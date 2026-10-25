/* ============================================================
   ui.js — 화면 공통 도구
   모든 글자는 textContent 로만 넣는다 (단체명·메모에 섞인 HTML이 실행되지 않도록).
   ============================================================ */

const WD = ['일', '월', '화', '수', '목', '금', '토'];

/** 요소 만들기: el('div', { class: 'x', onclick }, [자식…]) — 문자열 자식은 텍스트로 들어간다 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => { if (dv != null) node.dataset[dk] = dv; });
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null || c === false) return;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  });
  return node;
}

/** 한국 시간 기준 오늘 'YYYY-MM-DD' */
export function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const wdOf = (iso) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).getUTCDay();

/** '2026-11-18' → '11/18(수)' */
export const fmtDate = (iso) => (iso ? `${+iso.slice(5, 7)}/${+iso.slice(8, 10)}(${WD[wdOf(iso)]})` : '');

/** 오늘과의 차이를 말로: 오늘 · 내일 · 3일 후 · 2일 지남 */
export function relDay(iso, today) {
  const diff = Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10))) / 86400000);
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff > 1) return `${diff}일 후`;
  return `${-diff}일 지남`;
}

export const won = (n) => (Number(n) || 0).toLocaleString('ko-KR');

/* ───────── 토스트 (되돌리기 버튼 포함) ───────── */
let toastTimer = 0;
export function toast(message, action) {
  const box = document.getElementById('toast');
  clearTimeout(toastTimer);
  const kids = [el('span', { text: message })];
  if (action) {
    kids.push(el('button', {
      type: 'button', text: action.label,
      onclick: () => { box.hidden = true; action.run(); },
    }));
  }
  box.replaceChildren(...kids);
  box.hidden = false;
  toastTimer = setTimeout(() => { box.hidden = true; }, action ? 6000 : 3200);
}

/** 버튼을 잠깐 잠가 두 번 눌림을 막는다 */
export function guard(btn, fn) {
  if (btn.classList.contains('is-busy')) return;
  btn.classList.add('is-busy');
  Promise.resolve().then(fn).finally(() => setTimeout(() => btn.classList.remove('is-busy'), 350));
}
