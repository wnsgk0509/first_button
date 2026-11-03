/* ─── app.js ─────────────────────────────── */

// ══════════════════════════════════════════
// GATE SCREEN — 무의식 행동 인터셉트
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
  if (!gate) return;
  const fillEl = document.getElementById('gate-fill');
  const msgEl = document.getElementById('gate-msg');

  msgEl.textContent = GATE_MESSAGES[Math.floor(Math.random() * GATE_MESSAGES.length)];

  const circumference = 276.5;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / GATE_DURATION, 1);
    fillEl.style.strokeDashoffset = circumference * (1 - progress);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      gate.classList.add('hidden');
    }
  }

  requestAnimationFrame(tick);

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
const LIKES_KEY = 'jamkkan_community_likes';
const BLOCKED_KEY = 'jamkkan_blocked_posts';

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
  let cursor = new Date();

  for (let i = 0; i < dates.length; i++) {
    const dateKey = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
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

// ══════════════════════════════════════════
// RENDER TODAY VIEW
// ══════════════════════════════════════════
function renderToday() {
  const question = getDailyQuestion();
  const today = getTodayKey();
  const data = loadData();

  document.getElementById('date-label').textContent = getKoreanDate();

  const qtEl = document.getElementById('question-text');
  qtEl.textContent = question;

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

  const streak = calcStreak(data.entries);
  const miniEl = document.getElementById('streak-count-mini');
  if (miniEl) miniEl.textContent = streak;
}

function updateCharCount() {
  const len = document.getElementById('journal-input').value.length;
  document.getElementById('char-count').textContent = `${len}자`;
}

document.getElementById('journal-input').addEventListener('input', updateCharCount);

function saveEntry() {
  const text = document.getElementById('journal-input').value.trim();
  if (!text) {
    showSaveMsg('✦ 먼저 생각을 적어보세요', '#c4876a');
    return;
  }

  const today = getTodayKey();
  const question = getDailyQuestion();
  const data = loadData();

  data.entries = data.entries.filter(e => e.date !== today);
  data.entries.push({ date: today, question, text, savedAt: Date.now() });
  saveData(data);

  document.getElementById('save-btn').textContent = '수정하기';
  const streak = calcStreak(data.entries);
  const miniEl = document.getElementById('streak-count-mini');
  if (miniEl) miniEl.textContent = streak;

  showSaveMsg('✦ 저장되었어요 🌿', '#8a9e88');
}

function showSaveMsg(msg, color) {
  const el = document.getElementById('save-msg');
  el.textContent = msg;
  el.style.color = color;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2100);
}

// ══════════════════════════════════════════
// SHARE QUESTION
// ══════════════════════════════════════════
async function shareQuestion() {
  const question = getDailyQuestion();
  const shareText = `🌿 잠깐, 오늘의 질문\n\n"${question}"\n\n하루 한 번, 스마트폰을 내려놓고 나를 마주하는 쉼표 🌿\nhttps://wnsgk0509.github.io/first_button/`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: '잠깐 - 오늘의 질문',
        text: shareText,
      });
      return;
    } catch (e) {
      // User cancelled or share failed, fallback to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    alert('오늘의 질문이 클립보드에 복사되었습니다! 🌿\n원하는 곳에 붙여넣어 공유해 보세요.');
  } catch (err) {
    prompt('아래 텍스트를 복사하여 공유하세요:', shareText);
  }
}

// ══════════════════════════════════════════
// JOURNAL VIEW (목록 + 주간 리포트)
// ══════════════════════════════════════════
let currentJournalSubTab = 'list';

function switchJournalSubTab(name) {
  currentJournalSubTab = name;
  document.getElementById('subtab-list').classList.toggle('active', name === 'list');
  document.getElementById('subtab-report').classList.toggle('active', name === 'report');

  document.getElementById('subview-list').classList.toggle('active', name === 'list');
  document.getElementById('subview-report').classList.toggle('active', name === 'report');

  if (name === 'list') renderJournalList();
  if (name === 'report') renderWeeklyReport();
}

