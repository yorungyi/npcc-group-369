---
name: 연단체 3·6·9
description: 노스팜CC 연단체 후식사 3·6·9 야디지북 — 서서 한 손으로 읽는 현장 도구와 연단체 매출 실적
colors:
  green: "#1E4A34"
  green-deep: "#173B29"
  green-2: "#2D5C44"
  ink: "#10231A"
  sub: "#3F5248"
  paper: "#FFFFFF"
  page: "#F4F6F5"
  wash: "#EEF3F0"
  line: "#D5DED8"
  line-soft: "#E7EDE9"
  flag: "#C4541F"
  flag-ink: "#A8441A"
  flag-wash: "#FFF1E6"
  flag-line: "#F0CDB4"
  flag-on-green: "#FFB27A"
  bad: "#B3261E"
  ok: "#1E6B45"
  site-ch: "#1E4A34"
  site-st: "#D08A2E"
  site-sh: "#4A86C5"
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Pretendard Variable', Pretendard, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
  yardage:
    fontFamily: "'Barlow Condensed', 'Pretendard Variable', Pretendard, sans-serif"
    fontSize: "54px"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "0"
  count:
    fontFamily: "'Barlow Condensed', 'Pretendard Variable', Pretendard, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
  figure:
    fontFamily: "'Barlow Condensed', 'Pretendard Variable', Pretendard, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
    fontFeature: "tnum"
  headline:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  rule:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  body-sm:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  caption:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
rounded:
  tab: "4px"
  sm: "6px"
  md: "10px"
  panel: "12px"
  lg: "14px"
  card: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  gutter: "20px"
  gutter-wide: "28px"
  tab-h: "64px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.green-deep}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.green}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "48px"
  button-outline-hover:
    backgroundColor: "{colors.wash}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.sub}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "48px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "50px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "42px"
  chip-selected:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
  cover:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    padding: "12px 20px 20px"
  section-rule:
    textColor: "{colors.green}"
    typography: "{typography.rule}"
    padding: "0 0 8px"
  hole-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "18px 20px"
  hole-row-done:
    backgroundColor: "{colors.flag-wash}"
    textColor: "{colors.flag-ink}"
  flag-tab:
    backgroundColor: "{colors.flag}"
    textColor: "{colors.paper}"
    rounded: "{rounded.tab}"
    padding: "2px 9px"
  tick:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 18px 0 12px"
    height: "50px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "12px 12px 12px 18px"
  tabbar-pill-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
---

# Design System: 연단체 3·6·9

## Overview

**Creative North Star: "야디지북 (The Yardage Book)"**

이 앱은 캐디가 주머니에서 꺼내 보는 야디지북처럼 읽힌다. 각 연단체는 한 페이지이고, 그 페이지가 말하는 것은 하나뿐이다. 다음 깃발(3·6·9 보상)까지 남은 후식사 횟수가 큰 숫자 하나로 오른쪽에 서 있고, 그 아래로 티에서 깃발까지 가는 점과 선의 경로가 그려진다. 목록은 깃발에 가까운 순서로 내려간다. 촘촘한 회색 라벨 대시보드나 CRM 표가 아니라 한 손으로 서서 훑는 종이다.

바탕은 흰 종이이고, 모든 탭의 머리에 짙은 페어웨이 그린 표지가 한 덩어리로 놓인다. 페이지 구분은 그린 머리줄(두꺼운 밑줄)로 하고, 페이지 사이는 가는 헤어라인으로만 나눈다. 색은 거의 그린과 잉크뿐이다. 주황은 깃발과 "달성" 상태에만 나타나므로 화면에서 주황이 보이면 그곳이 지금 손을 대야 할 곳이다.

밀도는 의도적으로 낮다. 본문은 16–17px 이상, 단체명은 21px, 남은 거리 숫자는 54px 압축 고딕 숫자다. 그림자 없이 평면으로 두고, 깊이는 표지와 종이의 대비, 그리고 머리줄과 헤어라인의 위계로만 만든다.

