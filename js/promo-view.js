/* ============================================================
   promo-view.js — 3·6·9 탭 (야디지북)
   단체마다 「다음 깃발까지 남은 후식 횟수」를 큰 숫자 하나로.
   순서: 달성·지급 체크 → 1번 남음 → 2번 남음 → … → 9회 완주 → 탈회
   ============================================================ */

import { MILESTONES, promoBoard } from './promo-core.js';
import { write } from './store.js';
import { el, fmtDate, toast, won, guard } from './ui.js';

const ui = { q: '', open: new Set(), memo: new Map() };
let ctx = null;
let flashKey = null; // 방금 체크한 단체 — 새 자리에서 한 번 빛나게

const $ = (id) => document.getElementById(id);

export function initPromo() {
  $('promoSearch').addEventListener('input', (e) => { ui.q = e.target.value.trim(); draw(); });
}

export function renderPromo(next) {
  ctx = next;
  draw();
}

/** 표지: 1번 남음 · 2번 남음 · 체크 필요 */
export function promoCover(c) {
  if (c.phase !== 'ready') return [el('div', { class: 'cover-sum' }, ['1번 남음', '2번 남음', '체크 필요'].map((t) => el('div', { class: 'sk-count' }, [el('b', { text: '–' }), t])))];
  const b = promoBoard(c.promo.groups);
  const n = (k) => b.steps.find((s) => s.steps === k)?.groups.length || 0;
  // 숫자를 누르면 그 칸으로 (야디지북의 손가락 탭)
  const item = (v, label, target, flag) => el('button', {
    type: 'button', class: flag ? 'is-flag' : null, 'aria-label': `${label} ${v}곳 — 목록으로 이동`,
    onclick: () => jumpTo(target),
  }, [el('b', { text: v }), label]);
  return [el('div', { class: 'cover-sum' }, [
    item(n(1), '1번 남음', 'rule-s1'),
    item(n(2), '2번 남음', 'rule-s2'),
    item(b.achieved.length, '체크 필요', 'rule-done', b.achieved.length > 0),
  ])];
}

