---
name: 연단체 3·6·9
description: 노스팜CC 연단체 후식사 프로모션 현장 도구와 연단체 매출 실적 대시보드
colors:
  page: "#F3F6F8"
  panel: "#FFFFFF"
  ink: "#1D2731"
  ink-hover: "#2B3845"
  muted: "#5D6975"
  line: "#E2E7EC"
  line-2: "#DCE2E8"
  grid: "#EEF2F5"
  axis: "#B8C2CC"
  rest: "#C3CAD1"
  zebra: "#F8FAFB"
  bad: "#C8463A"
  warn: "#A86200"
  ok: "#1B7F4D"
  r3: "#CC7A14"
  r3-ink: "#8A4F00"
  r3-tint: "#FBF0E1"
  r6: "#0B8C66"
  r6-ink: "#06694B"
  r6-tint: "#E2F3ED"
  r9: "#D2563C"
  r9-ink: "#A63A23"
  r9-tint: "#FBE8E3"
  site-blue: "#3F7FD0"
  tier-indigo: "#5A5FD6"
typography:
  headline:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  title:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  section:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  body-sm:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  micro:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  xs: "4px"
  sm: "8px"
  inset: "10px"
  md: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  card-x: "14px"
  lg: "16px"
  gutter: "16px"
  gutter-wide: "28px"
components:
  button:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.panel}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.grid}"
  button-sm:
    typography: "{typography.body-sm}"
    padding: "0 12px"
    height: "36px"
  button-reward-3:
    backgroundColor: "{colors.r3-ink}"
    textColor: "{colors.panel}"
    rounded: "{rounded.sm}"
    height: "44px"
  button-reward-6:
    backgroundColor: "{colors.r6-ink}"
    textColor: "{colors.panel}"
    rounded: "{rounded.sm}"
    height: "44px"
  button-reward-9:
    backgroundColor: "{colors.r9-ink}"
    textColor: "{colors.panel}"
    rounded: "{rounded.sm}"
    height: "44px"
  field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  chip-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
  chip-filter:
    backgroundColor: "{colors.grid}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
  group-card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  reward-box:
    rounded: "{rounded.inset}"
    padding: "12px 14px 14px"
  tag:
    backgroundColor: "{colors.grid}"
    textColor: "{colors.muted}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "0 7px"
    height: "20px"
  tag-provisional:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 10px 10px 16px"
  tab-item:
    textColor: "{colors.muted}"
    typography: "{typography.micro}"
    rounded: "{rounded.inset}"
    height: "54px"
  tab-item-active:
    textColor: "{colors.ink}"
  tab-pill-wide:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  tab-pill-wide-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
  stamp:
    rounded: "{rounded.pill}"
    size: "14px"
  stamp-large:
    rounded: "{rounded.pill}"
    size: "22px"
---

# Design System: 연단체 3·6·9

## Overview

**Creative North Star: "현장 스탬프 장부"**

이 앱은 기존 연단체 대시보드 v3의 밝은 대시보드 세계를 그대로 잇는다. 차가운 회청색 바탕(`page`) 위에 흰 카드와 머리카락 굵기의 테두리, 짙은 잉크색 글자, Noto Sans KR과 고정폭 숫자(tabular figures). 이 차분한 바탕 위에서 색은 거의 오직 보상에만 쓰인다. 3회 호박색, 6회 초록, 9회 주홍. 화면을 훑었을 때 색이 보이는 곳이 곧 「오늘 무엇을 줘야 하는가」의 답이다.

형태의 중심은 0–9 사다리와 3·3·3 스탬프 줄이다. 단체마다 현재 후식사 횟수의 칸에 서 있고, 스탬프는 확정(채움), 현장 체크 임시(점선 고리), 보상 칸(보상색 고리)을 눈으로 구분한다. 휴대폰을 서서 한 손으로 쓰는 현장 도구이므로 밀도는 중간이고, 모든 탭 대상은 최소 44px이다. 장식은 없다. 깊이는 아주 옅은 그림자 한 겹이 전부이고, 움직임은 상태가 바뀌었다는 증거(스탬프가 찍힘, 카드가 반짝임, 토스트 등장)로만 쓴다.

확정·임시·추정의 구분이 이 세계의 문법이다. 실선 채움은 엑셀로 확정된 값, 점선은 엑셀 확정 전 현장 체크, 「예상」 글자는 추정 방문일이다. 이 세 가지를 같은 모양으로 그리는 화면은 이 시스템을 벗어난다.