**Key Characteristics:**
- 흰 종이 + 짙은 그린 표지 블록, 모든 탭이 같은 표지를 머리에 쓴다
- 한 단체 = 한 페이지(행), 오른쪽에 큰 거리 숫자, 아래에 티→깃발 경로
- 주황은 깃발과 달성 상태 전용
- 한국어는 Pretendard Variable, 숫자는 Barlow Condensed
- 평면, 헤어라인 구분, 두꺼운 그린 머리줄로 칸을 나눈다
- 휴대폰은 하단 탭 막대, 900px 이상에서는 표지 위 흰 알약 탭

## Colors

거의 단색에 가까운 그린-잉크 팔레트 위에, 깃발 주황 하나가 신호로만 얹힌다.

### Primary
- **페어웨이 그린** (`green`): 표지 블록 배경, 칸 머리줄의 글자와 2.5px 밑줄, 채운 경로 점과 선, 실선 버튼, 선택된 칩, 가로 순위 막대, 현재 탭 색, 테마 색(`theme-color`). 앱의 정체성 전부가 이 색이다.
- **짙은 그린** (`green-deep`): 실선 버튼 hover에만 쓴다.
- **두 번째 그린** (`green-2`): 보상 줄(`3회 · 품목`)과 "번 남음" 단위 같은 보조 글자, 파일 놓기 칸의 점선 테두리.

### Secondary
- **깃발 주황** (`flag`): 경로 끝의 깃발 탭, "달성 · 지급 체크" 머리줄의 밑줄, 상세 보상 줄에서 지급 대기(`due`) 표시.
- **깃발 잉크** (`flag-ink`): 달성 행의 큰 "N회 달성" 글자와 달성 머리줄 글자. 흰 바탕 위 주황 글자의 대비를 맞추기 위한 짙은 톤.
- **깃발 바탕 / 깃발 선** (`flag-wash`, `flag-line`): 달성 행의 바탕과 아래 헤어라인.
- **그린 위 깃발** (`flag-on-green`): 표지의 "체크 필요" 카운트가 0보다 클 때만 숫자를 이 색으로 바꾼다.

### Tertiary (매출 업장 색)
- **클럽하우스** (`site-ch`), **스타트하우스** (`site-st`), **그늘집** (`site-sh`): 매출 탭의 업장 비중 막대, 월별 누적 막대, 범례에만 쓰는 데이터 계열 색. 클럽하우스는 페어웨이 그린과 같은 값이다.

### Neutral
- **종이** (`paper`): 페이지 바탕, 행 바탕, 입력칸 바탕, 표지 위 글자.
- **잉크** (`ink`): 본문과 거리 숫자, 체크 버튼 테두리, 토스트 바탕.
- **보조 잉크** (`sub`): 라벨, 단위, 설명, 비활성 순위 숫자.
- **연한 바닥** (`page`): 검색칸, 상세 보상 줄, 빈 상태, 세그먼트 바탕, 파일 놓기 칸.
- **물빛** (`wash`): 버튼 hover, 선택된 월 행, 탈회 태그.
- **헤어라인** (`line`) / **연한 헤어라인** (`line-soft`): 행 사이 1px 구분선, 빈 경로 점의 테두리와 빈 선분, 막대의 빈 트랙.
- **경고 빨강** (`bad`), **일치 초록** (`ok`): 자료 탭의 대조 결과와 오류, 방문 기록의 "제외" 표시에만.

### Named Rules
**The One Flag Rule.** 주황 계열(`flag`, `flag-ink`, `flag-wash`, `flag-line`, `flag-on-green`)은 깃발 탭과 달성·지급 대기 상태에만 쓴다. 강조가 필요하다고 주황을 꺼내지 않는다. 주황이 보이면 그곳에 할 일이 있다.

**The Green Cover Rule.** 모든 탭은 같은 그린 표지(`green` 바탕, 흰 글자)로 시작한다. 표지 위의 흰 글자 보조 정보는 `rgba(255, 255, 255, 0.85)`, 표지 위 테두리는 `rgba(255, 255, 255, 0.45)`로 한 단계만 낮춘다.

## Typography

**Display Font:** Barlow Condensed 600/700 (fallback `'Pretendard Variable', Pretendard, sans-serif`)
**Body Font:** Pretendard Variable (fallback `Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif`)

