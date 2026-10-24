import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayKey } from '../constants/questions';

export interface JournalEntry {
  date: string;
  question: string;
  text: string;
  savedAt: number;
}

export interface JournalData {
  entries: JournalEntry[];
}

const STORAGE_KEY = 'jamkkan_journal';

export async function loadJournalData(): Promise<JournalData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw);
    return parsed.entries ? parsed : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

export async function saveJournalData(data: JournalData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save journal data', e);
  }
}

export function calcStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
  const today = getTodayKey();

  let streak = 0;
  let cursor = new Date();

  for (let i = 0; i < dates.length; i++) {
    const dateKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (dates.includes(dateKey)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      if (dateKey === today && i === 0) {
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }
  return streak;
}
