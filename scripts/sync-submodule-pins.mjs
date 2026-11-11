#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'node:fs';
import { README, readPins, renderBlock, readCurrentBlock } from './submodule-pins.mjs';
const block = renderBlock(readPins());
const text = readFileSync(README, 'utf8');
const cur = readCurrentBlock();
let next;
if (cur) {
  next = text.replace(cur, block);
} else {
  // 首次：插到「## 🔗 子模块锁定版本」标题之后
  const anchor = '## 🔗 子模块锁定版本\n';
  if (!text.includes(anchor)) throw new Error('README 找不到子模块锁定版本标题');
  next = text.replace(anchor, anchor + '\n' + block + '\n');
}
writeFileSync(README, next);
console.log('README 子模块 pin 已同步：', JSON.stringify(Object.fromEntries(Object.entries(readPins()).map(([k, v]) => [k, v.slice(0, 7)]))));
