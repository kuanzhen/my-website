## Context

站点当前只有 Vite 脚手架：`src/App.tsx` 是一张带计数器的演示卡片，`src/index.css` 仅有一行 `@import "tailwindcss";`，没有任何主题机制、没有组件目录、没有 spec。动机见 `proposal.md`，行为契约见 `specs/hero-section/spec.md` 与 `specs/theme-switching/spec.md`。本节只记录影响实现路径的现状与约束：

- Tailwind CSS v4 通过 `@tailwindcss/vite` 插件接入，**没有 `tailwind.config.js`**，自定义 theme token 必须走 CSS 的 `@theme` 指令。
- Tailwind v4 的 `dark:` 变体默认绑定 `prefers-color-scheme`，无法用按钮切换，必须显式改写 variant。
- 无路由、无状态管理库、无数据层；本次改动只落在一个页面组件上，但主题机制会影响后续所有区块。
- 首屏预算 < 2 秒，且站点部署在 GitHub Pages 子路径下（本次不配置 `base`）。

## Goals / Non-Goals

**Goals:**

- 用最小依赖实现"渐变 + 粒子"的双层背景，并保证任一层失效时画面仍完整。
- 建立一套后续区块可复用的主题机制（解析、持久化、防闪烁、Canvas 同步）。
- 让粒子层的开销可预测：像素比与粒子数都有硬上限，且不参与首屏关键路径。

**Non-Goals:**

- 不设计动画系统（无 transition/animation 编排，除粒子漂移外）。
- 不做组件库、不抽 Design Token 体系文件、不做主题切换的位置迁移（导航栏另议）。
- 不处理部署配置、不引入 `base` path 改写。
- 不做粒子层的配置化 UI（密度、颜色由代码常量决定）。

## Decisions

### 1. 背景采用"CSS 渐变底层 + Canvas 粒子上层"叠加

**选择**：渐变由 CSS `radial-gradient` 绘制，粒子与连线由 Canvas 2D 绘制，两层绝对定位叠放在 `z-0` / `z-10`；可读性遮罩在粒子层之上（`z-20`），内容在 `z-30`，切换控件在 `z-40`。

**理由**：这是唯一能让降级"看起来仍然完整"的结构。Canvas 失败、`prefers-reduced-motion`、低端机降级时，页面底子仍在。同时渐变可以用 CSS 变量做主题化，主题切换零成本。

**备选**：全部画进 Canvas（单层，但主题切换与降级都变复杂）；纯 CSS 无粒子（无法满足"粒子"）。

### 2. 粒子自己写，不引第三方库

**选择**：约 100–150 行的 Canvas 2D 实现，无新增依赖。

**理由**：需求只有"缓慢漂移的粒子"加"邻近粒子连线"（见决策 15），不涉及碰撞、交互与鼠标排斥。前者是约 20 行，后者是约 40 行的距离判定加一次批量 stroke。`tsparticles` 这类库的体积（数十 KB gz，视 preset）与首屏 2 秒预算冲突，且库自持 rAF 循环会与主题同步、降级逻辑打架。为了两条需求引入一整套配置驱动的粒子引擎，收益与成本明显不成比例。

**备选**：`@tsparticles/react`（开发快，但体积与主题化成本高）；Vanta 类效果（依赖 three.js，直接排除）。

### 3. 渐变用径向渐变软过渡，不用大面积 `filter: blur()`

**选择**：`radial-gradient` 以大半径、透明色标自然柔化，动画只作用于 `transform`；不使用覆盖整屏的 `filter: blur()` 图层。

**理由**：整屏模糊层在移动端 Safari 上是真实的光栅化与内存开销，低端机会掉帧；并且它会和 `backdrop-filter` 叠加放大成本。

**备选**：模糊色块 div（视觉更"雾"，但不可接受的开销）。

### 4. 渐变层不使用关键帧动画

**选择**：渐变层是静态的，仅由主题变量决定配色。视觉动态全部来自粒子漂移。

**理由**：proposal 的 out-of-scope 明确排除渐变色块流动。这也顺带省掉一个持续合成的图层。

### 5. 主题用类名驱动，不走 `prefers-color-scheme` 媒体查询

**选择**：在 `src/index.css` 顶部、`@import "tailwindcss"` 之后声明 `@custom-variant dark (&:where(.dark, .dark *));`，由 `<html>` 上的 `.dark` 类控制。

**理由**：媒体查询方案无法被按钮覆盖。类名方案同时允许"跟随系统"通过 JS 解析后落到同一个 `.dark` 类上，两条路径归一。

