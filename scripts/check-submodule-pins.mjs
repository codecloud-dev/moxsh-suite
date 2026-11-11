#!/usr/bin/env node
// CI 守门：README 的 pin 区块必须与真实 gitlink 一致，防止「文档说一套、子模块是另一套」。
import { readPins, renderBlock, readCurrentBlock } from './submodule-pins.mjs';
const cur = readCurrentBlock();
if (!cur) {
  console.error('✗ README 缺少 SUBMODULE_PINS 自动区块，请跑 node scripts/sync-submodule-pins.mjs');
  process.exit(1);
}
const want = renderBlock(readPins());
if (cur.trim() !== want.trim()) {
  console.error('✗ README 子模块 pin 与真实 gitlink 不一致。');
  console.error('--- 期望 ---\n' + want);
  console.error('--- 实际 ---\n' + cur);
  console.error('修复：node scripts/sync-submodule-pins.mjs && git add README.md');
  process.exit(1);
}
console.log('✓ README 子模块 pin 与 gitlink 一致（' +
  Object.values(readPins()).map((s) => s.slice(0, 7)).join(' / ') + '）');
