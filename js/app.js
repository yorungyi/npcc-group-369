/* ============================================================
   app.js — 시작점: 로그인 · 탭 전환 · 연도 선택 · 다시 그리기
   ============================================================ */

import { CONFIG } from './config.js';
import { buildPromo } from './promo-core.js';
import { sb, load, loadFixture, getData, getStatus, subscribe, clearLocal, flush } from './store.js';
import { initPromo, renderPromo } from './promo-view.js';
import { initSales } from './sales-view.js';
import { initData, renderData } from './data-view.js';
import { todayISO } from './ui.js';

const $ = (id) => document.getElementById(id);
const TABS = { promo: '3·6·9 프로모션', sales: '연단체 매출', data: '자료 · 확인' };
const TAB_KEY = 'npcc-grp-tab';

const app = { tab: 'promo', year: null, email: null, sales: null, booted: false };

/* ───────── 로그인 ───────── */
function showLogin(message) {
  $('shell').hidden = true;
  $('login').hidden = false;
  const email = $('loginEmail');
  if (!email.value) email.value = CONFIG.OWNER_EMAIL;
  $('loginErr').textContent = message || '';
  (email.value ? $('loginPw') : email).focus();
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('loginBtn');
  btn.disabled = true;
  $('loginErr').textContent = '';
  const { data, error } = await sb.auth.signInWithPassword({ email: $('loginEmail').value.trim(), password: $('loginPw').value });
  btn.disabled = false;
  $('loginPw').value = '';
  if (error) {
    $('loginErr').textContent = /invalid/i.test(error.message) ? '이메일 또는 비밀번호가 맞지 않습니다.' : `로그인하지 못했습니다: ${error.message}`;
    return;
  }
  start(data.session);
});

async function logout() {
  await sb.auth.signOut().catch(() => {});
  clearLocal();
  app.booted = false;
  showLogin('로그아웃했습니다.');
}