**Character:** 좁고 굵은 Barlow Condensed 숫자가 거리 표지판처럼 서고, 한국어는 Pretendard 굵은 무게(700–800)와 촘촘한 자간으로 단단하게 붙는다. 숫자는 모두 `tabular-nums`로 자릿수가 흔들리지 않는다.

### Hierarchy
- **Display** (`display`): 매출·자료 탭 표지의 큰 합계 숫자. 단위(`만`, `곳`)는 Pretendard 20px 700으로 붙인다.
- **Yardage** (`yardage`): 단체 페이지 오른쪽의 "남은 횟수" 숫자. 아래 14px 700 `green-2` "번 남음" 단위가 따라온다. 달성 행에서는 Pretendard 36px 800 `flag-ink`의 "N회"로 바뀐다.
- **Count** (`count`): 표지의 탭 가능한 세 카운트(1번 남음, 2번 남음, 체크 필요).
- **Figure** (`figure`): 매출 업장 금액(32px), 순위 금액(26px), 월 금액(24px), 칸 머리줄 개수(22px)와 같은 2차 숫자 계열.
- **Headline** (`headline`): 표지 제목("3·6·9 임박 단체"). 로그인 제목은 28px 800.
- **Title** (`title`): 단체명. 순위 행에서는 18px로 줄인다.
- **Rule** (`rule`): 칸 머리줄 제목. 오른쪽 보조 글은 14px 600 `sub`.
- **Body** (`body`): 기본 본문, 입력칸, 체크 버튼 글자(17px 800). 매출 요약문은 17px, `line-height: 1.7`.
- **Body-sm** (`body-sm`): 상세 행, 방문 행, 보상 줄, 판정 박스, 버튼(16px 700).
- **Label** (`label`): 입력 라벨, 표지 메타, 범례, 힌트.
- **Caption** (`caption`): 단위, 표 머리, 탭 막대 글자(13px 700)와 배지(11px 800)가 이 바닥선 아래 유일한 예외다.

### Named Rules
**The Standing Reader Rule.** 서서 한 손으로 읽는 화면이다. 읽어야 하는 본문은 16px 아래로 내리지 않는다. 14px 이하는 단위, 표 머리, 탭 이름처럼 옆에 큰 글자가 이미 있는 자리에만 쓴다.

**The Numerals Are Barlow Rule.** 거리·횟수·금액·순위 숫자는 `.num` 계열(Barlow Condensed 700, `letter-spacing: 0`)로 쓰고, 그 옆 단위 글자는 Pretendard로 되돌린다.

## Layout

단일 열의 세로 목록이 기본이다. 콘텐츠 폭은 `min(100%, 1080px)`로 가운데 정렬하고, 좌우 여백은 `gutter`(휴대폰 20px, 900px 이상 28px)를 모든 행·머리줄·안내문이 공유한다. 행은 화면 가장자리까지 꽉 차고, 내용만 거터만큼 들어온다.

- **표지:** 위쪽 `12px + safe-area-inset-top`, 아래 20px(PC 18px / 28px). 메타 줄(연도 알약 선택, 동기화 알약) → 제목 → 카운트 묶음 순서.
- **칸 머리줄:** 위 20px, 밑줄 아래 8px. 머리줄 사이에 카드나 상자를 두지 않는다.
- **행 리듬:** 단체 행 18px 위아래, 매출 행 14px, 월 행 최소 52px, 등급 표 행 최소 54px, 방문 행 최소 46px.
- **터치 목표:** 버튼 48px, 입력칸·체크 버튼 50px, 칩·세그먼트 42px, 탭 막대 버튼 56px.
- **하단:** 본문 아래에 `tab-h`(64px) + safe-area + 28px를 비워 고정 탭 막대에 가리지 않게 한다.
- **900px 이상:** 3·6·9 보드는 칸(머리줄)은 위→아래 그대로 두고 칸 안의 단체만 2열(`column-gap: 32px`)로 흐른다. 매출 탭의 `split`은 `1fr : 1.2fr` 두 열. 탭 막대는 표지 오른쪽 위로 올라간다.

## Elevation & Depth

평면 시스템이다. 깊이는 그린 표지와 흰 종이의 대비, 2.5px 그린 머리줄과 1px 헤어라인의 위계로 만든다. 그림자는 떠 있는 것과 눌러볼 것에만 쓴다.

