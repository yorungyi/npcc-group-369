/* ============================================================
   promo-view.js — 3·6·9 프로모션 탭
   사다리(0~9회) → 지급 대기 → 다음 후식이면 지급 → 칸별 단체.
   카드를 누르면 펼쳐져 스탬프 카드·보상·기록·방문 이력이 보인다.
   ============================================================ */

import { CONFIG } from './config.js';
import { MILESTONES, MAX_STAMPS, nextRewardGroups, pendingRewards, ladder, addDays } from './promo-core.js';
import { write } from './store.js';
import { el, fmtDate, relDay, toast, won, guard } from './ui.js';

const ui = { filter: 'all', rung: null, q: '', open: new Set(), memo: new Map(), recDate: new Map(), recAmt: new Map() };
let ctx = null;           // { year, promo, settings, today, marks }
let justStamped = null;   // { name, n } — 방금 찍은 스탬프 (애니메이션용)

const $ = (id) => document.getElementById(id);

export function initPromo() {
  $('promoSearch').addEventListener('input', (e) => { ui.q = e.target.value.trim(); draw(); });
}

/** 데이터가 바뀔 때마다 호출 */
export function renderPromo(next) {
  ctx = next;
  draw();
}

/* ───────── 거르기 ───────── */
function markOn(g, date) {
  return ctx.marks.find((m) => m.group_name === g.name && m.visit_date === date && (m.field_post != null)) || null;
}
function matches(g) {
  if (ui.q && !g.name.includes(ui.q) && !(g.label || '').includes(ui.q)) return false;
  if (ui.rung != null && g.count !== ui.rung) return false;
  const t = ctx.today;
  if (ui.filter === 'today') return g.predicted?.date === t || Boolean(markOn(g, t));
  if (ui.filter === 'week') {
    const end = addDays(t, 6);
    const p = g.predicted?.date;
    return Boolean(markOn(g, t)) || Boolean(p && p >= t && p <= end);
  }
  return true;
}
const filtering = () => ui.q || ui.rung != null || ui.filter !== 'all';

/* ───────── 그리기 ───────── */
function draw() {
  if (!ctx) return;
  const { promo } = ctx;
  const active = promo.groups.filter((g) => !g.withdrawn);
  const before = captureRects();

  drawLadder(active);
  drawChips(active);

  const pend = pendingRewards(active).filter((p) => p.reachedOn >= CONFIG.APP_START || p.group.rewardState[p.milestone].reached.provisional);
  const legacy = promo.groups.reduce((a, g) => a + g.legacyPending.length, 0);
  const pendShown = pend.filter((p) => matches(p.group));
  $('pendingN').textContent = ` ${pend.length}`;
  $('pendingList').replaceChildren(
    ...pendShown.map((p) => card(p.group, 'pending', p.milestone)),
    ...(legacy ? [legacyNotice(legacy)] : []),
    ...(!pendShown.length && !legacy ? [el('p', { class: 'empty', text: pend.length ? '검색 조건에 맞는 지급 대기가 없습니다.' : '지급할 서비스가 없습니다. 달성하면 여기에 바로 뜹니다.' })] : []),
  );
  $('pendingSec').hidden = !pend.length && !legacy && filtering();

  const pendingNames = new Set(pend.map((p) => p.group.name));
  const nexts = nextRewardGroups(active).filter((g) => !pendingNames.has(g.name));
  const nextShown = nexts.filter(matches);
  $('nextN').textContent = ` ${nexts.length}`;
  $('nextList').replaceChildren(...(nextShown.length ? nextShown.map((g) => card(g, 'next')) : [el('p', { class: 'empty', text: '조건에 맞는 단체가 없습니다.' })]));

  drawRungSections(active, new Set([...pendingNames, ...nexts.map((g) => g.name)]));

  const badge = $('promoBadge');
  badge.hidden = !pend.length;
  badge.textContent = pend.length;
  $('barSub').textContent = `${fmtDate(ctx.today)} · 지급 ${nexts.length} · 대기 ${pend.length}`;

  playFlip(before);
  justStamped = null;
}