function renderJournalList() {
  const data = loadData();
  const list = document.getElementById('entries-list');
  document.getElementById('journal-count').textContent = data.entries.length;
  list.innerHTML = '';

  if (data.entries.length === 0) {
    list.innerHTML = '<p class="empty-msg">아직 기록이 없어요.<br/>오늘의 질문에 답하고 저장해 보세요. 🌿</p>';
    return;
  }

  const sorted = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(entry => {
    const words = entry.text.trim().split(/\s+/).filter(Boolean).length;
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-date">${formatEntryDate(entry.date)}</div>
      <div class="entry-question">"${escHtml(entry.question)}"</div>
      <div class="entry-text">${escHtml(entry.text)}</div>
      <div class="entry-footer">
        <span class="entry-word-count">${words}단어 · ${entry.text.length}자</span>
        <button class="entry-delete" onclick="deleteEntry('${entry.date}')">삭제</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function deleteEntry(date) {
  if (!confirm('이 기록을 삭제할까요?')) return;
  const data = loadData();
  data.entries = data.entries.filter(e => e.date !== date);
  saveData(data);
  renderJournalList();
  renderWeeklyReport();
}

// ══════════════════════════════════════════
// WEEKLY REPORT (텍스트 마이닝)
// ══════════════════════════════════════════
const STOP_WORDS = new Set([
  '그리고','하지만','그런데','너무','그냥','진짜','정말','조금','아주','있는','없는',
  '것이','내가','나는','나를','오늘','하루','순간','생각','있다','없다','하고','해서','하면','위해','대해'
]);

function generateWeeklyReportData(entries) {
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  const todayKey = getTodayKey();

  const weekDays = [];
  const entriesMap = new Map();
  entries.forEach(e => entriesMap.set(e.date, e));

  let weeklyWords = 0;
  let weeklyChars = 0;
  const wordFrequency = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dayLabel = dayLabels[d.getDay()];
    const entry = entriesMap.get(dateKey);

    if (entry) {
      const words = entry.text.trim().split(/\s+/).filter(Boolean);
      weeklyWords += words.length;
      weeklyChars += entry.text.length;

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
    });
  }

  const writtenDaysCount = weekDays.filter(d => d.hasWritten).length;
  const completionRate = Math.round((writtenDaysCount / 7) * 100);

  const topKeywords = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  let insight = '작은 시작이 큰 변화를 만듭니다. 오늘부터 하루 1분, 나에게 질문을 건네보세요.';
  if (writtenDaysCount >= 5) {
    insight = '이번 주 나 자신에게 깊은 집중을 선물하셨군요. 무의식 스크롤보다 나를 위한 쉼표가 삶에 자리잡고 있습니다 🌿';
  } else if (writtenDaysCount >= 3) {
    insight = '바쁜 일상 속에서도 3번 이상 멈추어 생각을 기록했습니다. 아주 훌륭한 쉼표예요 ✦';
  }

  return { weekDays, writtenDaysCount, completionRate, weeklyWords, weeklyChars, topKeywords, insight };
}

function renderWeeklyReport() {
  const container = document.getElementById('report-container');
  const data = loadData();
  const rep = generateWeeklyReportData(data.entries);

  container.innerHTML = `
    <!-- 1. 달성률 카드 -->
    <div class="report-card">
      <h3 class="report-title">이번 주 성찰 달성률</h3>
      <div class="rate-row">
        <span class="rate-num">${rep.completionRate}%</span>
        <span class="rate-sub">최근 7일 중 ${rep.writtenDaysCount}일 쉼표 기록</span>
      </div>

      <div class="report-days-row">
        ${rep.weekDays.map(d => `
          <div class="report-day-col">
            <div class="report-day-dot ${d.hasWritten ? 'written' : ''} ${d.isToday ? 'today' : ''}">
              ${d.hasWritten ? '✓' : '·'}
            </div>
            <span class="report-day-label" style="${d.isToday ? 'font-weight:700; color:var(--ink);' : ''}">${d.dayLabel}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 2. 키워드 카드 -->
    <div class="report-card">
      <h3 class="report-title">이번 주 나의 키워드</h3>
      <p class="report-sub">작성한 답변에서 가장 자주 등장한 생각의 단어들입니다</p>

      ${rep.topKeywords.length > 0 ? `
        <div class="keywords-wrap">
          ${rep.topKeywords.map((k, idx) => `
            <div class="keyword-badge">
              <strong>#${idx + 1}</strong>
              <span>${escHtml(k.word)}</span>
              <small style="color:var(--stone); font-size:0.7rem;">${k.count}회</small>
            </div>
          `).join('')}
        </div>
      ` : `
        <p style="font-size:0.78rem; color:var(--stone); margin-bottom:12px;">이번 주 기록이 쌓이면 자주 쓴 단어가 여기에 분석됩니다 ✦</p>
      `}

      <div class="report-stats-mini">
        <div class="stat-mini-item">
          <span class="stat-mini-num">${rep.weeklyWords}</span>
          <span class="stat-mini-label">적어낸 단어</span>
        </div>
        <div class="stat-mini-item">
          <span class="stat-mini-num">${rep.weeklyChars}</span>
          <span class="stat-mini-label">총 글자수</span>
        </div>
      </div>
    </div>

    <!-- 3. 쉼표 한마디 -->
    <div class="insight-card">
      <div class="insight-title">🌿 이번 주의 쉼표 한마디</div>
      <p class="insight-desc">${rep.insight}</p>
    </div>
  `;
}

// ══════════════════════════════════════════
// SUPABASE REALTIME COMMUNITY (광장)
// ══════════════════════════════════════════
const SUPABASE_URL = 'https://swfqgxfvbgqkywdmhpfm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZnFneGZ2Ymdxa3l3ZG1ocGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMzcxNTQsImV4cCI6MjEwODYxMzE1NH0.AABIILrO0bR2CSh8Ev2niq8P86fwOQ7BhAQSNloMPsc';

const PROFANITY_LIST = [
  '시발','씨발','존나','졸라','개새끼','새끼','미친','닥쳐','병신','꺼져','쓰레기','지랄','엠창','느금','애미','죽어','자살','fuck','shit','bitch'
];

function hasProfanityWeb(text) {
  const norm = text.toLowerCase().replace(/[\s\d_!@#$%^&*()\-+=~`]+/g, '');
  return PROFANITY_LIST.some(w => norm.includes(w));
}

