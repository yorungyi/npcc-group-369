/* ============================================================
   sales-view.js — 매출 탭
   연단체 대시보드 v3(아티팩트)의 계산·차트 코드를 그대로 옮겼다.
   바뀐 점: 상태를 모듈 객체로, 데이터는 Supabase grp_visits에서, 연도 선택 지원,
   '금액 규모 + 1인 객단가'에서 막대도 객단가 기준으로 그림.
   d3 v7 은 index.html 에서 전역으로 읽는다.
   ============================================================ */

/* global d3 */
export function initSales() {
  // ───────── 공통 설정 ─────────
  const root = document.getElementById('yd');
  const tip = document.getElementById('yd-tip');
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = RM ? 0 : 650;
  const won = d3.format(',');
  const man1 = (v) => d3.format(',.1f')(v / 1e4);
  const man0 = (v) => d3.format(',.0f')(v / 1e4);
  const pct = d3.format('.1%');
  const pct0 = d3.format('.0%');
  // 사이트 색(클럽하우스·스타트하우스·그늘집) — dataviz 검증 통과(흰 배경 대비 3:1 이상, 색약 구분)
  const SC = ['#0B8C66', '#CC7A14', '#3F7FD0'];
  const SITES = [
    { key: 'clubhouse', share: 'ch_share', name: '클럽하우스' },
    { key: 'starthouse', share: 'st_share', name: '스타트하우스' },
    { key: 'shade', share: 'sh_share', name: '그늘집' },
  ];
  const METRICS = {
    total: { name: '총매출', col: '총매출(만원)', fmt: man1 },
    per: { name: '1인 객단가', col: '1인 객단가(원)', fmt: won },
    clubhouse: { name: '클럽하우스 매출', col: '클럽하우스(만원)', fmt: man1 },
    starthouse: { name: '스타트하우스 매출', col: '스타트(만원)', fmt: man1 },
  };
  const tierColor = (t) => t === 'top' ? '#5A5FD6' : t === 'bottom' ? '#D2563C' : '#C3CAD1';
  const RH = 28; // 레이스 행 높이(px)

  // ───────── 상태 (dash params) ─────────
  // v3는 대시보드 형식(dash.params)에 상태를 두었다 — 앱에서는 모듈 안의 객체로 둔다
  let params = { months: [], metric: 'total', view: 'mix', pick: null };
  let current = null; // 마지막으로 받은 방문 회차
  const state = () => ({ ...params, months: [...params.months] });
  const set = (o) => { params = { ...params, ...o }; if (current) draw(); };

  // ───────── 데이터 정리 ─────────
  // grp_visits 행 → 화면용 행. 탈회는 한 회차라도 표기가 있으면 그 단체 전체
  const parse = (data) => {
    const left = new Set(data.filter((r) => r.is_withdrawn).map((r) => r.group_name));
    return data.map((r) => ({
      date: r.visit_date, month: String(Number(r.visit_date.slice(5, 7))), group: r.group_name, status: left.has(r.group_name) ? '탈회' : '정상',
      pax: Number(r.pax), pre: Number(r.clubhouse_pre), post: Number(r.clubhouse_post),
      clubhouse: Number(r.clubhouse), starthouse: Number(r.starthouse), shade: Number(r.shade), total: Number(r.total),
    }));
  };
  // 선택 기간으로 단체별 합산
  const aggregate = (rows, months) => {
    const ms = new Set(months);
    const m = new Map();
    rows.forEach((r) => {
      if (ms.size && !ms.has(r.month)) return;
      let g = m.get(r.group);
      if (!g) { g = { group: r.group, status: r.status, visits: 0, used: 0, postVisits: 0, pax: 0, pre: 0, post: 0, clubhouse: 0, starthouse: 0, shade: 0, total: 0 }; m.set(r.group, g); }
      g.visits += 1; if (r.total > 0) g.used += 1; if (r.post > 0) g.postVisits += 1;
      ['pax', 'pre', 'post', 'clubhouse', 'starthouse', 'shade', 'total'].forEach((k) => { g[k] += r[k]; });
    });
    const arr = [...m.values()].map((g) => ({
      ...g,
      ch_share: g.total ? g.clubhouse / g.total : 0,
      st_share: g.total ? g.starthouse / g.total : 0,
      sh_share: g.total ? g.shade / g.total : 0,
      per: g.pax ? Math.round(g.total / g.pax) : 0,
    }));
    arr.sort((a, b) => b.total - a.total || a.group.localeCompare(b.group, 'ko'));
    const n = arr.length;
    arr.forEach((g, i) => { g.rank = i + 1; g.tier = i < 20 ? 'top' : (n > 40 && i >= n - 20) || (n <= 40 && i >= 20) ? 'bottom' : 'mid'; });
    return arr;
  };
  const sumOf = (arr, k) => arr.reduce((a, r) => a + r[k], 0);
  const tierStats = (arr, tier, label) => {
    const s = arr.filter((g) => g.tier === tier);
    const t = sumOf(s, 'total'), pax = sumOf(s, 'pax');
    return {
      tier, label, groups: s.length, total: t, clubhouse: sumOf(s, 'clubhouse'), starthouse: sumOf(s, 'starthouse'), shade: sumOf(s, 'shade'),
      ch_share: t ? sumOf(s, 'clubhouse') / t : 0, st_share: t ? sumOf(s, 'starthouse') / t : 0, sh_share: t ? sumOf(s, 'shade') / t : 0,
      per: pax ? Math.round(t / pax) : 0, post_groups: s.filter((g) => g.post > 0).length,
    };
  };

  // ───────── 툴팁 ─────────
  const showTip = (event, title, lines) => {
    const nodes = [];
    const t = document.createElement('div'); t.className = 'yd-tip-title'; t.textContent = title; nodes.push(t);
    lines.forEach((l) => {
      const line = document.createElement('div');
      if (l.sub) { line.className = 'yd-tip-sub'; line.textContent = l.sub; nodes.push(line); return; }
      line.className = 'yd-tip-line';
      const sw = document.createElement('span'); sw.className = 'yd-sw'; sw.style.background = l.color || 'transparent';
      const n = document.createElement('span'); n.className = 'yd-tip-n'; n.textContent = l.name;
      const v = document.createElement('span'); v.textContent = l.value;
      line.append(sw, n, v); nodes.push(line);
    });
    tip.replaceChildren(...nodes);
    tip.hidden = false;
    const r = root.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = event.clientX - r.left + 14, y = event.clientY - r.top + 14;
    if (x + w > r.width) x = Math.max(0, event.clientX - r.left - w - 14);
    if (y + h > r.height) y = Math.max(0, event.clientY - r.top - h - 14);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  };
  const hideTip = () => { tip.hidden = true; };
  const groupTip = (e, g) => showTip(e, g.rank + '위 · ' + g.group + (g.status === '탈회' ? ' (탈회)' : ''), [
    { name: '총매출', value: won(g.total) + '원' },
    { name: '클럽하우스', value: won(g.clubhouse) + '원 · ' + pct(g.ch_share), color: SC[0] },
    { sub: '　전식 ' + won(g.pre) + ' / 후식 ' + won(g.post) },
    { name: '스타트하우스', value: won(g.starthouse) + '원 · ' + pct(g.st_share), color: SC[1] },
    { name: '그늘집', value: won(g.shade) + '원 · ' + pct(g.sh_share), color: SC[2] },
    { sub: '방문 ' + g.visits + '회(매출 ' + g.used + '회) · 인원 ' + won(g.pax) + '명 · 1인 ' + won(g.per) + '원' },
  ]);

  // 숫자 카운트업
  const tweenText = (el, to, fmt) => {
    const from = el.__v == null ? 0 : el.__v;
    el.__v = to;
    if (!DUR || from === to) { el.textContent = fmt(to); return; }
    d3.select(el).interrupt().transition().duration(DUR).ease(d3.easeCubicOut)
      .tween('text', () => { const i = d3.interpolateNumber(from, to); return (t) => { el.textContent = fmt(i(t)); }; });
  };

  const failBox = (box) => {
    box.classList.remove('dash-skeleton');
    const d = document.createElement('div'); d.className = 'yd-fail'; d.textContent = 'Failed to load';
    box.replaceChildren(d);
  };

  // ───────── 필터 바 ─────────
  const monthsBox = document.getElementById('yd-months');
  const drawFilters = (allMonths, st) => {
    const btns = [['', '전체'], ...allMonths.map((m) => [m, m + '월'])];
    const sel = d3.select(monthsBox).selectAll('button').data(btns, (d) => d[0]);
    sel.enter().append('button').attr('type', 'button').attr('class', 'yd-btn')
      .text((d) => d[1])
      .on('click', (e, d) => {
        const cur = state().months;
        if (!d[0]) set({ months: [] });
        else set({ months: cur.includes(d[0]) ? cur.filter((m) => m !== d[0]) : [...cur, d[0]].sort((a, b) => a - b) });
      })
      .merge(sel)
      .attr('aria-pressed', (d) => String(d[0] ? st.months.includes(d[0]) : st.months.length === 0));
    sel.exit().remove();
    root.querySelectorAll('[data-metric]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.metric === st.metric)));
    root.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === st.view)));
    document.getElementById('yd-reset').hidden = !(st.months.length || st.metric !== 'total' || st.view !== 'mix' || st.pick);
  };
  root.querySelectorAll('[data-metric]').forEach((b) => b.addEventListener('click', () => set({ metric: b.dataset.metric })));
  root.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => set({ view: b.dataset.view })));
  document.getElementById('yd-reset').addEventListener('click', () => set({ months: [], metric: 'total', view: 'mix', pick: null }));

  // ───────── 헤더 문장 ─────────
  const periodText = (st, allMonths) => st.months.length === 0 ? (allMonths[0] + '~' + allMonths[allMonths.length - 1] + '월 전체') : st.months.map((m) => m + '월').join('·');
  // 첫 이용 달 이전에 기록이 없는 달 (예: 1·2월 동계 휴장)
  const missingText = (allMonths) => {
    const miss = [];
    for (let m = 1; m < Number(allMonths[0]); m += 1) miss.push(m);
    return miss.length ? ' · ' + miss.join('·') + '월 이용 기록 없음' : '';
  };
  const drawHeader = (rows, arr, st, allMonths) => {
    const sel = rows.filter((r) => !st.months.length || st.months.includes(r.month));
    const dates = sel.map((r) => r.date).sort();
    document.getElementById('yd-meta').textContent = dates.length
      ? '이용일 ' + dates[0] + ' ~ ' + dates[dates.length - 1] + ' · 단체 ' + arr.length + '개 · 방문 ' + won(sel.length) + '회 · 인원 ' + won(sumOf(sel, 'pax')) + '명' + missingText(allMonths)
      : '선택한 기간에 이용 기록이 없습니다.';
    const take = document.getElementById('yd-take');
    if (arr.length < 40) { take.textContent = '선택 기간 단체가 40곳 미만이라 상위·하위 20 비교는 참고용입니다.'; return; }
    const T = tierStats(arr, 'top'), B = tierStats(arr, 'bottom'), all = sumOf(arr, 'total');
    const b = (txt, cls) => { const el = document.createElement('b'); el.textContent = txt; if (cls) el.className = cls; return el; };
    const tx = (s) => document.createTextNode(s);
    take.replaceChildren(
      tx(periodText(st, allMonths) + ' 기준, 상위 20개 단체가 연단체 매출의 '), b(pct(T.total / all)), tx('를, 하위 20개 단체는 '), b(pct(B.total / all)),
      tx('를 차지합니다. 하위 20의 1인 객단가는 '), b(won(B.per) + '원'), tx('으로 상위 20('), b(won(T.per) + '원'),
      tx(')의 ' + (B.per && T.per ? Math.round(T.per / B.per) + '분의 1' : '-') + ' 수준이고, 클럽하우스 후식사를 이용한 단체는 상위 20 중 '), b(T.post_groups + '곳'),
      tx(', 하위 20 중 '), b(B.post_groups + '곳', 'yd-hot'), tx('입니다.')
    );
  };

  // ───────── KPI 카드 ─────────
  const kpiBox = document.getElementById('kpis');
  const KPI = [
    { id: 'total', label: '연단체 총매출', unit: '만원', color: null },
    { id: 'clubhouse', label: '클럽하우스 (대식당)', unit: '만원', site: 0 },
    { id: 'starthouse', label: '스타트하우스', unit: '만원', site: 1 },
    { id: 'shade', label: '그늘집 (동·서)', unit: '만원', site: 2 },
    { id: 'per', label: '1인 객단가', unit: '원' },
  ];
  const drawKpis = (arr) => {
    kpiBox.classList.remove('dash-skeleton');
    const total = sumOf(arr, 'total'), pax = sumOf(arr, 'pax');
    const vals = { total, clubhouse: sumOf(arr, 'clubhouse'), starthouse: sumOf(arr, 'starthouse'), shade: sumOf(arr, 'shade'), per: pax ? Math.round(total / pax) : 0 };
    const sel = d3.select(kpiBox).selectAll('div.yd-kpi').data(KPI, (d) => d.id);
    const en = sel.enter().append('div').attr('class', 'yd-kpi');
    en.each(function (d) {
      const lab = document.createElement('div'); lab.className = 'yd-kpi-label';
      if (d.site != null) { const sw = document.createElement('span'); sw.className = 'yd-sw'; sw.dataset.site = d.site; lab.appendChild(sw); }
      lab.appendChild(document.createTextNode(d.label));
      const val = document.createElement('div'); val.className = 'yd-kpi-val';
      const num = document.createElement('span'); num.className = 'yd-num';
      const u = document.createElement('span'); u.className = 'yd-unit'; u.textContent = d.unit;
      val.append(num, u);
      const sub = document.createElement('div'); sub.className = 'yd-kpi-sub';
      const meter = document.createElement('div'); meter.className = 'yd-kpi-meter'; meter.appendChild(document.createElement('i'));
      this.append(lab, val, sub, meter);
    });
    en.merge(sel).each(function (d) {
      const v = vals[d.id];
      tweenText(this.querySelector('.yd-num'), v, d.unit === '만원' ? man0 : won);
      const sub = this.querySelector('.yd-kpi-sub');
      const bar = this.querySelector('.yd-kpi-meter i');
      if (d.site != null) {
        const s = total ? v / total : 0;
        sub.textContent = '비중 ' + pct(s) + (d.id === 'clubhouse' ? ' · 후식 ' + man0(sumOf(arr, 'post')) + '만원' : '');
        bar.style.background = SC[d.site]; bar.style.width = (s * 100) + '%';
      } else if (d.id === 'total') {
        sub.textContent = '단체 ' + arr.length + '곳 · 방문 ' + won(sumOf(arr, 'visits')) + '회';
        bar.parentElement.hidden = true;
      } else {
        sub.textContent = '총매출 ÷ 인원 ' + won(pax) + '명';
        bar.parentElement.hidden = true;
      }
    });
    root.querySelectorAll('[data-site]').forEach((el) => { el.style.background = SC[Number(el.dataset.site)]; });
  };

  // ───────── 월별 차트 ─────────
  const monthlyBox = document.getElementById('yd-monthly');
  const drawMonthly = (rows, allMonths, st) => {
    monthlyBox.classList.remove('dash-skeleton');
    const W = Math.max(260, monthlyBox.clientWidth), H = 240;
    const data = allMonths.map((m) => {
      const s = rows.filter((r) => r.month === m);
      return { month: m, clubhouse: sumOf(s, 'clubhouse'), starthouse: sumOf(s, 'starthouse'), shade: sumOf(s, 'shade'), total: sumOf(s, 'total'), visits: s.length, groups: new Set(s.map((r) => r.group)).size };
    });
    const maxV = d3.max(data, (d) => d.total) || 1;
    const y = d3.scaleLinear([0, maxV], [H - 26, 14]).nice(4);
    const ticks = y.ticks(4);
    // 왼쪽 여백은 가장 긴 눈금 글자 기준
    let svg = d3.select(monthlyBox).select('svg');
    if (svg.empty()) svg = d3.select(monthlyBox).append('svg').attr('role', 'img').attr('aria-label', '월별 사이트 매출 막대 차트');
    svg.attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('height', H);
    const probe = svg.append('text').text(man0(ticks[ticks.length - 1]) + '만');
    const ml = Math.ceil(probe.node().getComputedTextLength()) + 10; probe.remove();
    const x = d3.scaleBand(allMonths, [ml, W - 4]).padding(0.28);
    // 격자
    const grid = svg.selectAll('g.grid').data([0]).join('g').attr('class', 'grid');
    grid.selectAll('line').data(ticks).join('line')
      .attr('x1', ml).attr('x2', W - 4).attr('y1', (d) => y(d)).attr('y2', (d) => y(d))
      .style('stroke', (d) => d === 0 ? 'var(--cds-chart-axis)' : 'var(--cds-chart-grid)').attr('stroke-width', 1);
    grid.selectAll('text').data(ticks).join('text')
      .attr('x', ml - 6).attr('y', (d) => y(d)).attr('dy', '0.32em').attr('text-anchor', 'end').text((d) => man0(d) + '만');
    // 월별 막대 그룹
    const g = svg.selectAll('g.yd-month').data(data, (d) => d.month).join((en) => {
      const gg = en.append('g').attr('class', 'yd-month').attr('tabindex', 0).attr('role', 'button');
      gg.append('rect').attr('class', 'yd-hit').style('fill', 'transparent').attr('rx', 4);
      SITES.forEach((s, i) => gg.append('rect').attr('class', 'seg seg' + i).attr('y', y(0)).attr('height', 0).style('fill', SC[i]).attr('rx', 2));
      gg.append('text').attr('class', 'lab').attr('text-anchor', 'middle');
      gg.append('text').attr('class', 'val').attr('text-anchor', 'middle');
      return gg;
    });
    g.attr('aria-pressed', (d) => String(st.months.includes(d.month))).attr('aria-label', (d) => d.month + '월 ' + won(d.total) + '원');
    const active = (d) => st.months.length === 0 || st.months.includes(d.month);
    g.select('.yd-hit').attr('x', (d) => x(d.month) - 4).attr('width', x.bandwidth() + 8).attr('y', 4).attr('height', H - 26);
    SITES.forEach((s, i) => {
      g.select('.seg' + i).attr('x', (d) => x(d.month)).attr('width', x.bandwidth())
        .transition().duration(DUR).ease(d3.easeCubicOut)
        .attr('y', (d) => { const below = SITES.slice(0, i).reduce((a, t) => a + d[t.key], 0); return y(below + d[s.key]); })
        .attr('height', (d) => { const v = d[s.key]; return v ? Math.max(0, y(0) - y(v) - (i ? 2 : 0)) : 0; })
        .style('opacity', (d) => active(d) ? 1 : 0.28);
    });
    g.select('.lab').attr('x', (d) => x(d.month) + x.bandwidth() / 2).attr('y', H - 8).text((d) => d.month + '월')
      .style('fill', (d) => st.months.includes(d.month) ? 'var(--color-fg)' : 'var(--color-fg-muted)').style('font-weight', (d) => st.months.includes(d.month) ? 600 : 400);
    g.select('.val').attr('x', (d) => x(d.month) + x.bandwidth() / 2)
      .text((d) => x.bandwidth() >= 30 ? man0(d.total) : '')
      .transition().duration(DUR).attr('y', (d) => y(d.total) - 5).style('opacity', (d) => active(d) ? 1 : 0.4);
    const toggle = (d) => { const cur = state().months; set({ months: cur.includes(d.month) ? cur.filter((m) => m !== d.month) : [...cur, d.month].sort((a, b) => a - b) }); };
    g.on('click', (e, d) => toggle(d))
      .on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(d); } })
      .on('mousemove', (e, d) => showTip(e, d.month + '월 · 방문 ' + d.visits + '회 · ' + d.groups + '개 단체', [
        { name: '총매출', value: won(d.total) + '원' },
        ...SITES.map((s, i) => ({ name: s.name, value: won(d[s.key]) + '원 · ' + pct(d.total ? d[s.key] / d.total : 0), color: SC[i] })),
      ]))
      .on('mouseleave', hideTip);
  };

  // ───────── 구간 비교 ─────────
  const tiersBox = document.getElementById('yd-tiers');
  const stackInto = (bar, row, trackW) => {
    const segs = d3.select(bar).selectAll('div.yd-seg').data(SITES).join((en) => {
      const s = en.append('div').attr('class', 'yd-seg').style('width', '0%');
      s.append('span'); return s;
    });
    segs.style('background', (s, i) => SC[i])
      .transition().duration(DUR).ease(d3.easeCubicOut)
      .style('width', (s) => (row[s.share] * 100) + '%');
    segs.select('span').text((s) => pct0(row[s.share]))
      .style('visibility', (s) => trackW * row[s.share] >= 34 ? 'visible' : 'hidden');
  };
  const drawTiers = (arr, allMonths) => {
    tiersBox.classList.remove('dash-skeleton');
    const n = arr.length;
    const list = [tierStats(arr, 'top', '상위 20'), tierStats(arr, 'mid', n > 40 ? '중위 (21~' + (n - 20) + '위)' : '중위'), tierStats(arr, 'bottom', '하위 20')].filter((t) => t.groups);
    const all = sumOf(arr, 'total');
    const sel = d3.select(tiersBox).selectAll('div.yd-tier').data(list, (d) => d.tier).join((en) => {
      const el = en.append('div').attr('class', 'yd-tier');
      const nm = el.append('div'); nm.append('div').attr('class', 'yd-tier-name'); nm.append('div').attr('class', 'yd-tier-cnt');
      el.append('div').attr('class', 'yd-track').append('div').attr('class', 'yd-bar');
      el.append('div').attr('class', 'yd-tier-stats');
      return el;
    });
    sel.select('.yd-tier-name').text((d) => d.label);
    sel.select('.yd-tier-cnt').text((d) => d.groups + '개 단체');
    sel.each(function (d) {
      const track = this.querySelector('.yd-track');
      stackInto(this.querySelector('.yd-bar'), d, track.clientWidth);
      const stats = this.querySelector('.yd-tier-stats');
      const items = [['매출 비중', pct(all ? d.total / all : 0)], ['매출', man0(d.total) + '만원'], ['1인 객단가', won(d.per) + '원'], ['후식사 이용', d.post_groups + '/' + d.groups + '곳']];
      stats.replaceChildren(...items.map(([k, v]) => { const s = document.createElement('span'); const b = document.createElement('b'); b.textContent = v; s.append(k + ' ', b); return s; }));
    });
    sel.on('mousemove', (e, d) => showTip(e, d.label, SITES.map((s, i) => ({ name: s.name, value: won(d[s.key]) + '원 · ' + pct(d[s.share]), color: SC[i] }))))
      .on('mouseleave', hideTip);
  };

  // ───────── 상·하위 20 레이스 ─────────
  const drawRace = (box, list, st, maxV) => {
    box.classList.remove('dash-skeleton');
    const M = METRICS[st.metric];
    const old = box.querySelector('.yd-empty'); if (old) old.remove();
    if (!list.length) { const e = document.createElement('div'); e.className = 'yd-empty'; e.textContent = '선택 기간에 해당하는 단체가 없습니다.'; box.appendChild(e); }
    box.style.height = Math.max(1, list.length) * RH + 'px';
    const sel = d3.select(box).selectAll('div.yd-row').data(list, (d) => d.group);
    const en = sel.enter().append('div').attr('class', 'yd-row').attr('tabindex', 0).attr('role', 'button')
      .style('opacity', 0).style('transform', (d, i) => `translateY(${(i + 2) * RH}px)`);
    en.append('div').attr('class', 'yd-rank');
    en.append('div').attr('class', 'yd-name');
    en.append('div').attr('class', 'yd-track').append('div').attr('class', 'yd-bar').style('width', '0%');
    en.append('div').attr('class', 'yd-amt');
    const all = en.merge(sel);
    all.classed('is-picked', (d) => d.group === st.pick)
      .attr('aria-label', (d) => d.mrank + '위 ' + d.group + ' 상세 보기')
      .on('click', (e, d) => set({ pick: state().pick === d.group ? null : d.group }))
      .on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set({ pick: d.group }); } })
      .on('mousemove', (e, d) => groupTip(e, d)).on('mouseleave', hideTip);
    all.transition().duration(DUR).ease(d3.easeCubicInOut)
      .style('opacity', 1).style('transform', (d, i) => `translateY(${i * RH}px)`);
    all.select('.yd-rank').text((d) => d.mrank);
    all.select('.yd-name').each(function (d) {
      this.textContent = d.group; this.title = d.group;
      if (d.status === '탈회') { const c = document.createElement('span'); c.className = 'yd-chip'; c.textContent = '탈회'; this.appendChild(c); }
    });
    all.each(function (d) {
      const track = this.querySelector('.yd-track');
      const bar = this.querySelector('.yd-bar');
      const frac = st.view === 'amount' ? (maxV ? d[st.metric] / maxV : 0) : 1;
      d3.select(bar).transition().duration(DUR).ease(d3.easeCubicOut).style('width', (Math.max(0, frac) * 100) + '%');
      stackInto(bar, d, track.clientWidth * frac);
      tweenText(this.querySelector('.yd-amt'), d[st.metric], M.fmt);
    });
    sel.exit().transition().duration(DUR / 2).style('opacity', 0).remove();
  };

  // ───────── 포지셔닝 맵 ─────────
  const mapBox = document.getElementById('yd-map');
  const drawMap = (arr, st) => {
    mapBox.classList.remove('dash-skeleton');
    const W = Math.max(280, mapBox.clientWidth), H = W < 500 ? 320 : 380;
    const pts = arr.filter((g) => g.total > 0);
    const maxPer = d3.max(pts, (d) => d.per) || 1;
    const total = sumOf(arr, 'total'), pax = sumOf(arr, 'pax');
    const avgPer = pax ? total / pax : 0, avgCh = total ? sumOf(arr, 'clubhouse') / total : 0;
    let svg = d3.select(mapBox).select('svg');
    if (svg.empty()) svg = d3.select(mapBox).append('svg').attr('role', 'img').attr('aria-label', '단체 포지셔닝 버블 차트');
    svg.attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('height', H);
    const ml = 42, mb = 34, mt = 10, mr = 14;
    const x = d3.scaleLinear([-maxPer * 0.03, maxPer * 1.06], [ml, W - mr]); // 왼쪽 여유: 0원 근처 점이 축에 겹치지 않게
    const y = d3.scaleLinear([0, 1], [H - mb, mt]);
    const r = d3.scaleSqrt([0, d3.max(pts, (d) => d.total) || 1], [2.5, W < 500 ? 16 : 22]);
    const xt = x.ticks(W < 500 ? 4 : 6), yt = [0, 0.25, 0.5, 0.75, 1];
    const ax = svg.selectAll('g.ax').data([0]).join('g').attr('class', 'ax');
    ax.selectAll('line.gx').data(xt).join('line').attr('class', 'gx').attr('x1', (d) => x(d)).attr('x2', (d) => x(d)).attr('y1', mt).attr('y2', H - mb).style('stroke', 'var(--cds-chart-grid)');
    ax.selectAll('line.gy').data(yt).join('line').attr('class', 'gy').attr('x1', ml).attr('x2', W - mr).attr('y1', (d) => y(d)).attr('y2', (d) => y(d)).style('stroke', (d) => d === 0 ? 'var(--cds-chart-axis)' : 'var(--cds-chart-grid)');
    ax.selectAll('text.tx').data(xt).join('text').attr('class', 'tx').attr('x', (d) => x(d)).attr('y', H - mb + 14).attr('text-anchor', 'middle').text((d) => d3.format(',.0f')(d / 1000) + '천');
    ax.selectAll('text.ty').data(yt).join('text').attr('class', 'ty').attr('x', ml - 6).attr('y', (d) => y(d)).attr('dy', '0.32em').attr('text-anchor', 'end').text(pct0);
    ax.selectAll('text.xl').data([0]).join('text').attr('class', 'xl yd-axis-label').attr('x', W - mr).attr('y', H - 4).attr('text-anchor', 'end').text('1인 객단가(원) →');
    // 평균선
    const ref = svg.selectAll('g.ref').data([0]).join('g').attr('class', 'ref');
    ref.selectAll('line.rx').data([avgPer]).join('line').attr('class', 'rx').attr('y1', mt).attr('y2', H - mb).style('stroke', 'var(--cds-chart-reference)').attr('stroke-dasharray', '4 4')
      .transition().duration(DUR).attr('x1', x).attr('x2', x);
    ref.selectAll('line.ry').data([avgCh]).join('line').attr('class', 'ry').attr('x1', ml).attr('x2', W - mr).style('stroke', 'var(--cds-chart-reference)').attr('stroke-dasharray', '4 4')
      .transition().duration(DUR).attr('y1', y).attr('y2', y);
    // 사분면 글자는 점 위에 그린다 (아래 qlab.raise)
    const qlab = svg.selectAll('g.qlab').data([0]).join('g').attr('class', 'qlab');
    qlab.selectAll('text.q').data([
      { t: '식사형 · 고객단가', x: W - mr - 4, y: mt + 12, a: 'end' },
      { t: '스타트 위주 · 저객단가 (전환 타깃)', x: ml + 6, y: H - mb - 8, a: 'start' },
    ]).join('text').attr('class', 'q').attr('x', (d) => d.x).attr('y', (d) => d.y).attr('text-anchor', (d) => d.a).text((d) => d.t).style('fill', 'var(--color-fg-muted)').style('font-weight', 500);
    // 버블
    const dots = svg.selectAll('g.dots').data([0]).join('g').attr('class', 'dots');
    const c = dots.selectAll('circle').data(pts, (d) => d.group).join(
      (en) => en.append('circle').attr('cx', (d) => x(d.per)).attr('cy', (d) => y(d.ch_share)).attr('r', 0),
      (up) => up,
      (ex) => ex.transition().duration(DUR / 2).attr('r', 0).remove()
    );
    c.sort((a, b) => b.total - a.total)
      .style('fill', (d) => tierColor(d.tier)).style('fill-opacity', (d) => st.pick && d.group !== st.pick ? 0.35 : 0.82)
      .style('stroke', (d) => d.group === st.pick ? 'var(--color-fg)' : 'var(--color-panel)').attr('stroke-width', (d) => d.group === st.pick ? 2.5 : 1.5)
      .style('cursor', 'pointer')
      .on('click', (e, d) => set({ pick: state().pick === d.group ? null : d.group }))
      .on('mousemove', (e, d) => groupTip(e, d)).on('mouseleave', hideTip)
      .transition().duration(DUR).ease(d3.easeCubicOut)
      .attr('cx', (d) => x(d.per)).attr('cy', (d) => y(d.ch_share)).attr('r', (d) => r(d.total));
    if (st.pick) c.filter((d) => d.group === st.pick).raise();
    qlab.raise();
    // 선택 단체 라벨
    const lab = svg.selectAll('text.pick').data(pts.filter((d) => d.group === st.pick), (d) => d.group);
    lab.join('text').attr('class', 'pick').style('fill', 'var(--color-fg)').style('font-weight', 600)
      .attr('text-anchor', (d) => x(d.per) > W * 0.7 ? 'end' : 'start')
      .attr('x', (d) => x(d.per) + (x(d.per) > W * 0.7 ? -1 : 1) * (r(d.total) + 5)).attr('y', (d) => y(d.ch_share)).attr('dy', '0.32em').text((d) => d.group);
    root.querySelectorAll('[data-tier]').forEach((el) => { el.style.background = tierColor(el.dataset.tier); });
  };

  // ───────── 단체 상세 ─────────
  const detail = document.getElementById('detail');
  let lastPick = null;
  document.getElementById('yd-d-close').addEventListener('click', () => set({ pick: null }));
  const drawDetail = (rows, arr, st) => {
    const g = arr.find((a) => a.group === st.pick);
    const visits = rows.filter((r) => r.group === st.pick).sort((a, b) => a.date.localeCompare(b.date));
    if (!st.pick || !visits.length) { detail.hidden = true; lastPick = null; return; }
    detail.hidden = false;
    const isNew = lastPick !== st.pick; lastPick = st.pick;
    document.getElementById('yd-d-name').textContent = st.pick;
    document.getElementById('yd-d-sub').textContent = g
      ? '선택 기간 총매출 ' + g.rank + '위 / ' + arr.length + '개 단체' + (g.status === '탈회' ? ' · 탈회' : '')
      : '선택 기간에 방문 기록이 없습니다';
    const stats = g ? [
      ['총매출', won(g.total) + '원'], ['1인 객단가', won(g.per) + '원'], ['방문(매출 발생)', g.visits + '회 (' + g.used + '회)'],
      ['인원', won(g.pax) + '명'], ['클럽하우스 비중', pct(g.ch_share)], ['후식사 이용', g.postVisits + '/' + g.visits + '회'],
    ] : [];
    document.getElementById('yd-d-stats').replaceChildren(...stats.map(([k, v]) => { const d = document.createElement('div'); d.className = 'yd-dstat'; const b = document.createElement('b'); b.textContent = v; d.append(k, b); return d; }));
    // 회차별 막대
    const box = document.getElementById('yd-d-chart');
    const W = Math.max(260, box.clientWidth), H = 170;
    let svg = d3.select(box).select('svg');
    if (svg.empty()) svg = d3.select(box).append('svg').attr('role', 'img').attr('aria-label', '방문 회차별 매출');
    svg.attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('height', H);
    const maxV = d3.max(visits, (d) => d.total) || 1;
    const y = d3.scaleLinear([0, maxV], [H - 24, 16]).nice(3);
    const ticks = y.ticks(3);
    const ml = 44;
    const x = d3.scaleBand(visits.map((v) => v.date), [ml, W - 4]).padding(0.3);
    svg.selectAll('line.g').data(ticks).join('line').attr('class', 'g').attr('x1', ml).attr('x2', W - 4).attr('y1', y).attr('y2', y).style('stroke', (d) => d === 0 ? 'var(--cds-chart-axis)' : 'var(--cds-chart-grid)');
    svg.selectAll('text.t').data(ticks).join('text').attr('class', 't').attr('x', ml - 6).attr('y', y).attr('dy', '0.32em').attr('text-anchor', 'end').text((d) => man0(d) + '만');
    const inSel = (v) => !st.months.length || st.months.includes(v.month);
    const vg = svg.selectAll('g.v').data(visits, (d) => d.date).join((en) => {
      const gg = en.append('g').attr('class', 'v');
      gg.append('rect').attr('class', 'hit').style('fill', 'transparent');
      SITES.forEach((s, i) => gg.append('rect').attr('class', 's s' + i).style('fill', SC[i]).attr('rx', 2).attr('y', H - 24).attr('height', 0));
      gg.append('text').attr('class', 'd').attr('text-anchor', 'middle');
      return gg;
    });
    vg.select('.hit').attr('x', (d) => x(d.date) - 3).attr('width', x.bandwidth() + 6).attr('y', 0).attr('height', H - 24);
    SITES.forEach((s, i) => {
      const tr = vg.select('.s' + i).attr('x', (d) => x(d.date)).attr('width', x.bandwidth());
      (isNew ? tr.attr('y', y(0)).attr('height', 0) : tr).transition().duration(DUR).ease(d3.easeCubicOut)
        .attr('y', (d) => y(SITES.slice(0, i + 1).reduce((a, t) => a + d[t.key], 0)))
        .attr('height', (d) => d[s.key] ? Math.max(0, y(0) - y(d[s.key]) - (i ? 2 : 0)) : 0)
        .style('opacity', (d) => inSel(d) ? 1 : 0.3);
    });
    const step = Math.ceil(46 / Math.max(1, x.step()));
    vg.select('.d').attr('x', (d) => x(d.date) + x.bandwidth() / 2).attr('y', H - 8)
      .text((d, i) => i % step === 0 ? Number(d.date.slice(5, 7)) + '/' + Number(d.date.slice(8, 10)) : '');
    vg.on('mousemove', (e, d) => showTip(e, d.date + ' · 인원 ' + d.pax + '명', [
      { name: '총매출', value: won(d.total) + '원' },
      { name: '클럽 전식', value: won(d.pre) + '원', color: SC[0] },
      { name: '클럽 후식', value: won(d.post) + '원', color: SC[0] },
      { name: '스타트하우스', value: won(d.starthouse) + '원', color: SC[1] },
      { name: '그늘집', value: won(d.shade) + '원', color: SC[2] },
    ])).on('mouseleave', hideTip);
    if (isNew && st.pickScroll !== false) detail.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
  };

  // ───────── 전체 표 ─────────
  const tbody = document.getElementById('yd-tbody');
  const search = document.getElementById('yd-search');
  const count = document.getElementById('yd-count');
  let tableRows = [], sortKey = 'rank', sortDir = 1, pickNow = null;
  const COLS = [['rank', String], ['group', String, 'yd-l'], ['status', String, 'yd-l'], ['visits', won], ['pax', won], ['pre', won], ['post', won], ['starthouse', won], ['shade', won], ['total', won], ['ch_share', pct], ['st_share', pct], ['per', won]];
  const drawTable = () => {
    const q = search.value.trim();
    const rows = tableRows.filter((r) => !q || r.group.includes(q)).slice().sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      const c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'ko');
      return c * sortDir || a.rank - b.rank;
    });
    tbody.replaceChildren(...rows.map((r) => {
      const tr = document.createElement('tr');
      if (r.group === pickNow) tr.className = 'is-picked';
      COLS.forEach(([k, f, cls]) => {
        const td = document.createElement('td');
        if (cls) td.className = cls;
        if (k === 'status' && r.status === '탈회') td.className = 'yd-l yd-left';
        td.textContent = f(r[k]); tr.appendChild(td);
      });
      tr.addEventListener('click', () => set({ pick: r.group }));
      tr.addEventListener('mousemove', (e) => groupTip(e, r));
      tr.addEventListener('mouseleave', hideTip);
      return tr;
    }));
    count.textContent = q ? rows.length + ' / ' + tableRows.length + '개 단체' : tableRows.length + '개 단체';
    root.querySelectorAll('.yd-table th').forEach((th) => {
      const k = th.querySelector('button').dataset.sort;
      if (k === sortKey) th.setAttribute('aria-sort', sortDir > 0 ? 'ascending' : 'descending'); else th.removeAttribute('aria-sort');
    });
  };
  root.querySelectorAll('.yd-table th button').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.sort;
    if (k === sortKey) sortDir = -sortDir; else { sortKey = k; sortDir = (k === 'group' || k === 'status' || k === 'rank') ? 1 : -1; }
    drawTable();
  }));
  search.addEventListener('input', drawTable);

  // ───────── 메인 렌더 ─────────
  const emptyBox = document.getElementById('yd-empty-year');
  const draw = () => {
    hideTip();
    const rows = current;
    const has = rows.length > 0;
    emptyBox.hidden = has;
    root.querySelectorAll(':scope > :not(#yd-empty-year):not(header):not(.yd-tip)').forEach((el) => { el.style.display = has ? '' : 'none'; });
    if (!has) { document.getElementById('yd-meta').textContent = ''; document.getElementById('yd-take').textContent = ''; return; }
    const allMonths = [...new Set(rows.map((r) => r.month))].sort((a, b) => a - b);
    const st = state();
    st.months = st.months.filter((m) => allMonths.includes(m));
    const arr = aggregate(rows, st.months);

    // 순위 기준별 정렬 (구간은 항상 총매출 기준)
    const byMetric = arr.slice().sort((a, b) => b[st.metric] - a[st.metric] || b.total - a.total);
    byMetric.forEach((g, i) => { g.mrank = i + 1; });
    const n = byMetric.length;
    const top = byMetric.slice(0, 20);
    const bot = n > 20 ? byMetric.slice(Math.max(20, n - 20)) : [];
    const M = METRICS[st.metric];
    const barKey = st.metric;
    const maxTop = d3.max(top, (d) => d[barKey]) || 0;
    const maxBot = d3.max(bot, (d) => d[barKey]) || 0;

    document.getElementById('yd-top-title').textContent = '상위 20 · ' + M.name;
    document.getElementById('yd-bot-title').textContent = '하위 20 · ' + M.name;
    document.getElementById('yd-top-sub').textContent = st.view === 'amount' ? '막대 = ' + (barKey === 'total' ? '총매출' : M.name) + ' 규모' : '막대 = 사이트 비중';
    document.getElementById('yd-bot-sub').textContent = n > 20 ? (n - bot.length + 1) + '~' + n + '위' + (st.view === 'amount' ? ' · 하위 20 안에서 비교' : '') : '';
    root.querySelectorAll('.yd-col-val').forEach((el) => { el.textContent = M.col; });
    root.querySelectorAll('.yd-col-bar').forEach((el) => { el.textContent = st.view === 'amount' ? '금액 규모 (사이트별)' : '사이트 비중'; });

    drawFilters(allMonths, st);
    drawHeader(rows, arr, st, allMonths);
    drawKpis(arr);
    drawMonthly(rows, allMonths, st);
    drawTiers(arr, allMonths);
    drawRace(document.getElementById('yd-top'), top, st, maxTop);
    drawRace(document.getElementById('yd-bot'), bot, st, maxBot);
    drawMap(arr, st);
    drawDetail(rows, arr, st);
    pickNow = st.pick;
    tableRows = arr;
    drawTable();
  };

  /** 한 해의 확정 방문 회차로 다시 그린다 */
  const render = (data, yearLabel) => {
    document.getElementById('yd-title').textContent = yearLabel + ' 연단체 식음 매출';
    if (current && current.__src === data) return;
    current = parse(data);
    current.__src = data;
    params = { ...params, months: [], pick: null };
    draw();
  };

  // 화면 폭이 바뀌면 차트를 다시 그린다 (차트가 폭을 픽셀로 계산하므로)
  let lastW = 0, rt = 0;
  new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width);
    if (!current || Math.abs(w - lastW) < 8) return;
    lastW = w; clearTimeout(rt); rt = setTimeout(draw, 120);
  }).observe(root);

  return { render, redraw: () => { if (current) draw(); } };
}