**Key Characteristics:**
- 밝은 회청색 바탕 + 흰 카드 + `line` 테두리 + 옅은 그림자 한 겹
- 무채색 잉크가 기본, 색은 보상 3색과 상태(정상·주의·오류)에만
- 눌린 상태는 언제나 잉크색 알약(배경 `ink`, 글자 흰색)
- 모든 숫자는 고정폭 숫자, 천 단위 쉼표
- 점선 = 임시(현장 체크·끌어 놓기 영역·빈 상태), 실선 = 확정
- 휴대폰은 하단 탭바, 900px 이상은 우측 상단 알약 내비게이션

## Colors

차가운 회청색 무채색 단계 위에, 검증된 데이터 시각화 팔레트에서 고른 보상 3색이 유일한 채도다.

### Primary
- **노스팜 잉크** (`ink`): 본문 글자, 주 버튼 배경, 눌린 칩·탭 알약 배경, 확정 스탬프의 채움, 토스트 배경, 포커스 윤곽선. 이 앱의 「결정된 것」은 모두 잉크색이다. 주 버튼 hover는 `ink-hover`로 한 단계 밝아진다.

### Secondary
- **피쳐 호박색** (`r3`, 글자용 `r3-ink`, 바탕용 `r3-tint`): 3회 보상(생맥주 피쳐). 사다리 3칸 막대, 3번째 스탬프 고리, 3회 보상 칸과 지급 버튼.
- **샐러드 초록** (`r6`, `r6-ink`, `r6-tint`): 6회 보상(오늘의 샐러드). 같은 자리의 6회 판.
- **닭날개 주홍** (`r9`, `r9-ink`, `r9-tint`): 9회 보상(닭날개&감자튀김). 같은 자리의 9회 판. `r9-ink`는 탭바 알림 배지와 「오늘」 예상일 강조에도 쓴다.

각 보상색은 세 단계로 쓴다. 기본색은 막대·고리 같은 면과 선, `-ink`는 글자와 흰 글자를 올리는 버튼 배경(흰 글자 대비 확보), `-tint`는 보상 칸 바탕과 사다리 다음 칸의 빗금이다. 구성요소는 `data-r="3|6|9"`에서 `--rc`, `--rc-ink`, `--rc-tint`를 받아 같은 규칙으로 칠한다.

### Tertiary
- **사이트 파랑** (`site-blue`), **상위 남색** (`tier-indigo`): 매출 탭 차트 전용. 사이트 구분은 클럽하우스 `r6` 초록 · 스타트하우스 `r3` 호박 · 그늘집 `site-blue`, 순위 구간은 상위 `tier-indigo` · 중위 `rest` · 하위 `r9` 주홍. v3에서 그대로 이식했다.

### Neutral
- **회청 바탕** (`page`): 페이지 바탕, 반투명 상단바(92% 불투명)의 기준색, `theme-color`.
- **카드 흰색** (`panel`): 카드, 입력, 기본 버튼, 칩, 넓은 화면 탭 알약.
- **보조 잉크** (`muted`): 보조 글자, 힌트, 비활성 탭, 표 머리글. `page`와 `panel` 위 모두 본문 대비 기준을 넘는다.
- **카드 테두리** (`line`): 카드·구분선의 1px 머리카락선. 스크롤 후 상단바 아래선.
- **입력 테두리** (`line-2`): 버튼·입력·칩의 1px 외곽선. `line`보다 한 단계 진하다.
- **격자 회색** (`grid`): 차트 격자, quiet 버튼 hover, 선택된 사다리 칸 바탕, 필터 칩 바탕, 표 행 hover.
- **축 회색** (`axis`): 차트 축, 빈 스탬프 고리, 버튼 hover 테두리, 스크롤바, 파일 끌어 놓기 점선.
- **쉼 회색** (`rest`): 보상이 아닌 사다리 막대, 오프라인 동기화 점, 중위 구간.
- **줄무늬 흰색** (`zebra`): 방문 목록 홀수 행, 보상 상태 행, 파일 끌어 놓기 바탕.

### 상태색
- `ok` 초록: 동기화됨 점, 대조 일치 표시. 일치 판정 칸은 바탕 `#E7F4EC` · 글자 `#145C38`.
- `warn` 갈색 주황: 동기화 대기 점, 탈회 태그(바탕 `#FFF4E0`), 매출 표의 주의 칩.
- `bad` 빨강: 오류, 불일치, 로그인 오류. 불일치 판정 칸은 바탕 `#FBE8E5` · 글자 `#8E2B1E`.

