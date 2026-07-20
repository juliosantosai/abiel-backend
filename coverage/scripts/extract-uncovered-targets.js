const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '..', '.tmp');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')) : [];
const targets = ['src/modules/agente/application/agent-orchestrator.ts','src/modules/gateway/presentation/webhook.controller.ts'];
const res = {};
for (const t of targets) res[t] = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const arr = Array.isArray(data) ? data : (Array.isArray(data.result) ? data.result : [data]);
  for (const e of arr) {
    const url = (e.url || e.scriptUrl || '').replace('file://', '');
    const rel = path.relative(process.cwd(), url);
    if (!targets.includes(rel)) continue;
    for (const fn of e.functions || []) {
      for (const r of fn.ranges || []) {
        if (r && r.count === 0) res[rel].push([r.startOffset || r.start || 0, (r.endOffset || r.end || 0) - 1]);
      }
    }
  }
}
function offsetsToLines(file, ranges) {
  const src = fs.readFileSync(file, 'utf8');
  const offsets = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') offsets.push(i + 1);
  const lines = [];
  for (const rg of ranges) {
    const start = rg[0];
    const end = rg[1];
    let sLine = offsets.findIndex(o => o > start);
    sLine = sLine === -1 ? offsets.length : sLine;
    let eLine = offsets.findIndex(o => o > Math.max(0, end));
    eLine = eLine === -1 ? offsets.length : eLine;
    lines.push([sLine, eLine]);
  }
  return lines;
}
for (const t of targets) {
  const file = path.resolve(t);
  const ranges = res[t];
  if (!ranges || ranges.length === 0) {
    console.log(t + ': NO uncovered ranges found');
    continue;
  }
  const lines = offsetsToLines(file, ranges);
  lines.sort((a,b)=>a[0]-b[0]);
  const merged = [];
  for (const l of lines) {
    if (!merged.length) merged.push(l.slice());
    else {
      const last = merged[merged.length-1];
      if (l[0] <= last[1] + 1) last[1] = Math.max(last[1], l[1]); else merged.push(l.slice());
    }
  }
  console.log('\n' + t + ' uncovered:');
  for (const m of merged) console.log(`L${m[0]}-L${m[1]}`);
}
