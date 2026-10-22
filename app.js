/* ─── app.js ─────────────────────────────── */

// ══════════════════════════════════════════
// GATE SCREEN — 무의식 행동 인터셉트
// 앱이 열릴 때 3초 pause로 습관 행동을 끊어냄
// ══════════════════════════════════════════
const GATE_DURATION = 3000; // ms

const GATE_MESSAGES = [
  "핸드폰을 집어 들었군요",
  "잠깐, 지금 뭘 하려 했나요?",
  "무의식중에 켰나요? 괜찮아요",
  "잠깐만 멈춰볼게요",
  "지금 이 순간, 어디에 있나요?",
];

function initGate() {
  const gate = document.getElementById('gate-screen');
  const fillEl = document.getElementById('gate-fill');
  const msgEl = document.getElementById('gate-msg');

  // 랜덤 메시지
  msgEl.textContent = GATE_MESSAGES[Math.floor(Math.random() * GATE_MESSAGES.length)];

  const circumference = 276.5; // 2π × 44
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / GATE_DURATION, 1);
    // 원이 채워지면서 올라감 (dashoffset 감소)
    fillEl.style.strokeDashoffset = circumference * (1 - progress);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // 게이트 닫기
      gate.classList.add('hidden');
    }
  }

  requestAnimationFrame(tick);

  // 탭해도 넘어갈 수 있음 (하지만 최소 1초는 보여줌)
  gate.addEventListener('click', () => {
    const elapsed = performance.now() - startTime;
    if (elapsed > 1000) gate.classList.add('hidden');
  }, { once: true });
}