function maskProfanityWeb(text) {
  let masked = text;
  PROFANITY_LIST.forEach(w => {
    const reg = new RegExp(w, 'gi');
    masked = masked.replace(reg, '*'.repeat(w.length));
  });
  return masked;
}

let communityPosts = [];
let communityFilter = 'today';

async function loadCommunity() {
  const feed = document.getElementById('community-feed');
  const qText = document.getElementById('com-question-text');
  const q = getDailyQuestion();
  qText.textContent = `"${q}"`;

  feed.innerHTML = '<div class="loading-spinner">광장의 생각들을 불러오는 중... 🌿</div>';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts?select=*&order=created_at.desc&limit=50`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();

    const blockedRaw = localStorage.getItem(BLOCKED_KEY);
    const blockedIds = blockedRaw ? JSON.parse(blockedRaw) : [];

    communityPosts = data.filter(p => !blockedIds.includes(p.id));
    renderCommunityFeed();
  } catch (err) {
    feed.innerHTML = '<div class="loading-spinner">광장 글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>';
  }
}

function filterCommunity(mode) {
  communityFilter = mode;
  document.getElementById('filter-today').classList.toggle('active', mode === 'today');
  document.getElementById('filter-all').classList.toggle('active', mode === 'all');
  renderCommunityFeed();
}

function renderCommunityFeed() {
  const feed = document.getElementById('community-feed');
  const q = getDailyQuestion();

  const likesRaw = localStorage.getItem(LIKES_KEY);
  const likedIds = likesRaw ? JSON.parse(likesRaw) : [];

  const displayed = communityFilter === 'today'
    ? communityPosts.filter(p => !p.question || p.question === q)
    : communityPosts;

  if (displayed.length === 0) {
    feed.innerHTML = `
      <div class="loading-spinner" style="padding:40px 20px;">
        🌿 아직 ${communityFilter === 'today' ? '오늘 질문에' : '광장에'} 도착한 생각이 없어요.<br/>
        첫 번째로 내 생각을 익명으로 나누어 보세요.
      </div>
    `;
    return;
  }

  feed.innerHTML = displayed.map(post => {
    const isLiked = likedIds.includes(post.id);
    const maskedText = maskProfanityWeb(post.text);
    const timeAgo = formatTimeAgoWeb(post.created_at);

    return `
      <div class="feed-card" id="post-${post.id}">
        <div class="feed-header">
          <span class="feed-author">🌿 ${escHtml(post.author || '익명의 나그네')}</span>
          <div class="feed-right">
            <span class="feed-time">${timeAgo}</span>
            <button class="feed-report-btn" onclick="reportPostWeb('${post.id}')">🚨 신고</button>
          </div>
        </div>

        ${communityFilter === 'all' && post.question && post.question !== q ? `
          <div class="feed-q-ref">Q. "${escHtml(post.question)}"</div>
        ` : ''}

        <div class="feed-text">${escHtml(maskedText)}</div>

        <div class="feed-footer">
          <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLikeWeb('${post.id}')">
            ${isLiked ? '🌱 공감됨' : '🌿 공감해요'} ${post.likes || 0}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function formatTimeAgoWeb(dateStr) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
    return `${Math.floor(diff/86400)}일 전`;
  } catch {
    return '최근';
  }
}

