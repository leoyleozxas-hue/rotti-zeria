import fs from 'node:fs';
import path from 'node:path';

const roots = ['app', 'components', 'lib'];
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
const files = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (exts.has(path.extname(e.name))) files.push(p);
  }
}
for (const r of roots) if (fs.existsSync(r)) walk(r);

let hex = 0, xl = 0, xxl = 0, lg = 0, full = 0;
const hexFiles = new Map();
const motionFiles = [];
const uiImporters = { admin: 0, store: 0 };
const motionPkg = fs.existsSync('node_modules/motion');

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const h = (t.match(/#[0-9A-Fa-f]{3,8}\b/g) || []).length;
  hex += h;
  if (h) hexFiles.set(f, h);
  xl += (t.match(/rounded-xl\b/g) || []).length;
  xxl += (t.match(/rounded-2xl\b/g) || []).length;
  lg += (t.match(/rounded-lg\b/g) || []).length;
  full += (t.match(/rounded-full\b/g) || []).length;
  if (/from ['"]motion/.test(t)) motionFiles.push(f);
  if (/@\/components\/ui\//.test(t)) {
    if (f.split(path.sep).includes('admin')) uiImporters.admin++;
    else uiImporters.store++;
  }
}

console.log(`archivos JS/JSX: ${files.length}`);
console.log(`hex literales: ${hex} (en ${hexFiles.size} archivos)`);
console.log(`radios  -> lg:${lg}  xl:${xl}  2xl:${xxl}  full:${full}  total:${lg + xl + xxl + full}`);
console.log(`dependencia motion instalada: ${motionPkg}; archivos que la importan: ${motionFiles.length} ${motionFiles.join(', ')}`);
console.log(`archivos que usan components/ui -> admin: ${uiImporters.admin}, tienda: ${uiImporters.store}`);
const top = [...hexFiles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log('top hex por archivo:');
for (const [f, n] of top) console.log(`  ${n.toString().padStart(3)}  ${f}`);
