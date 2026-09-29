# moxsh 插件清单规范（moxsh-plugin.json）v1.0

> 每一个 moxsh 插件都在其根目录放一个 `moxsh-plugin.json`，它是**插件对宿主（moxsh App）与市场**的完整自描述。市场据此展示、定价、鉴权、校验、分发；宿主据此安装、加载、请求权限。
>
> 设计目标：**支持开源与闭源并存、免费与付费并存**，并且让面向小白的图形化市场能拿到它需要的一切元数据。

- 机器可读定义：[`plugin-manifest.schema.json`](./plugin-manifest.schema.json)（JSON Schema Draft 2020-12）
- 示例：[`examples/`](./examples/)
  - `01-open-source-free.json` 开源免费（玻璃主题）
  - `02-closed-source-free.json` 闭源免费（下载器）
  - `03-closed-source-paid-afdian.json` 闭源付费买断（爱发电）
  - `04-subscription-ai.json` 订阅制 AI 插件（爱发电包月）
  - `05-builtin-system.json` 系统内置插件（发行版管理器）

---

## 1. 文件约定

| 项 | 约定 |
|---|---|
| 文件名 | `moxsh-plugin.json`（必须，位于插件包根目录） |
| 编码 | UTF-8，无 BOM |
| 版本 | `schemaVersion` 固定 `"1.0"` |
| 语言 | 默认语言用顶层字段；多语言用 `*I18n` 映射（BCP-47） |
| 未知字段 | 规范外字段一律**拒绝**（Schema `additionalProperties:false`），保证向前兼容可预测 |

## 2. 最小可用清单

```json
{
  "schemaVersion": "1.0",
  "id": "com.example.plugin.hello",
  "name": "Hello 插件",
  "version": "0.1.0",
  "author": { "name": "作者名" },
  "license": { "spdx": "MIT" },
  "visibility": "open-source",
  "compatibility": { "minAppVersion": "0.9.0" },
  "distribution": { "type": "direct" },
  "entrypoints": { "screen": "com.example.plugin.hello.HelloScreen" }
}
```

## 3. 字段详解

### 3.1 身份

| 字段 | 必填 | 说明 |
|---|---|---|
| `schemaVersion` | ✓ | 固定 `"1.0"` |
| `id` | ✓ | 反向域名，`^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$`，发布后**不可改** |
| `name` / `nameI18n` | ✓ | 展示名 + 多语言 |
| `version` | ✓ | SemVer 2.0.0 |
| `author` / `contributors` | ✓ / — | `{name, email?, url?, moxId?, avatar?}` |
| `publisher` | — | 发布主体：`{id, name, verified, certFingerprint, moxId}`，市场鉴权用 |
| `description` / `descriptionI18n` | 建议 | ≤200 字，列表页用 |
| `longDescription` / `longDescriptionI18n` | — | 详情页长文，支持 Markdown |
| `icon` / `banner` / `screenshots` / `videos` | 建议 | 图标 512×512，横幅 16:9，截图 ≤12 张 |
| `categories` | 建议 | 1~4 个，见枚举（system/container/terminal/development/networking/security/ai/automation/theming/file/productivity/multimedia/education/gaming/utility/widget/integration/other） |
| `tags` / `keywords` | — | 标签 / 搜索关键词 |
| `homepage` / `repository` / `issues` | — | 主页 / 仓库 / 反馈 |
| `terms` / `privacy` | — | 服务条款 / 隐私政策 |

### 3.2 开源 · 闭源 · 源码可见

| `visibility` | 含义 | 要求 |
|---|---|---|
| `open-source` | 开源 | `license.spdx` 为真实开源协议；`sourceCode.url` 建议填 |
| `closed-source` | 闭源 | `license.spdx` 用 `LicenseRef-Proprietary`（或自有）；`distribution.artifact` 为编译产物（`moxp`/`dex-bundle`/`apk`） |
| `source-available` | 源码可见但受限 | 填 `sourceCode`，并在 `license` 注明限制 |

> **闭源插件如何分发**：只发布编译产物。`visibility: "closed-source"` + `distribution.artifact.format` ∈ {`moxp`, `dex-bundle`, `apk`, `jar`}，并**必须**提供 `integrity.signature`，宿主安装前验签。

### 3.3 定价与授权（`pricing`）

`model` ∈ `free | paid | freemium | subscription | donation | ad-supported`。

**爱发电（afdian）是国内首选收款/授权渠道**，配置位于 `pricing.provider.afdian`：

```jsonc
"pricing": {
  "model": "paid",
  "currency": "CNY",
  "price": 29,
  "compareAtPrice": 49,
  "trial": { "enabled": true, "days": 7 },
  "plans": [
    { "id": "lifetime", "name": "买断版", "price": 29, "billing": "one-time", "recommended": true }
  ],
  "provider": {
    "type": "afdian",
    "afdian": {
      "creatorPage": "https://afdian.com/a/cloudharbor",
      // 方案 ↔ 爱发电「电铺」商品 映射
      "shopItems": [ { "planId": "lifetime", "itemId": "f3b2c1d0e9", "skuId": "dockerui-life" } ],
      // 服务端校验接口（推荐经自建中转，避免泄露爱发电 API Token）
      "verifyEndpoint": "https://api.moxsh.app/license/afdian/verify",
      "orderQueryTemplate": "https://api.moxsh.app/license/afdian/verify?order={orderNo}&item=dockerui",
      "unlockCodeFormat": "^MOXSH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$",
      "bindBy": "order-no"
    }
  },
  "license": {
    "required": true,
    "type": "order-query",       // activation-code | account-bind | order-query | offline-blob | none
    "offlineGraceDays": 7,
    "devicesPerLicense": 1,
    "restoreUrl": "https://cloudharbor.io/dockerui/restore"
  },
  "refundPolicy": "购买后 7 天内未激活可全额退款。",
  "taxIncluded": true
}
```