### Shadow Vocabulary
- **토스트** (`box-shadow: 0 10px 30px rgba(16, 35, 26, 0.3)`): 화면 위에 뜨는 유일한 층.
- **체크 버튼 hover** (`box-shadow: 0 2px 6px rgba(16, 35, 26, 0.12)`): 포인터를 올렸을 때만.
- **세그먼트 선택** (`box-shadow: 0 1px 3px rgba(16, 35, 26, 0.15)`): 선택된 칸이 바닥에서 살짝 올라온 표시.
- **입력 포커스 링** (`box-shadow: 0 0 0 3px rgba(30, 74, 52, 0.15)`): 테두리가 `green`으로 바뀌면서 함께.
- **탭 막대(휴대폰)**: 그림자 대신 `rgba(255, 255, 255, 0.97)` 바탕 + `backdrop-filter: blur(12px)` + 위쪽 1px `line`.

### Named Rules
**The Flat Page Rule.** 단체 행, 칸, 상세는 그림자 없이 종이 위에 그대로 놓인다. 구분은 선으로 한다. 카드 상자로 감싸지 않는다.

## Shapes

부드럽지만 둥글둥글하지 않은 모서리. 조작 요소(버튼, 입력칸, 체크 버튼, 상세 보상 줄)는 `md`(10px), 상자형 안내(빈 상태, 판정 박스, 세그먼트)는 `panel`(12px), 토스트와 파일 놓기 칸은 `lg`(14px), 로그인 카드만 `card`(18px). 깃발 탭과 완주 표시는 `tab`(4px)로 거의 각지게 두어 표지판처럼 보인다. 표지 위 컨트롤(연도, 동기화, PC 탭)과 칩은 `pill`.

경로의 점은 14px 원, 선분은 16×4px 직사각형. 채운 점은 `green`, 빈 점은 흰 바탕에 3px 안쪽 `line` 테두리다. 체크 버튼 안의 상자는 26px, `sm`(6px) 모서리, 2.5px `ink` 테두리.

## Components

### Buttons
담백하고 단단하다. 실선 또는 그린 외곽선 두 가지.
- **Shape:** `md`(10px), 높이 48px, 좌우 18px, 16px 700. 작은 버튼은 40px / 15px.
- **Primary (실선):** `green` 바탕, 흰 글자. hover `green-deep`.
- **Outline (기본):** 흰 바탕, 1.5px `green` 테두리, `green` 글자. hover `wash`.
- **Quiet:** 투명 테두리·바탕, `sub` 글자. hover `wash`.
- **눌림 / 비활성:** `transform: scale(0.97)` (120ms `--ease`), 비활성은 `opacity: 0.45`.
- **Focus:** 전역 `:focus-visible`이 3px 외곽선 + 2px 간격을 그린다.

### Chips
- **Style:** 흰 바탕, 1.5px `line` 테두리, `pill`, 높이 42px, 16px 700 `ink`. 가로 스크롤 한 줄.
- **State:** 선택(`aria-pressed="true"`) 시 `green` 바탕·테두리, 흰 글자.

### Segmented Control
- `page` 바탕, 4px 안쪽 여백, `panel` 모서리. 각 칸 42px, 15px 700 `sub`. 선택 칸은 흰 바탕, `ink` 글자, 세그먼트 그림자.

### Inputs / Fields
- **Style:** 흰 바탕, 1.5px `line` 테두리, `md`, 높이 50px, 17px. placeholder `#66776D`.
- **Focus:** 테두리 `green` + 입력 포커스 링.
- **검색칸:** `page` 바탕에 테두리 없음, 왼쪽 20px 돋보기 SVG. 포커스 시 흰 바탕 + `green` 테두리.
- **라벨:** 15px 600 `sub`, 아래 6px.

### Navigation
- **휴대폰:** 화면 아래 고정 3칸 탭 막대(3·6·9 · 매출 · 자료). 각 버튼 56px, 26px 선 아이콘 SVG 위 13px 700 글자, 기본 `#5C6E64`, 현재 탭 `green` + 아이콘 `stroke-width: 2.4`.
- **900px 이상:** 같은 버튼이 표지 오른쪽 위의 가로 알약 줄로 바뀐다. 1.5px `rgba(255, 255, 255, 0.4)` 테두리, 흰 글자, 높이 40px, 19px 아이콘. 현재 탭은 흰 알약에 `green` 글자.
- **배지:** 18px 높이 알약, 11px 800 흰 글자.