function drawLadder(active) {
  const rungs = ladder(active);
  const max = Math.max(1, ...rungs.map((r) => r.groups.length));
  const counted = active.reduce((a, g) => a + g.visits.filter((v) => v.counted).length, 0);
  $('ladderNote').textContent = `탈회 제외 ${active.length}개 단체 · 후식 인정 ${won(counted)}회 · 1인 ${won(ctx.promo.threshold)}원 이상`;
  $('rungs').replaceChildren(...rungs.map(({ rung, groups }) => {
    const reward = MILESTONES.includes(rung) ? rung : null;
    const nextOf = MILESTONES.find((m) => m === rung + 1) || null;
    const b = el('button', {
      type: 'button', class: 'rung', 'aria-pressed': String(ui.rung === rung),
      'aria-label': `${rung}회 ${groups.length}곳${nextOf ? ` — 다음 후식이면 ${nextOf}회` : ''}`,
      'data-reward': reward ? '' : null, 'data-next': nextOf ? '' : null,
      dataset: { r: reward || nextOf },
      onclick: () => { ui.rung = ui.rung === rung ? null : rung; draw(); if (ui.rung != null) $('nextSec').scrollIntoView({ block: 'start', behavior: 'smooth' }); },
    }, [
      el('span', { class: 'n', text: groups.length || '' }),
      el('span', { class: 'col' }),
      el('span', { class: 'lab', text: rung === MAX_STAMPS ? '9' : String(rung) }),
    ]);
    b.querySelector('.col').style.setProperty('--h', `${Math.round((groups.length / max) * 72)}px`);
    return b;
  }));
}

function drawChips(active) {
  const t = ctx.today;
  const end = addDays(t, 6);
  const nToday = active.filter((g) => g.predicted?.date === t || markOn(g, t)).length;
  const nWeek = active.filter((g) => markOn(g, t) || (g.predicted && g.predicted.date >= t && g.predicted.date <= end)).length;
  const chip = (key, label, n) => el('button', {
    type: 'button', class: 'chip', 'aria-pressed': String(ui.filter === key),
    onclick: () => { ui.filter = key; draw(); },
  }, [label, n != null ? el('b', { text: n }) : null]);
  const kids = [chip('all', '전체'), chip('today', '오늘 예상', nToday), chip('week', '이번 주', nWeek)];
  if (ui.rung != null) {
    kids.push(el('button', { type: 'button', class: 'chip is-filter', onclick: () => { ui.rung = null; draw(); } }, [`${ui.rung}회 칸만`, xIcon(), el('span', { class: 'sr-only', text: ' 해제' })]));
  }
  $('viewChips').replaceChildren(...kids);
}

function drawRungSections(active, shownAbove) {
  const out = [];
  for (let r = MAX_STAMPS; r >= 0; r -= 1) {
    const gs = active.filter((g) => g.count === r && !shownAbove.has(g.name) && matches(g));
    if (!gs.length) continue;
    gs.sort((a, b) => (a.predicted?.date || '9999').localeCompare(b.predicted?.date || '9999') || a.name.localeCompare(b.name, 'ko'));
    const title = r === MAX_STAMPS ? '9회 완주' : `후식 ${r}회`;
    const nextM = MILESTONES.find((m) => m > r);
    const hint = r === MAX_STAMPS ? '올해 보상 모두 달성' : `${nextM}회까지 ${nextM - r}번 남음`;
    const open = filtering() || r >= 3;
    out.push(el('details', { class: 'fold', open }, [
      el('summary', {}, el('div', { class: 'sec-head' }, [el('h2', {}, [title, el('span', { class: 'count', text: ` ${gs.length}` })]), el('span', { class: 'hint', text: hint })])),
      el('div', { class: 'list' }, gs.map((g) => card(g, 'row'))),
    ]));
  }
  const left = ctx.promo.groups.filter((g) => g.withdrawn && matches({ ...g, count: ui.rung ?? g.count }));
  if (left.length) {
    out.push(el('details', { class: 'fold' }, [
      el('summary', {}, el('div', { class: 'sec-head' }, [el('h2', {}, ['탈회 단체', el('span', { class: 'count', text: ` ${left.length}` })]), el('span', { class: 'hint', text: '프로모션 제외 · 이력 보존' })])),
      el('div', { class: 'list' }, left.map((g) => card(g, 'row'))),
    ]));
  }
  if (!out.length && filtering()) out.push(el('p', { class: 'empty', text: '조건에 맞는 단체가 없습니다.' }));
  $('rungSecs').replaceChildren(...out);
}

