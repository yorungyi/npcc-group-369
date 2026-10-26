/* ============================================================
   sales-view.js — 매출 탭 (휴대폰 우선)
   수치·계산은 연단체 대시보드 v3와 같다(구간: 총매출 상위 20 / 중위 / 하위 20,
   1인 객단가 = 총매출 ÷ 인원, 클럽하우스 = 전식 + 후식). 화면은 큰 숫자와 가로 막대만.
   ============================================================ */

import { el, fmtDate, won } from './ui.js';
import { waiting } from './promo-view.js';

const SITES = [
  { key: 'clubhouse', name: '클럽하우스', color: 'var(--site-ch)' },
  { key: 'starthouse', name: '스타트하우스', color: 'var(--site-st)' },
  { key: 'shade', name: '그늘집', color: 'var(--site-sh)' },
];
const METRICS = { total: '총매출', per: '1인 객단가', clubhouse: '클럽하우스' };
const TOP_N = 20;

const ui = { months: [], metric: 'total', q: '', all: false, open: null };
let rows = [];
let srcRef = null;

const $ = (id) => document.getElementById(id);
const man = (v) => `${Math.round(v / 1e4).toLocaleString('ko-KR')}`;
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const sum = (arr, k) => arr.reduce((a, r) => a + r[k], 0);

/** grp_visits 행 → 화면용. 탈회는 한 회차라도 표기가 있으면 그 단체 전체 */
function parse(data) {
  const left = new Set(data.filter((r) => r.is_withdrawn).map((r) => r.group_name));
  return data.map((r) => ({
    date: r.visit_date, month: Number(r.visit_date.slice(5, 7)), group: r.group_name, left: left.has(r.group_name),
    pax: Number(r.pax), pre: Number(r.clubhouse_pre), post: Number(r.clubhouse_post),
    clubhouse: Number(r.clubhouse), starthouse: Number(r.starthouse), shade: Number(r.shade), total: Number(r.total),
  }));
}

/** 선택한 달로 단체별 합산 + 총매출 순위·구간 */
function aggregate(list) {
  const m = new Map();
  list.forEach((r) => {
    let g = m.get(r.group);
    if (!g) { g = { group: r.group, left: r.left, visits: 0, used: 0, postVisits: 0, pax: 0, pre: 0, post: 0, clubhouse: 0, starthouse: 0, shade: 0, total: 0, rows: [] }; m.set(r.group, g); }
    g.visits += 1; if (r.total > 0) g.used += 1; if (r.post > 0) g.postVisits += 1;
    ['pax', 'pre', 'post', 'clubhouse', 'starthouse', 'shade', 'total'].forEach((k) => { g[k] += r[k]; });
    g.rows.push(r);
  });
  const arr = [...m.values()].map((g) => ({ ...g, per: g.pax ? Math.round(g.total / g.pax) : 0 }));
  arr.sort((a, b) => b.total - a.total || a.group.localeCompare(b.group, 'ko'));
  const n = arr.length;
  arr.forEach((g, i) => { g.tier = i < 20 ? 'top' : (n > 40 && i >= n - 20) || (n <= 40 && i >= 20) ? 'bottom' : 'mid'; });
  return arr;
}

function tierStats(arr, tier) {
  const s = arr.filter((g) => g.tier === tier);
  const t = sum(s, 'total');
  const pax = sum(s, 'pax');
  return { groups: s.length, total: t, per: pax ? Math.round(t / pax) : 0, post: s.filter((g) => g.post > 0).length };
}

const selected = () => rows.filter((r) => !ui.months.length || ui.months.includes(r.month));

/** 데이터가 바뀌면 다시 계산 (같은 배열이면 필터 상태 유지) */
export function renderSales(data, phase = 'ready') {
  if (phase !== 'ready') { $('sales').replaceChildren(waiting({ phase, error: null })); return; }
  if (data !== srcRef) { srcRef = data; rows = parse(data); ui.months = []; ui.open = null; ui.all = false; }
  draw();
}

