export const QUESTIONS = [
  "오늘 아침, 가장 먼저 떠오른 생각은 무엇인가요?",
  "지금 이 순간 핸드폰을 집어 들기 전에, 실제로 무엇을 하려 했나요?",
  "요즘 당신을 가장 충전시켜 주는 것은 무엇인가요?",
  "오늘 하루, 기억에 남기고 싶은 한 가지가 있다면 무엇인가요?",
  "지금 내가 회피하고 있는 감정이 있다면, 솔직히 말하면 무엇인가요?",
  "요즘 가장 많이 생각하는 사람은 누구인가요? 그 이유는?",
  "오늘 하루 중에서, 의미 있다고 느꼈던 순간이 있었나요?",
  "지금 당신의 몸은 어떤 상태인가요? 긴장? 피로? 가벼움?",
  "최근에 진심으로 웃은 게 언제였나요?",
  "지금 가장 간절한 것이 있다면 무엇인가요?",
  "오늘 누군가에게 감사함을 느꼈나요? 누구에게, 왜?",
  "지금 '해야 한다'고 생각하지만 자꾸 미루는 것이 있나요?",
  "요즘 가장 두려운 것은 무엇인가요?",
  "당신이 오늘 하루를 한 단어로 표현한다면?",
  "지금 이 순간, 당신 곁에 있어줬으면 하는 사람이 있나요?",
  "최근에 스스로를 칭찬해 준 적이 있나요?",
  "오늘 밤 잠들기 전에 꼭 해결하고 싶은 생각이 있나요?",
  "요즘 '이게 나다운 건가?' 하고 의심되는 순간이 있나요?",
  "지금 하고 싶지만 못 하고 있는 것이 있나요?",
  "당신의 하루에서 가장 조용하고 좋은 순간은 언제인가요?",
  "지난 한 주를 돌아보면, 어떤 선택이 가장 마음에 드나요?",
  "지금 내 삶에서 가장 소중한 것 세 가지를 꼽는다면?",
  "요즘 충분히 쉬고 있다고 느끼나요?",
  "오늘 당신을 힘들게 한 것이 있다면, 그것에 어떻게 반응했나요?",
  "지금 이 순간, 무엇을 내려놓고 싶은가요?",
  "앞으로 한 달 뒤의 나에게 한마디를 한다면?",
  "오늘 나 자신을 위해 한 일이 있나요? 아주 작은 것도 좋아요.",
  "요즘 빈번히 떠오르는 걱정이 있나요? 그게 실제로 일어날 것 같나요?",
  "지금 가장 연결되고 싶은 것은 무엇인가요? 사람, 자연, 음악…",
  "오늘 하루 중 가장 고요했던 순간은 언제였나요?",
];

export const GATE_MESSAGES = [
  "핸드폰을 집어 들었군요",
  "잠깐, 지금 뭘 하려 했나요?",
  "무의식중에 켰나요? 괜찮아요",
  "잠깐만 멈춰볼게요",
  "지금 이 순간, 어디에 있나요?",
];

export function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getKoreanDate(): string {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = days[d.getDay()];
  return `${y}년 ${m}월 ${day}일 ${dow}요일`;
}

export function formatEntryDate(key: string): string {
  const [y, m, d] = key.split('-');
  const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${y}년 ${m}월 ${d}일 ${days[dt.getDay()]}요일`;
}

export function getDailyQuestion(): string {
  const today = getTodayKey();
  const seed = today.replace(/-/g, '');
  const idx = parseInt(seed, 10) % QUESTIONS.length;
  return QUESTIONS[idx];
}
