// 校验 index.astro：JS getElementById 引用与 HTML id 一致 + 脚本语法检查
const fs = require('fs');
const path = 'D:/python_pro/qorde_workspace/phy_areafly/exam-sim/src/pages/index.astro';
const src = fs.readFileSync(path, 'utf-8');

// 1. 提取 <script> 内容
const m = src.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('NO SCRIPT FOUND'); process.exit(1); }
const js = m[1];

// 2. 语法检查
try {
  new Function(js);
  console.log('[OK] script parses without syntax errors');
} catch (e) {
  console.error('[FAIL] syntax error:', e.message);
  process.exit(1);
}

// 3. id 引用一致性
const html = src.replace(m[0], '');
const usedIds = new Set();
for (const mm of js.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)) usedIds.add(mm[1]);
const htmlIds = new Set();
for (const mm of html.matchAll(/id="([^"]+)"/g)) htmlIds.add(mm[1]);
let bad = 0;
for (const id of usedIds) {
  if (!htmlIds.has(id)) { console.error('[FAIL] JS 引用了不存在的 id:', id); bad++; }
}
console.log('[INFO] JS 引用 id 数:', usedIds.size, ' HTML 定义 id 数:', htmlIds.size);

// 4. 关键 id 动态拼接检查（'screen-' + s / 'mark' + g）
for (const s of ['login', 'info', 'exam', 'result']) {
  if (!htmlIds.has('screen-' + s)) { console.error('[FAIL] 缺少 section id=screen-' + s); bad++; }
}
for (const g of [0, 1, 2, 3]) {
  if (!htmlIds.has('mark' + g)) { console.error('[FAIL] 缺少 id=mark' + g); bad++; }
}

// 5. 类选择器抽查
const css = (src.match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1];
const needed = ['.fs-hint', '.score-note', '.saved-mark', '.avg-hint', '.sub',
  '.hl', '.data-table', '.total-num', '.total-desc', '.login-tip', '.time-note',
  '.step-no', '.timer', '.hw-status', '.exam-cols', '.draw-btn', '.toggle', '.grey',
  '.log-panel', '.diagram-box', '.overlay', '.draw-modal', '.stu-item', '.exp-list',
  '.btn-blue', '.btn-red', '.form-row', '.screen', '.card', '.topbar', '.total-box', '.submit-row'];
for (const c of needed) {
  if (!css.includes(c)) { console.error('[FAIL] CSS 缺少类:', c); bad++; }
}

// 6. 已知易错点专项检查（防止字符级损坏复发）
const mustContain = ['examState', 'decimalScore', 'precisionScore', 'avgCalc',
  'requestFullscreen', 'fs-hint', 'F11', '95', 'svg-lamp', 'svg-knife', 'sw-state',
  'data-g', 'data-k', 'save-row', 'btn-draw', 'draw-overlay', 'draw-counting',
  'draw-result', 'btn-go-exam', 'btn-submit', 't42', 'total-num', 'total-desc'];
for (const s of mustContain) {
  if (!src.includes(s)) { console.error('[FAIL] 文件缺少关键内容:', s); bad++; }
}

if (bad === 0) console.log('[PASS] 全部校验通过');
else { console.error('共', bad, '处问题'); process.exit(1); }