### Named Rules
**보상만 색을 갖는다 규칙.** 프로모션 화면에서 채도는 보상 3색과 상태색에만 허락된다. 단체·사다리 칸·버튼이 보상과 무관하면 무채색 잉크로 그린다. 색이 보이는 곳이 곧 지급할 곳이다.

**세 단계 보상색 규칙.** 보상색 기본값 위에 흰 글자를 올리지 않는다. 흰 글자 버튼은 `-ink`, 연한 바탕은 `-tint`, 막대·고리·테두리만 기본색이다.

**탭마다 색의 뜻 규칙.** 초록과 호박색은 프로모션 탭에서는 보상(6회·3회), 매출 탭에서는 사이트(클럽하우스·스타트하우스)를 뜻한다. 두 뜻을 한 화면에 섞지 않는다. 한 화면에 보상과 사이트가 함께 나와야 하면 범례로 뜻을 반드시 밝힌다.

## Typography

**본문 글꼴:** Noto Sans KR (Apple SD Gothic Neo, Malgun Gothic, system-ui 순 대체)

**성격:** 한 가지 글꼴로 굵기와 크기만 바꾼다. 숫자는 페이지 전체에 고정폭 숫자(`font-variant-numeric: tabular-nums`)가 걸려 있어 금액·횟수·날짜가 세로로 정렬된다. 제목은 살짝 좁힌 자간(-0.01em, 로그인 제목만 -0.02em)으로 단단하게 묶는다.

### Hierarchy
- **Headline** (700, 22px, 1.2): 매출 탭 제목, KPI 값, 단체 상세 이름. 로그인 제목만 24px.
- **Title** (700, 17px): 상단바 화면 제목. 한 줄, 넘치면 말줄임.
- **Section** (700, 15px): 구역 제목, 사다리 제목, 단체 카드 이름, 자료 카드 제목, 보상 칸 제목.
- **Body** (400, 15px, 1.5): 기본 본문과 버튼(버튼은 500). 입력은 아이폰 확대를 막기 위해 16px.
- **Body-sm** (500, 13px): 칩, 힌트성 본문, 알림 줄, 표, 토스트, 넓은 화면 탭 알약.
- **Label** (400, 12px): 부제, 범례, 캡션, 사다리 설명, 표 머리글, 매출 탭 캡션(`--cds-font-size-caption`).
- **Micro** (500, 11px): 하단 탭 글자, 사다리 칸 번호 아래 이름, 태그, 차트 눈금 글자.

### Named Rules
**고정폭 숫자 규칙.** 숫자가 들어가는 모든 자리는 고정폭 숫자다. 금액은 원 단위 천 단위 쉼표, 비교되는 숫자는 오른쪽 정렬.

**굵기로 강조 규칙.** 강조는 색보다 굵기(700)로 한다. 색을 쓰는 강조는 보상(`-ink`)과 오류(`bad`)뿐이다.

## Layout

휴대폰 390px 기준으로 설계하고 넓은 화면에서 넓힌다. 본문은 `min(100%, 1180px)` 폭 가운데 정렬, 좌우 여백은 `gutter`(16px), 900px 이상에서 `gutter-wide`(28px).

- **셸:** 상단 고정 바(최소 56px, 안전 영역 포함)와 하단 고정 탭바(62px). 본문 아래 여백은 탭바 높이 + 안전 영역 + 24px.
- **세로 리듬:** 탭 안 구역 간격 16px, 카드 목록 간격 8px, 카드 안 요소 간격 6–14px. 카드 안쪽 여백은 가로 14px(`card-x`), 세로 12–14px.
- **프로모션 탭 순서:** 사다리 카드 → 보기 칩 줄(가로 스크롤) + 검색 → 지급 대기 → 다음 후식이면 지급 → 칸별 목록. 900px 이상에서 목록은 두 열(`minmax(0, 1fr)` 두 개, 간격 16px)로 나뉜다.
- **사다리:** 10칸 균등 격자(`repeat(10, minmax(0, 1fr))`, 간격 4px), 칸 높이 최소 112px, 막대는 아래에서 위로 자란다.
- **매출 탭:** v3의 `--cds-*` 간격 단계(4/8/12/16)를 그대로 쓴다. 두 열 카드 격자는 `minmax(min(100%, 27rem), 1fr)` 자동 맞춤. 컨테이너 폭 460px 이하에서 표·구간 배치를 한 열로 접는다. 640px 이하에서 표는 가로로만 스크롤하고 세로는 페이지와 함께 흐른다.
- **터치:** 버튼·입력 최소 44px, 칩·작은 버튼·탭 알약 36px, 하단 탭 54px.

