/* ============================================================
   promo-core.js — 계산 규칙 (화면·DB와 무관한 순수 함수)
   엑셀 해석과 3·6·9 카운트·순서가 모두 여기 있다.
   tests/promo-core.test.mjs 가 원자료로 이 파일을 검증한다.
   ============================================================ */

export const MILESTONES = [3, 6, 9];
export const MAX_STAMPS = 9;

/* 시트 「단체팀 식음이용현황」 열 위치 (0부터) */
const COL = {
  date: 0, label: 1, group: 2, teams: 3, pax: 4,
  pre: 5, post: 8, clubhouse: 11, starthouse: 15, shade: 18, total: 21,
};

export const TOTAL_KEYS = [
  ['pax', '인원'], ['clubhouse_pre', '클럽 전식'], ['clubhouse_post', '클럽 후식'],
  ['clubhouse', '클럽하우스'], ['starthouse', '스타트하우스'], ['shade', '그늘집'], ['total', '총매출'],
];

/** 쉼표 문자열·빈칸·null 을 정수로. 숫자가 아니면 0 */
export function toInt(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v) : 0;
  const s = String(v).replace(/,/g, '').trim();
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

const pad = (n) => String(n).padStart(2, '0');

/** 엑셀 날짜 칸(문자열·Date·일련번호)을 'YYYY-MM-DD' 로. 날짜가 아니면 null */
export function toISODate(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  }
  if (typeof v === 'number') {
    if (v < 20000 || v > 80000) return null; // 1954~2119 범위의 엑셀 일련번호만
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const m = String(v).trim().match(/^(20\d{2})[-./](\d{1,2})[-./](\d{1,2})/);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${pad(mo)}-${pad(d)}`;
}

/**
 * 시트 2차원 배열(머리글 포함)을 방문 회차로 해석한다.
 * @param {unknown[][]} aoa
 * @returns {{ rows: object[], sheetTotals: object|null, errors: string[], years: number[] }}
 */
export function parseSheet(aoa) {
  const rows = [];
  const errors = [];
  const seen = new Set();
  let sheetTotals = null;

  aoa.forEach((r, i) => {
    if (!Array.isArray(r)) return;
    const line = i + 1;
    const date = toISODate(r[COL.date]);
    const label = String(r[COL.label] ?? '').trim();

    if (!date) {
      // 날짜·단체명이 없고 인원·총매출 숫자가 있는 행 = 시트 맨 아래 합계행
      if (!label && toInt(r[COL.pax]) > 0 && toInt(r[COL.total]) > 0) sheetTotals = pickTotals(r);
      return;
    }
    if (!label) return;

    const group = String(r[COL.group] ?? '').trim() || label;
    const row = {
      visit_date: date,
      group_name: group,
      team_label: label === group ? null : label,
      is_withdrawn: label.includes('탈회'),
      teams: toInt(r[COL.teams]),
      pax: toInt(r[COL.pax]),
      clubhouse_pre: toInt(r[COL.pre]),
      clubhouse_post: toInt(r[COL.post]),
      clubhouse: toInt(r[COL.clubhouse]),
      starthouse: toInt(r[COL.starthouse]),
      shade: toInt(r[COL.shade]),
      total: toInt(r[COL.total]),
    };

    if (row.clubhouse !== row.clubhouse_pre + row.clubhouse_post) {
      errors.push(`${line}행 ${group} ${date}: 대식당 계(${row.clubhouse})가 전식+후식(${row.clubhouse_pre + row.clubhouse_post})과 다릅니다`);
    }
    if (row.total !== row.clubhouse + row.starthouse + row.shade) {
      errors.push(`${line}행 ${group} ${date}: 총매출(${row.total})이 세 업장 합(${row.clubhouse + row.starthouse + row.shade})과 다릅니다`);
    }
    const key = `${date}|${group}`;
    if (seen.has(key)) errors.push(`${line}행 ${group} ${date}: 같은 날짜·예약자명이 두 번 있습니다`);
    seen.add(key);
    rows.push(row);
  });

  const years = [...new Set(rows.map((r) => Number(r.visit_date.slice(0, 4))))].sort();
  return { rows, sheetTotals, errors, years };
}

function pickTotals(r) {
  return {
    pax: toInt(r[COL.pax]), clubhouse_pre: toInt(r[COL.pre]), clubhouse_post: toInt(r[COL.post]),
    clubhouse: toInt(r[COL.clubhouse]), starthouse: toInt(r[COL.starthouse]), shade: toInt(r[COL.shade]),
    total: toInt(r[COL.total]),
  };
}

/** 방문 회차 합계 */
export function sumRows(rows) {
  const out = Object.fromEntries(TOTAL_KEYS.map(([k]) => [k, 0]));
  rows.forEach((r) => TOTAL_KEYS.forEach(([k]) => { out[k] += Number(r[k]) || 0; }));
  return out;
}

/** 해석한 합계와 시트 합계행 대조표 */
export function compareTotals(parsed, sheet) {
  return TOTAL_KEYS.map(([key, label]) => ({
    key, label, parsed: parsed[key], sheet: sheet ? sheet[key] : null,
    ok: sheet ? parsed[key] === sheet[key] : null,
  }));
}

/* ───────── 3·6·9 카운트 ───────── */

/**
 * 한 해의 단체별 프로모션 현황을 만든다.
 * @param {object} p
 * @param {number} p.year
 * @param {object[]} p.visits   grp_visits 행 (모든 연도 가능 — 예상일 계산에 이전 연도도 쓴다)
 * @param {object[]} p.marks    grp_marks 행
 * @param {object[]} p.rewards  grp_rewards 행
 * @param {{threshold_per_pax: number, items: Record<string,string>}} p.settings
 * @param {string} p.appStart  이 날짜 전에 달성한 3·6·9는 「도입 전 정리」 대상
 */
export function buildPromo({ year, visits, marks, rewards, settings, appStart }) {
  const threshold = Number(settings.threshold_per_pax) || 10000;
  const inYear = (d) => Number(String(d).slice(0, 4)) === year;
  const key = (d, g) => `${d}|${g}`;

  const markMap = new Map(marks.map((m) => [key(m.visit_date, m.group_name), m]));
  const excelMap = new Map(visits.filter((v) => inYear(v.visit_date)).map((v) => [key(v.visit_date, v.group_name), v]));

  // 그 해의 방문 회차 = 엑셀 행 ∪ 엑셀에 아직 없는 현장 기록
  const byGroup = new Map();
  const push = (g, item) => { if (!byGroup.has(g)) byGroup.set(g, []); byGroup.get(g).push(item); };
  excelMap.forEach((v, k) => push(v.group_name, { date: v.visit_date, excel: v, mark: markMap.get(k) || null }));
  markMap.forEach((m, k) => {
    if (!inYear(m.visit_date) || excelMap.has(k)) return;
    if (m.field_post == null && m.override_counted == null) return;
    push(m.group_name, { date: m.visit_date, excel: null, mark: m });
  });

  const rewardMap = new Map(rewards.filter((r) => r.year === year).map((r) => [`${r.group_name}|${r.milestone}`, r]));
  const issues = [];
  const groups = [];

  byGroup.forEach((items, name) => {
    items.sort((a, b) => a.date.localeCompare(b.date));
    const withdrawn = items.some((it) => it.excel && it.excel.is_withdrawn);
    const label = (items.find((it) => it.excel && it.excel.team_label) || {}).excel?.team_label || null;
    let count = 0;
    const achieved = [];

    const vlist = items.map((it) => {
      const ex = it.excel;
      const mk = it.mark;
      const post = ex ? Number(ex.clubhouse_post) || 0 : Number(mk?.field_amount) || 0;
      const pax = ex ? Number(ex.pax) || 0 : 0;
      const perPax = ex && post > 0 ? (pax > 0 ? post / pax : post) : null;
      const qualifies = ex ? post > 0 && perPax >= threshold : null;
      const override = mk && mk.override_counted != null ? mk.override_counted : null;
      const field = mk && mk.field_post != null ? mk.field_post : null;

      let counted;
      if (override != null) counted = override;
      else if (ex) counted = qualifies;
      else counted = field === true;

      let kind;
      if (counted) kind = ex ? 'confirmed' : 'provisional';
      else if (ex && post > 0 && !qualifies) kind = 'excluded';
      else kind = 'visit';

      const mismatch = Boolean(ex && field != null && override == null && field !== qualifies);
      let n = null;
      if (counted) {
        count += 1;
        n = count;
        if (MILESTONES.includes(n)) achieved.push({ milestone: n, date: it.date, provisional: !ex });
      }
      const v = { date: it.date, excel: ex, mark: mk, post, pax, perPax, qualifies, counted, kind, override, field, mismatch, n };
      if (mismatch) issues.push({ type: 'mismatch', group: name, date: it.date, visit: v });
      if (kind === 'excluded' && override == null) issues.push({ type: 'below', group: name, date: it.date, visit: v });
      return v;
    });

    const stamps = vlist.filter((v) => v.counted).slice(0, MAX_STAMPS).map((v) => ({ n: v.n, date: v.date, kind: v.kind }));
    const rewardState = {};
    MILESTONES.forEach((m) => {
      const reached = achieved.find((a) => a.milestone === m) || null;
      const reward = rewardMap.get(`${name}|${m}`) || null;
      const status = reward ? 'given' : reached ? 'pending' : 'none';
      rewardState[m] = { status, reached, reward, item: reward?.item || settings.items[String(m)] };
      if (reward && !reached) issues.push({ type: 'orphan', group: name, milestone: m, reward });
    });

    const capped = Math.min(count, MAX_STAMPS);
    const nextM = MILESTONES.find((m) => m > capped) || null;
    const lastVisit = vlist.length ? vlist[vlist.length - 1].date : null;
    groups.push({
      name, label, withdrawn, visits: vlist, count: capped, stamps, rewardState,
      next: nextM ? { milestone: nextM, steps: nextM - capped, item: settings.items[String(nextM)] } : null,
      lastVisit,
      legacyPending: MILESTONES.filter((m) => rewardState[m].status === 'pending' && rewardState[m].reached.date < appStart),
    });
  });

  groups.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  return { year, threshold, groups, issues };
}

/** 같은 칸 안 정렬: 큰 보상 먼저 → 후식 많은 순 → 가나다 */
const byReward = (a, b) => (b.next?.milestone || 0) - (a.next?.milestone || 0) || b.count - a.count || a.name.localeCompare(b.name, 'ko');

/**
 * 3·6·9 탭의 목록 구성.
 * achieved — 달성했는데 지급 체크가 없는 건(도입 전 달성분 제외), 맨 위에 둔다
 * steps    — 다음 보상까지 남은 횟수별 단체 [{ steps: 1, groups }, …]
 */
export function promoBoard(groups) {
  const active = groups.filter((g) => !g.withdrawn);
  const achieved = [];
  active.forEach((g) => MILESTONES.forEach((m) => {
    const st = g.rewardState[m];
    if (st.status === 'pending' && !g.legacyPending.includes(m)) achieved.push({ group: g, milestone: m, reachedOn: st.reached.date, item: st.item });
  }));
  achieved.sort((a, b) => b.milestone - a.milestone || a.group.name.localeCompare(b.group.name, 'ko'));

  const bySteps = new Map();
  active.filter((g) => g.next).forEach((g) => {
    if (!bySteps.has(g.next.steps)) bySteps.set(g.next.steps, []);
    bySteps.get(g.next.steps).push(g);
  });
  const steps = [...bySteps.entries()].sort((a, b) => a[0] - b[0]).map(([n, gs]) => ({ steps: n, groups: gs.sort(byReward) }));

  return {
    achieved,
    steps,
    finished: active.filter((g) => !g.next).sort(byReward),
    withdrawn: groups.filter((g) => g.withdrawn),
    legacyCount: groups.reduce((a, g) => a + g.legacyPending.length, 0),
  };
}
