/* 실행: node --test tests/*.test.mjs
   원자료 대조 테스트는 환경변수 NPCC_SHEET_JSON 에 시트를 2차원 배열 JSON 으로 내보낸 파일 경로를 주면 돈다
   (영업 자료라 저장소에는 넣지 않는다). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  toInt, toISODate, parseSheet, sumRows, compareTotals, buildPromo, promoBoard,
} from '../js/promo-core.js';

const SETTINGS = { threshold_per_pax: 10000, items: { 3: '생맥주 피쳐', 6: '오늘의 샐러드', 9: '닭날개&감자튀김' } };

const visit = (date, group, post, pax = 12, extra = {}) => ({
  visit_date: date, group_name: group, team_label: null, is_withdrawn: false, teams: 3, pax,
  clubhouse_pre: 0, clubhouse_post: post, clubhouse: post, starthouse: 0, shade: 0, total: post, ...extra,
});

test('toInt 은 쉼표 문자열과 빈 값을 처리한다', () => {
  assert.equal(toInt('48,000'), 48000);
  assert.equal(toInt(''), 0);
  assert.equal(toInt(null), 0);
  assert.equal(toInt('abc'), 0);
  assert.equal(toInt(1234.6), 1235);
});

test('toISODate 는 문자열·Date·엑셀 일련번호를 받는다', () => {
  assert.equal(toISODate('2026-03-18'), '2026-03-18');
  assert.equal(toISODate('2026-03-18 00:00:00'), '2026-03-18');
  assert.equal(toISODate('2026.3.8'), '2026-03-08');
  assert.equal(toISODate(46099), '2026-03-18');
  assert.equal(toISODate(new Date(2026, 2, 18)), '2026-03-18');
  assert.equal(toISODate('일자'), null);
  assert.equal(toISODate(''), null);
});

test('parseSheet 는 머리글·합계행을 건너뛰고 합계 오류와 중복을 잡는다', () => {
  const head = ['일자', '단체명', '예약자명'];
  const ok = ['2026-03-18', 'A회', 'A회', '3', '12', '48,000', '', '', '390,000', '', '', '438,000', '', '', '', '51,000', '', '', '', '', '', '489,000'];
  const bad = ['2026-03-19', 'B회(탈회)', 'B회', '3', '12', '1,000', '', '', '0', '', '', '9,000', '', '', '', '0', '', '', '', '', '', '9,000'];
  const tot = [null, null, null, '6', '24', '49,000', '', '', '390,000', '', '', '447,000', '', '', '', '51,000', '', '', '', '', '', '498,000'];
  const res = parseSheet([head, ok, bad, ok, tot]);
  assert.equal(res.rows.length, 3);
  assert.equal(res.rows[1].is_withdrawn, true);
  assert.equal(res.rows[1].team_label, 'B회(탈회)');
  assert.equal(res.rows[1].group_name, 'B회');
  assert.equal(res.sheetTotals.total, 498000);
  assert.ok(res.errors.some((e) => e.includes('대식당 계')));
  assert.ok(res.errors.some((e) => e.includes('두 번')));
  assert.deepEqual(res.years, [2026]);
});

test('buildPromo: 1인 1만원 기준, 3·6·9 달성, 지급 상태', () => {
  const visits = [
    visit('2026-03-01', 'A', 390000), visit('2026-04-01', 'A', 23000), // 두 번째는 1인 1,917원 → 제외
    visit('2026-05-01', 'A', 200000), visit('2026-06-01', 'A', 0), visit('2026-07-01', 'A', 300000),
  ];
  const rewards = [{ year: 2026, group_name: 'A', milestone: 3, given_on: '2026-07-01', item: '생맥주 피쳐' }];
  const r = buildPromo({ year: 2026, visits, marks: [], rewards, settings: SETTINGS, appStart: '2026-10-25' });
  const a = r.groups.find((g) => g.name === 'A');
  assert.equal(a.count, 3);
  assert.deepEqual(a.visits.map((v) => v.kind), ['confirmed', 'excluded', 'confirmed', 'visit', 'confirmed']);
  assert.equal(a.rewardState[3].status, 'given');
  assert.equal(a.next.milestone, 6);
  assert.equal(a.next.steps, 3);
  assert.ok(r.issues.some((i) => i.type === 'below' && i.date === '2026-04-01'));
});

test('buildPromo: 현장 체크는 임시로 세고, 엑셀과 어긋나면 불일치', () => {
  const visits = [visit('2026-03-01', 'B', 390000), visit('2026-04-01', 'B', 0)];
  const marks = [
    { visit_date: '2026-04-01', group_name: 'B', field_post: true, field_amount: null, override_counted: null },
    { visit_date: '2026-10-25', group_name: 'B', field_post: true, field_amount: null, override_counted: null },
  ];
  const r = buildPromo({ year: 2026, visits, marks, rewards: [], settings: SETTINGS, appStart: '2026-10-25' });
  const b = r.groups[0];
  assert.equal(b.count, 2); // 3/1 확정 + 10/25 임시 (4/1 은 엑셀 기준 미달 → 불인정)
  assert.equal(b.visits.find((v) => v.date === '2026-10-25').kind, 'provisional');
  assert.ok(r.issues.some((i) => i.type === 'mismatch' && i.date === '2026-04-01'));
});

test('buildPromo: 수동 인정은 엑셀 판정보다 우선한다', () => {
  const visits = [visit('2026-04-01', 'C', 23000)];
  const marks = [{ visit_date: '2026-04-01', group_name: 'C', field_post: null, override_counted: true }];
  const r = buildPromo({ year: 2026, visits, marks, rewards: [], settings: SETTINGS, appStart: '2026-10-25' });
  assert.equal(r.groups[0].count, 1);
  assert.equal(r.issues.length, 0);
});

test('buildPromo: 연도가 다르면 따로 센다', () => {
  const visits = [visit('2026-03-01', 'D', 390000), visit('2027-03-01', 'D', 390000)];
  const r = buildPromo({ year: 2027, visits, marks: [], rewards: [], settings: SETTINGS, appStart: '2026-10-25' });
  assert.equal(r.groups[0].count, 1);
});

test('buildPromo: 지급 기록이 있는데 달성이 사라지면 orphan', () => {
  const rewards = [{ year: 2026, group_name: 'E', milestone: 3, given_on: '2026-05-01', item: 'x' }];
  const r = buildPromo({ year: 2026, visits: [visit('2026-03-01', 'E', 390000)], marks: [], rewards, settings: SETTINGS, appStart: '2026-10-25' });
  assert.ok(r.issues.some((i) => i.type === 'orphan'));
});

const SHEET = process.env.NPCC_SHEET_JSON;
test('promoBoard: 달성 미체크가 따로, 남은 횟수 순, 같은 칸은 큰 보상 먼저', () => {
  const v = [];
  ['2026-03-01', '2026-04-01', '2026-05-01'].forEach((d) => v.push(visit(d, 'A3', 300000))); // 3회 달성
  ['2026-03-01', '2026-04-01'].forEach((d) => v.push(visit(d, 'B2', 300000)));               // 1번 남음(3회)
  ['2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01', '2026-07-01'].forEach((d) => v.push(visit(d, 'C5', 300000))); // 1번 남음(6회)
  v.push(visit('2026-03-01', 'D1', 300000));                                                    // 2번 남음
  const r = buildPromo({ year: 2026, visits: v, marks: [], rewards: [], settings: SETTINGS, appStart: '2026-01-01' });
  const b = promoBoard(r.groups);
  assert.deepEqual(b.achieved.map((x) => [x.group.name, x.milestone]), [['A3', 3], ['C5', 3]]); // C5도 3회는 지났고 체크 전
  assert.deepEqual(b.steps.map((x) => x.steps), [1, 2, 3]);
  assert.deepEqual(b.steps[0].groups.map((g) => g.name), ['C5', 'B2']);
  assert.equal(b.legacyCount, 0);
});

test('원자료 26년: 시트 합계행과 1원까지 일치하고 카운트가 분석값과 같다', { skip: !SHEET || !existsSync(SHEET) }, () => {
  const aoa = JSON.parse(readFileSync(SHEET, 'utf8'));
  const res = parseSheet(aoa);
  assert.equal(res.errors.length, 0, res.errors.join('\n'));
  assert.equal(res.rows.length, 757);
  const cmp = compareTotals(sumRows(res.rows), res.sheetTotals);
  cmp.forEach((c) => assert.equal(c.ok, true, `${c.label} ${c.parsed} ≠ ${c.sheet}`));
  assert.equal(sumRows(res.rows).total, 382596500);
  assert.equal(new Set(res.rows.map((r) => r.group_name)).size, 123);

  const r = buildPromo({ year: 2026, visits: res.rows, marks: [], rewards: [], settings: SETTINGS, appStart: '2026-10-25' });
  const active = r.groups.filter((g) => !g.withdrawn);
  assert.equal(r.groups.filter((g) => g.withdrawn).length, 6);
  assert.equal(r.groups.reduce((a, g) => a + g.visits.filter((v) => v.counted).length, 0), 248);
  assert.equal(active.filter((g) => g.count >= 3).length, 40);
  assert.equal(active.filter((g) => g.count >= 6).length, 21);
  const board = promoBoard(r.groups);
  assert.equal(board.steps[0].steps, 1);
  assert.equal(board.steps[0].groups.length, 16);
  assert.equal(board.steps[1].groups.length, 29);
  assert.equal(board.achieved.length, 0); // 26년 달성분은 모두 앱 도입 전
  assert.equal(board.legacyCount, 62);
  assert.equal(r.issues.filter((i) => i.type === 'below').length, 2);
  assert.equal(board.steps.reduce((a, x) => a + x.groups.length, 0) + board.finished.length, active.length);
});
