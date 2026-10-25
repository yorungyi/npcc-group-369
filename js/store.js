/* ============================================================
   store.js — 데이터 저장소
   - Supabase에서 네 테이블을 읽어 휴대폰에 사본(스냅샷)을 둔다 → 오프라인에서도 열람
   - 기록(체크·지급·메모)은 화면에 먼저 반영하고 대기열(outbox)에 쌓았다가 순서대로 전송
     → 전파가 약해도 입력이 끊기지 않는다. 같은 칸을 두 번 고치면 마지막 값만 보낸다.
   ============================================================ */

import { CONFIG } from './config.js';

export const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'npcc-grp-auth' },
});

const SNAP_KEY = 'npcc-grp-snapshot-v1';
const OUTBOX_KEY = 'npcc-grp-outbox-v1';

/* 테이블별 기본키 — 업서트 충돌 기준이자 대기열 병합 기준 */
const PK = {
  grp_marks: ['visit_date', 'group_name'],
  grp_rewards: ['year', 'group_name', 'milestone'],
  grp_settings: ['year'],
};

const state = {
  visits: [], marks: [], rewards: [], settings: [],
  fetchedAt: null,
};
const status = { online: navigator.onLine, syncing: false, pending: 0, lastSync: null, error: null, fromCache: false };
const listeners = new Set();

export const getData = () => state;
export const getStatus = () => ({ ...status });
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((fn) => fn());

/* ───────── 로컬 저장 (사생활 보호 모드 등에서 실패해도 앱은 동작) ───────── */
const readJSON = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const writeJSON = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 공간 부족 — 다음 동기화 때 서버가 원본 */ }
};

let outbox = readJSON(OUTBOX_KEY, []);
status.pending = outbox.length;

const keyOf = (table, row) => PK[table].map((k) => String(row[k])).join('|');
const tableArr = (table) => (table === 'grp_marks' ? 'marks' : table === 'grp_rewards' ? 'rewards' : 'settings');

/** 대기열의 작업을 받은 데이터 위에 덮어씌운다 (서버에 아직 안 간 기록도 화면에 보이도록) */
function overlay(data) {
  const out = { ...data };
  outbox.forEach((op) => {
    const arr = tableArr(op.table);
    const k = keyOf(op.table, op.row);
    const rest = out[arr].filter((r) => keyOf(op.table, r) !== k);
    out[arr] = op.kind === 'upsert' ? [...rest, op.row] : rest;
  });
  return out;
}

function applySnapshot(snap, fromCache) {
  const merged = overlay(snap);
  state.visits = merged.visits;
  state.marks = merged.marks;
  state.rewards = merged.rewards;
  state.settings = merged.settings;
  state.fetchedAt = snap.fetchedAt;
  status.fromCache = fromCache;
}

/** 1,000행 제한을 넘기기 위한 페이지 단위 읽기 */
async function fetchAll(table, order) {
  const size = 1000;
  let from = 0;
  const rows = [];
  for (;;) {
    const { data, error } = await sb.from(table).select('*').order(order[0]).order(order[1] || order[0]).range(from, from + size - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < size) return rows;
    from += size;
  }
}

/** 스냅샷을 먼저 보여주고, 서버에서 새로 받는다 */
export async function load() {
  const cached = readJSON(SNAP_KEY, null);
  if (cached && !state.fetchedAt) { applySnapshot(cached, true); emit(); }
  try {
    const [visits, marks, rewards, settings] = await Promise.all([
      fetchAll('grp_visits', ['visit_date', 'group_name']),
      fetchAll('grp_marks', ['visit_date', 'group_name']),
      fetchAll('grp_rewards', ['year', 'group_name']),
      fetchAll('grp_settings', ['year']),
    ]);
    const snap = { visits, marks, rewards, settings, fetchedAt: new Date().toISOString() };
    writeJSON(SNAP_KEY, snap);
    applySnapshot(snap, false);
    status.error = null;
    status.lastSync = snap.fetchedAt;
  } catch (err) {
    status.error = describe(err);
    if (!cached) throw err;
  }
  emit();
  flush();
}

