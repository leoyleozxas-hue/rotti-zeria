// .tools/admin-capture.mjs — login real + capturas del panel.
// Uso: node .tools/admin-capture.mjs <baseUrl> <outDir> <email> <password>
// Las credenciales NO se escriben en el archivo: entran por argv.
import fs from 'node:fs';
import path from 'node:path';

const [, , baseUrl, outDir, EMAIL, PASSWORD] = process.argv;
if (!EMAIL || !PASSWORD) {
  console.error('faltan credenciales');
  process.exit(1);
}

const CDP_PORT = process.env.CDP_PORT || 9225;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      // el navegador todavía no levantó el puerto
    }
    await sleep(400);
  }
  throw new Error(`No hay target CDP en el puerto ${CDP_PORT}`);
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method && this.handlers.has(msg.method)) {
        this.handlers.get(msg.method)(msg.params);
      }
    };
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = () => reject(new Error('WebSocket rechazado'));
    });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method, timeout = 45000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.handlers.delete(method);
        reject(new Error(`timeout esperando ${method}`));
      }, timeout);
      this.handlers.set(method, (params) => {
        clearTimeout(timer);
        this.handlers.delete(method);
        resolve(params);
      });
    });
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'eval falló');
    return r.result.value;
  }
  // Sin esperar Page.loadEventFired: la primera compilación de una ruta puede
  // tardar minutos y el evento llega tarde o nunca. Se hace polling de readyState.
  async goto(url, vw = 1440, vh = 1000) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: vw, height: vh, deviceScaleFactor: 1, mobile: vw < 500,
    });
    const t0 = Date.now();
    this.send('Page.navigate', { url }).catch(() => null);
    for (let i = 0; i < 900; i++) {
      await sleep(2000);
      try {
        const st = await this.eval('document.readyState');
        const here = await this.eval('location.pathname');
        const want = new URL(url).pathname;
        if (st === 'complete' && here === want) {
          console.log(`   ${url} listo en ${Math.round((Date.now() - t0) / 1000)}s (${here})`);
          break;
        }
      } catch {
        // navegación en curso: el contexto todavía no existe
      }
    }
    await sleep(2600);
  }
  async shot(name, vw = 1440, vh = 1000, full = false) {
    let height = vh;
    if (full) {
      const m = await this.send('Page.getLayoutMetrics');
      height = Math.min(Math.ceil(m.cssContentSize.height), 12000);
      await this.send('Emulation.setDeviceMetricsOverride', {
        width: vw, height, deviceScaleFactor: 1, mobile: vw < 500,
      });
      await sleep(600);
    }
    const s = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full });
    const file = path.join(outDir, `${name}.png`);
    fs.writeFileSync(file, Buffer.from(s.data, 'base64'));
    console.log(`OK  ${name}  ${vw}x${height}  ${fs.statSync(file).size} bytes`);
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const target = await findTarget();
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  console.log('-- login --');
  await cdp.goto(`${baseUrl}/admin/login`, 1440, 1000);

  const filled = await cdp.eval(`(() => {
    const set = (sel, val) => {
      const el = document.querySelector(sel);
      if (!el) return 'falta ' + sel;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok';
    };
    const a = set('#email', ${JSON.stringify(EMAIL)});
    const b = set('#password', ${JSON.stringify(PASSWORD)});
    const btn = document.querySelector('form button[type="submit"]');
    if (btn) btn.click();
    return a + ' | ' + b + ' | boton=' + !!btn;
  })()`);
  console.log('campos:', filled);

  let pathname = '/admin/login';
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    pathname = await cdp.eval('location.pathname');
    if (pathname !== '/admin/login') break;
  }
  console.log('pathname tras login:', pathname);

  if (pathname === '/admin/login') {
    const txt = await cdp.eval('document.body.innerText.slice(0, 600)');
    console.log('SIGUE EN LOGIN. Texto visible:\n' + txt);
    await cdp.shot('login-error');
    process.exit(2);
  }

  console.log('-- capturando panel --');
  await cdp.goto(`${baseUrl}/admin`, 1440, 1100);
  await cdp.shot('dashboard', 1440, 1100, true);

  await cdp.goto(`${baseUrl}/admin/pedidos`, 1440, 1100);
  await cdp.shot('pedidos', 1440, 1100, true);
  const orderHref = await cdp.eval(`(() => {
    const a = document.querySelector('a[href^="/admin/pedidos/"]');
    return a ? a.getAttribute('href') : null;
  })()`);
  console.log('primer pedido:', orderHref);

  await cdp.goto(`${baseUrl}/admin/productos`, 1440, 1100);
  await cdp.shot('productos', 1440, 1100, true);

  await cdp.goto(`${baseUrl}/admin/productos/nuevo`, 1440, 1100);
  await cdp.shot('producto-nuevo', 1440, 1100, true);

  if (orderHref) {
    await cdp.goto(`${baseUrl}${orderHref}`, 1440, 1400);
    await cdp.shot('pedido-detalle', 1440, 1400, true);
  }

  await cdp.goto(`${baseUrl}/admin`, 390, 844);
  await cdp.shot('dashboard-mobile', 390, 844);

  await cdp.goto(`${baseUrl}/admin/pedidos`, 390, 844);
  await cdp.shot('pedidos-mobile', 390, 844);

  try { cdp.ws.close(); } catch { /* ya cerrado */ }
  process.exit(0);
}

main().catch((e) => {
  console.error('FALLO:', e.message);
  process.exit(1);
});
