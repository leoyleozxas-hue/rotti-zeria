// .tools/capture.mjs
//
// Captura páginas usando Chrome headless por el protocolo DevTools (CDP).
// No usa Playwright ni Puppeteer: habla WebSocket con el navegador ya abierto,
// así que no hay descargas ni procesos hijos.
//
// Uso:
//   node .tools/capture.mjs <baseUrl> <outDir> <spec> [<spec> ...]
//   spec = nombre:ruta:ancho:alto[:full]
//
// Ejemplo:
//   node .tools/capture.mjs http://127.0.0.1:3000 .capturas \
//     login:/admin/login:1440:900 pedidos:/admin/pedidos:1440:1200
import fs from 'node:fs'
import path from 'node:path'

const [, , baseUrl, outDir, ...specs] = process.argv
const CDP_PORT = process.env.CDP_PORT || 9222
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function findTarget() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) return page
    } catch {
      // el navegador todavía no levantó el puerto
    }
    await sleep(400)
  }
  throw new Error(`No hay target CDP en el puerto ${CDP_PORT}`)
}

class CDP {
  constructor(ws) {
    this.ws = ws
    this.nextId = 0
    this.pending = new Map()
    this.handlers = new Map()
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      } else if (msg.method && this.handlers.has(msg.method)) {
        this.handlers.get(msg.method)(msg.params)
      }
    }
  }

  static async connect(url) {
    const ws = new WebSocket(url)
    await new Promise((resolve, reject) => {
      ws.onopen = resolve
      ws.onerror = () => reject(new Error('WebSocket rechazado'))
    })
    return new CDP(ws)
  }

  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  once(method, timeout = 45000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.handlers.delete(method)
        reject(new Error(`timeout esperando ${method}`))
      }, timeout)
      this.handlers.set(method, (params) => {
        clearTimeout(timer)
        this.handlers.delete(method)
        resolve(params)
      })
    })
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const target = await findTarget()
  const cdp = await CDP.connect(target.webSocketDebuggerUrl)

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')

  const results = []

  for (const spec of specs) {
    const [label, routePath, w, h, extra] = spec.split(':')
    const vw = Number(w) || 1440
    const vh = Number(h) || 900
    const url = new URL(routePath, baseUrl).toString()

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vw,
      height: vh,
      deviceScaleFactor: 1,
      mobile: vw < 500,
    })

    // El catch va pegado: si el load tarda más que el timeout, la promesa ya
    // está manejada y no rompe el proceso.
    const loaded = cdp.once('Page.loadEventFired', 90000).catch(() => null)
    await cdp.send('Page.navigate', { url })
    await loaded

    // Red, fuentes y animaciones de entrada (anim-rise ~0.5s + stagger)
    await sleep(2200)

    let clipHeight = vh
    if (extra === 'full') {
      const metrics = await cdp.send('Page.getLayoutMetrics')
      clipHeight = Math.min(Math.ceil(metrics.cssContentSize.height), 12000)
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vw,
        height: clipHeight,
        deviceScaleFactor: 1,
        mobile: vw < 500,
      })
      await sleep(600)
    }

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      // Sin `full` sólo se captura el viewport: así no aparecen vacías las
      // imágenes que todavía no entraron en pantalla (lazy loading).
      captureBeyondViewport: extra === 'full',
    })

    const file = path.join(outDir, `${label}.png`)
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'))
    const size = fs.statSync(file).size
    results.push(`${label}  ${vw}x${clipHeight}  ${size} bytes`)
    console.log(`OK  ${label}  ${vw}x${clipHeight}  ${size} bytes  <- ${url}`)
  }

  // Datos de diagnóstico que no se ven en la imagen
  const diag = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map(n => n.textContent.trim()),
      bodyBg: getComputedStyle(document.body).backgroundColor
    })`,
    returnByValue: true,
  })
  fs.writeFileSync(path.join(outDir, '_diag.json'), diag.result.value)
  console.log('DIAG', diag.result.value)
  console.log('\n' + results.join('\n'))

  // Corta el WebSocket y sale: si queda vivo, la consola no vuelve nunca.
  try {
    cdp.ws.close()
  } catch {
    // ya estaba cerrado
  }
  process.exit(0)
}

main().catch((err) => {
  console.error('FALLO:', err.message)
  process.exit(1)
})
