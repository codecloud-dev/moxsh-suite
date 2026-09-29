# Podroid UI 学习笔记与借鉴方案

> 目标：克隆并研读 GitHub 上 **ExTV/Podroid**（Android 终端/容器 App，3051⭐，Kotlin + Jetpack Compose + Hilt）的 UI 代码，提取其"好看且不丑"的工程手法，借鉴到我们的 `moxsh-terminal`。
>
> 结论先行：Podroid 的好看**不是靠特效**，而是**极致克制的 Material 3 规范** + **单一设计 token 真源** + **职责单一的组件**。这正是它"不丑"的原因，也正好补上我们 moxsh 外壳当前最缺的一块。

---

## 一、Podroid 是什么

| 项     | 内容                                                                              |
| ----- | ------------------------------------------------------------------------------- |
| 仓库    | `github.com/ExTV/Podroid`（3051⭐，2026-09 仍在更新）                                   |
| 技术栈   | Kotlin · Jetpack Compose · Hilt · Navigation Compose · WindowSizeClass          |
| 能力    | 在 Android 上跑 QEMU 虚拟机 + rootless Podman 容器；终端用 **Termux 引擎**（印证"终端照搬 Termux"路线） |
| UI 特征 | 自适应手机/平板/横屏；Material 3 + **动态配色（默认关，设置可开）**                                     |

---

## 二、它的设计系统（最值得抄的三件事）

### 1. 配色：近黑近白 + 单色细线（Color.kt）

```kotlin
// 深色
val PodroidDarkBg       = Color(0xFF0A0A0A)   // 不是深蓝紫，是纯黑灰
val PodroidDarkSurface  = Color(0xFF141414)
val PodroidDarkSurface2 = Color(0xFF1A1A1A)
val PodroidDarkBorder   = Color(0xFF262626)   // 1px 细线分隔，不靠阴影
val PodroidDarkText     = Color(0xFFEDEDED)
val PodroidDarkTextMute = Color(0xFFA3A3A3)
// 浅色
val PodroidLightBg       = Color(0xFFFAFAFA)
val PodroidLightSurface  = Color(0xFFFFFFFF)
val PodroidLightBorder   = Color(0xFFE4E4E7)
val PodroidLightText     = Color(0xFF0A0A0A)
// 强调（深浅通用）
val PodroidAccent    = Color(0xFF4ADE80)       // lime 绿
val PodroidAmber     = Color(0xFFF59E0B)
val PodroidRed       = Color(0xFFEF4444)
```

> **对照我们**：`Glass.kt` 用的是深蓝紫绿渐变（`0xFF101A33 / 0xFF2A1538 / 0xFF0B2E2C`）+ 白字白边。Podroid 的"近黑+近白+单色 border"明显更干净。这正是它不丑、我们之前 HTML 原型显脏的根因差异。

### 2. 设计 token 单一真源（PodroidTokens.kt）

所有屏幕**只**从 `PodroidTokens` 拿间距/圆角/字号/字体，绝不在各处写死数值：

```kotlin
object PodroidTokens {
    object Spacing { val XS=4.dp; val SM=8.dp; val MD=12.dp; val LG=16.dp; val XL=20.dp; val XL2=24.dp }
    object Radius  { val Chip=4.dp; val Button=8.dp; val Card=12.dp; val Sheet=20.dp }
    object TypeSize{ val Display=32.sp; val Headline=20.sp; val Title=14.sp; val Body=12.sp; val Label=10.sp }
    // 字体：Inter(UI) + JetBrains Mono(终端)，从 assets 提取，双检单例
    fun ui()   : FontFamily = ...   // 提取 ui-fonts/Inter-Regular.ttf
    fun mono() : FontFamily = ...   // 提取 fonts/JetBrains-Mono.ttf
}
```

### 3. 主题（Theme.kt）

```kotlin
@Composable
fun PodroidTheme(darkTheme: Boolean? = null, dynamicColor: Boolean = false, content: @Composable () -> Unit) {
    val colorScheme = when {
        dynamicColor && Build.S -> dynamicDark/LightColorScheme(ctx)  // 开动态色才走壁纸取色
        effectiveDark -> PodroidDark   // 否则固定暗/亮板
        else          -> PodroidLight
    }
    MaterialTheme(colorScheme = colorScheme, typography = buildPodroidTypography(), content = content)
}
```

