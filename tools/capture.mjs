/* 화면 점검용 전체 페이지 캡처 (개발 도구 — 배포 안 됨)
   헤드리스 크롬은 창 최소 폭이 500px라 휴대폰 폭은 DevTools 기기 흉내로 찍는다.
   사용: node tools/capture.mjs <url> <out.png> <width> [height] [clickSelector]
   크롬은 --remote-debugging-port=9333 으로 미리 띄워 둔다. */
const [url, out, width = '390', height = '844', click] = process.argv.slice(2);
const { writeFileSync } = await import('node:fs');

const targets = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { id += 1; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const w = Number(width);
await send('Emulation.setDeviceMetricsOverride', { width: w, height: Number(height), deviceScaleFactor: 1, mobile: w < 768 });
await send('Page.navigate', { url });
await sleep(3500);
if (click) {
  await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(click)})?.click()` });
  await sleep(1500);
}
await send('Runtime.evaluate', { expression: 'document.getAnimations().forEach(a => a.finish()); window.scrollTo(0,0)' });
await sleep(300);
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
ws.close();
console.log('saved', out);
