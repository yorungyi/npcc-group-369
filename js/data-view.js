/* ============================================================
   data-view.js — 자료 탭
   ① 엑셀 올리기: 브라우저에서 바로 읽고 → 시트 합계행 대조 → 일치할 때만 반영
   ② 확인 필요: 1인 기준 미달 제외, 달성 없는 지급 기록, 수동 판정
   ③ 연도별 규칙  ④ 동기화·계정
   ============================================================ */

import { CONFIG } from './config.js';
import { parseSheet, sumRows, compareTotals } from './promo-core.js';
import { write, replaceYear, getStatus, flush, load, pendingCount } from './store.js';
import { el, fmtDate, toast, won, guard } from './ui.js';

const SHEETJS = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
// 받은 파일이 이 해시와 다르면 브라우저가 실행을 거부한다 (CDN 변조 방지)
const SHEETJS_SRI = 'sha384-EnyY0/GSHQGSxSgMwaIPzSESbqoOLSexfnSMN2AP+39Ckmn92stwABZynq1JyzdT';
const SHEET_NAME = '단체팀 식음이용현황';
const MAX_FILE = 15 * 1024 * 1024;

const $ = (id) => document.getElementById(id);
let ctx = null;
let parsed = null; // 마지막으로 읽은 엑셀

export function initData({ onLogout }) {
  const input = $('fileInput');
  const drop = $('fileDrop');
  input.addEventListener('change', () => { if (input.files[0]) readFile(input.files[0]); input.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('is-over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readFile(f); });

  $('legacyBtn').addEventListener('click', (e) => guard(e.currentTarget, settleLegacy));
  $('rulesForm').addEventListener('submit', (e) => { e.preventDefault(); saveRules(); });
  $('syncNow').addEventListener('click', (e) => guard(e.currentTarget, async () => {
    try { await flush(); await load(); toast('서버에서 새로 받았습니다'); } catch { toast('받지 못했습니다. 연결을 확인해 주세요.'); }
  }));
  $('logoutBtn').addEventListener('click', () => {
    const n = pendingCount();
    if (n && !window.confirm(`아직 서버로 가지 않은 기록이 ${n}건 있습니다. 로그아웃하면 이 기록은 사라집니다. 계속할까요?`)) return;
    onLogout();
  });
}

export function renderData(next) {
  ctx = next;
  $('rulesTitle').textContent = `규칙 · ${String(ctx.year).slice(2)}년`;
  if (document.activeElement?.closest('#rulesForm') == null) {
    $('ruleTh').value = ctx.settings.threshold_per_pax;
    $('rule3').value = ctx.settings.items['3'];
    $('rule6').value = ctx.settings.items['6'];
    $('rule9').value = ctx.settings.items['9'];
  }
  drawLegacy();
  drawIssues();
  drawSync();
  if (parsed) drawUpload();
}

/* ───────── 앱 도입 전 달성분 정리 (1회) ───────── */
function drawLegacy() {
  const n = ctx.promo.groups.reduce((a, g) => a + g.legacyPending.length, 0);
  $('legacySec').hidden = !n;
  if (!n) return;
  $('legacyText').textContent = `${fmtDate(CONFIG.APP_START)} 이전에 달성한 3·6·9 ${n}건은 지급 체크 기록이 없습니다. 이미 지급한 것으로 한 번에 정리합니다(지급일 = 달성일, 메모 「앱 도입 전 지급」).`;
}

function settleLegacy() {
  const rows = [];
  ctx.promo.groups.forEach((g) => g.legacyPending.forEach((m) => {
    const st = g.rewardState[m];
    rows.push({ year: ctx.year, group_name: g.name, milestone: m, given_on: st.reached.date, item: st.item, memo: '앱 도입 전 지급', legacy: true });
  }));
  rows.forEach((r) => write('grp_rewards', 'upsert', r));
  toast(`도입 전 달성 ${rows.length}건을 지급 완료로 정리했습니다`, { label: '되돌리기', run: () => rows.forEach((r) => write('grp_rewards', 'delete', r)) });
}

/* ───────── ① 엑셀 ───────── */
function loadSheetJS() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SHEETJS;
    s.integrity = SHEETJS_SRI;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error('엑셀 읽기 도구를 받지 못했습니다. 인터넷 연결을 확인해 주세요.'));
    document.head.appendChild(s);
  });
}