> 关键手法：PrimaryButton 用 `colorScheme.primary` **而非**硬编码 `Accent`，所以用户开"动态配色"后按钮自动随壁纸重着色——默认外观仍是 lime 绿。

---

## 三、组件范式（最值得抄的工程手法）

### PodroidTopBar —— TopAppBar 包一层 + 1px 分隔线

```kotlin
@Composable
fun PodroidTopBar(title: String, navigationIcon: ..., actions: ...) {
    Column {
        TopAppBar(title = { Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = Medium) },
                  colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface, ...))
        HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
    }
}
```

### PodroidPrimary/Ghost/Destructive Button —— 统一 44dp / 8dp 圆角

```kotlin
Button(onClick, Modifier.fillMaxWidth().height(44.dp), shape = RoundedCornerShape(PodroidTokens.Radius.Button),
       colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)) {
    Text(text, style = MaterialTheme.typography.titleMedium, fontWeight = Medium)
}
// Ghost = OutlinedButton(边框 outline)；Destructive = OutlinedButton(边框 Red.copy(.5)，文字 Red)
```

### PodroidListRow —— label 左 / value 右 / 1px 线（设置页通用）

```kotlin
fun PodroidListRow(label:String, value:String?=null, trailing:String?=null, mono:Boolean=false,
                   onClick:(()->Unit)?=null, divider:Boolean=true, rightSlot:(()->Unit)?=null) {
    Row(Modifier.fillMaxWidth().heightIn(min=48.dp).clickable{...}.padding(vertical=MD), SpaceBetween) {
        Text(label, bodyMedium, onSurface, weight(1f))
        if (value!=null) Text(value, bodyMedium, onSurfaceVariant, fontFamily = if(mono) mono() else Default, weight(1f, fill=false))
        if (trailing!=null) Text(trailing, ...)
    }
    if (divider) HorizontalDivider(color = outline, 1.dp)
}
```

> `mono=true` 渲染 IP/端口/路径等宽；`trailing="›"` 表示可进入子页。

### PodroidSectionLabel —— 分组小标题

所有组件**一律消费 `MaterialTheme.colorScheme.*` 与 `PodroidTokens.*`，绝不硬编码颜色**——这是视觉统一、可换肤的底层保证。

---

## 四、主屏布局模式（HomeScreen.kt）

```
Scaffold(topBar = PodroidTopBar) {
  AdaptiveContainer(windowSizeClass, maxWidth = 竖屏600/横屏900) {
    竖屏: Column(spacedBy=MD, verticalScroll) {
      权限卡 / 提示卡(可选)
      HomeStatusBlock   // displayLarge 状态大字 + 状态点 + 资源标注
      HomeDataSection   // PodroidListRow 列表: 容器数 / IP / SSH / 端口
      Spacer(weight=1f)
      HomeActionButtons // Primary/Ghost/Destructive 组合
    }
    横屏: Row { hero 左 (状态+数据) | 操作列 右 }
  }
}
```

**三段式**：状态大标题 → 信息列表 → 操作按钮。干净、可扫读、不堆特效。

---

## 五、导航（NavGraph.kt）

Navigation Compose；路由 `setup / home / terminal / terminal_x11 / settings / status / container_backup`；`NavGraphViewModel` 驱动首屏（首次走 `setup` 向导）；全程 `launchSingleTop`。

---

## 六、终端（TerminalScreen.kt）—— 验证"照搬 Termux"可行

```kotlin
import com.termux.terminal.TerminalSession
import com.termux.view.TerminalView
// ...
AndroidView(factory = { ctx -> TerminalView(ctx, ...) })  // 直接复用 Termux 官方 View
```

顶部 `PodroidTopBar` + 工具栏：`QuickSettingsDialog`（字号/配色 114 套/字体 13 款/振动）、可滚动 `extra keys` 栏（ESC TAB SYNC CTRL ALT 方向键 F1–F12，CTRL/ALT 为 sticky 切换）、`rememberExtraKeyTapModifier`。还做了 xterm focus 事件转发（nvim 焦点高亮）、`FLAG_KEEP_SCREEN_ON`。

