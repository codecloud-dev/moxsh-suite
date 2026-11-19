# 更新日志 · moxsh-suite

> 格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

本文件记录**显著的**用户可见变更。琐碎的排版、内部重构、CI 微调不单独列条目；完整逐笔记录请看 [提交历史](../../commits/master) 与 [Releases](../../releases)。

## [1.0.1] - 2026-11-19

> 本仓不产二进制；`1.0.1` 只标识本次文档 / CI 契约升级，组件版本仍以 `compat-matrix.json` 与 gitlink 为准。

### 修复

- **UI 回归测试此前从未真正跑过**：`design/tests/test_ui.js` 把被测页硬编码成
  `file:///workspace/moxsh-ui-5styles.html`，在任何新 clone / CI runner 上都必然
  `ERR_FILE_NOT_FOUND`（真跑 EXIT=1）。改为按脚本自身位置解析 `design/moxsh-ui-5styles.html`；
  修正后真跑 **33/33 断言通过、0 JS 错误**。
- **secret-scan 存在 `.github/` 目录盲区**：`.github/scripts/check_secrets.py` 同时用
  `EXCLUDE_DIRS` 显式含 `'.github'` 和 `not d.startswith('.git')` 双重排除整个 `.github/`，
  workflow 里写死令牌也扫不到。现只排除真正的 `.git/`，扫描脚本自身仍跳过；
  在 `.github/workflows/` 植入 `ghp_…` 令牌真跑 **EXIT=1 命中**，干净仓 **EXIT=0**。
- **兼容矩阵的真实版本核对在 CI 从未执行**：`check-pins.yml` 用 `submodules: false`，
  `check-compat-matrix.mjs` 的「读 app 子模块 build.gradle.kts 核对」分支永远走不到
  （本地 17 项 vs CI 15 项）。现只检出 public 的 `app` 子模块（`--depth 1`，private 的 `site` 仍不拉），
  CI 校验增至 **17 项**。
- **矩阵核对会误判子模块 drift**：此前只要开发者本地 `app` 停在别的提交，版本比对失败就报
  「请更新 compat-matrix.json」，把「子模块没更新」说成「矩阵写错」。现先校验 `app` 的 HEAD
  是否等于本仓 gitlink，不是就直接报「请先 git submodule update --init app」；
  drift 到 `2b1b63e`（versionName 1.0.0）时真跑 **EXIT=1** 且给出准确诊断。

### 新增

- `design-ui-test.yml`：把 UI 原型回归接入 CI，固定 `playwright@1.58.1` + chromium，
  只在 `design/**` 变更时触发；不引入顶层 `package.json` / `package-lock.json`。
- `check_secrets.py --self-test` 增加目录守门回归：临时建 `.github/workflows/leak.yml` 与
  `.git/config`，断言前者被扫描、后者被排除，防止盲区再次引入。

### 变更 / 文档

- README / README.en 同步：版本徽章 `1.0.0 → 1.0.1`；修正 `tests/test_ui.js` 覆盖描述
  （原写「终端 10 行 / 四件套 4 卡 / 2 入口」与实际 33 条断言不符）；新增「本地校验」命令清单；
  bump 子模块时补上同步 `compat-matrix.json` 版本的提示；删除过时的「未接入 CI」表述。

**真跑命令与退出码**（2026-11-19，Node 22.13.1 / Python 3.11.1）：
`node design/tests/test_ui.js`=0（33/33）、`python3 .github/scripts/check_secrets.py --self-test`=0、
`python3 .github/scripts/check_secrets.py`=0、`node scripts/check-submodule-pins.mjs`=0、
`node scripts/check-compat-matrix.mjs`=0（18 项，含新增 pin 一致性校验）。

## [Unreleased]

> 尚未发布的改动合并后写在这里，发布时归入对应版本段落。

### 文档 / 依赖维护 (2026-11-14)

- **docs**：复核双语文档与治理文件完整性（README / README.en / CONTRIBUTING / SECURITY / CODE_OF_CONDUCT / LICENSE / CHANGELOG 均齐全且彼此一致）；修正 Gitee 镜像同步频率描述——由「每小时」更正为「每 2 小时 + 手动触发」，与 `gitee-mirror.yml` 实际的 `cron: '23 */2 * * *'` 一致。
- **chore**：运行仓库自带 Node 校验脚本 `scripts/check-submodule-pins.mjs` 与 `scripts/check-compat-matrix.mjs`，结果全部通过（pin 与真实 gitlink 一致、兼容矩阵结构 15 项校验通过）；`spec/*.json` 与 `spec/examples/*.json` 语法校验通过，schema「41 顶层字段 / 19 复用定义」声明属实。
- **chore**：本仓无前端构建、无顶层 `package.json`、无 npm 第三方依赖（脚本仅用 Node 内置模块），故无 `npm ci` / 依赖升级 / `npm audit` 可跑；当时版本徽章为 `1.0.0`（2026-11-19 已在 `1.0.1` 段落升级；UI 测试现由独立 workflow 临时安装固定版本 playwright，不改本条结论）。

## 历史版本

历史变更请看 [Releases 页面](../../releases)；本文件自 2026-11-11 起统一维护，此前条目不再补录，避免与发布记录产生两个互相矛盾的版本来源。

---

**条目写法**：`### 新增` / `### 修复` / `### 变更` / `### 移除` / `### 安全`，每条一句话说清「用户能感知到什么变化」，涉及破坏性变更必须以 **`BREAKING`** 开头标出。
