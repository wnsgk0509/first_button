import { JournalEntry } from './storage';

export interface DayStatus {
  dateKey: string;
  dayLabel: string;
  isToday: boolean;
  hasWritten: boolean;
  charCount: number;
}

export interface WeeklyReportData {
  weekDays: DayStatus[];
  writtenDaysCount: number;
  completionRate: number;
  totalWords: number;
  totalChars: number;
  topKeywords: { word: string; count: number }[];
  insightMessage: string;
}

const STOP_WORDS = new Set([
  '그리고',
  '하지만',
  '그런데',
  '너무',
  '그냥',
  '진짜',
  '정말',
  '조금',
  '아주',
  '있는',
  '없는',
  '것이',
  '내가',
  '나는',
  '나를',
  '오늘',
  '하루',
  '순간',
  '생각',
  '있다',
  '없다',
  '하고',
  '해서',
  '하면',
  '위해',
  '대해',
]);

export function generateWeeklyReport(entries: JournalEntry[]): WeeklyReportData {
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Get last 7 days including today
  const weekDays: DayStatus[] = [];
  const entriesMap = new Map<string, JournalEntry>();
  entries.forEach(e => entriesMap.set(e.date, e));

  let weeklyWords = 0;
  let weeklyChars = 0;
  const wordFrequency: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = dayLabels[d.getDay()];
    const entry = entriesMap.get(dateKey);

    if (entry) {
      const words = entry.text.trim().split(/\s+/).filter(Boolean);
      weeklyWords += words.length;
      weeklyChars += entry.text.length;

      // Extract meaningful words
      words.forEach(w => {
        const cleaned = w.replace(/[^가-힣a-zA-Z]/g, '').trim();
        if (cleaned.length >= 2 && !STOP_WORDS.has(cleaned)) {
          wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
        }
      });
    }

    weekDays.push({
      dateKey,
      dayLabel,
      isToday: dateKey === todayKey,
      hasWritten: !!entry,
      charCount: entry ? entry.text.length : 0,
    });
  }

  const writtenDaysCount = weekDays.filter(d => d.hasWritten).length;
  const completionRate = Math.round((writtenDaysCount / 7) * 100);

  // Sort keywords by frequency
  const topKeywords = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Insight message
  let insightMessage = '';
  if (writtenDaysCount >= 5) {
    insightMessage =
      '이번 주 나 자신에게 깊은 집중을 선물하셨군요. 무의식 스크롤보다 나를 위한 쉼표가 삶에 자리잡고 있습니다 🌿';
  } else if (writtenDaysCount >= 3) {
    insightMessage =
      '바쁜 일상 속에서도 3번 이상 멈추어 생각을 기록했습니다. 아주 훌륭한 쉼표예요 ✦';
  } else if (writtenDaysCount >= 1) {
    insightMessage =
      '작은 시작이 큰 변화를 만듭니다. 오늘부터 하루 1분, 나에게 질문을 건네보세요.';
  } else {
    insightMessage =
      '아직 이번 주 기록이 없어요. 오늘의 질문에 스치는 생각을 한 줄 남겨볼까요?';
  }

  return {
    weekDays,
    writtenDaysCount,
    completionRate,
    totalWords: weeklyWords,
    totalChars: weeklyChars,
    topKeywords,
    insightMessage,
  };
}