function jumpTo(id) {
  const t = document.getElementById(id);
  if (!t) return;
  const fold = t.closest('details');
  if (fold) fold.open = true;
  t.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

const match = (g) => !ui.q || g.name.includes(ui.q) || (g.label || '').includes(ui.q);

function draw() {
  if (!ctx) return;
  if (ctx.phase !== 'ready') { $('board').replaceChildren(waiting(ctx)); return; }
  const before = captureRects();
  const b = promoBoard(ctx.promo.groups);
  const searching = Boolean(ui.q);
  const out = [];

  // 달성 · 지급 체크
  const achieved = b.achieved.filter((a) => match(a.group));
  if (achieved.length) {
    out.push(el('section', {}, [
      el('h2', { class: 'rule is-flag', id: 'rule-done' }, ['달성 · 지급 체크', el('span', { class: 'n', text: achieved.length })]),
      el('div', { class: 'holes' }, achieved.map((a) => doneHole(a))),
    ]));
  }

  // 남은 횟수별 칸
  b.steps.forEach(({ steps, groups }) => {
    const gs = groups.filter(match);
    if (!gs.length) return;
    const title = [`${steps}번 남음`, el('span', { class: 'n', text: gs.length })];
    const list = el('div', { class: 'holes' }, gs.map((g) => hole(g)));
    const head = el('h2', { class: 'rule', id: `rule-s${steps}` }, title);
    if (steps <= 2 || searching) out.push(el('section', {}, [head, list]));
    else out.push(el('details', { class: 'fold' }, [el('summary', {}, head), list]));
  });

  const fin = b.finished.filter(match);
  if (fin.length) out.push(el('section', {}, [el('h2', { class: 'rule' }, ['9회 완주', el('span', { class: 'n', text: fin.length })]), el('div', { class: 'holes' }, fin.map((g) => hole(g)))]));

  const left = b.withdrawn.filter(match);
  if (left.length) {
    out.push(el('details', { class: 'fold', open: searching }, [
      el('summary', {}, el('h2', { class: 'rule' }, ['탈회 단체 · 대상 제외', el('span', { class: 'n', text: left.length })])),
      el('div', { class: 'holes' }, left.map((g) => hole(g))),
    ]));
  }

  if (!out.length) out.push(el('p', { class: 'empty', text: searching ? `「${ui.q}」에 맞는 단체가 없습니다.` : '아직 올린 엑셀 자료가 없습니다. 자료 탭에서 엑셀을 올려 주세요.' }));

  $('board').replaceChildren(el('div', { class: 'board' }, out));
  const badge = $('promoBadge');
  badge.hidden = !b.achieved.length;
  badge.textContent = b.achieved.length;

  playFlip(before);
  if (flashKey) {
    const target = document.querySelector(`#board .hole[data-key="${CSS.escape(flashKey)}"]`);
    if (target) target.classList.add('is-flash');
    flashKey = null;
  }
}

/** 첫 자료를 받는 동안 실제 줄과 같은 모양의 뼈대, 실패하면 다시 시도 */
export function waiting(c) {
  if (c.phase === 'error') {
    return el('div', { class: 'empty' }, [
      el('p', { text: `자료를 받지 못했습니다. ${c.error || '연결을 확인해 주세요.'}` }),
      el('button', { type: 'button', class: 'btn btn-sm', style: null, onclick: () => window.dispatchEvent(new Event('npcc:retry')) }, '다시 시도'),
    ]);
  }
  const row = () => el('div', { class: 'hole sk-hole', 'aria-hidden': 'true' }, [
    el('span', { class: 'sk sk-name' }), el('span', { class: 'sk sk-num' }), el('span', { class: 'sk sk-line' }), el('span', { class: 'sk sk-path' }),
  ]);
  return el('div', { class: 'board', role: 'status', 'aria-label': '자료를 받는 중' }, [
    el('div', { class: 'rule sk-rule', 'aria-hidden': 'true' }, el('span', { class: 'sk sk-title' })),
    el('div', { class: 'holes' }, [row(), row(), row(), row()]),
  ]);
}

/* ───────── 단체 한 줄 ───────── */
function pathFor(g) {
  if (!g.next) return el('span', { class: 'path' }, [el('span', { class: 'done-mark', text: '올해 3·6·9 완주' })]);
  const m = g.next.milestone;
  const kids = [];
  for (let i = 1; i <= m; i += 1) {
    const on = i <= g.count;
    if (i > 1) kids.push(el('i', { class: on ? null : 'o' }));
    kids.push(el('em', { class: on ? null : 'o' }));
  }
  kids.push(el('span', { class: 'flag num', text: m }));
  return el('span', { class: 'path', role: 'img', 'aria-label': `후식 ${g.count}회, ${m}회까지 ${g.next.steps}번 남음` }, kids);
}

function nameNode(g) {
  return el('span', { class: 'nm' }, [g.name, g.withdrawn ? el('span', { class: 'tag', text: '탈회' }) : null]);
}

function hole(g) {
  const key = g.name;
  const open = ui.open.has(key);
  const main = el('button', {
    type: 'button', class: 'hole-main', 'aria-expanded': String(open),
    onclick: () => { if (open) ui.open.delete(key); else ui.open.add(key); draw(); },
  }, [
    nameNode(g),
    g.next
      ? el('span', { class: 'yd' }, [el('b', { text: g.next.steps }), el('span', { text: '번 남음' })])
      : el('span', { class: 'yd' }, [el('b', { text: g.count }), el('span', { text: '회' })]),
    el('span', { class: 'rw', text: g.next ? `${g.next.milestone}회 · ${g.next.item}` : `후식 ${g.count}회` }),
    pathFor(g),
  ]);
  return el('article', { class: 'hole', dataset: { key } }, [main, open ? detail(g) : null]);
}

function doneHole(a) {
  const { group: g, milestone: m } = a;
  const memoKey = `${g.name}|${m}`;
  const memo = el('input', {
    class: 'field', type: 'text', maxlength: '200', placeholder: '메모 (선택)',
    'aria-label': `${g.name} ${m}회 지급 메모`, value: ui.memo.get(memoKey) || '',
    oninput: (e) => ui.memo.set(memoKey, e.target.value),
  });
  return el('article', { class: 'hole is-done', dataset: { key: `${g.name}|done${m}` } }, [
    el('div', { class: 'hole-main' }, [
      nameNode(g),
      el('span', { class: 'yd' }, [el('b', { text: `${m}회` }), el('span', { text: '달성' })]),
      el('span', { class: 'rw', text: `${a.item} · ${fmtDate(a.reachedOn)} 방문에서 달성` }),
    ]),
    el('div', { class: 'tick-row' }, [
      el('button', {
        type: 'button', class: 'tick',
        // 누르는 순간 칸에 체크가 찍히고, 잠깐 보여준 뒤 줄이 새 자리로 간다
        onclick: (e) => {
          const btn = e.currentTarget;
          if (btn.classList.contains('is-ticked')) return;
          btn.classList.add('is-ticked');
          btn.closest('.hole').classList.add('is-ticking');
          setTimeout(() => giveReward(g, m, memo.value), matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 450);
        },
      }, [el('span', { class: 'box', 'aria-hidden': 'true' }), '지급했으면 체크']),
      memo,
    ]),
  ]);
}

function detail(g) {
  const parts = [];
  parts.push(el('div', {}, [
    el('h3', { text: '3·6·9 보상' }),
    el('div', { class: 'rewards' }, MILESTONES.map((m) => {
      const st = g.rewardState[m];
      if (st.status === 'given') {
        const r = st.reward;
        return el('div', { class: 'rwd given' }, [
          el('span', { class: 'mk', text: m }),
          el('span', {}, [el('span', { class: 't', text: st.item }), el('span', { class: 's', text: `${fmtDate(r.given_on)} 지급${r.memo ? ` · ${r.memo}` : ''}` })]),
          el('button', { type: 'button', class: 'btn btn-sm btn-quiet', onclick: (e) => guard(e.currentTarget, () => cancelReward(g, m)) }, '체크 취소'),
        ]);
      }
      if (st.status === 'pending') {
        return el('div', { class: 'rwd due' }, [
          el('span', { class: 'mk', text: m }),
          el('span', {}, [el('span', { class: 't', text: st.item }), el('span', { class: 's', text: `${fmtDate(st.reached.date)} 달성 · 체크 전` })]),
          el('button', { type: 'button', class: 'btn btn-sm', onclick: (e) => guard(e.currentTarget, () => giveReward(g, m, '')) }, '지급 체크'),
        ]);
      }
      return el('div', { class: 'rwd' }, [
        el('span', { class: 'mk', text: m }),
        el('span', {}, [el('span', { class: 't', text: st.item }), el('span', { class: 's', text: `후식 ${m - g.count}번 더` })]),
        null,
      ]);
    })),
  ]));

  const counted = g.visits.filter((v) => v.counted).length;
  parts.push(el('div', {}, [
    el('h3', { text: `방문 ${g.visits.length}회 · 후식 인정 ${counted}회` }),
    el('div', { class: 'visits' }, g.visits.slice().reverse().map((v) => {
      let k; let cls;
      if (v.counted) { k = `후식 ${v.n}회째`; cls = 'c'; }
      else if (v.kind === 'excluded') { k = `기준 미달 · 1인 ${won(Math.round(v.perPax))}원`; cls = 'x'; }
      else { k = '후식 없음'; cls = 'v'; }
      return el('div', { class: 'vrow' }, [el('span', { text: fmtDate(v.date) }), el('span', { class: `k ${cls}`, text: k }), el('span', { class: 'a', text: v.post ? `${won(v.post)}원` : '' })]);
    })),
  ]));
  return el('div', { class: 'detail' }, parts);
}

/* ───────── 동작 ───────── */
function giveReward(g, m, memo) {
  const st = g.rewardState[m];
  const row = {
    year: ctx.year, group_name: g.name, milestone: m, given_on: ctx.today,
    item: st.item, memo: (memo || '').trim().slice(0, 200) || null, legacy: false,
  };
  ui.memo.delete(`${g.name}|${m}`);
  flashKey = g.name;
  write('grp_rewards', 'upsert', row);
  toast(`${g.name} · ${st.item} 지급 체크`, { label: '되돌리기', run: () => write('grp_rewards', 'delete', row) });
}

function cancelReward(g, m) {
  const prev = g.rewardState[m].reward;
  if (!prev) return;
  write('grp_rewards', 'delete', prev);
  toast(`${g.name} ${m}회 지급 체크를 지웠습니다`, { label: '되돌리기', run: () => write('grp_rewards', 'upsert', prev) });
}

/* ───────── 체크한 단체가 새 자리로 미끄러져 가는 움직임 (FLIP) ───────── */
function captureRects() {
  const map = new Map();
  document.querySelectorAll('#board .hole[data-key]').forEach((n) => map.set(n.dataset.key, n.getBoundingClientRect().top));
  return map;
}
function playFlip(before) {
  if (!before.size || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('#board .hole[data-key]').forEach((n) => {
    const top = before.get(n.dataset.key);
    if (top == null) return;
    const dy = top - n.getBoundingClientRect().top;
    if (Math.abs(dy) < 4 || Math.abs(dy) > 1600) return;
    n.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  });
}
