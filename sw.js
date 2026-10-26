/* ============================================================
   sw.js — 앱 설치(PWA)용 서비스워커
   화면 뼈대(HTML·CSS·JS·아이콘)와 외부 라이브러리·글꼴을 휴대폰에 둔다 → 전파가 없어도 앱이 열린다.
   Supabase 요청은 절대 가로채지 않는다(로그인 토큰이 오가고, 데이터 사본은 store.js가 따로 관리).
   ============================================================ */

const CACHE = 'npcc-grp-v4';

const SHELL = [
  './',
  './manifest.webmanifest',
  './css/app.css?v=4',
  './js/app.js?v=4',
  './js/config.js',
  './js/store.js',
  './js/ui.js',
  './js/promo-core.js',
  './js/promo-view.js',
  './js/sales-view.js',
  './js/data-view.js',
  './icons/icon-192.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

// 외부 라이브러리는 index.html 과 같은 무결성 해시로 받아 둔다
const CDN = [
  ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js', 'sha384-0w2KAL2YHP6wKOkUDzkCDGgVvfmHnj02DHeQ6XcHOgTfFsGyonKOpShMH1x6nk9o'],
  ['https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css', 'sha384-2nNKoOPayicGa+aRguOQuiZP+RqQ4G3jalfDeOgftkKD7zBM2gJXTwcFqCZltdv0'],
];

// 버전이 주소에 박힌 외부 파일 — 한 번 받으면 바뀌지 않는다
const IMMUTABLE_HOSTS = new Set(['cdn.jsdelivr.net', 'cdn.sheetjs.com', 'fonts.gstatic.com']);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all([
    c.addAll(SHELL),
    ...CDN.map(([u, integrity]) => fetch(u, { mode: 'cors', integrity }).then((r) => { if (r.ok) return c.put(u, r); return undefined; })),
  ])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
  else if (IMMUTABLE_HOSTS.has(url.hostname)) e.respondWith(cacheFirst(req));
  else if (url.hostname === 'fonts.googleapis.com') e.respondWith(networkFirst(req));
  // 그 외(Supabase 등)는 브라우저 기본 동작 그대로
});

/* 내 파일: 온라인이면 항상 최신본, 오프라인일 때만 사본 */
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok && !res.redirected) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const shell = await cache.match('./');
      if (shell) return shell;
    }
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone()); // 불투명(opaque) 응답은 내용을 검증할 수 없어 저장하지 않는다
  return res;
}