## Elevation & Depth

거의 평평하다. 카드는 옅은 그림자 한 겹(`--shadow`)과 1px 테두리로 바탕에서 떠 있고, 그 이상의 깊이는 상태가 있을 때만 생긴다. 토스트와 반짝임 순간만 `--shadow-lift`로 들린다. 상단바와 하단 탭바는 그림자 대신 반투명 바탕과 흐림(backdrop blur 12px)으로 겹침을 표현하고, 상단바는 스크롤된 뒤에만 아래 테두리가 나타난다.

### Shadow Vocabulary
- **카드 휴식** (`box-shadow: 0 1px 2px rgba(29, 39, 49, 0.05), 0 4px 12px rgba(29, 39, 49, 0.04)`): 모든 앱 카드와 단체 카드.
- **들림** (`box-shadow: 0 2px 4px rgba(29, 39, 49, 0.06), 0 12px 28px rgba(29, 39, 49, 0.10)`): 토스트, 단체 카드 반짝임의 시작.
- **팝오버** (`box-shadow: 0 8px 24px rgba(29, 39, 49, 0.12)`): 매출 탭 차트 툴팁.
- **보상 고리** (`box-shadow: 0 0 0 1px var(--rc), var(--shadow)`): 지급 대기 카드. 그림자가 아니라 보상색 2px 테두리 효과.

### Named Rules
**휴식은 평평하게 규칙.** 그림자는 카드 휴식 한 겹이 기본이다. 더 깊은 그림자는 떠 있는 일시 요소(토스트, 툴팁)와 방금 바뀐 카드의 반짝임에만 쓴다.

## Shapes

부드럽지만 둥글둥글하지 않다. 카드와 토스트는 12px(`md`), 버튼과 입력은 8px(`sm`), 카드 안의 안쪽 상자(보상 칸, 판정 칸, 탭 버튼)는 10px(`inset`), 칩·태그·연도 선택·동기화·넓은 화면 탭은 완전한 알약(`pill`). 사다리 막대는 위가 4px, 아래가 2px로 둥근 기둥, 매출 막대는 4px.

원은 스탬프와 상태 점에만 쓴다. 스탬프는 3개씩 묶여 묶음 사이 8px, 묶음 안 4px로 벌어져 3·3·3이 읽힌다.

선의 종류가 뜻을 갖는다. 실선은 확정, **점선은 임시 또는 아직 비어 있음**이다. 현장 체크 스탬프(2px 점선), 파일 끌어 놓기 영역(1.5px 점선 `axis`), 빈 목록 안내(1px 점선 `line-2`)가 같은 문법을 공유한다. 사다리의 「다음 후식이면 지급」 칸은 135° 빗금(보상 `-tint`와 흰색 4px/3px 반복) 위에 보상색 1.5px 안쪽 고리다.

## Components

### Buttons
차분하고 단단하다. 누르면 살짝 눌린다.
- **모양:** 8px 둥근 모서리, 최소 높이 44px, 가로 16px 여백, 1px `line-2` 테두리, 500 굵기.
- **주 버튼:** `ink` 바탕, 흰 글자. hover는 `ink-hover`. 한 묶음 안에 주 버튼은 하나(예: 「후식 진행」 옆의 「방문만」은 기본 버튼).
- **기본 버튼:** 흰 바탕, `ink` 글자. hover는 테두리만 `axis`로 진해진다.
- **조용한 버튼:** 테두리·바탕 없음, `muted` 글자, hover에 `grid` 바탕. 로그아웃, 지급 취소처럼 되돌리는 동작.
- **보상 버튼:** 「지급 완료」는 해당 회차의 `-ink` 바탕에 흰 글자. 지급 버튼만 보상색을 쓴다.
- **작은 버튼:** 높이 36px, 가로 12px, 13px 글자.
- **상태:** 누를 때 `scale(0.97)`(120ms), 비활성은 투명도 0.45, 처리 중은 0.7에 포인터 차단. 포커스는 2px `ink` 윤곽선, 2px 띄움.