**备选**：`data-theme` 属性驱动（等价，但需额外声明 variant；类名是 Tailwind 生态默认）。

### 6. 主题语义为三态，UI 为一次点击循环

**选择**：持久化值为 `'system' | 'light' | 'dark'`；未存值等同 `'system'`。切换控件按 `system → light → dark → system` 循环，并用可访问名称暴露当前态。系统偏好由 `matchMedia('(prefers-color-scheme: dark)')` 解析，处于 `system` 时监听其 `change` 事件。

**理由**：只有三态才能既表达"跟随系统"又表达"显式锁定"，同时满足规范中"显式选择优先"与"清除后重新跟随系统"两条要求。两态存储会在用户想回到跟随系统时无路可走。

### 7. 防闪烁依赖 `index.html` 内的阻塞式 inline script

**选择**：在 `index.html` 的 `<head>` 中、样式与模块脚本之前直接内联一小段脚本，同步读取持久化值与 `matchMedia`，立即给 `<html>` 加上 `.dark` 类并改写 `theme-color` 的取值。`color-scheme` 不在这段脚本里设置——它由 `<meta name="color-scheme" content="light dark">` 声明支持范围，再由 `:root` / `.dark` 的 CSS 声明落到具体值，浏览器在样式应用时一并对齐原生控件。

**理由**：任何异步（React 挂载后、`requestAnimationFrame`、模块加载）都晚于首屏绘制，必然产生一帧错误主题。这段脚本必须在 HTML 里、必须同步执行。

**备选**：Vite 插件注入（多一层构建复杂度，收益相同）；CSS-only（无法读取持久化值）。

**约束**：这段脚本原生 JS 书写，不能 `import`；读取存储必须包在 `try/catch` 中（隐私模式可能抛异常）。

### 8. 主题状态用 Lightweight Provider 共享，不靠 prop drilling

**选择**：`ThemeProvider` 提供 `{ preference, resolvedTheme, setPreference }`；`ThemeToggle` 与 `ParticleField` 都从中消费。

**理由**：本次只有 Hero 消费，但导航栏落地时必然要在别处放切换控件；提前放进 context 的边际成本很低，事后重构的成本高得多。同时它给了 Canvas 一个明确的"主题变了"的信号，避免用 `MutationObserver` 去嗅探 `class` 变化。

### 9. 粒子配色与主题共享同一数据源

**选择**：在 CSS 中定义单一的粒子色 token `--particle-color`（透明度内嵌在 rgba 里，不再单列 `--particle-opacity`），同时出现在 `:root` 与 `.dark`；Canvas 在初始化与主题变化时用 `getComputedStyle(document.documentElement).getPropertyValue(...)` 读取，不硬编码颜色。

**理由**：这是"主题切换但粒子不变"这个经典 bug 的唯一干净解法——颜色只有一个定义处。硬编码两套 rgba 值必然会在某次改色时不同步。

### 10. 高度用单个自定义工具类承载 vh / dvh 回退

**选择**：在 `index.css` 中用 `@utility min-h-hero` 同时声明 `min-height: 100vh` 与 `min-height: 100dvh`，组件只用 `min-h-hero`。

**理由**：`100vh` 在移动端包含地址栏区域，导致内容被裁或滚动时跳动；`dvh` 会跟随地址栏变化。`min-` 前缀保证放大与横屏时内容可以撑高而不被裁切。

**关键细节（实现中发现的坑）**：不能直接同时挂 Tailwind 内置的 vh 与 dvh 两个高度工具类——它们的输出顺序固定，同优先级下 `100vh` 会盖住 `100dvh`，等于 dvh 失效。写进同一个 `@utility` 才能控制声明顺序。当前构建的浏览器目标已支持 `dvh`，因此产物中该回退会被压缩器合并为单条 `100dvh`。

**附带约束**：Tailwind v4 的自动内容扫描会把 `openspec/`、`dist/`、`.claude/` 中的类名字面量当成候选（例如文档里写到的高度工具类名），已在 `index.css` 用 `@source not` 排除，避免产物混入用不到的样式。

**备选**：`h-screen`（固定高度会裁切内容，排除）；`100svh`（会把地址栏区域永久计入，视觉上顶部留白，不采用）。

### 11. Canvas 的资源约束与生命周期

**选择**：