/* ───────── 탭 ───────── */
function setTab(tab) {
  app.tab = TABS[tab] ? tab : 'promo';
  try { localStorage.setItem(TAB_KEY, app.tab); } catch { /* 무시 */ }
  Object.keys(TABS).forEach((k) => { $(`tab-${k}`).hidden = k !== app.tab; });
  document.querySelectorAll('.tabbar button').forEach((b) => {
    if (b.dataset.tab === app.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('barTitle').textContent = TABS[app.tab];
  window.scrollTo({ top: 0 });
  render();
}
document.querySelectorAll('.tabbar button').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

/* ───────── 연도 ───────── */
function yearsAvailable(data, today) {
  const ys = new Set([Number(today.slice(0, 4))]);
  data.visits.forEach((v) => ys.add(Number(v.visit_date.slice(0, 4))));
  data.marks.forEach((m) => ys.add(Number(m.visit_date.slice(0, 4))));
  return [...ys].sort((a, b) => b - a);
}
function drawYears(years) {
  const sel = $('yearSel');
  const want = years.map(String).join(',');
  if (sel.dataset.years !== want) {
    sel.replaceChildren(...years.map((y) => { const o = document.createElement('option'); o.value = y; o.textContent = `${String(y).slice(2)}년`; return o; }));
    sel.dataset.years = want;
  }
  sel.value = String(app.year);
}
$('yearSel').addEventListener('change', (e) => { app.year = Number(e.target.value); render(); });

/** 그 해의 규칙. 없으면 직전 연도 규칙, 그것도 없으면 기본값 */
function settingsFor(year, all) {
  const exact = all.find((s) => s.year === year);
  if (exact) return exact;
  const prev = all.filter((s) => s.year < year).sort((a, b) => b.year - a.year)[0];
  return { year, threshold_per_pax: prev?.threshold_per_pax ?? CONFIG.DEFAULT_THRESHOLD, items: { ...(prev?.items ?? CONFIG.DEFAULT_ITEMS) } };
}

/* ───────── 동기화 표시 ───────── */
function drawSync() {
  const s = getStatus();
  const btn = $('syncBtn');
  let state = 'ok'; let text = '동기화됨';
  if (!s.online) { state = 'offline'; text = s.pending ? `오프라인 · 대기 ${s.pending}` : '오프라인'; }
  else if (s.syncing) { state = 'syncing'; text = '보내는 중'; }
  else if (s.pending) { state = 'pending'; text = `대기 ${s.pending}`; }
  else if (s.error) { state = 'error'; text = '확인 필요'; }
  btn.dataset.state = state;
  $('syncText').textContent = text;
  btn.title = s.error || '';
  if (s.error && /로그인이 만료/.test(s.error)) showLogin(s.error);
}
$('syncBtn').addEventListener('click', () => { flush(); setTab('data'); });

/* ───────── 그리기 ───────── */
function render() {
  if (!app.booted) return;
  const data = getData();
  const today = todayISO();
  const years = yearsAvailable(data, today);
  if (!app.year || !years.includes(app.year)) app.year = years[0];
  drawYears(years);
  drawSync();

  const settings = settingsFor(app.year, data.settings);
  const promo = buildPromo({
    year: app.year, visits: data.visits, marks: data.marks, rewards: data.rewards, settings, today,
    appStart: CONFIG.APP_START, predict: { minShare: CONFIG.PATTERN_MIN_SHARE, minVisits: CONFIG.PATTERN_MIN_VISITS },
  });
  const ctx = { year: app.year, promo, settings, today, marks: data.marks, visits: data.visits, rewards: data.rewards, fetchedAt: data.fetchedAt, email: app.email };

  renderPromo(ctx);
  renderData(ctx);
  const yy = `${String(app.year).slice(2)}년`;
  if (app.tab === 'sales') {
    app.sales.render(data.visits.filter((v) => Number(v.visit_date.slice(0, 4)) === app.year), yy);
    $('barSub').textContent = `${yy} · 엑셀 확정분만 집계`;
  }
  if (app.tab === 'data') $('barSub').textContent = `${yy} · 엑셀 반영 · 확인 · 규칙`;
  // 프로모션 탭의 부제는 renderPromo 가 쓴다
}

/* ───────── 시작 ───────── */
let viewsReady = false;
async function start(session, loader = load) {
  app.email = session?.user?.email || null;
  $('login').hidden = true;
  $('shell').hidden = false;
  if (!viewsReady) {
    initPromo();
    initData({ onLogout: logout });
    app.sales = initSales();
    subscribe(render);
    viewsReady = true;
  }
  app.booted = true;
  let saved = 'promo';
  try { saved = localStorage.getItem(TAB_KEY) || 'promo'; } catch { /* 무시 */ }
  setTab(saved);
  try {
    await loader();
  } catch (err) {
    drawSync();
    if (/JWT|로그인/.test(String(err?.message))) showLogin('로그인이 만료되었습니다. 다시 로그인해 주세요.');
  }
}

// 스크롤하면 상단바 아래 선
window.addEventListener('scroll', () => { $('bar').classList.toggle('is-scrolled', window.scrollY > 4); }, { passive: true });

// 날짜가 바뀌면(자정을 넘겨 켜 둔 경우) 오늘 기준을 다시 계산
let lastDay = todayISO();
setInterval(() => { const t = todayISO(); if (t !== lastDay) { lastDay = t; render(); } }, 60000);

// 내 PC 미리보기: http://localhost:5179/?fixture — 로그인·서버 없이 dev/fixture.json 사본으로 화면 점검
const FIXTURE = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('fixture');

(async () => {
  if (FIXTURE) {
    await start({ user: { email: '미리보기(사본)' } }, () => loadFixture('dev/fixture.json'));
    return;
  }
  const { data } = await sb.auth.getSession();
  if (data.session) start(data.session);
  else showLogin();
})();

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
