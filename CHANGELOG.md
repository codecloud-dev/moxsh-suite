# 更新日志 · moxsh-suite

> 格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

本文件记录**显著的**用户可见变更。琐碎的排版、内部重构、CI 微调不单独列条目；完整逐笔记录请看 [提交历史](../../commits/master) 与 [Releases](../../releases)。

## [Unreleased]

> 尚未发布的改动合并后写在这里，发布时归入对应版本段落。

### 文档 / 依赖维护 (2026-11-14)

- **docs**：复核双语文档与治理文件完整性（README / README.en / CONTRIBUTING / SECURITY / CODE_OF_CONDUCT / LICENSE / CHANGELOG 均齐全且彼此一致）；修正 Gitee 镜像同步频率描述——由「每小时」更正为「每 2 小时 + 手动触发」，与 `gitee-mirror.yml` 实际的 `cron: '23 */2 * * *'` 一致。
- **chore**：运行仓库自带 Node 校验脚本 `scripts/check-submodule-pins.mjs` 与 `scripts/check-compat-matrix.mjs`，结果全部通过（pin 与真实 gitlink 一致、兼容矩阵结构 15 项校验通过）；`spec/*.json` 与 `spec/examples/*.json` 语法校验通过，schema「41 顶层字段 / 19 复用定义」声明属实。
- **chore**：本仓无前端构建、无顶层 `package.json`、无 npm 第三方依赖（脚本仅用 Node 内置模块），故无 `npm ci` / 依赖升级 / `npm audit` 可跑；版本徽章维持 `1.0.0`，与仓库「不设独立版本号」约定一致。

## 历史版本

历史变更请看 [Releases 页面](../../releases)；本文件自 2026-11-11 起统一维护，此前条目不再补录，避免与发布记录产生两个互相矛盾的版本来源。

---

**条目写法**：`### 新增` / `### 修复` / `### 变更` / `### 移除` / `### 安全`，每条一句话说清「用户能感知到什么变化」，涉及破坏性变更必须以 **`BREAKING`** 开头标出。