async function shareMyAnswerToCommunity() {
  const data = loadData();
  const today = getTodayKey();
  const todayEntry = data.entries.find(e => e.date === today);

  if (!todayEntry || !todayEntry.text.trim()) {
    alert('오늘의 질문에 답변을 먼저 작성하고 저장해 주세요 🌿');
    return;
  }

  const sharedCheck = localStorage.getItem(`shared_community_${today}`);
  if (sharedCheck) {
    alert('오늘의 생각은 이미 광장에 익명으로 공유되었습니다 ✦');
    return;
  }

  if (hasProfanityWeb(todayEntry.text)) {
    alert('차분한 성찰 광장을 위해 부적절하거나 공격적인 단어는 등록할 수 없습니다 🌿');
    return;
  }

  const q = getDailyQuestion();
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        author: '익명의 나그네',
        text: todayEntry.text.trim(),
        question: q,
        likes: 1
      })
    });

    if (!res.ok) throw new Error('Post failed');
    const inserted = await res.json();

    localStorage.setItem(`shared_community_${today}`, '1');
    if (inserted && inserted[0]) {
      communityPosts.unshift(inserted[0]);
      renderCommunityFeed();
    }
    alert('오늘의 솔직한 생각이 광장에 익명으로 공유되었습니다 🌿');
  } catch (err) {
    alert('공유에 실패했습니다. 네트워크 연결을 확인해 주세요.');
  }
}

