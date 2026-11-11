#!/usr/bin/env node
// 兼容矩阵守门：结构合法 + 已 checkout 的 app 子模块版本与矩阵声明一致。
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './submodule-pins.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } };
const m = JSON.parse(readFileSync(join(ROOT, 'compat-matrix.json'), 'utf8'));

ok(m.schemaVersion === '1.0', 'schemaVersion 应为 1.0');
ok(/^\d{4}-\d{2}-\d{2}$/.test(m.generatedAt ?? ''), 'generatedAt 应为 YYYY-MM-DD');
ok(Array.isArray(m.releaseLines) && m.releaseLines.length > 0, 'releaseLines 为空');
ok(typeof m.limitation === 'string' && m.limitation.length > 0, '必须如实写明 limitation（不得假装跨仓实时）');

for (const line of m.releaseLines ?? []) {
  ok(typeof line.line === 'string' && line.line.length > 0, 'releaseLine 缺 line 名称');
  ok(Array.isArray(line.components) && line.components.length > 0, `${line.line} 缺 components`);
  for (const c of line.components ?? []) {
    ok(!!c.repo && !!c.version && !!c.source, `${line.line} 有 component 缺 repo/version/source`);
  }
  const term = (line.components ?? []).find((c) => c.repo === 'codecloud-dev/moxsh-terminal');
  ok(!!term, `${line.line} 缺 moxsh-terminal 版本声明`);
  // 真实核对：app 子模块已 checkout 时，读它的 build.gradle.kts 比对，不靠人写。
  const gradle = join(ROOT, 'app', 'moxsh', 'app', 'build.gradle.kts');
  if (term && existsSync(gradle)) {
    const txt = readFileSync(gradle, 'utf8');
    const hit = txt.match(/versionName\s*=\s*"([^"]+)"/);
    ok(!!hit, 'app 子模块 build.gradle.kts 找不到 versionName');
    if (hit) ok(hit[1] === term.version,
      `矩阵声明 moxsh-terminal=${term.version}，但 app 子模块实际 versionName=${hit[1]}（请更新 compat-matrix.json）`);
  } else if (term) {
    console.log('  · app 子模块未 checkout，跳过本地版本核对（CI 仅校验结构）');
  }
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