async function readFile(file) {
  const box = $('uploadResult');
  box.hidden = false;
  if (file.size > MAX_FILE) { box.replaceChildren(el('p', { class: 'verdict no', text: '파일이 너무 큽니다 (15MB 초과).' })); return; }
  box.replaceChildren(el('p', { class: 'muted', text: `${file.name} 읽는 중…` }));
  try {
    const XLSX = await loadSheetJS();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const name = wb.SheetNames.includes(SHEET_NAME) ? SHEET_NAME : wb.SheetNames[0];
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: null });
    const res = parseSheet(aoa);
    parsed = { file: file.name, sheet: name, ...res, totals: sumRows(res.rows) };
    drawUpload();
  } catch (err) {
    parsed = null;
    box.replaceChildren(el('p', { class: 'verdict no', text: `읽지 못했습니다: ${err.message}` }));
  }
}

function diffWithServer(year, rows) {
  const cur = new Map(ctx.visits.filter((v) => Number(v.visit_date.slice(0, 4)) === year).map((v) => [`${v.visit_date}|${v.group_name}`, v]));
  const next = new Map(rows.map((r) => [`${r.visit_date}|${r.group_name}`, r]));
  let added = 0; let changed = 0; let removed = 0;
  next.forEach((r, k) => {
    const c = cur.get(k);
    if (!c) added += 1;
    else if (['pax', 'clubhouse_pre', 'clubhouse_post', 'starthouse', 'shade', 'total', 'is_withdrawn'].some((f) => Number(c[f]) !== Number(r[f]))) changed += 1;
  });
  cur.forEach((_, k) => { if (!next.has(k)) removed += 1; });
  return { added, changed, removed, before: cur.size };
}

function drawUpload() {
  const p = parsed;
  const box = $('uploadResult');
  const cmp = compareTotals(p.totals, p.sheetTotals);
  const totalsOk = Boolean(p.sheetTotals) && cmp.every((c) => c.ok);
  const oneYear = p.years.length === 1;
  const ok = totalsOk && oneYear && !p.errors.length && p.rows.length > 0;
  const year = p.years[0];

  const kids = [
    el('p', { class: 'muted', text: `${p.file} · 시트 「${p.sheet}」 · ${won(p.rows.length)}회 · 단체 ${new Set(p.rows.map((r) => r.group_name)).size}곳 · ${p.years.join(', ')}년` }),
    el('table', { class: 'vtable' }, [
      el('thead', {}, el('tr', {}, ['항목', '읽은 합계', '시트 합계행', ''].map((h) => el('th', { text: h })))),
      el('tbody', {}, cmp.map((c) => el('tr', {}, [
        el('td', { text: c.label }), el('td', { text: won(c.parsed) }), el('td', { text: c.sheet == null ? '없음' : won(c.sheet) }),
        el('td', {}, el('span', { class: `okmark${c.ok ? '' : ' no'}`, text: c.ok ? '일치' : '불일치' })),
      ]))),
    ]),
  ];
  if (!p.sheetTotals) kids.push(el('p', { class: 'verdict no', text: '시트 맨 아래 합계행을 찾지 못했습니다. 합계행이 있는 원본 시트인지 확인해 주세요.' }));
  if (!oneYear && p.rows.length) kids.push(el('p', { class: 'verdict no', text: `한 파일에 여러 연도(${p.years.join(', ')})가 섞여 있습니다. 연도별로 나눠 올려 주세요.` }));
  if (p.errors.length) kids.push(el('ul', { class: 'errs' }, p.errors.slice(0, 8).map((e) => el('li', { text: e }))));

  if (ok) {
    const d = diffWithServer(year, p.rows);
    kids.push(el('div', { class: 'diff' }, [
      el('span', { text: `지금 서버 ${won(d.before)}회 →` }),
      el('span', {}, ['추가 ', el('b', { text: d.added })]),
      el('span', {}, ['변경 ', el('b', { text: d.changed })]),
      el('span', {}, ['삭제 ', el('b', { text: d.removed })]),
    ]));
    kids.push(el('p', { class: 'verdict', text: `시트 합계행과 모두 일치합니다. 반영하면 ${year}년 확정 자료가 이 파일로 교체됩니다. 현장 체크·지급 기록은 그대로 남습니다.` }));
    kids.push(el('div', { class: 'btnrow' }, [
      el('button', { type: 'button', class: 'btn btn-primary', onclick: (e) => guard(e.currentTarget, () => commit(year)) }, `${year}년 자료 반영`),
      el('button', { type: 'button', class: 'btn btn-quiet', onclick: () => { parsed = null; box.hidden = true; } }, '취소'),
    ]));
  } else {
    kids.push(el('div', { class: 'btnrow' }, el('button', { type: 'button', class: 'btn btn-quiet', onclick: () => { parsed = null; box.hidden = true; } }, '닫기')));
  }
  box.replaceChildren(...kids);
}