/** 표지: 큰 총매출 + 기간 */
export function salesCover() {
  const sel = selected();
  if (!sel.length) return [el('p', { class: 'cover-sub', text: '확정된 엑셀 자료가 없습니다' })];
  const dates = sel.map((r) => r.date).sort();
  const groups = new Set(sel.map((r) => r.group)).size;
  const period = ui.months.length ? ui.months.map((m) => `${m}월`).join('·') : `${fmtDate(dates[0])} ~ ${fmtDate(dates[dates.length - 1])}`;
  return [
    el('div', { class: 'cover-big' }, [man(sum(sel, 'total')), el('small', { text: '만원' })]),
    el('p', { class: 'cover-sub' }, [period, `단체 ${groups}곳`, `방문 ${won(sel.length)}회`, `인원 ${won(sum(sel, 'pax'))}명`]
      .map((t) => el('span', { class: 'nowrap', text: t }))),
  ];
}

function draw() {
  const box = $('sales');
  if (!rows.length) { box.replaceChildren(el('p', { class: 'empty', text: '이 연도에 확정된 엑셀 자료가 없습니다. 자료 탭에서 엑셀을 올리면 매출이 집계됩니다.' })); return; }
  const sel = selected();
  const arr = aggregate(sel);
  box.replaceChildren(
    takeLine(arr),
    el('div', { class: 'split' }, [
      el('div', {}, [sitesBlock(sel), monthsBlock(), tiersBlock(arr)]),
      el('div', {}, [rankBlock(arr)]),
    ]),
  );
}

/* 결론 한 문장 */
function takeLine(arr) {
  if (arr.length < 40) return el('p', { class: 'take', text: '선택한 기간의 단체가 40곳 미만이라 상위·하위 20 비교는 참고용입니다.' });
  const all = sum(arr, 'total');
  const T = tierStats(arr, 'top');
  const B = tierStats(arr, 'bottom');
  const b = (t, cls) => el('b', { class: cls, text: t });
  return el('p', { class: 'take' }, [
    '상위 20개 단체가 매출의 ', b(pct(T.total / all)), ', 하위 20개 단체는 ', b(pct(B.total / all)), '를 차지합니다. 1인 객단가는 상위 ',
    b(`${won(T.per)}원`), ', 하위 ', b(`${won(B.per)}원`), '이고, 클럽하우스 후식사를 한 단체는 상위 20 중 ', b(`${T.post}곳`), ', 하위 20 중 ', b(`${B.post}곳`, 'hot'), '입니다.',
  ]);
}

/* 업장별 */
function sitesBlock(sel) {
  const total = sum(sel, 'total');
  const pax = sum(sel, 'pax');
  const kids = SITES.map((s) => {
    const v = sum(sel, s.key);
    const share = total ? v / total : 0;
    const sub = s.key === 'clubhouse' ? `전식 ${man(sum(sel, 'pre'))}만 · 후식 ${man(sum(sel, 'post'))}만` : '';
    const bar = el('span', { class: 'share' }, el('i'));
    bar.firstChild.style.width = `${share * 100}%`;
    bar.firstChild.style.background = s.color;
    const sw = el('i');
    sw.style.background = s.color;
    return el('div', { class: 'site' }, [
      el('span', { class: 'k' }, [sw, s.name]),
      el('span', { class: 'v' }, [man(v), el('small', { text: '만원' })]),
      el('span', { class: 's', text: sub }),
      el('span', { class: 'p', text: pct(share) }),
      bar,
    ]);
  });
  kids.push(el('div', { class: 'site' }, [
    el('span', { class: 'k', text: '1인 객단가' }),
    el('span', { class: 'v' }, [won(pax ? Math.round(total / pax) : 0), el('small', { text: '원' })]),
    el('span', { class: 's', text: `총매출 ÷ 인원 ${won(pax)}명` }),
    el('span', {}),
  ]));
  return el('section', {}, [el('h2', { class: 'rule', text: '업장별' }), ...kids]);
}