- 尺寸由容器的 `ResizeObserver` 驱动（而非 `window.resize`），避免与地址栏变化不同步。
- `devicePixelRatio` 上限截到 2；粒子数量按容器面积计算并设硬上限。
- 首屏绘制完成后（`requestIdleCallback`，回退 `setTimeout`）才启动 rAF，粒子层不以任何方式阻塞首屏。
- `visibilitychange` 时暂停并在恢复时重置时间基准，避免 delta time 累积导致瞬移。
- `prefers-reduced-motion: reduce` 时只绘制一帧静态粒子，不启动 rAF；监听其变化以支持运行中切换。
- effect 返回完整的清理：取消 rAF、断开 observers、移除监听器。React 19 StrictMode 下开发期会双挂载，重复注册会导致双倍速度与泄漏。

### 12. 内容与呈现分离

**选择**：`Hero` 通过 props 接收 `name` / `role` / `intro`，文案常量定义在页面组装处。`Hero` 内部不写死任何个人信息。

**理由**：让组件可测试、可复用，也避免把个人文案散落在布局代码里。

### 13. 组件与文件划分

```
src/
├── App.tsx                       ← 组装：文案常量 + Hero
├── main.tsx                      ← StrictMode + ThemeProvider 挂载
├── index.css                     ← 主题 token、dark variant、姓名字族、min-h-hero
├── components/
│   ├── Hero/
│   │   ├── Hero.tsx              ← 语义结构、布局、遮罩
│   │   ├── HeroBackground.tsx    ← CSS 渐变层
│   │   └── ParticleField.tsx     ← Canvas 粒子与连线（内聚全部生命周期）
│   └── ui/
│       ├── ThemeToggle.tsx
│       └── ProjectCta.tsx        ← 「我的项目」外链按钮，含空链接的禁用分支
├── hooks/
│   ├── useResolvedTheme.ts
│   └── useTheme.ts               ← 从 context 取值，provider 外抛错
├── lib/
│   └── theme.ts                  ← 三态读写、系统解析、storage 容错
└── theme/
    ├── theme-context.ts          ← context 定义（与组件分文件，避开 react/only-export-components）
    └── ThemeProvider.tsx
```

**理由**：`ParticleField` 是唯一含命令式生命周期的组件，隔离它能让 Hero 保持声明式。按 CLAUDE.md，文件名 PascalCase、函数式组件、样式全 Tailwind。

### 14. 可读性遮罩必须压在粒子层之上

**选择**：在渐变层与内容层之间加一层由主题变量控制的径向遮罩（半透明），**该层位于粒子层之上**（`z-20`，内容 `z-30`），而不是给文字加 `text-shadow` 硬扛。

**理由**：亮色主题下浅渐变 + 深字、暗色主题下深渐变 + 浅字都可能跌破对比度；遮罩是唯一能同时保证两种主题对比度且不影响配色的手段。

**关键细节（加入连线后修正）**：遮罩最初写在 `HeroBackground` 内部，也就是在 Canvas **之下**。加入连线后这个问题才暴露出来——文字背后的粒子点与连线完全不受遮罩影响，正文最坏情况下对比度会掉到约 3.9:1，跌破 4.5:1。遮罩的职责是削弱"背景上的一切"，因此它必须处在粒子层之上、内容层之下。对比度需在实现后用实际色值核对。

### 15. 连线用距离阈值 + 透明度分档，按容器短边自适应

**选择**：

- 连线距离取容器短边的一个比例（约 0.22），夹在 80–160 px 之间，避免窄屏上密集糊成一片、宽屏上稀疏无结构。
- 只画点之间的连线，点始终描在连线之上，让交点看起来像星图中的节点。
- 连线的最高不透明度压到粒子色的一部分（约 0.45），且随距离线性衰减；文字上的可读性由决策 14 的遮罩兜底。
- 每帧把所有线段按距离分成固定 4 档，同档合并成一条路径只 `stroke()` 一次，用 `globalAlpha` 表达档位。不逐线 `stroke`，也不逐线设 `globalAlpha`——那是 O(n²) 次状态切换。
- 距离判定先比较平方值，省掉每对的 `Math.sqrt`；只有命中阈值的对才开方算档位。

**理由**：这是"星图感"在 Canvas 2D 上最省的做法。粒子数已被硬上限约束（110），最坏情况也只是一万次以内的距离比较，且运行在首屏后的 rAF 里，不参与关键路径。

**取舍**：不做空间网格分区（例如把画布切成格子只比较邻近格子）。在当前粒子上限下，分区带来的是更多代码与更多状态，收益要在粒子数上千时才显现。若将来提高粒子上限，这是第一个要改的地方。

**边界**：`prefers-reduced-motion` 下不启动 rAF，但仍绘制静态一帧，所以连线同样存在——降级只关闭运动，不改变画面结构。

### 16. 姓名字族走系统楷体栈，不加载任何字体文件

