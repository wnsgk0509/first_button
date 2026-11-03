// 건전한 성찰 환경을 위한 기초 비속어 및 공격적 어휘 필터링 모듈

const PROFANITY_LIST = [
  '시발',
  '씨발',
  '존나',
  '졸라',
  '개새끼',
  '새끼',
  '미친',
  '닥쳐',
  '병신',
  '꺼져',
  '쓰레기',
  '지랄',
  '엠창',
  '느금',
  '애미',
  '죽어',
  '자살',
  'fuck',
  'shit',
  'bitch',
];

export function hasProfanity(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[\s\d_!@#$%^&*()\-+=~`]+/g, '');
  return PROFANITY_LIST.some(word => normalized.includes(word));
}

export function maskProfanity(text: string): string {
  let masked = text;
  PROFANITY_LIST.forEach(word => {
    const reg = new RegExp(word, 'gi');
    masked = masked.replace(reg, '*'.repeat(word.length));
  });
  return masked;
}