async function toggleLikeWeb(postId) {
  const likesRaw = localStorage.getItem(LIKES_KEY);
  let likedIds = likesRaw ? JSON.parse(likesRaw) : [];

  const post = communityPosts.find(p => p.id === postId);
  if (!post) return;

  const isLiked = likedIds.includes(postId);
  const nextLikes = isLiked ? Math.max(0, (post.likes || 1) - 1) : (post.likes || 0) + 1;

  if (isLiked) {
    likedIds = likedIds.filter(id => id !== postId);
  } else {
    likedIds.push(postId);
  }
  localStorage.setItem(LIKES_KEY, JSON.stringify(likedIds));

  post.likes = nextLikes;
  renderCommunityFeed();

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/community_posts?id=eq.${postId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ likes: nextLikes })
    });
  } catch (e) {
    console.warn(e);
  }
}

function reportPostWeb(postId) {
  if (!confirm('부적절하거나 불쾌감을 주는 게시글인가요?\n신고 즉시 내 피드에서 숨겨지며 관리자에게 검토 요청됩니다.')) return;

  const blockedRaw = localStorage.getItem(BLOCKED_KEY);
  let blockedIds = blockedRaw ? JSON.parse(blockedRaw) : [];
  if (!blockedIds.includes(postId)) {
    blockedIds.push(postId);
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(blockedIds));
  }

  communityPosts = communityPosts.filter(p => p.id !== postId);
  renderCommunityFeed();
  alert('해당 게시글이 피드에서 숨김 처리되었습니다 🌿');
}

// ══════════════════════════════════════════
// DATA BACKUP & RESTORE (웹)
// ══════════════════════════════════════════
function exportDataWeb() {
  const data = loadData();
  if (data.entries.length === 0) {
    alert('아직 백업할 성찰 기록이 없습니다 🌿');
    return;
  }

  const jsonStr = JSON.stringify(data, null, 2);

  // 1. JSON 파일 다운로드 트리거
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `잠깐_성찰기록_백업_${getTodayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // 2. 클립보드 복사 시도
  if (navigator.clipboard) {
    navigator.clipboard.writeText(jsonStr).then(() => {
      alert('백업 파일이 다운로드되었으며, 클립보드에도 복사되었습니다 🌿');
    }).catch(() => {
      alert('백업 파일이 다운로드되었습니다 🌿');
    });
  }
}

function openRestoreModal() {
  document.getElementById('restore-input').value = '';
  document.getElementById('restore-modal').classList.add('show');
}

function closeRestoreModal() {
  document.getElementById('restore-modal').classList.remove('show');
}

function confirmRestoreWeb() {
  const input = document.getElementById('restore-input').value.trim();
  if (!input) {
    alert('백업 텍스트를 입력해 주세요.');
    return;
  }

  try {
    const parsed = JSON.parse(input);
    if (!parsed.entries || !Array.isArray(parsed.entries)) {
      throw new Error('Invalid format');
    }

    const existing = loadData();
    const map = new Map(existing.entries.map(e => [e.date, e]));
    parsed.entries.forEach(e => map.set(e.date, e));

    const merged = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    saveData({ entries: merged });

    closeRestoreModal();
    updateAboutStats();
    alert(`총 ${merged.length}개의 기록이 안전하게 복원되었습니다 🌿`);
  } catch (err) {
    alert('올바른 백업 JSON 텍스트 형식이 아닙니다. 복사한 전체 텍스트를 붙여넣어 주세요.');
  }
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
// VIEW SWITCHING (4 Tabs)
// ══════════════════════════════════════════
function showView(name) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(`tab-${name}`);
  if (tab) tab.classList.add('active');

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${name}`);
  if (target) target.classList.add('active');

  if (name === 'today') renderToday();
  if (name === 'journal') switchJournalSubTab(currentJournalSubTab);
  if (name === 'community') loadCommunity();
  if (name === 'about') updateAboutStats();
}

function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'<br/>');
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

if (breathRing) breathRing.addEventListener('click', toggleBreath);

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

  const dismissed = localStorage.getItem('jamkkan_install_dismissed');
  if (dismissed) return;

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

window.addEventListener('appinstalled', () => {
  dismissInstall();
  console.log('잠깐 앱이 설치되었습니다 🌿');
});

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
initGate();
renderToday();
