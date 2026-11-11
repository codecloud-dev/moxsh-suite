// 子模块 pin 的单一事实来源：直接读 gitlink（git ls-tree HEAD），不读 README、不手写。
// sync-submodule-pins.mjs 用它生成 README 区块；check-submodule-pins.mjs 用它校验。
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const README = join(ROOT, 'README.md');
export const BEGIN = '<!-- SUBMODULE_PINS:BEGIN 由 scripts/sync-submodule-pins.mjs 自动生成，请勿手改 -->';
export const END = '<!-- SUBMODULE_PINS:END -->';

const REPOS = {
  app: 'codecloud-dev/moxsh-terminal',
  site: 'codecloud-dev/mox-site',
};

export function readPins() {
  const out = execFileSync('git', ['ls-tree', 'HEAD', 'app', 'site'], { cwd: ROOT, encoding: 'utf8' });
  const pins = {};
  for (const line of out.trim().split('\n')) {
    // 160000 commit <sha>\t<path>
    const m = line.match(/^160000 commit ([0-9a-f]{40})\t(\S+)$/);
    if (m) pins[m[2]] = m[1];
  }
  const missing = Object.keys(REPOS).filter((k) => !pins[k]);
  if (missing.length) throw new Error(`gitlink 缺失：${missing.join(', ')}（子模块是否未提交？）`);
  return pins;
}

export function renderBlock(pins) {
  const rows = Object.entries(REPOS).map(([path, repo]) => {
    const sha = pins[path];
    const short = sha.slice(0, 7);
    return `| \`${path}\` | \`${repo}\` | \`${short}\`（[查看该提交](https://github.com/${repo}/tree/${sha})） |`;
  });
  return [
    BEGIN,
    '| 子模块 | 仓库 | 锁定提交（真实 gitlink） |',
    '| --- | --- | --- |',
    ...rows,
    '',
    `> 本区块由 \`scripts/sync-submodule-pins.mjs\` 从 \`git ls-tree HEAD\` 生成，CI 由 \`check-pins.yml\` 校验；`,
    `> 手动改这里会在下次 PR 直接失败。bump 子模块后请重跑 \`node scripts/sync-submodule-pins.mjs\`。`,
    END,
  ].join('\n');
}

export function readCurrentBlock() {
  const text = readFileSync(README, 'utf8');
  const a = text.indexOf(BEGIN);
  const b = text.indexOf(END);
  if (a < 0 || b < 0 || b < a) return null;
  return text.slice(a, b + END.length);
}
