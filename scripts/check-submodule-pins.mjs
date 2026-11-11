#!/usr/bin/env node
// CI 守门：中英两份 README 的 pin 区块都必须与真实 gitlink 一致，
// 防止「中文改了、英文没改」或「文档说一套、子模块是另一套」。
import { join } from 'node:path';
import { ROOT, TARGETS, readPins, renderBlock, readCurrentBlock } from './submodule-pins.mjs';

const pins = readPins();
const short = Object.values(pins).map((s) => s.slice(0, 7)).join(' / ');
let bad = 0;

for (const t of TARGETS) {
  const path = join(ROOT, t.file);
  const cur = readCurrentBlock(path);
  if (!cur) {
    console.error(`✗ ${t.file} 缺少 SUBMODULE_PINS 自动区块，请跑 node scripts/sync-submodule-pins.mjs`);
    bad++;
    continue;
  }
  const want = renderBlock(pins, t.lang);
  if (cur.trim() !== want.trim()) {
    console.error(`✗ ${t.file} 子模块 pin 与真实 gitlink 不一致。`);
    console.error(`--- 期望 ---\n${want}`);
    console.error(`--- 实际 ---\n${cur}`);
    bad++;
  } else {
    console.log(`✓ ${t.file} 子模块 pin 与 gitlink 一致（${short}）`);
  }
}

if (bad) {
  console.error(`修复：node scripts/sync-submodule-pins.mjs && git add README.md README.en.md`);
  process.exit(1);
}
