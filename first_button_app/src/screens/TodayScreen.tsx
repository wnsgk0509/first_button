import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getDailyQuestion,
  getKoreanDate,
  getTodayKey,
} from '../constants/questions';
import { syncWidgetData } from '../services/nativeBridge';
import {
  calcStreak,
  JournalData,
  loadJournalData,
  saveJournalData,
} from '../services/storage';
import { BreathGuide } from '../components/BreathGuide';

interface Props {
  onJournalUpdated: () => void;
}

export const TodayScreen: React.FC<Props> = ({ onJournalUpdated }) => {
  const [question, setQuestion] = useState(getDailyQuestion());
  const [dateLabel] = useState(getKoreanDate());
  const [inputText, setInputText] = useState('');
  const [streak, setStreak] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    initToday();

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates?.height || 280);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const initToday = async () => {
    const q = getDailyQuestion();
    setQuestion(q);
    const data = await loadJournalData();
    const today = getTodayKey();
    const existing = data.entries.find(e => e.date === today);

    if (existing) {
      setInputText(existing.text);
      setIsSaved(true);
    } else {
      setInputText('');
      setIsSaved(false);
    }

    setStreak(calcStreak(data.entries));

    // Sync to Android home screen widget
    syncWidgetData(q, dateLabel);
  };

  const handleSave = async () => {
    const text = inputText.trim();
    if (!text) {
      showToast('✦ 먼저 짧게라도 생각을 적어보세요');
      return;
    }

    const today = getTodayKey();
    const data = await loadJournalData();

    // Upsert
    const filtered = data.entries.filter(e => e.date !== today);
    const updatedEntries = [
      ...filtered,
      {
        date: today,
        question,
        text,
        savedAt: Date.now(),
      },
    ];

    const updatedData: JournalData = { entries: updatedEntries };
    await saveJournalData(updatedData);

    setIsSaved(true);
    setStreak(calcStreak(updatedEntries));
    showToast('✦ 소중한 생각이 저장되었습니다 🌿');
    onJournalUpdated();
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoid}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🌿 {streak}일 연속</Text>
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionBadge}>오늘의 질문</Text>
          <Text style={styles.questionText}>"{question}"</Text>
        </View>

        {/* Breathing guide */}
        <BreathGuide />

        {/* Journal Input Area */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="답변을 길게 쓰지 않아도 괜찮아요. 지금 스치는 솔직한 생각을 한 줄이라도 남겨보세요."
            placeholderTextColor="#ABA59C"
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 150);
            }}
            textAlignVertical="top"
          />

          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>{inputText.length}자</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.saveButton,
                isSaved ? styles.savedButton : styles.defaultButton,
              ]}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {isSaved ? '수정하기' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toast Message */}
        {toastMsg && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        )}

        {/* Widget Hint */}
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>💡 홈화면 위젯 팁</Text>
          <Text style={styles.hintDesc}>
            스마트폰 홈화면 빈 곳을 길게 눌러 [위젯] → [잠깐]을 추가하면 매일 폰을 켤 때마다 오늘의 질문이 바로 보입니다.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#8C867B',
    fontWeight: '500',
  },
  streakBadge: {
    backgroundColor: '#EAE6DC',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F5E4E',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#ECE7DD',
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 10,
  },
  questionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A8F76',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2E2B27',
    lineHeight: 28,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE7DD',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  textInput: {
    fontSize: 15,
    color: '#2E2B27',
    lineHeight: 22,
    minHeight: 120,
    padding: 0,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2EDE4',
    paddingTop: 12,
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#ABA59C',
  },
  saveButton: {
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  defaultButton: {
    backgroundColor: '#5C705A',
  },
  savedButton: {
    backgroundColor: '#8A9E88',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toastContainer: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#EBE7DD',
    alignItems: 'center',
  },
  toastText: {
    fontSize: 13,
    color: '#49453F',
    fontWeight: '600',
  },
  hintBox: {
    marginTop: 22,
    backgroundColor: '#F3EFE7',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E0D4',
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F5E4E',
    marginBottom: 4,
  },
  hintDesc: {
    fontSize: 12,
    color: '#7A756D',
    lineHeight: 18,
  },
});
