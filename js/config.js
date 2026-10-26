/* ============================================================
   설정값 — 여기만 바꾸면 됩니다
   ============================================================ */

export const CONFIG = {
  /* Supabase 프로젝트 (매출등록·매출진척 대시보드와 같은 DB) — 공개(publishable) 키만 둔다 */
  SUPABASE_URL: 'https://ulvdlmokrvgxrabfvrza.supabase.co',
  SUPABASE_KEY: 'sb_publishable_TVaRRSK2QdlhYgiYlImtJw_4egVt0p9',

  /* 로그인 화면에 미리 채워 둘 계정 (DB 정책도 이 계정만 허용) */
  OWNER_EMAIL: 'yorungyiyh@gmail.com',

  /* 앱 도입일 — 이 날짜 전에 달성한 3·6·9는 「앱 도입 전 지급」으로 일괄 처리 대상 */
  APP_START: '2026-10-25',

  /* 연도별 규칙이 아직 없을 때 쓰는 기본값 (자료 탭에서 연도별로 수정) */
  DEFAULT_THRESHOLD: 10000,
  DEFAULT_ITEMS: { 3: '생맥주 피쳐', 6: '오늘의 샐러드', 9: '닭날개&감자튀김' },

  /* 오프라인 동안 쌓인 지급 체크를 다시 보내는 주기(ms) */
  SYNC_INTERVAL: 30000,
};
