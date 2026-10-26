---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

Scope: whole app shell (index.html) — tab 「3·6·9」(primary), 「매출」(mobile-first rebuild, figures from the v3 dashboard but not its look), 「자료」(엑셀 업로드·대조·규칙). Visitor mode: Operate. Phone first (standing, one hand), PC secondary.
Audience/job: single owner. Job 1: see which groups are closest to 3/6/9 and tick rewards as given. Job 2: read group sales at a glance. Job 3: month-end Excel upload reconciled to the totals row.
Constraints (2026-10-25 user correction): no visit-date prediction, no "today"/"pending" sections, no field check-in — counts come from Excel only. Achieved-but-unchecked groups sit at the top of the same list. Previous inherited dashboard look rejected as unreadable.
Memorable moment: each group reads like a yardage-book page — one huge "1 번 남음" number and a tee-to-flag path.

## Direction contract
THESIS: The 3·6·9 tab is a yardage book. Every group is a page showing the distance left to the next flag (post-meals remaining) as one huge number, ordered nearest-flag first. It refuses the dense dashboard of tiny grey labels and the CRM table.
OWN-WORLD: White page, deep fairway green #1E4A34 cover block and rules, ink #10231A, secondary green #2D5C44, hairline #D5DED8, flag orange #C4541F used only for flags and the achieved state. Pretendard for Korean text (body ≥16px, names 21px), Barlow Condensed for distance numerals (52px). Tee-to-flag path: filled dots joined by green segments, open dots for remaining, orange flag tab with the milestone number.
STORY: Open → green cover says how many groups are 1 and 2 away and how many need a tick → achieved groups at top with a big checkbox (+ memo) → then 1 번 남음, 2 번 남음… → tap a page for its post-meal history.
FIRST VIEWPORT: green cover (year chip, "엑셀 MM/DD 기준", title "3·6·9 임박 단체", three big counts), search field, section rule "달성 · 지급 체크" with orange-tinted pages, then "1 번 남음" pages with right-aligned 52px numerals. Bottom tab bar: 3·6·9 · 매출 · 자료.
FORM: yardage book, rank 7 of my seven grounded directions (assigned by the roll), user-locked over leaderboard and the canon card. seed:658c36a565cfeeac. Signature move: the tee-to-flag path; ticking a reward stamps the flag and the page slides to its new place.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