**选择**：`--font-calligraphy: "Kaiti TC", "Kaiti SC", "STKaiti", "KaiTi", "DFKai-SB", "BiauKai", "AR PL UKai CN", serif`，只通过 `font-calligraphy` 挂在姓名的 `h1` 上。姓名以繁体「寬真居士」呈现，职业与介绍保持简体。字号桌面 72px / 移动 60px，字距 `0.05em`，不加 `font-bold`。

**理由**：需求最终收敛到「普通的繁体字楷书」，而系统楷体就是这个字面意思。零字节、零授权风险、零维护——不需要切片、不需要子集与文案同步、不引入 `font-display` 与 FOUT 问题。

**为什么排除了所有自定义字体方案**：

- **瘦金体**：没有开源授权字库。方正瘦金书、汉仪瘦金书、字魂系列均为商业授权；「润玉瘦金体」出自点墨字库（`DMCYuShengWuNian-Light`），字体内嵌版权声明写明商用需授权，字客网与识字体网同样标注「商用须授权」。把它嵌进公开站点等于把字库文件分发给每个访客，用户未提供有授权的文件，不能接入。
- **篆书**：实测「敬峰中山王篆」（OFL-1.1）既不含「宽」也不含「寬」，四字姓名里第一个字直接回退成黑体；「崇羲篆体」是 CC BY-ND，子集化即改作，不允许；「霞鹜篆书」alpha 期仅约数百字。此外篆书对多数访客不可读，与首屏「让人认出你是谁」的职责冲突。
- **自托管楷体 webfont**（全字库正楷体）：授权没问题（OGDL 允许改作，新版另有 OFL），但可获得的形态都不划算——预切片的 `@ivanagyro/tw-kai` 每片约 110–125 KB、覆盖约两百字，姓名四个字分属四片，合计约 450 KB；完整字库 36 MB，当前网络环境下拉取失败。为四个字付 450 KB，收益与成本不成比例。
- **开源毛笔楷书**（Long Cang 龙藏体、Ma Shan Zheng 马善政毛笔楷书）：都验证可用、都能切到 2 KB，但用户逐一看过之后否决——前者太细，后者「不对劲」。

**已知代价（明确接受）**：Android 与多数 Linux 发行版默认没有楷体，会退到 `serif`（宋体/衬线），这些访客看到的姓名不是楷书。这是系统字体方案的固有缺口，不是实现缺陷；macOS / iOS / Windows 均自带楷体，覆盖主流桌面与 iOS。

**字族顺序的理由**：繁体楷体排在前面（姓名是繁体），随后是简体楷体与 Windows 的 `DFKai-SB`/`BiauKai`，最后 `serif` 兜底。全部写成具体字族名而不是泛型 `cursive`——`cursive` 在部分浏览器会被映射成极不可控的手写体。

**备选**：上一轮实现过的两种自托管方案（Long Cang、Ma Shan Zheng）已完整验证、随时可切回，只是被用户否决；不是「做不到」，是「不采用」。

### 17. CTA 放在介绍下方，空链接渲染为禁用态

**选择**：`ProjectCta` 接收 `{ label, url }` 两个 prop。`url` 非空时渲染 `<a target="_blank" rel="noopener noreferrer">`，并在链接内用 `sr-only` 文本告知辅助技术「在新标签页打开」；`url` 为空字符串时渲染同款样式的 `<button type="button" disabled>`，不产生任何 `href`。

**理由**：原 proposal 把 CTA 排除在外，理由是「projects 区块不存在，跳转目标无效」。改成站外链接后，这个理由不成立；但链接地址要等站点主人提供，在拿到之前不能渲染 `href="#"` 或占位域名——那是一个会静默失败的假链接。禁用态让视觉可以先行评审，同时保证页面上不存在任何死链。

**样式（可点击态）**：`bg-accent` 底色 + 胶囊圆角；亮色主题 `text-white`，暗色主题 `dark:text-canvas`（深底反色）。实测对比度：亮色 `#0e7490` 上的白字 5.36:1，暗色 `#22d3ee` 上的 `#050b18` 字 10.9:1，均高于 4.5:1。焦点环用 `outline-ink`，在 accent 底色与渐变背景上都可见（实测 `outline: solid 2px` + `offset 2px`，亮色环为 `#0f172a`、暗色为 `#e8eefc`）。