/* ───────── 카드 ───────── */
function xIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 12 12'); svg.setAttribute('class', 'x'); svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', 'M2 2l8 8M10 2l-8 8'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.6'); p.setAttribute('stroke-linecap', 'round');
  svg.append(p);
  return svg;
}

function stampRow(g, large) {
  const trios = [0, 1, 2].map((t) => el('span', { class: 'trio' }, [1, 2, 3].map((k) => {
    const i = t * 3 + k;
    const s = g.stamps[i - 1];
    const m = MILESTONES.includes(i);
    const cls = ['st'];
    if (m) cls.push('m');
    if (s) cls.push(s.kind === 'provisional' ? 'prov' : 'on');
    if (!s && m && g.next && g.next.steps === 1 && i === g.count + 1 && !g.withdrawn) cls.push('target');
    if (justStamped && justStamped.name === g.name && justStamped.n === i) cls.push('just');
    return el('i', { class: cls.join(' '), dataset: { r: m ? i : null }, title: s ? `${i}회째 · ${fmtDate(s.date)}${s.kind === 'provisional' ? ' (현장 체크, 엑셀 확정 전)' : ''}` : `${i}회째` });
  })));
  return el('span', { class: `stamps${large ? ' stamps-lg' : ''}`, role: 'img', 'aria-label': `후식 ${g.count}회 / 9칸` }, trios);
}

function whenBlock(g) {
  const t = ctx.today;
  const todayMark = markOn(g, t);
  if (todayMark) return el('span', { class: 'gwhen is-today' }, [el('b', { text: '오늘 방문' }), todayMark.field_post ? '후식 진행 기록' : '방문만 기록']);
  if (g.predicted) {
    const isToday = g.predicted.date === t;
    return el('span', { class: `gwhen${isToday ? ' is-today' : ''}`, title: `예상 근거: ${g.predicted.note}` }, [
      el('b', { text: isToday ? '오늘 예상' : fmtDate(g.predicted.date) }),
      isToday ? g.predicted.note : `예상 · ${relDay(g.predicted.date, t)}`,
    ]);
  }
  return el('span', { class: 'gwhen' }, [el('b', { text: g.lastVisit ? fmtDate(g.lastVisit) : '-' }), '최근 방문']);
}

function card(g, mode, milestone) {
  const key = `${mode}:${g.name}:${milestone || ''}`;
  const open = ui.open.has(key);
  const rc = mode === 'pending' ? milestone : g.next?.milestone;
  const hasProv = g.stamps.some((s) => s.kind === 'provisional');
  const nextText = g.withdrawn ? '탈회 — 프로모션 제외'
    : g.next ? null : '올해 9회 완주';

  const main = el('button', {
    type: 'button', class: 'gmain', 'aria-expanded': String(open),
    onclick: () => { if (open) ui.open.delete(key); else ui.open.add(key); draw(); },
  }, [
    el('span', { class: 'gname' }, [
      el('span', { text: g.name }),
      g.withdrawn ? el('span', { class: 'tag warn', text: '탈회' }) : null,
      hasProv ? el('span', { class: 'tag prov', title: '엑셀로 확정되기 전 현장 체크가 포함되어 있습니다', text: '임시 포함' }) : null,
    ]),
    whenBlock(g),
    el('span', { class: 'gline', dataset: { r: rc } }, [
      stampRow(g, false),
      el('span', { class: 'gnext' }, nextText ? [nextText] : [
        '다음 후식 = ', el('b', { text: `${g.next.milestone}회째` }),
        g.next.steps === 1 ? ` · ${g.next.item}` : ` · ${g.next.steps}번 남음`,
      ]),
    ]),
  ]);

  const kids = [main];
  if (mode === 'next' && !g.withdrawn) kids.push(quickActions(g));
  if (mode === 'pending') kids.push(rewardBox(g, milestone, false));
  if (open) kids.push(detail(g));

  return el('article', {
    class: `gcard${mode === 'next' ? ' is-next' : ''}${mode === 'pending' ? ' is-pending' : ''}`,
    dataset: { key: g.name, r: rc, flip: key },
  }, kids);
}