// ══════════════════════════════════════════
// QUESTION BANK
// ══════════════════════════════════════════
const QUESTIONS = [
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

// ══════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════
const STORAGE_KEY = 'jamkkan_journal';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ══════════════════════════════════════════
// DATE HELPERS
// ══════════════════════════════════════════
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getKoreanDate() {
  const d = new Date();
  const days = ['일','월','화','수','목','금','토'];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = days[d.getDay()];
  return `${y}년 ${m}월 ${day}일 ${dow}요일`;
}

function formatEntryDate(key) {
  const [y, m, d] = key.split('-');
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
  const days = ['일','월','화','수','목','금','토'];
  return `${y}년 ${m}월 ${d}일 ${days[dt.getDay()]}요일`;
}

// ══════════════════════════════════════════
// QUESTION SELECTION (date-seeded)
// ══════════════════════════════════════════
function getDailyQuestion() {
  const today = getTodayKey();
  const seed = today.replace(/-/g, '');
  const idx = parseInt(seed) % QUESTIONS.length;
  return QUESTIONS[idx];
}

// ══════════════════════════════════════════
// STREAK CALCULATOR
// ══════════════════════════════════════════
function calcStreak(entries) {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
  const today = getTodayKey();

  let streak = 0;
  let cursor = new Date(today);

  for (let i = 0; i < dates.length; i++) {
    const dateKey = cursor.toISOString().slice(0, 10);
    if (dates.includes(dateKey)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Allow today to not break streak if not yet answered
      if (dateKey === today && i === 0) {
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }
  return streak;
}

// ══════════════════════════════════════════
// RENDER TODAY VIEW
// ══════════════════════════════════════════
function renderToday() {
  const question = getDailyQuestion();
  const today = getTodayKey();
  const data = loadData();

  // Date
  document.getElementById('date-label').textContent = getKoreanDate();

  // Question
  const qtEl = document.getElementById('question-text');
  qtEl.style.opacity = '0';
  qtEl.textContent = question;
  setTimeout(() => {
    qtEl.style.transition = 'opacity 0.8s ease';
    qtEl.style.opacity = '1';
  }, 100);

  // Pre-fill if already written today
  const todayEntry = data.entries.find(e => e.date === today);
  const textarea = document.getElementById('journal-input');
  if (todayEntry) {
    textarea.value = todayEntry.text;
    updateCharCount();
    document.getElementById('save-btn').textContent = '수정하기';
  } else {
    textarea.value = '';
    document.getElementById('save-btn').textContent = '저장하기';
  }

  // Streak
  const streak = calcStreak(data.entries);
  document.getElementById('streak-count').textContent = streak;
}

// ══════════════════════════════════════════
// CHAR COUNT
// ══════════════════════════════════════════
function updateCharCount() {
  const len = document.getElementById('journal-input').value.length;
  document.getElementById('char-count').textContent = `${len}자`;
}

document.getElementById('journal-input').addEventListener('input', updateCharCount);

// ══════════════════════════════════════════
// SAVE ENTRY
// ══════════════════════════════════════════
function saveEntry() {
  const text = document.getElementById('journal-input').value.trim();
  if (!text) {
    showSaveMsg('✦ 먼저 생각을 적어보세요', '#c4876a');
    return;
  }

  const today = getTodayKey();
  const question = getDailyQuestion();
  const data = loadData();

  // Remove today's existing entry (upsert)
  data.entries = data.entries.filter(e => e.date !== today);
  data.entries.push({ date: today, question, text, savedAt: Date.now() });
  saveData(data);

  document.getElementById('save-btn').textContent = '수정하기';
  const streak = calcStreak(data.entries);
  document.getElementById('streak-count').textContent = streak;

  showSaveMsg('✦ 저장되었어요', '#8a9e88');
}

function showSaveMsg(msg, color) {
  const el = document.getElementById('save-msg');
  el.textContent = msg;
  el.style.color = color;
  el.classList.remove('show');
  void el.offsetWidth; // reflow
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2100);
}

// ══════════════════════════════════════════
// RENDER JOURNAL VIEW
// ══════════════════════════════════════════
function renderJournal() {
  const data = loadData();
  const list = document.getElementById('entries-list');
  list.innerHTML = '';

  if (data.entries.length === 0) {
    list.innerHTML = '<p class="empty-msg">아직 기록이 없어요.<br/>오늘의 질문에 답하고 저장해 보세요. 🌿</p>';
    return;
  }

  // Sort newest first
  const sorted = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(entry => {
    const words = entry.text.trim().split(/\s+/).filter(Boolean).length;
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-date">${formatEntryDate(entry.date)}</div>
      <div class="entry-question">"${entry.question}"</div>
      <div class="entry-text">${escHtml(entry.text)}</div>
      <div class="entry-footer">
        <span class="entry-word-count">${words}단어</span>
        <button class="entry-delete" onclick="deleteEntry('${entry.date}')">삭제</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function escHtml(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'<br/>');
}

function deleteEntry(date) {
  if (!confirm('이 기록을 삭제할까요?')) return;
  const data = loadData();
  data.entries = data.entries.filter(e => e.date !== date);
  saveData(data);
  renderJournal();
  updateAboutStats();
}

// ══════════════════════════════════════════
// ABOUT STATS
// ══════════════════════════════════════════
function updateAboutStats() {
  const data = loadData();
  const total = data.entries.length;
  const streak = calcStreak(data.entries);
  const words = data.entries.reduce((acc, e) => {
    return acc + e.text.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('stat-words').textContent = words;
}

// ══════════════════════════════════════════
// VIEW SWITCHING
// ══════════════════════════════════════════
function showView(name) {
  // Update tabs
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');

  // Update views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${name}`);
  target.classList.add('active');

  // Render view
  if (name === 'today') renderToday();
  if (name === 'journal') renderJournal();
  if (name === 'about') updateAboutStats();
}

// ══════════════════════════════════════════
// BREATH GUIDE
// ══════════════════════════════════════════
let breathInterval = null;
let breathPhase = 0;
const breathPhases = [
  { label: '들이쉬기', duration: 4000 },
  { label: '유지하기', duration: 4000 },
  { label: '내쉬기', duration: 4000 },
  { label: '쉬기', duration: 2000 },
];

const breathRing = document.getElementById('breath-ring');
const breathLabel = document.getElementById('breath-label');

breathRing.addEventListener('click', toggleBreath);

function toggleBreath() {
  if (breathInterval) {
    clearTimeout(breathInterval);
    breathInterval = null;
    breathRing.classList.remove('breathing');
    breathLabel.textContent = '잠깐';
    breathPhase = 0;
  } else {
    breathRing.classList.add('breathing');
    runBreathPhase();
  }
}

function runBreathPhase() {
  const phase = breathPhases[breathPhase % breathPhases.length];
  breathLabel.textContent = phase.label;
  breathInterval = setTimeout(() => {
    breathPhase++;
    runBreathPhase();
  }, phase.duration);
}

// ══════════════════════════════════════════
// PWA INSTALL PROMPT
// ══════════════════════════════════════════
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  // 이미 설치했거나 dismissed한 경우 무시
  const dismissed = localStorage.getItem('jamkkan_install_dismissed');
  if (dismissed) return;

  // 게이트 닫힌 후 2초 뒤에 배너 표시
  setTimeout(() => {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('visible');
  }, GATE_DURATION + 2000);
});

function installPWA() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') {
      dismissInstall();
    }
    deferredInstallPrompt = null;
  });
}

function dismissInstall() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.classList.remove('visible');
  localStorage.setItem('jamkkan_install_dismissed', '1');
}

// PWA 설치 완료 감지
window.addEventListener('appinstalled', () => {
  dismissInstall();
  console.log('잠깐 앱이 설치되었습니다 🌿');
});

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
initGate();
renderToday();
