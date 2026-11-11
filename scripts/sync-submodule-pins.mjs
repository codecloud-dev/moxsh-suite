#!/usr/bin/env node
// 从中英两份 README 的 gitlink 生成 pin 区块。bump 子模块后跑一次并提交两份 README。
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, TARGETS, readPins, renderBlock, readCurrentBlock } from './submodule-pins.mjs';

const pins = readPins();

for (const t of TARGETS) {
  const path = join(ROOT, t.file);
  const block = renderBlock(pins, t.lang);
  const text = readFileSync(path, 'utf8');
  const cur = readCurrentBlock(path);
  let next;
  if (cur) {
    next = text.replace(cur, block);
  } else {
    // 首次：插到对应语言的「子模块锁定版本」标题之后
    if (!text.includes(t.anchor)) {
      throw new Error(`${t.file} 找不到锚点标题：${t.anchor.trim()}`);
    }
    next = text.replace(t.anchor, t.anchor + '\n' + block + '\n');
  }
  writeFileSync(path, next);
  console.log(`  ✓ ${t.file} 子模块 pin 已同步`);
}

console.log('真实 gitlink：', JSON.stringify(
  Object.fromEntries(Object.entries(pins).map(([k, v]) => [k, v.slice(0, 7)]))
));