async function commit(year) {
  if (!navigator.onLine) { toast('오프라인에서는 반영할 수 없습니다. 연결된 뒤 다시 눌러 주세요.'); return; }
  try {
    const res = await replaceYear(year, parsed.rows, parsed.file);
    toast(`${year}년 자료 반영 완료 · ${won(res.inserted)}회`);
    parsed = null;
    $('uploadResult').hidden = true;
  } catch (err) {
    toast(`반영하지 못했습니다: ${err.message}`);
  }
}

/* ───────── ② 확인 필요 ───────── */
function markOf(group, date) {
  return ctx.marks.find((m) => m.group_name === group && m.visit_date === date) || null;
}
function setOverride(group, date, value) {
  const prev = markOf(group, date);
  const row = { visit_date: date, group_name: group, field_post: prev?.field_post ?? null, field_amount: prev?.field_amount ?? null, override_counted: value, memo: prev?.memo ?? null };
  if (value == null && row.field_post == null && !row.memo) write('grp_marks', 'delete', row);
  else write('grp_marks', 'upsert', row);
  toast('반영했습니다', { label: '되돌리기', run: () => (prev ? write('grp_marks', 'upsert', prev) : write('grp_marks', 'delete', row)) });
}
function keepExcel(group, date) {
  const prev = markOf(group, date);
  if (!prev) return;
  if (prev.override_counted != null || prev.memo) write('grp_marks', 'upsert', { ...prev, field_post: null, field_amount: null });
  else write('grp_marks', 'delete', prev);
  toast('엑셀 기준으로 정리했습니다', { label: '되돌리기', run: () => write('grp_marks', 'upsert', prev) });
}