function quickActions(g) {
  const t = ctx.today;
  const m = markOn(g, t);
  if (m) {
    return el('div', { class: 'gact' }, [
      el('span', { class: 'muted', text: m.field_post ? '오늘 후식 진행으로 기록됨' : '오늘 방문만 기록됨' }),
      el('button', { type: 'button', class: 'btn btn-sm', onclick: (e) => guard(e.currentTarget, () => clearMark(g, t)) }, '기록 지우기'),
    ]);
  }
  return el('div', { class: 'gact' }, [
    el('button', { type: 'button', class: 'btn btn-primary', onclick: (e) => guard(e.currentTarget, () => recordVisit(g, t, true, null)) }, '후식 진행'),
    el('button', { type: 'button', class: 'btn', onclick: (e) => guard(e.currentTarget, () => recordVisit(g, t, false, null)) }, '방문만'),
  ]);
}

function rewardBox(g, m, compact) {
  const st = g.rewardState[m];
  const memoKey = `${g.name}|${m}`;
  const memo = el('input', {
    class: 'field', type: 'text', maxlength: '200', placeholder: '메모 (선택) · 예: 총무님께 전달',
    'aria-label': `${g.name} ${m}회 지급 메모`, value: ui.memo.get(memoKey) || '',
    oninput: (e) => ui.memo.set(memoKey, e.target.value),
  });
  return el('div', { class: 'reward', dataset: { r: m } }, [
    el('div', { class: 'reward-top' }, [
      el('b', { text: `${m}회 달성 · ${st.item}` }),
      el('span', { text: `${fmtDate(st.reached.date)} 달성${st.reached.provisional ? ' (현장 체크)' : ''}` }),
    ]),
    el('div', { class: 'row2' }, [
      memo,
      el('button', { type: 'button', class: 'btn', dataset: { r: m }, onclick: (e) => guard(e.currentTarget, () => giveReward(g, m, memo.value)) }, compact ? '지급' : '지급 완료'),
    ]),
  ]);
}

