import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatEntryDate } from '../constants/questions';
import {
  JournalEntry,
  loadJournalData,
  saveJournalData,
} from '../services/storage';

interface Props {
  refreshKey: number;
  onJournalChanged: () => void;
}

export const JournalScreen: React.FC<Props> = ({
  refreshKey,
  onJournalChanged,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, [refreshKey]);

  const loadEntries = async () => {
    const data = await loadJournalData();
    const sorted = [...data.entries].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    setEntries(sorted);
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
          <Text style={styles.wordCount}>{words}단어 · {item.text.length}자</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {entries.length === 0 ? (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
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
});