function drawIssues() {
  const list = $('issuesList');
  const overridden = [];
  ctx.promo.groups.forEach((g) => g.visits.forEach((v) => { if (v.override != null) overridden.push({ g, v }); }));
  const items = ctx.promo.issues.map((i) => {
    const btn = (label, fn, cls = 'btn btn-sm') => el('button', { type: 'button', class: cls, onclick: (e) => guard(e.currentTarget, fn) }, label);
    if (i.type === 'below') {
      return el('div', { class: 'issue' }, [
        el('div', { class: 't' }, [el('b', { text: `${i.group} · ${fmtDate(i.date)}` }), el('span', { class: 'muted', text: '기준 미달 제외' })]),
        el('span', { text: `후식 ${won(i.visit.post)}원 ÷ ${i.visit.pax}명 = 1인 ${won(Math.round(i.visit.perPax))}원 (기준 ${won(ctx.promo.threshold)}원)` }),
        el('div', { class: 'acts' }, [btn('후식사로 인정', () => setOverride(i.group, i.date, true)), btn('제외 유지', () => setOverride(i.group, i.date, false), 'btn btn-sm btn-quiet')]),
      ]);
    }
    if (i.type === 'mismatch') {
      const fieldSaid = i.visit.field ? '후식 진행' : '방문만';
      const excelSaid = i.visit.qualifies ? `후식 인정 (${won(i.visit.post)}원)` : (i.visit.post ? `기준 미달 (${won(i.visit.post)}원)` : '후식 매출 없음');
      return el('div', { class: 'issue' }, [
        el('div', { class: 't' }, [el('b', { text: `${i.group} · ${fmtDate(i.date)}` }), el('span', { class: 'muted', text: '엑셀 ≠ 현장 체크' })]),
        el('span', { text: `현장: ${fieldSaid} / 엑셀: ${excelSaid}` }),
        el('div', { class: 'acts' }, [
          btn('엑셀 기준 유지', () => keepExcel(i.group, i.date)),
          btn(i.visit.field ? '현장 체크대로 인정' : '현장 체크대로 제외', () => setOverride(i.group, i.date, i.visit.field), 'btn btn-sm btn-quiet'),
        ]),
      ]);
    }
    return el('div', { class: 'issue' }, [
      el('div', { class: 't' }, [el('b', { text: `${i.group} · ${i.milestone}회 지급 기록` }), el('span', { class: 'muted', text: '달성 기록 없음' })]),
      el('span', { text: `${fmtDate(i.reward.given_on)}에 ${i.reward.item} 지급으로 기록됐지만, 지금 자료로는 ${i.milestone}회에 도달하지 않았습니다.` }),
      el('div', { class: 'acts' }, [btn('지급 기록 지우기', () => { write('grp_rewards', 'delete', i.reward); toast('지웠습니다', { label: '되돌리기', run: () => write('grp_rewards', 'upsert', i.reward) }); })]),
    ]);
  });
  overridden.forEach(({ g, v }) => items.push(el('div', { class: 'issue' }, [
    el('div', { class: 't' }, [el('b', { text: `${g.name} · ${fmtDate(v.date)}` }), el('span', { class: 'muted', text: v.override ? '수동 인정' : '수동 제외' })]),
    el('div', { class: 'acts' }, [el('button', { type: 'button', class: 'btn btn-sm btn-quiet', onclick: (e) => guard(e.currentTarget, () => setOverride(g.name, v.date, null)) }, '수동 판정 취소')]),
  ])));

  $('issuesN').textContent = ctx.promo.issues.length;
  const badge = $('dataBadge');
  badge.hidden = !ctx.promo.issues.length;
  badge.textContent = ctx.promo.issues.length;
  list.replaceChildren(...(items.length ? items : [el('p', { class: 'empty', text: '확인할 건이 없습니다.' })]));
}

/* ───────── ③ 규칙 ───────── */
function saveRules() {
  const th = Math.round(Number($('ruleTh').value));
  const items = { 3: $('rule3').value.trim(), 6: $('rule6').value.trim(), 9: $('rule9').value.trim() };
  if (!(th >= 1000 && th <= 1000000)) { toast('1인 기준 금액은 1,000원 이상으로 넣어 주세요'); return; }
  if (!items[3] || !items[6] || !items[9]) { toast('보상 품목을 모두 채워 주세요'); return; }
  write('grp_settings', 'upsert', { year: ctx.year, threshold_per_pax: th, items });
  toast(`${ctx.year}년 규칙을 저장했습니다`);
}

/* ───────── ④ 동기화 ───────── */
function drawSync() {
  const s = getStatus();
  const when = (iso) => (iso ? `${fmtDate(iso.slice(0, 10))} ${iso.slice(11, 16)}` : '-');
  const local = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return when(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`);
  };
  const rows = [
    ['연결', s.online ? '온라인' : '오프라인 (기록은 휴대폰에 저장 후 자동 전송)'],
    ['전송 대기', `${s.pending}건`],
    ['마지막으로 받은 시각', local(ctx.fetchedAt)],
    ['확정 방문 회차 (전체 연도)', `${won(ctx.visits.length)}회`],
    ['지급 체크 기록', `${won(ctx.rewards.length)}건`],
    ['계정', ctx.email || CONFIG.OWNER_EMAIL],
  ];
  if (s.error) rows.push(['최근 오류', s.error]);
  $('syncKv').replaceChildren(...rows.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })]));
}