function detail(g) {
  const counted = g.visits.filter((v) => v.counted).length;
  const parts = [];

  parts.push(el('div', {}, [
    el('h3', { text: '스탬프 카드' }),
    el('div', { dataset: { r: g.next?.milestone } }, stampRow(g, true)),
    el('p', { class: 'muted', text: `후식 인정 ${counted}회 · 방문 ${g.visits.length}회${g.label ? ` · 시트 표기 ${g.label}` : ''}` }),
  ]));

  parts.push(el('div', {}, [
    el('h3', { text: '보상' }),
    el('div', { class: 'mstates' }, MILESTONES.map((m) => {
      const st = g.rewardState[m];
      let body;
      let act = null;
      if (st.status === 'given') {
        body = [`${st.item} · ${fmtDate(st.reward.given_on)} 지급`, st.reward.memo ? el('span', { class: 'memo', text: st.reward.memo }) : null];
        act = el('button', { type: 'button', class: 'btn btn-sm btn-quiet', onclick: (e) => guard(e.currentTarget, () => cancelReward(g, m)) }, '지급 취소');
      } else if (st.status === 'pending') {
        body = [`${st.item} · ${fmtDate(st.reached.date)} 달성 · 미지급`];
        act = el('button', { type: 'button', class: 'btn btn-sm', dataset: { r: m }, onclick: (e) => guard(e.currentTarget, () => giveReward(g, m, ui.memo.get(`${g.name}|${m}`) || '')) }, '지급 완료');
      } else {
        body = [`${st.item} · 후식 ${m - g.count}번 남음`];
      }
      return el('div', { class: 'mstate', dataset: { r: m } }, [el('span', { class: 'mk', text: `${m}회` }), el('span', {}, body), act]);
    })),
  ]));

  if (!g.withdrawn) parts.push(recordForm(g));

  parts.push(el('div', {}, [
    el('h3', { text: '방문 이력' }),
    el('div', { class: 'vlist' }, g.visits.slice().reverse().map((v) => {
      let k; let cls;
      if (v.kind === 'confirmed') { k = `후식 ${v.n}회째`; cls = 'c'; }
      else if (v.kind === 'provisional') { k = `후식 ${v.n}회째 (임시)`; cls = 'p'; }
      else if (v.kind === 'excluded') { k = `제외 · 1인 ${won(Math.round(v.perPax))}원`; cls = 'x'; }
      else { k = v.field === false ? '방문만 (현장)' : '방문'; cls = 'v'; }
      const amt = v.excel ? (v.post ? `후식 ${won(v.post)}원` : '후식 없음') : (v.post ? `현장 ${won(v.post)}원` : '엑셀 확정 전');
      return el('div', { class: 'vrow' }, [el('span', { text: fmtDate(v.date) }), el('span', { class: `k ${cls}`, text: k }), el('span', { class: 'amt', text: amt })]);
    })),
  ]));

  return el('div', { class: 'gdetail' }, parts);
}