/* 월별: 달을 누르면 그 달만 */
function monthsBlock() {
  const months = [...new Set(rows.map((r) => r.month))].sort((a, b) => a - b);
  const data = months.map((m) => {
    const s = rows.filter((r) => r.month === m);
    return { m, total: sum(s, 'total'), parts: SITES.map((x) => sum(s, x.key)) };
  });
  const max = Math.max(1, ...data.map((d) => d.total));
  const legend = el('div', { class: 'legend' }, SITES.map((s) => { const i = el('i'); i.style.background = s.color; return el('span', {}, [i, s.name]); }));
  const list = el('div', { class: 'months' }, data.map((d) => {
    const on = ui.months.includes(d.m);
    const stack = el('span', { class: 'stack' });
    stack.style.width = `${(d.total / max) * 100}%`;
    d.parts.forEach((v, i) => { const seg = el('i'); seg.style.width = d.total ? `${(v / d.total) * 100}%` : '0'; seg.style.background = SITES[i].color; stack.append(seg); });
    return el('button', {
      type: 'button', class: `mrow${ui.months.length && !on ? ' dim' : ''}`, 'aria-pressed': String(on),
      'aria-label': `${d.m}월 ${won(d.total)}원`,
      onclick: () => { ui.months = on ? ui.months.filter((x) => x !== d.m) : [...ui.months, d.m].sort((a, b) => a - b); ui.open = null; draw(); window.dispatchEvent(new Event('npcc:cover')); },
    }, [el('span', { class: 'm', text: `${d.m}월` }), el('span', {}, stack), el('span', { class: 'v' }, [man(d.total), el('small', { text: '만' })])]);
  }));
  const head = el('h2', { class: 'rule' }, ['월별 매출', ui.months.length
    ? el('button', { type: 'button', class: 'btn btn-sm btn-quiet', onclick: () => { ui.months = []; draw(); window.dispatchEvent(new Event('npcc:cover')); } }, '전체 보기')
    : el('span', { class: 'h', text: '달을 누르면 그 달만' })]);
  head.lastChild.style.marginLeft = 'auto';
  return el('section', {}, [head, legend, list]);
}

/* 상위·하위 20 비교 */
function tiersBlock(arr) {
  if (arr.length < 40) return el('div');
  const all = sum(arr, 'total');
  const row = (label, t) => el('div', { class: 'trow' }, [el('b', { text: label }), el('span', { text: pct(all ? t.total / all : 0) }), el('span', { text: `${won(t.per)}원` }), el('span', { text: `${t.post}/${t.groups}곳` })]);
  return el('section', {}, [
    el('h2', { class: 'rule', text: '상위·하위 20 비교' }),
    el('div', { class: 'tiers' }, [
      el('div', { class: 'trow h' }, ['구간', '매출 비중', '1인 객단가', '후식 이용'].map((t) => el('span', { text: t }))),
      row('상위 20', tierStats(arr, 'top')),
      row('중위', tierStats(arr, 'mid')),
      row('하위 20', tierStats(arr, 'bottom')),
    ]),
  ]);
}

/* 단체 순위 */
function valueText(g) {
  if (ui.metric === 'per') return [won(g.per), el('small', { text: '원' })];
  return [man(g[ui.metric]), el('small', { text: '만' })];
}

