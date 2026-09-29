# moxsh 总仓库 · monorepo

> **moxsh** —— 完全脱离 Termux、全面兼容 Termux、性能更强、**整个 App 都是液态玻璃**的移动 Linux 终端。

本仓库是 moxsh 家族的**资产总入口**：把散落在各处的真机源码、官网、设计原型、文档与规范集中收纳，五块分明，一眼看清。

## 目录结构

| 目录 | 内容 | 形式 |
|---|---|---|
| [`app/`](./app) | 真机源码（Android · Jetpack Compose + Rust 终端内核） | `git submodule` → `codecloud-dev/moxsh-terminal` |
| [`site/`](./site) | 官网（中英双语 · 液态玻璃质感） | `git submodule` → `codecloud-dev/mox-site` |
| [`design/`](./design) | UI 原型（液态玻璃 · 针对小白的图形化容器管理四件套） | 实体文件 |
| [`docs/`](./docs) | 设计与学习笔记、验收报告 | 实体文件 |
| [`spec/`](./spec) | **插件清单 JSON 规范** + JSON Schema + 多套示例 | 实体文件 |

## 快速开始

```bash
git clone <this-repo> moxsh-suite
cd moxsh-suite
git submodule update --init --recursive   # 拉取 app / site
```

在线体验（无需安装）：打开官网 `site/index.html` 里的「在线体验」，或直接看 `design/moxsh-ui-mockup.html`。

## 关键资产速览

### 🎨 design/ — UI 原型
- `moxsh-ui-mockup.html` —— **主原型**：全应用液态玻璃；底部三键（终端/分类/设置）；**会话抽屉**（Termux 式：环境色点 / 长按改名 / 退出码红删除线 / 新建）；**针对小白的图形化容器管理四件套**（发行版管理器 / 图形包管理器 / 资源监控 / 新手引导）；控制中心（音量+键呼出、跟手）；AI 助手配置屏。

### 🧩 spec/ — 插件清单规范
- `plugin-manifest.schema.json` —— Draft 2020-12 JSON Schema，41 个顶层字段。
- `README.md` —— 规范文档（身份 / 开源闭源 / 定价与授权 / 爱发电 / 兼容 / 分发 / 入口 / 权限 / 依赖 / 能力 / 设置 / 签名）。
- `examples/` —— 开源免费 / 闭源免费 / 闭源付费(爱发电) / 订阅制 / 系统内置 五套真实示例。

### 🛠 app/ — 真机源码（子仓库）
- `moxsh/ui/` —— 自研 Canvas 终端渲染层、液态玻璃组件库（`Glass.kt` / `MoxshTokens.kt` / `MoxshComponents.kt`）。
- `moxsh/plugins/plugin-distro/` —— 图形化容器管理四件套（发行版管理器 / 包管理器 / 资源监控 / 新手引导）。
- `moxsh/plugins/plugin-ai/` —— AI 助手（多模型接入 + 技能 + Agent 工具）。

---
moxsh · 让手机上的 Linux 像 iOS 一样顺滑。