**悬停色单独开 token，不用 `bg-accent/85`**：半透明的 accent 会与浅色渐变混成更浅的颜色——实测白字掉到 4.07:1，跌破 4.5:1。因此另设 `--accent-strong`：亮色取更深的 `#0b5f77`（白字 7.2:1），暗色取更亮的 `#67e8f9`（深字 13.6:1）。亮色压暗、暗色提亮，方向相反是因为两套主题的按钮字色相反。仍然是"颜色只有一个定义处"：token 在 `index.css` 里成对声明，组件只引用 `accent-strong`。

**样式（待补充态）**：用「描边 + 主题底色 + `text-ink-muted`」而不是给整颗按钮挂 `opacity-50`。半透明会把文字一起压淡，实测落到 4.5:1 以下；禁用控件的对比度在 WCAG 里虽可豁免，但本 spec 的「两套主题下的按钮可读性」场景没有给出这个豁免，所以按 4.5:1 落实。实测 `#475569` on `#f4f7fb` = 7.05:1，`#94a3b8` on `#050b18` = 7.67:1。`disabled` 让按钮不进 Tab 序列（实测 `focus()` 后 `activeElement` 不落在按钮上），且 DOM 里没有 `href`。

**不加过渡**：`hover` 只在 `accent` 与 `accent-strong` 之间瞬切底色，不加 `transition-colors`。proposal 的 out-of-scope 明确排除漂移以外的动画，悬停过渡虽小也属于动画，不做。

**备选**：站内 `#projects` 锚点（区块不存在，点击无反应，排除）；空链接时直接省略按钮（视觉无法评审，且用户明确要求先看到前端，排除）。

## Risks / Trade-offs

- **亮色主题对比度不达标** → 用遮罩层保证下限，实现后逐主题测量正文（4.5:1）与大字号（3:1）。
- **`@custom-variant` 位置写错导致 `dark:` 全部失效** → 该声明必须位于 `@import "tailwindcss";` 之后；实现后用一个 `dark:` 类做快速验证。
- **首屏 inline script 与未来 CSP 冲突** → 目前无 CSP；若将来加，需为其计算 hash 或改用 nonce。记录为已知约束。
- **粒子在低端机掉帧** → 像素比上限 2、粒子数硬上限、`reduced-motion` 静止、首屏后启动；必要时再按帧率做自适应减量。
- **连线把每帧成本抬到 O(n²)** → 粒子上限压到 110，距离比较用平方值，线段分 4 档批量 `stroke`；阈值随容器短边自适应，窄屏上自动减少可见连线。若将来提高上限，改用空间网格分区。
- **容器尺寸波动引发重绘抖动** → 用 `ResizeObserver` 并做微小尺寸变化的阈值过滤，避免地址栏动画期间反复重建粒子。
- **主题存储被禁用或数据损坏** → `lib/theme.ts` 全部读写包 `try/catch`，失败即视为 `system`。
- **Android / Linux 无楷体** → 姓名字族回退到 `serif`，这些访客看到的不是楷书。这是系统字体方案的固有缺口，已写进决策 16 作为「已知代价」；若将来必须跨平台一致，再改成自托管子集。
- **系统楷体的笔画比毛笔楷书细** → 已在亮暗两套主题、320 / 375 / 900 三种宽度下核对过 72px / 60px 的视觉重量与溢出；深色主题下细笔画会显弱，必要时上调字号而不是加粗（`font-bold` 会触发合成假粗体）。
- **本变更引入全局样式改动，可能影响未来区块** → 主题 token 与 variant 只在 `index.css` 单点声明，后续区块直接消费，不再各自定义。
- **8 个进程外的已知遗留**：`vite.config.ts` 无 `base: '/my-website/'`，GitHub Pages 部署后资源会 404。属 proposal 的 out-of-scope，不在此次修复。

## Migration Plan

单页替换，无数据、无外部依赖、无持久化结构迁移：

1. 先在 `index.css` 落主题机制（variant + token），此时页面视觉可保持不变。
2. 再落 `ThemeProvider` 与 `index.html` 的 inline script，验证无 FOUC。
3. 最后替换 `App.tsx` 为 Hero 组装，删除占位内容与未引用资源。
4. 回滚：三步均为新增文件 + 两处就地替换，`git checkout` 或还原 `App.tsx` / `index.html` / `index.css` 三个文件即可回到脚手架状态。

## Open Questions

- ~~姓名、职业、一句话介绍的具体文案尚未提供~~ 已确定：姓名「寬真居士」（繁体，展示字体子集按此四字切出）、职业「全栈工程师」、介绍「喜欢儒释道传统文化，自认为是马列主义者的 AI coder」。
- 粒子的密度、漂移速度、渐变的具体色标需要视觉调参，属实现期可调常量，不影响规范与任务拆分。