### Green Cover (표지)
- `green` 바탕 블록. 메타 줄에 "엑셀 MM/DD 기준" 15px 600, 연도 선택 알약(흰 꺾쇠 SVG), 동기화 알약(9px 상태 점: 정상 `#7FD4A4`, 대기 `#F5B971`, 오류 `#FF8A80`, 오프라인은 흰 빈 원, 동기화 중 깜빡임).
- **탭 가능한 카운트:** 라벨 15px 600 위에 `count` 숫자, 아래 2px `rgba(255, 255, 255, 0.35)` 밑줄이 평소에도 보이고, 라벨 뒤에 7px 아래 꺾쇠가 붙어 "누르면 그 칸으로 간다"를 알린다. hover·누름 시 밑줄이 흰색이 된다. 누르면 해당 칸 머리줄로 이동한다.

### Section Rule (칸 머리줄)
- 야디지북의 페이지 구분. 18px 800 `green` 제목, 오른쪽에 22px Barlow 개수, 필요하면 맨 오른쪽 14px `sub` 보조 글. 2.5px `green` 밑줄.
- 달성 칸은 글자 `flag-ink`, 밑줄 `flag`.
- 접는 칸(`details`)은 제목 뒤에 9px 꺾쇠가 붙고 열리면 위로 돌아간다(200ms).

### Yardage Page Row (단체 페이지)
이 시스템의 서명 컴포넌트.
- 두 열 그리드: 왼쪽에 단체명(`title`) + 아래 보상 줄(16px 600 `green-2`, "3회 · 품목"), 오른쪽에 두 줄 높이의 `yardage` 숫자와 "번 남음".
- 아래 전체 폭에 **티→깃발 경로:** 후식사 1회마다 점 하나, 점 사이 선분. 인정된 횟수는 채운 `green` 점과 선, 남은 횟수는 빈 점과 `line` 선, 끝에 `flag` 바탕 흰 Barlow 16px 숫자(3/6/9) 깃발 탭.
- 9회 완주 단체는 경로 대신 `green` 바탕 흰 14px 800 "올해 3·6·9 완주" 표시.
- 행 전체가 버튼이다. hover `#FAFCFB`. 누르면 아래에 상세가 펼쳐진다.
- 탈회 단체 이름 옆에 `wash` 바탕 13px 700 태그.

### Achieved Row (달성 · 지급 체크)
- `flag-wash` 바탕, `flag-line` 아래선. 오른쪽 숫자는 Pretendard 36px 800 `flag-ink` "N회" + "달성".
- 아래 줄: **큰 체크 버튼**(높이 50px, 2px `ink` 테두리, 흰 바탕, 26px 빈 상자 + "지급했으면 체크" 17px 800) 옆에 메모 입력칸(50px, 16px).
- 체크하면 행이 새 자리로 옮겨 가고 그 자리에서 1100ms 동안 `#DCEFE3`에서 흰색으로 한 번 빛난다(`--ease`). 되돌리기 토스트가 함께 뜬다.

### Expanded Detail
- 소제목 16px 800 `green`.
- **보상 줄:** `page` 바탕, `md`, 최소 56px. 왼쪽 52px 칸에 Barlow 22px 회차 표시(흰 바탕 + 2px `line` 안쪽 테두리). 지급 완료는 `green` 바탕 흰 글자, 지급 대기는 `flag` 바탕 흰 글자. 품목 700, 아래 14px `sub` 설명.
- **방문 줄:** 날짜 / 내용 / 금액 세 칸, 최소 46px, `line-soft` 구분선. 인정 `green`, 제외 `bad`, 일반 방문 `sub` 500.

