import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatEntryDate } from '../constants/questions';
import {
  generateWeeklyReport,
  WeeklyReportData,
} from '../services/reportAnalysis';
import {
  JournalEntry,
  loadJournalData,
  saveJournalData,
} from '../services/storage';

interface Props {
  refreshKey: number;
  onJournalChanged: () => void;
}

type SubTab = 'list' | 'report';

export const JournalScreen: React.FC<Props> = ({
  refreshKey,
  onJournalChanged,
}) => {
  const [subTab, setSubTab] = useState<SubTab>('list');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [report, setReport] = useState<WeeklyReportData | null>(null);

  useEffect(() => {
    loadEntries();
  }, [refreshKey]);

  const loadEntries = async () => {
    const data = await loadJournalData();
    const sorted = [...data.entries].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    setEntries(sorted);
    setReport(generateWeeklyReport(sorted));
  };

  const handleDelete = (date: string) => {
    Alert.alert('기록 삭제', '이 성찰 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const data = await loadJournalData();
          const filtered = data.entries.filter(e => e.date !== date);
          await saveJournalData({ entries: filtered });
          setEntries(filtered);
          setReport(generateWeeklyReport(filtered));
          onJournalChanged();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: JournalEntry }) => {
    const words = item.text.trim().split(/\s+/).filter(Boolean).length;

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{formatEntryDate(item.date)}</Text>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => handleDelete(item.date)}>
            <Text style={styles.deleteText}>삭제</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.entryQuestion}>"{item.question}"</Text>
        <Text style={styles.entryText}>{item.text}</Text>

        <View style={styles.entryFooter}>
          <Text style={styles.wordCount}>
            {words}단어 · {item.text.length}자
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sub-Tab Header */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'list' && styles.activeSubTabBtn]}
          onPress={() => setSubTab('list')}>
          <Text
            style={[
              styles.subTabText,
              subTab === 'list' && styles.activeSubTabText,
            ]}>
            기록 목록 ({entries.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTabBtn,
            subTab === 'report' && styles.activeSubTabBtn,
          ]}
          onPress={() => setSubTab('report')}>
          <Text
            style={[
              styles.subTabText,
              subTab === 'report' && styles.activeSubTabText,
            ]}>
            📊 주간 리포트
          </Text>
        </TouchableOpacity>
      </View>

      {subTab === 'list' ? (
        entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>아직 작성된 기록이 없어요</Text>
            <Text style={styles.emptyDesc}>
              오늘의 질문에 잠시 멈추어 짧은 생각을 남겨보세요.
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={item => item.date}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : report ? (
        <ScrollView
          contentContainerStyle={styles.reportContent}
          showsVerticalScrollIndicator={false}>
          {/* 1. Habit Completion Card */}
          <View style={styles.reportCard}>
            <Text style={styles.reportCardTitle}>이번 주 성찰 달성률</Text>
            <View style={styles.rateRow}>
              <Text style={styles.rateNumber}>{report.completionRate}%</Text>
              <Text style={styles.rateSub}>
                최근 7일 중 {report.writtenDaysCount}일 쉼표 기록
              </Text>
            </View>

            {/* Days Indicator */}
            <View style={styles.daysRow}>
              {report.weekDays.map(d => (
                <View key={d.dateKey} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayDot,
                      d.hasWritten
                        ? styles.dayDotWritten
                        : styles.dayDotEmpty,
                      d.isToday && styles.dayDotToday,
                    ]}>
                    <Text
                      style={[
                        styles.dayDotText,
                        d.hasWritten && styles.dayDotTextWritten,
                      ]}>
                      {d.hasWritten ? '✓' : '·'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      d.isToday && styles.dayLabelToday,
                    ]}>
                    {d.dayLabel}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 2. Top Keywords Card */}
          <View style={styles.reportCard}>
            <Text style={styles.reportCardTitle}>이번 주 나의 키워드</Text>
            <Text style={styles.reportCardSub}>
              작성한 답변에서 가장 자주 등장한 생각의 단어들입니다
            </Text>

            {report.topKeywords.length > 0 ? (
              <View style={styles.keywordsWrap}>
                {report.topKeywords.map((k, idx) => (
                  <View key={k.word} style={styles.keywordBadge}>
                    <Text style={styles.keywordRank}>#{idx + 1}</Text>
                    <Text style={styles.keywordWord}>{k.word}</Text>
                    <Text style={styles.keywordCount}>{k.count}회</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noKeywordsText}>
                이번 주 기록이 쌓이면 자주 쓴 단어가 여기에 분석됩니다 ✦
              </Text>
            )}

            <View style={styles.statsMiniRow}>
              <View style={styles.statMiniCol}>
                <Text style={styles.statMiniNum}>{report.totalWords}</Text>
                <Text style={styles.statMiniLabel}>적어낸 단어</Text>
              </View>
              <View style={styles.statMiniDivider} />
              <View style={styles.statMiniCol}>
                <Text style={styles.statMiniNum}>{report.totalChars}</Text>
                <Text style={styles.statMiniLabel}>총 글자수</Text>
              </View>
            </View>
          </View>

          {/* 3. Mindful Insight Card */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>🌿 이번 주의 쉼표 한마디</Text>
            <Text style={styles.insightDesc}>{report.insightMessage}</Text>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7DD',
  },
  subTabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 8,
  },
  activeSubTabBtn: {
    backgroundColor: '#EBE5D9',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C867B',
  },
  activeSubTabText: {
    color: '#344332',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  reportContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C867B',
  },
  deleteText: {
    fontSize: 12,
    color: '#B57C68',
  },
  entryQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B4A3A',
    marginBottom: 12,
    lineHeight: 21,
  },
  entryText: {
    fontSize: 14,
    color: '#383531',
    lineHeight: 22,
  },
  entryFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F1E8',
    alignItems: 'flex-end',
  },
  wordCount: {
    fontSize: 11,
    color: '#ABA59C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A463F',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#8C867B',
    textAlign: 'center',
    lineHeight: 20,
  },
  reportCard: {
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
  reportCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#322F2B',
    marginBottom: 4,
  },
  reportCardSub: {
    fontSize: 12,
    color: '#8A857C',
    marginBottom: 16,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  rateNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4F5E4E',
    marginRight: 12,
  },
  rateSub: {
    fontSize: 13,
    color: '#736E65',
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4EFE8',
  },
  dayCol: {
    alignItems: 'center',
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayDotEmpty: {
    backgroundColor: '#F3EFE7',
  },
  dayDotWritten: {
    backgroundColor: '#7A8F76',
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: '#4F5E4E',
  },
  dayDotText: {
    fontSize: 13,
    color: '#A19C93',
  },
  dayDotTextWritten: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: 12,
    color: '#8C867B',
  },
  dayLabelToday: {
    fontWeight: '700',
    color: '#383531',
  },
  keywordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  keywordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E0D4',
  },
  keywordRank: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A8F76',
    marginRight: 4,
  },
  keywordWord: {
    fontSize: 13,
    fontWeight: '600',
    color: '#383531',
    marginRight: 6,
  },
  keywordCount: {
    fontSize: 11,
    color: '#9C968C',
  },
  noKeywordsText: {
    fontSize: 13,
    color: '#A19C93',
    lineHeight: 18,
    marginBottom: 12,
  },
  statsMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F4EFE8',
    paddingTop: 12,
    marginTop: 8,
  },
  statMiniCol: {
    alignItems: 'center',
  },
  statMiniNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F5E4E',
  },
  statMiniLabel: {
    fontSize: 11,
    color: '#9C968C',
    marginTop: 2,
  },
  statMiniDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#ECE7DD',
  },
  insightCard: {
    backgroundColor: '#F3EFE7',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7E1D4',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F5E4E',
    marginBottom: 8,
  },
  insightDesc: {
    fontSize: 13,
    color: '#736E65',
    lineHeight: 20,
  },
});
