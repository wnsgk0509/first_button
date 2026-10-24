import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getDailyQuestion, getKoreanDate } from '../constants/questions';
import {
  cancelDailyAlarm,
  getAlarmSettings,
  requestNotificationPermission,
  scheduleDailyAlarm,
  syncWidgetData,
} from '../services/nativeBridge';
import { calcStreak, loadJournalData } from '../services/storage';

export const SettingsScreen: React.FC = () => {
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);

  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [widgetSyncStatus, setWidgetSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    const s = await getAlarmSettings();
    setAlarmEnabled(s.enabled);
    setAlarmHour(s.hour);
    setAlarmMinute(s.minute);
  };

  const loadStats = async () => {
    const data = await loadJournalData();
    setTotalCount(data.entries.length);
    setStreak(calcStreak(data.entries));
    const words = data.entries.reduce((acc, e) => {
      return acc + e.text.trim().split(/\s+/).filter(Boolean).length;
    }, 0);
    setTotalWords(words);
  };

  const handleToggleAlarm = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          '알림 권한 필요',
          '원하는 시간에 성찰 질문을 받으시려면 알림 권한을 허용해 주세요.'
        );
        return;
      }

      setAlarmEnabled(true);
      const q = getDailyQuestion();
      await scheduleDailyAlarm(alarmHour, alarmMinute, q);
      Alert.alert(
        '성찰 알림 설정 완료',
        `매일 ${formatTime(alarmHour, alarmMinute)}에 핸드폰 잠금화면과 상단바에 오늘의 질문이 도착합니다 🌿`
      );
    } else {
      setAlarmEnabled(false);
      await cancelDailyAlarm();
    }
  };

  const adjustHour = async (delta: number) => {
    let next = alarmHour + delta;
    if (next < 0) next = 23;
    if (next > 23) next = 0;
    setAlarmHour(next);

    if (alarmEnabled) {
      const q = getDailyQuestion();
      await scheduleDailyAlarm(next, alarmMinute, q);
    }
  };

  const adjustMinute = async (delta: number) => {
    let next = alarmMinute + delta;
    if (next < 0) next = 50;
    if (next > 50) next = 0;
    setAlarmMinute(next);

    if (alarmEnabled) {
      const q = getDailyQuestion();
      await scheduleDailyAlarm(alarmHour, next, q);
    }
  };

  const handleManualSyncWidget = async () => {
    const q = getDailyQuestion();
    const dateLabel = getKoreanDate();
    await syncWidgetData(q, dateLabel);
    setWidgetSyncStatus('위젯에 최신 질문이 반영되었습니다 ✦');
    setTimeout(() => setWidgetSyncStatus(null), 2500);
  };

  const formatTime = (h: number, m: number) => {
    const period = h < 12 ? '오전' : '오후';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = String(m).padStart(2, '0');
    return `${period} ${displayH}:${displayM}`;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      {/* 1. Alarm Setting Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>⏰ 잠금화면 성찰 알림</Text>
            <Text style={styles.cardSub}>
              아침이나 원하는 시간에 오늘의 질문을 먼저 노출합니다
            </Text>
          </View>
          <Switch
            value={alarmEnabled}
            onValueChange={handleToggleAlarm}
            trackColor={{ false: '#DDD7CC', true: '#8A9E88' }}
            thumbColor={alarmEnabled ? '#4A6248' : '#FAF8F4'}
          />
        </View>

        <View style={styles.timePickerRow}>
          <Text style={styles.timeLabel}>도착 시간</Text>
          <View style={styles.timeControls}>
            <View style={styles.pickerBox}>
              <TouchableOpacity
                onPress={() => adjustHour(-1)}
                style={styles.timeBtn}>
                <Text style={styles.timeBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pickerText}>{String(alarmHour).padStart(2, '0')}시</Text>
              <TouchableOpacity
                onPress={() => adjustHour(1)}
                style={styles.timeBtn}>
                <Text style={styles.timeBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.colon}>:</Text>

            <View style={styles.pickerBox}>
              <TouchableOpacity
                onPress={() => adjustMinute(-10)}
                style={styles.timeBtn}>
                <Text style={styles.timeBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pickerText}>{String(alarmMinute).padStart(2, '0')}분</Text>
              <TouchableOpacity
                onPress={() => adjustMinute(10)}
                style={styles.timeBtn}>
                <Text style={styles.timeBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.alarmExplain}>
          {alarmEnabled
            ? `현재 매일 ${formatTime(alarmHour, alarmMinute)}에 잠금화면 알림이 도착하도록 설정되어 있습니다.`
            : '스위치를 켜면 아침 기상 시간에 맞춰 무의식 스크롤을 막아줍니다.'}
        </Text>
      </View>

      {/* 2. Home Screen Widget Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 안드로이드 홈화면 위젯</Text>
        <Text style={styles.cardSub}>
          홈화면에 오늘의 질문을 띄워두고 폰을 켤 때마다 생각을 일깨워보세요.
        </Text>

        <View style={styles.guideStepBox}>
          <Text style={styles.guideStep}>1. 스마트폰 홈화면 빈 곳을 길게 터치</Text>
          <Text style={styles.guideStep}>2. [위젯] 메뉴 선택</Text>
          <Text style={styles.guideStep}>3. [잠깐] 위젯을 찾아 홈화면에 배치</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.syncBtn}
          onPress={handleManualSyncWidget}>
          <Text style={styles.syncBtnText}>위젯에 오늘 질문 동기화</Text>
        </TouchableOpacity>

        {widgetSyncStatus && (
          <Text style={styles.syncSuccessText}>{widgetSyncStatus}</Text>
        )}
      </View>

      {/* 3. Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 나의 성찰 통계</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{totalCount}</Text>
            <Text style={styles.statLabel}>총 기록수</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{streak}일</Text>
            <Text style={styles.statLabel}>연속 기록</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{totalWords}</Text>
            <Text style={styles.statLabel}>적어낸 단어</Text>
          </View>
        </View>
      </View>

      {/* 4. Philosophy Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🌿 서비스 이야기</Text>
        <Text style={styles.infoDesc}>
          지루함을 견디지 못해 우리는 무의식적으로 폰을 켜곤 합니다. 의지 문제가 아니라 손가락의 버릇일 뿐입니다.{'\n\n'}
          '잠깐'은 그 순간에 부드러운 쉼표를 건네며, 무의미한 터치 대신 나 자신과 마주하는 하나의 질문을 남깁니다.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECE7DD',
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#322F2B',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: '#8A857C',
    maxWidth: 220,
    lineHeight: 17,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4EFE8',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#49453F',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F2EA',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#383531',
    marginHorizontal: 8,
  },
  timeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C705A',
  },
  colon: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#8A857C',
  },
  alarmExplain: {
    fontSize: 12,
    color: '#8A857C',
    lineHeight: 18,
  },
  guideStepBox: {
    backgroundColor: '#F9F7F2',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
  },
  guideStep: {
    fontSize: 13,
    color: '#5A564F',
    lineHeight: 22,
  },
  syncBtn: {
    backgroundColor: '#EAE6DC',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  syncBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F5E4E',
  },
  syncSuccessText: {
    marginTop: 8,
    fontSize: 12,
    color: '#5C705A',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F5E4E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9C968C',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#ECE7DD',
  },
  infoCard: {
    backgroundColor: '#F3EFE7',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7E1D4',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F5E4E',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 13,
    color: '#736E65',
    lineHeight: 20,
  },
});
