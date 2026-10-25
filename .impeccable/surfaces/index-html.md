---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

Scope: whole app shell (index.html) — tab 1 「3·6·9 프로모션」(primary), tab 2 「매출」(port of dashboard v3), tab 3 「자료」(엑셀 업로드·대조·설정). Visitor mode: Operate. Mobile-first (390px), used standing on site; desktop for month-end upload.
Audience/job: single owner (F&B 지배인). Job 1: know who gets which reward today and record it in one tap. Job 2: month-end upload that reconciles to the sheet's totals row.
Constraints: offline-first check-ins; confirmed vs provisional vs estimated must be visually distinct; numbers in won with tabular figures.
Memorable moment: tapping 후식 진행 fills the next stamp and the group climbs one rung; landing on 3/6/9 lights the reward.

## Direction contract
THESIS: The promotion tab is a 0→9 ladder. Every group sits on the rung of its current post-meal count; groups one step below 3, 6, 9 are lifted to the top as "다음 후식이면 지급". It refuses the CRM member table sorted by name.
OWN-WORLD: Inherited dashboard world — ground #F3F6F8, white cards with #E2E7EC hairline, ink #1D2731 / #5D6975, Noto Sans KR, tabular figures, dark ink pill for pressed state. Reward rungs carry validated food colors: 3 amber #CC7A14 (피쳐), 6 green #0B8C66 (샐러드), 9 red #D2563C (닭날개). Stamps: filled = confirmed, ring with dashed edge = 당일 체크(임시), struck = 기준 미달.
STORY: Open → see who is one post-meal away and when they are expected → on site tap 후식 진행 → stamp fills, reward card asks 지급 ✓ + 메모 → done; month-end upload confirms or flags mismatches.
FIRST VIEWPORT: sticky header (title, 26년 chip, sync dot), ladder strip of 10 rung columns 0–9 with group counts (rungs 2/5/8 tinted as next-reward), search input, then "다음 후식이면 지급" cards: name, 9-dot stamp row, 예상일, reward item, [후식 진행] [방문만]. Bottom tab bar: 프로모션 · 매출 · 자료.
FORM: ladder board, rank 5 of my seven grounded structures, dealt lead and locked by the user. seed:c9c6123779e484e1. Signature move: stamp fill + FLIP climb of the card to its new rung; reward rung flashes its color once.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
