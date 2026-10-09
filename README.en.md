# moxsh · monorepo

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-8a7bff" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-37d5d3" alt="license">
  <img src="https://img.shields.io/badge/repo-monorepo-2088FF" alt="monorepo">
  <img src="https://img.shields.io/badge/submodules-git%20linked-ff7ac3" alt="submodules">
</p>

<p align="center"><a href="README.md">中文</a> · <b>English</b></p>

> **moxsh** —— a mobile Linux terminal that is fully independent from Termux, fully Termux-compatible, faster, and **all-glass UI across the whole App**.

This repo is the **asset hub** of the moxsh family: it gathers the scattered real-device source, website, design prototypes, docs and specs in one place, clearly organized into five blocks.

<p align="center"><img src="assets/demo.svg" width="760" alt="moxsh-suite animation: terminal / plugin / core / website modules float around the central mox logo"></p>

<p align="center"><b>⭐ If moxsh is useful to you, please give it a <a href="https://github.com/codecloud-dev/moxsh-suite">Star</a> — it helps more developers discover this mobile Linux terminal!</b></p>

<details>
<summary>📑 Contents</summary>

- [🗃️ Repo topology](#repo-topology)
- [🔗 Pinned submodule versions](#pinned-submodule-versions)
- [📑 Directory navigation](#directory-navigation)
- [🚀 Quick start](#quick-start)
- [🌐 Try it online](#try-it-online)
- [📊 Key assets at a glance](#key-assets-at-a-glance)
- [🔹 Build & contribute](#build--contribute)
- [📜 License](#license)

</details>

## 🗃️ Repo topology

```text
moxsh-suite  (this repo / monorepo, default branch master)
├── app/    → git submodule → codecloud-dev/moxsh-terminal   (Android real-device source)
├── site/   → git submodule → codecloud-dev/mox-site          (website + online experience)
├── design/ (real files)  UI prototype HTML + automated regression tests
├── docs/   (real files)  design / study notes, acceptance reports
└── spec/   (real files)  plugin manifest JSON spec (Schema + multiple examples)
```

Both sub-repos are **public**, default branch `main`.

## 🔗 Pinned submodule versions

| Submodule | Repo | Pinned commit (v1.0.0) |
|---|---|---|
| `app`  | `codecloud-dev/moxsh-terminal` | `dad8ff5` ([v1.0.0](https://github.com/codecloud-dev/moxsh-terminal/releases/tag/v1.0.0)) |
| `site` | `codecloud-dev/mox-site`        | `bcdc62b` ([v1.0.0](https://github.com/codecloud-dev/mox-site/releases/tag/v1.0.0)) |

> This repo bumped to the **1.0.0** milestone together with the whole MoX bundle: both submodules are pinned to their respective v1.0.0 release commits. The other public repos (agent-core / moxsh-plugins / moxwebgpu) shipped 1.0.0 in the same wave; moxbox / moxcode remain "planned · TBD" and are out of scope this time.

Note: the pinned commit is a snapshot taken at monorepo init. After a submodule evolves, `cd` into it, `git pull`, then back at root `git add app site && git commit` to bump the version.

## 📑 Directory navigation

| Path | Content |
|---|---|
| `app/moxsh/ui/` | Self-built Canvas terminal renderer, liquid-glass component library (`Glass.kt` / `MoxshTokens.kt` / `MoxshComponents.kt`) |
| `app/moxsh/plugins/plugin-distro/` | Graphical container-management quartet (distro manager / package manager / resource monitor / onboarding) |
| `app/moxsh/plugins/plugin-ai/` | AI assistant (multi-model + skills + Agent tools) |
| `site/` | Static website + online experience page (`experience.html` embeds `prototype.html`) |
| `design/moxsh-ui-mockup.html` | Main interaction prototype (also the source of `site/prototype.html`) |
| `design/tests/test_ui.js` | Playwright prototype regression tests (terminal / quartet / session drawer / 0 errors) |
| `docs/` | Podroid UI study notes, acceptance reports |
| `spec/plugin-manifest.schema.json` | Plugin manifest Draft 2020-12 JSON Schema (41 top-level fields) |
| `spec/examples/` | Five real examples: OSS-free / closed-free / closed-paid (donation) / subscription / system-builtin |

## 🚀 Quick start

```bash
git clone https://github.com/codecloud-dev/moxsh-suite.git
cd moxsh-suite
git submodule update --init --recursive   # pull app / site
```

**Proxy clone (mainland China / restricted networks)**: set `insteadOf` before `clone` so git auto-routes through the `ghproxy` mirror:

```bash
git config --global url."https://ghproxy.net/https://github.com/".insteadOf "https://github.com/"
```

## 🌐 Try it online

The website is deployed on GitHub Pages (source: `mox-site`'s `main` branch root):

- Online experience: <https://codecloud-dev.github.io/mox-site/experience.html>
- Website home: <https://codecloud-dev.github.io/mox-site/>

Local preview: open `site/index.html`, or `design/moxsh-ui-mockup.html`, directly in a browser.

## 📊 Key assets at a glance

### 🎨 design/ — UI prototype

- `moxsh-ui-mockup.html` —— **main prototype**: full-app liquid glass; bottom three keys (terminal / categories / settings); **session drawer** (Termux-style: env-color dots / long-press rename / exit-code red strikethrough / new); **beginner-friendly graphical container-management quartet** (distro manager / graphical package manager / resource monitor / onboarding); control center (volume + key summon, follows finger); AI assistant config screen.
- `tests/test_ui.js` —— Playwright regression covering 10 terminal lines, 4 quartet cards, usable session drawer, 2 homepage entries, 0 console errors.

### 🧩 spec/ — plugin manifest spec

- `plugin-manifest.schema.json` —— Draft 2020-12 JSON Schema, 41 top-level fields, 19 reusable definitions.
- `README.md` —— spec docs (identity / OSS vs closed / pricing & licensing / donation / compatibility / distribution / entrypoints / permissions / dependencies / capabilities / settings / signing).
- `examples/` —— five real examples (OSS-free / closed-free / closed-paid(donation) / subscription(AI) / system-builtin), all passing `ajv` validation.

### 🗃️ app/ — real-device source (sub-repo)

- `moxsh/ui/` —— self-built Canvas terminal renderer, liquid-glass component library.
- `plugin-distro/` —— graphical container-management quartet (Compose screens).
- `plugin-ai/` —— AI assistant (model接入 + skill system + Agent tools).

## 🔹 Build & contribute

- **App build / release**: see the `app` sub-repo `README.md` (needs Android SDK / NDK / Rust toolchain).
- **Website changes**: see the `site` sub-repo; GitHub Pages auto-builds after pushing `main`.
- **This repo's job**: only to gather assets and specs. After a submodule evolves, advance it in its own repo, then bump the gitlink here and commit.

## 📜 License

Each sub-repo ships its own `LICENSE`; assets gathered here follow the respective sub-repo's license.

---

moxsh · a Linux terminal on your phone that feels as smooth as iOS.
