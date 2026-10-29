import fs from 'node:fs';
import path from 'node:path';

const roots = ['app', 'components'];
const exts = new Set(['.js', '.jsx']);
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (exts.has(path.extname(e.name))) files.push(p);
  }
}
for (const r of roots) if (fs.existsSync(r)) walk(r);

const hex = new Map();
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/#([0-9A-Fa-f]{3,8})\b/g)) {
    const key = m[0].toUpperCase();
    if (!hex.has(key)) hex.set(key, { count: 0, files: new Set() });
    const e = hex.get(key);
    e.count++;
    e.files.add(path.basename(f));
  }
}

// Agrupar por cercanía para ver cuántos "marrones distintos" hay de verdad.
const rows = [...hex.entries()].sort((a, b) => b[1].count - a[1].count);
console.log('distintos:', rows.length, '| total usos:', rows.reduce((a, r) => a + r[1].count, 0));
for (const [h, e] of rows) {
  console.log(`${h.padEnd(9)} ${String(e.count).padStart(3)}  ${[...e.files].join(', ')}`);
}