function rankBlock(arr) {
  const sorted = arr.slice().sort((a, b) => b[ui.metric] - a[ui.metric] || b.total - a.total);
  const max = Math.max(1, ...sorted.map((g) => g[ui.metric]));
  const filtered = sorted.map((g, i) => ({ g, rank: i + 1 })).filter(({ g }) => !ui.q || g.group.includes(ui.q));
  const shown = ui.all || ui.q ? filtered : filtered.slice(0, TOP_N);

  const seg = el('div', { class: 'seg', role: 'group', 'aria-label': '순위 기준' }, Object.entries(METRICS).map(([k, label]) => el('button', {
    type: 'button', 'aria-pressed': String(ui.metric === k), onclick: () => { ui.metric = k; ui.open = null; draw(); },
  }, label)));
  const ns = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(ns, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('fill', 'none'); icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '2.2'); icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('aria-hidden', 'true');
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', '11'); circle.setAttribute('cy', '11'); circle.setAttribute('r', '7');
  const handle = document.createElementNS(ns, 'path');
  handle.setAttribute('d', 'M20 20l-3.5-3.5');
  icon.append(circle, handle);
  const search = el('div', { class: 'search' }, [
    icon,
    el('label', { class: 'sr-only', for: 'salesSearch', text: '단체명 검색' }),
    el('input', { class: 'field', id: 'salesSearch', type: 'search', placeholder: '단체명 검색', value: ui.q, autocomplete: 'off', oninput: (e) => { ui.q = e.target.value.trim(); redrawRank(arr); } }),
  ]);

  const list = el('div', { class: 'rank', id: 'rankList' }, shown.flatMap(({ g, rank }) => {
    const open = ui.open === g.group;
    const stack = el('span', { class: 'stack amount' }); // 한 색 막대: 길이 = 순위 기준 금액
    const fill = el('i');
    fill.style.width = `${Math.max(2, (g[ui.metric] / max) * 100)}%`;
    stack.append(fill);
    const btn = el('button', {
      type: 'button', class: 'rrow', 'aria-expanded': String(open),
      onclick: () => { ui.open = open ? null : g.group; redrawRank(arr); },
    }, [
      el('span', { class: 'r', text: rank }),
      el('span', { class: 'nm' }, [g.group, g.left ? el('span', { class: 'tag', text: '탈회' }) : null]),
      el('span', { class: 'v' }, valueText(g)),
      stack,
    ]);
    return open ? [btn, groupDetail(g)] : [btn];
  }));

  const more = !ui.q && filtered.length > TOP_N
    ? el('button', { type: 'button', class: 'btn more', onclick: () => { ui.all = !ui.all; redrawRank(arr); } }, ui.all ? `상위 ${TOP_N}곳만 보기` : `전체 ${filtered.length}곳 보기`)
    : null;

  return el('section', { id: 'rankSec' }, [
    el('h2', { class: 'rule' }, ['단체 순위', el('span', { class: 'h', text: `${METRICS[ui.metric]} 기준` })]),
    seg, search, list, more,
  ]);
}

/** 순위 칸만 다시 그려 검색창 입력이 끊기지 않게 */
function redrawRank(arr) {
  const old = $('rankSec');
  const input = $('salesSearch');
  const caret = input ? input.selectionStart : null;
  const focused = document.activeElement === input;
  const next = rankBlock(arr);
  old.replaceWith(next);
  if (focused) { const i = $('salesSearch'); i.focus(); if (caret != null) i.setSelectionRange(caret, caret); }
}

function groupDetail(g) {
  const kv = [
    ['총매출', `${won(g.total)}원`], ['1인 객단가', `${won(g.per)}원`],
    ['방문 (매출 발생)', `${g.visits}회 (${g.used}회)`], ['인원', `${won(g.pax)}명`],
    ['후식사 이용', `${g.postVisits}/${g.visits}회`],
    ...SITES.map((s) => [s.name, `${man(g[s.key])}만 · ${pct(g.total ? g[s.key] / g.total : 0)}`]),
  ];
  return el('div', { class: 'rdetail' }, [
    el('div', { class: 'kv' }, kv.map(([k, v]) => el('span', {}, [k, el('b', { text: v })]))),
    el('div', { class: 'visits' }, g.rows.slice().sort((a, b) => b.date.localeCompare(a.date)).map((r) => el('div', { class: 'vrow' }, [
      el('span', { text: fmtDate(r.date) }),
      el('span', { class: 'k v', text: `클럽 ${man(r.clubhouse)}만 · 스타트 ${man(r.starthouse)}만 · 그늘 ${man(r.shade)}만` }),
      el('span', { class: 'a', text: `${won(r.total)}원` }),
    ]))),
  ]);
}