### Chips
- **모양:** 알약, 높이 36px, 가로 14px, 1px `line-2` 테두리, 흰 바탕, 13px 500.
- **눌림:** `ink` 바탕, 흰 글자. 이 앱 전체의 「선택됨」 표현이다.
- **필터 표시:** `grid` 바탕·테두리로 적용 중인 필터를 표시하고, 12px 닫기 표시를 단다.
- **매출 탭 칩:** v3의 `yd-btn`. 같은 알약 문법, 높이 32px, 12px 글자, 눌림 역시 `ink` 바탕 흰 글자.
- **태그:** 카드 이름 옆 높이 20px 알약, 11px. 기본 `grid`/`muted`, 탈회는 `#FFF4E0`/`warn`, 「임시 포함」은 흰 바탕에 1px `ink` 안쪽 고리(점선 문법의 글자판).

### Cards / Containers
- **모서리:** 12px.
- **바탕:** `panel`, 1px `line` 테두리, 카드 휴식 그림자.
- **안쪽 여백:** 프로모션 카드 12px 14px, 자료 카드 16px, 매출 카드 16px.
- **빈 상태:** 1px 점선 `line-2`, 반투명 흰 바탕, `muted` 13px 가운데 정렬.

### 단체 카드 (세 가지 변형)
머리 줄에 단체명(15px 700, 말줄임)과 태그, 오른쪽에 예상일(굵은 날짜 + 보조 글자, 오늘이면 날짜가 `r9-ink`), 아래 줄에 스탬프 줄과 「다음 후식 = N회째 · 품목」. 카드 전체가 펼침 버튼이고 펼치면 1px `line` 위 상세(스탬프 카드 큰 판, 보상 상태 3행, 방문 목록, 기록 입력)가 열린다.
- **다음(next):** 테두리가 다음 보상색 45%와 `line`을 섞은 색. 아래에 「후식 진행」(주 버튼) · 「방문만」 두 버튼(1.4fr : 1fr). 오늘 이미 기록했으면 기록 문구와 「기록 지우기」 작은 버튼.
- **지급 대기(pending):** 보상색 2px 고리. 안쪽에 `-tint` 바탕 보상 칸(10px 모서리)이 붙고, 「N회 달성 · 품목」, 달성일, 메모 입력과 보상 버튼이 들어간다.
- **목록 행(row):** 기본 카드 그대로, 동작 버튼 없음. 사다리 칸별 목록에 쓴다.
- **반짝임:** 기록 직후 카드가 보상색 35% 6px 고리 + 들림 그림자에서 휴식 상태로 900ms 동안 가라앉는다.

### 0–9 사다리 (시그니처)
10칸 막대 차트이자 필터. 각 칸은 위에 단체 수(12px, 0이면 `axis` 가운뎃점), 가운데 막대, 아래 회차 이름(11px, 위 1px `line`).
- 보상 칸(3·6·9): 막대 보상색, 이름은 `-ink` 700에 위선도 보상색.
- 다음 칸(2·5·8): 보상 `-tint`/흰색 빗금 + 보상색 1.5px 안쪽 고리, 숫자는 `-ink`.
- 그 밖: 막대 `rest`.
- 칸을 누르면 그 칸만 보고, 눌린 칸은 `grid` 바탕에 이름이 `ink` 700.
- 막대 높이 변화는 420ms `--ease`.
- 아래 범례: 10px 사각 견본 3개 + 빗금 견본 「다음 후식이면 지급」.

### 3·3·3 스탬프 줄 (시그니처)
9개 원, 3개씩 묶음. 기본 14px, 상세의 큰 판은 22px(묶음 사이 12px, 안 6px).
- **비어 있음:** 1.5px `axis` 안쪽 고리.
- **보상 칸(3·6·9번째):** 2px 보상색 안쪽 고리.
- **확정:** `ink`로 채움. 보상 칸은 보상색으로 채움.
- **현장 체크(임시):** 흰 바탕에 2px 점선 `ink` 테두리. 보상 칸이면 점선이 보상색.
- **다음 목표:** 보상색 고리가 5px까지 퍼졌다 사라지는 맥박(1.6s 반복).
- **방금 찍힘:** 1.9배에서 내려와 0.9배로 눌렸다 제자리(520ms). 로그인 화면 표식도 같은 스탬프 세 개다.

### Inputs / Fields
- **모양:** 흰 바탕, 1px `line-2`, 8px 모서리, 높이 44px, 16px 글자. 라벨은 위쪽 13px `muted`.
- **포커스:** 2px `ink` 윤곽선(띄움 0)과 테두리 `ink`.
- **검색:** 왼쪽 12px에 18px 돋보기 선 아이콘(`muted`), 글자는 38px부터.
- **파일 끌어 놓기:** 최소 96px, 1.5px 점선 `axis`, `zebra` 바탕. 끌어 올리면 테두리 `ink`, 바탕 `grid`.