> **对照我们**：`moxsh/app/.../ui/terminal/TerminalView.kt` 是**自建 Compose Canvas 渲染层**（`TerminalCore` 单元格契约），并非直接包 Termux View。两种都"基于 Termux"，Podroid 更省事。终端核心按你的要求**不动**。

---

## 七、对照我们 `moxsh-terminal` 现状

**已有的优势（别丢）**

- `ui/component/Glass.kt`：完整液态玻璃库 `GlassSurface / GlassSpecular(移动高光) / GlassBottomBar(向 PTY 发键) / GlassFAB / GlassTilt`，`LocalGlassAccent` 主题色流动——比 Podroid 更"苹果液态玻璃"。
- `ui/theme/Theme.kt`：`MoxshGlassTheme`，默认深色极光青，accent 可注入。
- `app/.../ui/terminal/TerminalView.kt`（Termux 系）、`SettingsScreen.kt`、`PluginPanelScreen.kt`、`auth/*`（GitHub 登录）。

**明显差距（要改的）**

1. **无设计 token 单一真源**：`Glass.kt` 与各处直接写死 `20.dp / 14.dp / 0.10f` 等数值，缺系统。
2. **无 Inter 字体接入**：全靠默认字体，缺 Podroid 那种 Inter + JetBrains Mono 的精致排版。
3. **组件不统一**：各 Screen 自己写 TopBar/Button/Row，无 Podroid 式可复用组件。
4. **无 AdaptiveContainer 自适应**：手机/平板/横屏未做 `WindowSizeClass` 适配。
5. **默认深色玻璃**：上轮你要求"纯白"，需把默认主题切到纯白 + iOS 系统蓝。

---

## 八、借鉴清单（"改一改"落地点）

| # | 借鉴点                       | 来源                                          | 落到 moxsh                                                                |
| - | ------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| 1 | 设计 token 单一真源             | `PodroidTokens.kt`                          | 新增 `ui/theme/MoxshTokens.kt`（Spacing/Radius/TypeSize + 字体提取）            |
| 2 | Inter + JetBrains Mono 字体 | `PodroidTokens.ui/mono`                     | assets 放字体 + 双检单例提取，TerminalView 用 mono                                 |
| 3 | 统一组件                      | `PodroidTopBar/Button/ListRow/SectionLabel` | 新增 `ui/component/MoxshComponents.kt`（同范式，可选 Glass tint）                 |
| 4 | 自适应容器                     | `AdaptiveContainer`                         | 新增 `AdaptiveContainer`（WindowSizeClass → maxWidth 600/900）              |
| 5 | 默认主题纯白 iOS 蓝              | 上一轮你要求 + Podroid 克制配色                       | `Theme.kt` 默认 `a 白简约`：`#FFFFFF/#FAFAFA` 底、`#007AFF` 蓝、1px `#E4E4E7` 线   |
| 6 | 重写设置/插件面板                 | HomeScreen 范式                               | 用 `MoxshListRow + MoxshSectionLabel + MoxshPrimaryButton` 统一风格          |
| 7 | 终端工具栏                     | TerminalScreen                              | 保持 Termux 内核，顶部加 QuickSettings + extra-keys 栏（沿用我们 `GlassBottomBar` 发键） |

> 方向取舍：**主壳**采用 Podroid 式干净 Material 3 + token + Inter 字体 + 自适应；**视觉点缀**保留我们 `Glass.kt` 液态玻璃材质（终端卡、控制中心、FAB），形成"干净骨架 + 苹果玻璃质感"的融合——既不像 Podroid 那样纯扁平，也不像我们旧 HTML 原型那样糊。

---

## 九、风险与验证

- 沙箱**无 Android SDK**，新增 Kotlin 无法在此编译验证；需在你本地执行：


  ```bash
  cd moxsh-terminal/moxsh && ./gradlew assembleDebug
  ```
- 字体文件需放到 `moxsh/app/src/main/assets/ui-fonts/Inter-Regular.ttf`、`Inter-SemiBold.ttf`、`fonts/JetBrains-Mono.ttf`（可从 Google Fonts / termux-styling 取）。
- 完整仓库（含 QEMU 二进制）因沙箱网络限制未能拉全；**UI 源码已全部通过 GitHub API 取得**（见 `podroid-ui/` 临时目录）。本地克隆：


  ```bash
  git clone https://github.com/ExTV/Podroid.git
  ```