**授权类型说明**

| `license.type` | 适用 | 说明 |
|---|---|---|
| `activation-code` | 买断 | 用户输入解锁码，客户端 + 服务端校验 |
| `order-query` | 爱发电买断 | 用爱发电订单号查询订单状态解锁（`orderQueryTemplate`） |
| `account-bind` | 订阅/账号 | 绑定 mox-id 账号，服务端下发授权 |
| `offline-blob` | 离线授权 | 预置签名授权文件 |
| `none` | 免费 | 无需校验 |

**推荐授权流程（爱发电）**

```
用户在爱发电电铺下单 ──▶ 获得订单号
        │
用户在 moxsh 插件内粘贴订单号
        │
客户端 ──▶ POST {verifyEndpoint} （订单号 + 插件 id + 设备指纹）
        │
你的服务端用爱发电 OpenAPI 校验订单 ──▶ 返回签名票据(license blob)
        │
客户端本地缓存票据；离线宽限 {offlineGraceDays} 天
```

> 安全要求：**绝不在客户端硬编码爱发电 API Token**；所有对爱发电的调用经自建服务中转；票据需服务端签名、客户端缓存并定期（宽限期内）校验。

### 3.4 兼容性（`compatibility`）

`minAppVersion`（必填）、`maxAppVersion`（可空）、`minPluginApi`、`android.{minSdk,targetSdk}`、`abis`、`arches`、`supportedOs`、`termuxCompat`（如 `>=0.118`）、`requiresRoot`、`requiresProot`。

### 3.5 分发（`distribution`）

| `type` | 含义 |
|---|---|
| `builtin` | 随 App 内置（系统插件） |
| `registry` | 走市场仓库安装 |
| `direct` | 直链安装 |
| `side-load` | 本地导入 |

`artifact` 描述下载物：`url`、`size`、`sha256`、`format`、`compression`；`mirrors` 提供国内镜像加速；`autoUpdate` 控制自动更新。

### 3.6 入口（`entrypoints`）

至少提供 `screen` / `registrar` / `application` 之一。另可声明 `services`、`receivers`、`providers`、`activities`、`commands`（注入终端 PATH）、`widgets`、`hooks`（`onInstall`/`onEnable`/`onDisable`/`onUninstall`/`onBoot`/`onSessionStart`/`onThemeChange`）。

### 3.7 权限（`permissions[]`）

每项 `{name, reason, optional?}`。`reason` **必须用小白能懂的话**解释（市场与安装时会展示）。

枚举：`storage.read/write`、`network`、`exec`、`root`、`container`、`termux.api`、`clipboard`、`notification`、`boot`、`location`、`camera`、`microphone`、`contacts`、`phone`、`sms`、`account`、`background`、`overlay`、`install.packages`。

### 3.8 依赖（`dependencies`）

`plugins[]`（插件依赖，可带 SemVer 区间）、`packages[]`（apt/apk/moxpkg/pip/npm…）、`native[]`（按 ABI 的原生库）。

### 3.9 能力（`capabilities[]`）

供市场筛选与宿主调度：`terminal.*`、`container.*`、`ai.*`、`widget.home`、`boot.auto-start`、`tasker.action`、`float.window`、`theming`、`file.manager`、`network.proxy`、`storage.encrypt`、`notification`、`clipboard`、`scheduler.cron`、`input.ime`、`root.shell`。

### 3.10 设置项（`settings[]`）

声明式配置，宿主据此**自动生成图形化设置界面**（面向小白，`advanced:true` 默认折叠）。类型：`bool/int/float/string/password/select/multiselect/color/path/time/duration`。

### 3.11 完整性（`integrity`）

```jsonc
"integrity": {
  "checksum": { "algo": "sha256", "value": "<64 hex>" },
  "signature": {
    "algo": "ed25519",              // ed25519 | rsa-pss | ecdsa
    "value": "<base64 sig>",
    "keyId": "cloudharbor-2026",
    "certFingerprint": "sha256:...",
    "timestamp": "2026-09-25T02:00:00Z"
  }
}
```

> **闭源/付费插件强制要求签名**；宿主校验 `sha256` 与签名通过后才可安装。

## 4. 校验

```bash
# 语法
npx ajv-cli@5 validate --spec=draft2020 --strict=false \
  -s plugin-manifest.schema.json -d 'examples/*.json'
```

## 5. 版本策略

- `schemaVersion` 为 **major**：不兼容变更才升（1.0 → 2.0），宿主与市场按 major 兼容。
- 新增**可选**字段属于 minor 变更，`schemaVersion` 不变。
- 市场对写入的 `marketplace.*` 字段以服务端为准。