/* 내 PC 미리보기 전용(localhost?fixture): 서버 없이 사본으로만 동작, 기록은 화면에만 */
let fixtureMode = false;
export async function loadFixture(url) {
  const snap = await (await fetch(url, { cache: 'no-store' })).json();
  fixtureMode = true;
  outbox = [];
  status.pending = 0;
  applySnapshot({ marks: [], rewards: [], settings: [], ...snap, fetchedAt: new Date().toISOString() }, false);
  emit();
}

/** 기록 한 건: 화면 즉시 반영 → 대기열 → 전송 */
export function write(table, kind, row) {
  const k = keyOf(table, row);
  if (fixtureMode) {
    const arr = tableArr(table);
    state[arr] = [...state[arr].filter((r) => keyOf(table, r) !== k), ...(kind === 'upsert' ? [row] : [])];
    emit();
    return;
  }
  outbox = [...outbox.filter((op) => !(op.table === table && keyOf(table, op.row) === k)), { table, kind, row, at: Date.now() }];
  writeJSON(OUTBOX_KEY, outbox);
  status.pending = outbox.length;

  const arr = tableArr(table);
  const rest = state[arr].filter((r) => keyOf(table, r) !== k);
  state[arr] = kind === 'upsert' ? [...rest, row] : rest;
  emit();
  flush();
}

const isTransient = (err) => !err || !err.code || err.code === 'PGRST301' || /fetch|network|JWT/i.test(err.message || '');

function describe(err) {
  if (!err) return null;
  if (!navigator.onLine) return '오프라인';
  if (err.code === 'PGRST301' || /JWT/i.test(err.message || '')) return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
  if (err.code === '42501') return '권한이 없습니다. 소유자 계정으로 로그인했는지 확인해 주세요.';
  return err.message || '알 수 없는 오류';
}

let flushing = null;
/** 대기열을 순서대로 전송. 네트워크 오류면 멈추고 다음 기회에 다시 */
export function flush() {
  if (flushing) return flushing;
  if (!outbox.length || !navigator.onLine) { emit(); return Promise.resolve(); }
  status.syncing = true; emit();
  flushing = (async () => {
    while (outbox.length) {
      const op = outbox[0];
      const q = sb.from(op.table);
      const match = Object.fromEntries(PK[op.table].map((k) => [k, op.row[k]]));
      const { error } = op.kind === 'upsert'
        ? await q.upsert(op.row, { onConflict: PK[op.table].join(',') })
        : await q.delete().match(match);
      if (error && isTransient(error)) { status.error = describe(error); break; }
      // 검증 오류(값이 규칙 위반)는 다시 보내도 실패하므로 버리고 알린다
      if (error) status.error = `기록 1건을 저장하지 못했습니다: ${describe(error)}`;
      else status.error = null;
      outbox = outbox.slice(1);
      writeJSON(OUTBOX_KEY, outbox);
      status.pending = outbox.length;
    }
    if (!outbox.length) status.lastSync = new Date().toISOString();
  })().finally(() => {
    flushing = null;
    status.syncing = false;
    status.pending = outbox.length;
    emit();
  });
  return flushing;
}

/** 엑셀 업로드: 한 해의 확정 회차를 서버에서 통째로 교체 */
export async function replaceYear(year, rows, source) {
  const { data, error } = await sb.rpc('grp_replace_year', { p_year: year, p_rows: rows, p_source: source });
  if (error) throw new Error(describe(error));
  await load();
  return data;
}

/** 로그아웃 시 휴대폰에 남은 사본과 대기열을 지운다 */
export function clearLocal() {
  try { localStorage.removeItem(SNAP_KEY); localStorage.removeItem(OUTBOX_KEY); } catch { /* 무시 */ }
  outbox = [];
  Object.assign(state, { visits: [], marks: [], rewards: [], settings: [], fetchedAt: null });
  status.pending = 0;
}

export const pendingCount = () => outbox.length;

window.addEventListener('online', () => { status.online = true; emit(); flush(); });
window.addEventListener('offline', () => { status.online = false; emit(); });
setInterval(() => { if (outbox.length) flush(); }, CONFIG.SYNC_INTERVAL);