### Navigation
- **상단바:** `page` 92% 반투명 + 흐림. 왼쪽에 제목(17px 700)과 부제(12px `muted`), 오른쪽에 연도 선택 알약(13px)과 동기화 알약(8px 상태 점: 정상 `ok`, 대기 `warn`, 오프라인 `rest` 이중 고리, 오류 `bad`, 동기화 중 깜박임).
- **휴대폰(900px 미만):** 하단 고정 3칸 탭바, 흰색 96% 반투명 + 흐림, 위 1px `line`. 각 탭은 24px 선 아이콘(선 굵기 1.8) 위, 11px 글자 아래. 현재 탭은 `ink` 700, 아이콘 선 굵기 2.2. 비활성은 `muted`.
- **넓은 화면(900px 이상):** 탭바가 우측 상단의 알약 묶음이 된다. 각 탭은 높이 36px 흰 알약(1px `line-2`), 18px 아이콘과 13px 글자가 가로로. 현재 탭은 `ink` 바탕 흰 글자. 상단바는 오른쪽 360px를 비워 둔다.
- **배지:** 16px 높이 알약, `r9-ink` 바탕 흰 10px 700 글자, 아이콘 오른쪽 위.

### Toast (되돌리기 포함)
- `ink` 바탕, 흰 13px 글자, 12px 모서리, 들림 그림자, 최대 폭 `min(520px, calc(100% - 32px))`.
- 화면 **위쪽**(상단바 바로 아래 8px, 넓은 화면은 64px)에 뜬다. 아래쪽의 지급·후식 진행 버튼을 가리지 않기 위해서다.
- 오른쪽에 「되돌리기」 버튼: 흰색 14% 바탕, 8px 모서리, 36px 높이, 700. 되돌리기가 있으면 6초, 없으면 3.2초 유지.
- 등장은 위에서 12px 내려오며 나타남(260ms `--ease`).

### 매출 탭 구성요소
v3 그대로 이식. KPI 카드(12px 캡션 라벨 + 22px 700 값 + 4px 진행 막대), 100% 누적 사이트 막대(20px, 구간 비교는 26px, 칸 사이 2px), 순위 레이스 목록(행 26px, 선택 행은 `grid` 바탕에 왼쪽 2px `ink` 안쪽 선), 정렬 표(머리글 고정, 행 hover `grid`), 툴팁(팝오버 그림자).

## Do's and Don'ts

### Do:
- **Do** 보상과 관련된 모든 요소는 `data-r="3|6|9"`로 `--rc` 세 단계를 받아 칠한다. 새 보상 화면도 같은 경로를 쓴다.
- **Do** 확정은 실선·채움, 현장 체크 임시는 점선, 추정 방문일은 「예상」 글자로 구분한다.
- **Do** 선택·눌림·현재 상태는 `ink` 바탕 흰 글자 알약으로 표현한다(칩, 매출 필터, 넓은 화면 탭).
- **Do** 흰 글자를 보상색 위에 올릴 때는 `-ink` 단계를 쓴다.
- **Do** 모든 탭 대상은 최소 44px(보조 칩·작은 버튼 36px), 입력 글자는 16px.
- **Do** 숫자는 고정폭 숫자, 천 단위 쉼표, 원 단위로 쓴다.
- **Do** 상태 변경 뒤에는 위쪽 토스트로 알리고, 되돌릴 수 있는 기록에는 「되돌리기」를 붙인다.
- **Do** 움직임은 `cubic-bezier(0.16, 1, 0.3, 1)` 하나로, 줄임 모션 설정에서는 사실상 0으로 줄인다.

### Don't:
- **Don't** 보상과 무관한 요소에 보상 3색이나 다른 채도 있는 색을 쓰지 않는다.
- **Don't** 현장 체크(임시)를 확정과 같은 채움 스탬프로 그리지 않는다.
- **Don't** 보상 기본색(`r3`·`r6`·`r9`) 위에 흰 글자를 올리지 않는다.
- **Don't** 토스트를 화면 아래에 띄우지 않는다. 지급·후식 진행 버튼을 가린다.
- **Don't** 카드 휴식 상태에 `--shadow-lift`보다 깊은 그림자를 쓰지 않는다.
- **Don't** 매출 탭의 사이트 색 뜻(초록 = 클럽하우스, 호박 = 스타트하우스)을 범례 없이 프로모션 화면에 섞지 않는다.