function recordForm(g) {
  const t = ctx.today;
  const date = ui.recDate.get(g.name) || t;
  const existing = markOn(g, date);
  const dateIn = el('input', {
    class: 'field', type: 'date', max: t, min: `${ctx.year}-01-01`, value: date, 'aria-label': '방문일',
    onchange: (e) => { ui.recDate.set(g.name, e.target.value || t); draw(); },
  });
  const amtIn = el('input', {
    class: 'field', type: 'text', inputmode: 'numeric', placeholder: '후식 금액 (선택)', 'aria-label': '후식 금액 (선택)',
    value: ui.recAmt.get(g.name) || '', oninput: (e) => ui.recAmt.set(g.name, e.target.value),
  });
  const amount = () => {
    const n = Number(String(amtIn.value).replace(/[^0-9]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  return el('div', { class: 'record' }, [
    el('h3', { text: '기록하기' }),
    el('div', { class: 'row3' }, [dateIn, amtIn]),
    existing
      ? el('div', { class: 'btnrow' }, [
        el('span', { class: 'muted', text: `${fmtDate(date)} ${existing.field_post ? '후식 진행' : '방문만'}으로 기록됨` }),
        el('button', { type: 'button', class: 'btn btn-sm', onclick: (e) => guard(e.currentTarget, () => clearMark(g, date)) }, '기록 지우기'),
      ])
      : el('div', { class: 'btnrow' }, [
        el('button', { type: 'button', class: 'btn btn-primary', onclick: (e) => guard(e.currentTarget, () => recordVisit(g, date, true, amount())) }, '후식 진행'),
        el('button', { type: 'button', class: 'btn', onclick: (e) => guard(e.currentTarget, () => recordVisit(g, date, false, null)) }, '방문만'),
      ]),
  ]);
}

function legacyNotice(n) {
  return el('div', { class: 'notice' }, [
    el('span', {}, [el('b', { text: `도입 전 기록 정리 · 1회` }), ` — ${fmtDate(CONFIG.APP_START)} 이전에 달성한 3·6·9 ${n}건을 이미 지급한 것으로 한 번에 기록합니다. 대기 건수에는 넣지 않았습니다.`]),
    el('button', { type: 'button', class: 'btn btn-sm btn-primary', onclick: (e) => guard(e.currentTarget, settleLegacy) }, '일괄 지급 처리'),
  ]);
}

/* ───────── 동작 ───────── */
function findMark(name, date) {
  return ctx.marks.find((m) => m.group_name === name && m.visit_date === date) || null;
}

function recordVisit(g, date, post, amount) {
  const prev = findMark(g.name, date);
  const row = {
    visit_date: date, group_name: g.name, field_post: post, field_amount: post ? amount : null,
    override_counted: prev?.override_counted ?? null, memo: prev?.memo ?? null,
  };
  const n = post ? g.count + 1 : null;
  justStamped = post ? { name: g.name, n } : null;
  ui.recAmt.delete(g.name);
  write('grp_marks', 'upsert', row);
  const undo = { label: '되돌리기', run: () => (prev ? write('grp_marks', 'upsert', prev) : write('grp_marks', 'delete', row)) };
  if (post && MILESTONES.includes(n) && n <= MAX_STAMPS) {
    toast(`${g.name} ${n}회째 달성 — ${ctx.settings.items[String(n)]} 지급하세요`, undo);
    ui.open.delete(`next:${g.name}:`);
    requestAnimationFrame(() => {
      const target = document.querySelector(`[data-flip="pending:${CSS.escape(g.name)}:${n}"]`);
      if (target) { target.classList.add('is-flash'); target.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
  } else {
    toast(post ? `${g.name} 후식 ${n}회째 기록` : `${g.name} 방문 기록`, undo);
  }
}

function clearMark(g, date) {
  const prev = findMark(g.name, date);
  if (!prev) return;
  if (prev.override_counted != null || prev.memo) write('grp_marks', 'upsert', { ...prev, field_post: null, field_amount: null });
  else write('grp_marks', 'delete', prev);
  toast(`${g.name} ${fmtDate(date)} 기록을 지웠습니다`, { label: '되돌리기', run: () => write('grp_marks', 'upsert', prev) });
}

function giveReward(g, m, memo) {
  const st = g.rewardState[m];
  const row = {
    year: ctx.year, group_name: g.name, milestone: m, given_on: ctx.today,
    item: st.item, memo: (memo || '').trim().slice(0, 200) || null, legacy: false,
  };
  ui.memo.delete(`${g.name}|${m}`);
  write('grp_rewards', 'upsert', row);
  toast(`${g.name} ${st.item} 지급 완료`, { label: '되돌리기', run: () => write('grp_rewards', 'delete', row) });
}

function cancelReward(g, m) {
  const prev = g.rewardState[m].reward;
  if (!prev) return;
  write('grp_rewards', 'delete', prev);
  toast(`${g.name} ${m}회 지급 기록을 지웠습니다`, { label: '되돌리기', run: () => write('grp_rewards', 'upsert', prev) });
}

function settleLegacy() {
  const rows = [];
  ctx.promo.groups.forEach((g) => g.legacyPending.forEach((m) => {
    const st = g.rewardState[m];
    rows.push({ year: ctx.year, group_name: g.name, milestone: m, given_on: st.reached.date, item: st.item, memo: '앱 도입 전 지급', legacy: true });
  }));
  rows.forEach((r) => write('grp_rewards', 'upsert', r));
  toast(`앱 도입 전 달성 ${rows.length}건을 지급 완료로 기록했습니다`, { label: '되돌리기', run: () => rows.forEach((r) => write('grp_rewards', 'delete', r)) });
}

/* ───────── 카드 이동 애니메이션 (FLIP): 스탬프를 찍으면 카드가 새 칸으로 올라간다 ───────── */
function captureRects() {
  const map = new Map();
  document.querySelectorAll('#tab-promo .gcard[data-key]').forEach((n) => {
    if (!map.has(n.dataset.key)) map.set(n.dataset.key, n.getBoundingClientRect().top);
  });
  return map;
}
function playFlip(before) {
  if (!before.size || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const seen = new Set();
  document.querySelectorAll('#tab-promo .gcard[data-key]').forEach((n) => {
    const k = n.dataset.key;
    if (seen.has(k) || !before.has(k)) return;
    seen.add(k);
    const dy = before.get(k) - n.getBoundingClientRect().top;
    if (Math.abs(dy) < 4) return;
    n.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  });
}