### Sales Rows (매출)
- **업장 행:** 12px `rounded 3px` 색 사각 + 업장명 17px 700, 오른쪽 `figure` 32px 금액(+ 15px "만"), 아래 15px `sub` 설명과 비중 %, 전체 폭 8px 비중 막대(`line-soft` 트랙, 업장 색 채움).
- **월 행:** 월(17px 800) / 업장 색 누적 막대(14px 높이, 길이 = 최대월 대비) / Barlow 24px 금액. 선택 월은 `wash`, 범위 밖 월은 `opacity: 0.38`. 아래 범례 15px.
- **순위 행:** Barlow 22px `sub` 순위, 단체명 18px, Barlow 26px 금액, 아래 8px **단색 `green` 금액 막대**(업장 색을 쓰지 않는다). 누르면 `page` 바탕 상세가 펼쳐진다.
- **등급 표:** 구간 / 매출 비중 / 1인 객단가 / 후식 이용 네 칸, 머리 14px 700 `sub`, 행 15px(구간명 18px), 숫자 칸 오른쪽 정렬.
- **요약문:** 17px, `line-height: 1.7`, 굵은 수치는 800, 주의 수치는 `bad`.

### Data Tab (자료)
- **파일 놓기 칸:** 최소 112px, 2px 점선 `green-2` 테두리, `lg`, `page` 바탕. "엑셀 파일 선택" 19px 800 `green`. 파일을 끌어 올리는 동안은 테두리 `flag`, 바탕 `flag-wash`.
- **대조 표:** 16px, 머리 14px 700 `sub`, 숫자 오른쪽 정렬, "일치" `ok` 800 / "불일치" `bad`.
- **판정 상자:** `panel`, 16px 600. 통과 `#E3F2E9` 바탕 `#134A2E` 글자, 실패 `#FBE6E3` 바탕 `#8A1C15` 글자.
- **확인 필요 행:** 제목 줄 800 + 오른쪽 15px `sub` 날짜, 아래 작은 버튼 줄, `line-soft` 구분선.

### Toast
- 아래 가운데 떠 있는 `ink` 바탕 흰 16px 600 알림, `lg`, 토스트 그림자, 최대 520px. 아래에서 12px 올라오며 260ms에 나타난다.
- 되돌리기 동작이 있으면 오른쪽에 `rgba(255, 255, 255, 0.16)` 바탕 40px 버튼(15px 800). 동작이 있으면 6초, 없으면 3.2초 뒤 사라진다.

## Do's and Don'ts

### Do:
- **Do** 모든 탭을 `green` 표지로 시작하고, 표지 안에는 흰 글자와 Barlow 큰 숫자만 둔다.
- **Do** 단체 하나를 한 행(페이지)으로 두고, 오른쪽에 54px `yardage` 숫자, 아래에 티→깃발 경로를 그린다.
- **Do** 목록을 깃발에 가까운 순서(달성 → 1 번 남음 → 2 번 남음 …)로 정렬하고, 칸은 2.5px `green` 머리줄로 나눈다.
- **Do** 행 사이를 1px `line` / `line-soft` 헤어라인으로만 구분한다.
- **Do** 숫자는 Barlow Condensed 700 + `tabular-nums`, 단위 글자는 Pretendard로 되돌린다.
- **Do** 읽는 본문은 16px 이상, 단체명은 21px, 터치 목표는 42px 이상(주요 동작 48–50px)으로 둔다.
- **Do** 표지의 탭 가능한 숫자에는 평소에도 보이는 밑줄과 아래 꺾쇠를 붙인다.
- **Do** 아이콘은 `currentColor` 선 SVG로 그린다.
- **Do** `prefers-reduced-motion`에서 모든 애니메이션과 전환을 1ms로 줄인다.

### Don't:
- **Don't** 주황(`flag` 계열)을 깃발 탭과 달성·지급 대기 상태 밖의 강조에 쓰지 않는다.
- **Don't** 단체 행을 그림자 있는 카드나 상자로 감싸지 않는다. 그림자는 토스트, 체크 버튼 hover, 세그먼트 선택, 포커스 링에만 쓴다.
- **Don't** 순위 막대에 업장 색을 섞지 않는다. 업장 색은 업장 비중 막대, 월별 누적 막대, 범례에만 쓴다.
- **Don't** 촘촘한 회색 소형 라벨 대시보드나 CRM 표처럼 구성하지 않는다. 표는 대조 표와 등급 표에만 쓴다.
- **Don't** 읽어야 하는 문장을 14px 이하로 내리지 않는다.
