## Context

当前站点只有一个 `Hero`（`min-h-hero`，内部 `isolate` 分层，粒子层在 `z-0`~`z-40`），`ThemeToggle` 以绝对定位挂在 Hero 右上角。`App.tsx` 直接渲染 `Hero`，没有路由、没有其他 section。主题 token 集中在 `src/index.css` 的 `:root` / `.dark`，通过 `@theme inline` 暴露为 `bg-canvas` / `text-ink` / `border-line` / `text-accent` 等工具类。参见 proposal.md 了解动机与范围。

技术约束：

- 不新增 npm 依赖，站点仍是单页 + 锚点，不引入 Router。
- 样式只用 Tailwind（含 `dark:` 与 `supports-[...]:` 变体），不写内联 style。
- GitHub Pages 的 `base` path 仍是遗留问题；纯 hash 锚点不依赖 base，不受影响。
- 需要同时满足 `site-navigation` 与 `hero-section`（修改后）的规范。

## Goals / Non-Goals

**Goals:**

- 用原生锚点 + 自研 JS 平滑滚动实现导航，保持零依赖、可深链、可键盘操作。
- 让固定导航不遮挡滚动目标，且不影响 Hero 的居中布局与粒子分层。
- 毛玻璃在亮/暗主题、`backdrop-filter` 不可用时都能保住文字对比度。
- 主题切换控件迁入导航栏后，Hero 只做减法，不引入新的布局耦合。

**Non-Goals:**

- 不做 scroll-spy 当前区块高亮、不做 `aria-current`。
- 不做导航栏显隐动画、不做移动端抽屉/汉堡菜单。
- 不填充 `#projects` / `#contact` 的真实内容。
- 不改 Hero CTA 的外链行为，也不合并它与导航「项目」的语义。

## Decisions

### 1. 原生锚点做语义与兜底，点击时用 JS 限时滚动

- **选择**：链接仍然是真实的 `href="#home"` / `#projects` / `#contact`；点击时 `preventDefault`，用 `requestAnimationFrame` 以**固定 400ms** 缓动滚到目标，并用 `history.pushState` 同步 hash。`index.css` **刻意不设** `scroll-behavior: smooth`：实测（Chrome）`html` 上的 smooth 会让 `scrollTo(x,y)`、`scrollTop` 赋值乃至 `behavior:'auto'` 全部走平滑滚动，与自研逐帧动画叠加后表现为「点击后先不动、再慢慢起步」。首次带 hash 加载与无 JS 场景由浏览器原生锚点 + 目标 section 的 `scroll-margin-top` 保底瞬时定位。
- **理由**：Chrome 原生 `scroll-behavior: smooth` 的时长随距离增长，实测 720px 约 550ms、1520px 约 770ms，且 CSS 无法指定时长；从页面底部回顶部正是距离最长的一次，主观上「反应慢」。此外它在 JS 逐帧滚动中会二次生效，叠加后起手迟缓。固定 400ms 让长距离跳转不再随距离变慢，也彻底隔离了浏览器原生平滑的干扰。
- **替代方案**：
  - 纯全局 `scroll-behavior: smooth`：零代码，但时长不可控，已由实测否决。
  - `scrollIntoView({ behavior: 'smooth' })`：同为浏览器原生时长，同样不可控。
  - React Router：单页锚点站点不需要，且会给 GitHub Pages 的 base path 增加复杂度，明确不做。
- **键盘与语义**：`href` 保留，Enter 触发的仍是可拦截的 `click`；品牌链接与三个导航链接共用同一套处理。修饰键点击（Cmd/Ctrl/Shift/Alt）不拦截，保留新标签页打开等原生行为。
- **减弱动效**：JS 检测 `prefers-reduced-motion: reduce` 后直接 `scrollTo` 到目标；CSS 侧不设 `scroll-behavior`，无 JS / 首次带 hash 加载走原生锚点瞬时定位，行为一致可预期。
- **互斥与取消**：新的跳转会取消上一段未完成的 rAF 动画，避免两段动画抢滚动位置。

### 2. 固定导航用 `fixed` + 目标 section 用 `scroll-margin-top`

- **选择**：导航栏 `fixed inset-x-0 top-0 z-50`；所有带 `id` 的目标 section 统一使用 `scroll-mt-20`（或基于 `--nav-h` 的 `scroll-margin-top`），导航高度固定为 `h-16`。
- **理由**：`scroll-margin-top` 只影响滚动定位，不改变布局；用 `padding-top` 会在需要时把内容整体推下去，还会在 `#home` 上制造多余留白。
- **z-index**：导航 `z-50` 位于根层；Hero 的 `isolate` 把内部 `z-0~z-40` 限制在自身层叠上下文内，不会与导航竞争，因此无需改动粒子层的 z 值。
- **注意**：`#home` 在文档顶部，`scroll-margin-top` 会把目标算成负值，浏览器自动夹到 0，回到真正的页面顶部，符合预期。

### 3. 毛玻璃用「不透明底 + `supports-[backdrop-filter]:` 半透明」的渐进增强

- **选择**：
  ```
  bg-canvas supports-[backdrop-filter]:bg-canvas/70
  backdrop-blur-md border-b border-line
  ```
  默认不透明底色；当浏览器支持 `backdrop-filter` 时，再用 Tailwind 的 supports 变体把底色改成 70% 透明并叠加模糊。
- **理由**：不写裸 CSS `@supports`，符合「样式只用 Tailwind」的项目规则；不支持模糊的浏览器拿到的是一块实心导航栏，对比度天然达标，而不是「半透明但没有模糊」的脏底色。
- **替代方案**：直接用 `bg-canvas/70` + `@supports not` 覆盖成不透明。方向相反，容易出现半透明但模糊失效的中间态，放弃。
- **性能**：只对一个固定元素使用 `blur-md`，不对整屏或大区块用 `backdrop-filter`，避免滚动时掉帧。
- **主题适配**：`bg-canvas` 与 `border-line` 都是主题 token，`.dark` 下自动换成暗色值，无需额外 `dark:` 类。

### 4. 占位 section 复用 `min-h-hero` 工具类

- **选择**：新建 `PlaceholderSection` 组件，接收 `id` / `title` / `description`，根元素用 `min-h-hero` + 居中布局，文字使用 `text-ink` / `text-ink-muted`。
- **理由**：`min-h-hero` 已经处理了 `vh` → `dvh` 的回退与声明顺序，复用它保证三个 section 的视口高度语义一致；主题 token 保证亮/暗可读。
- **视觉**：不加背景图或粒子，只用 `border-t border-line` 与页面底色区分，避免把首屏的视觉重量稀释。
- **内容**：标题 + 「内容待补充」说明，明确占位，不伪装成完整区块。

### 5. 主题切换控件迁入导航栏，DOM 顺序即视觉顺序

- **选择**：`NavBar` 右侧依次是三个链接和 `ThemeToggle`；Hero 只删除右侧绝对定位容器。
- **理由**：`<nav>` 在 `main` 之前，天然满足「品牌 → 首页 → 项目 → 联系我 → 主题切换 → Hero CTA」的 Tab 顺序，不需要 `tabIndex` 干预。
- **替代方案**：保留 Hero 内的控件再在导航里放一个，会出现两个开关和重复的 live region，放弃。

### 6. 320px 用紧凑字号与间距，而不是折叠菜单

- **选择**：品牌 `text-sm`、链接 `text-sm`、`gap-2`、`px-3`；`sm:` 以上放大到 `text-base` / `gap-6` / `px-6`。
- **理由**：规范要求 320px 下品牌、三链接、切换控件全部直接可见；粗算 56 + 98 + 40 + 间距与内边距 ≈ 250px，能容下。
- **替代方案**：`xs` 隐藏品牌名或链接进抽屉——与规范冲突，且新增交互复杂度，放弃。

## Risks / Trade-offs

- [毛玻璃下文字对比度依赖下方内容] → 底色固定 70% 不透明并保留底部描边；在亮/暗主题、最深与最浅背景下分别实测 ≥ 4.5:1，必要时提高不透明度。
- [`backdrop-filter` 在低端设备掉帧] → 仅单个导航元素、`blur-md` 而非 `blur-xl`；滚动时观察帧率，异常则降级为不透明。
- [自研滚动动画与浏览器原生行为有细微差异（缓动曲线）] → 用 `ease-out` 缓动让开头更快、结尾收束，固定 400ms；减弱动效与无 JS 场景仍走原生/瞬移，行为可预期。
- [`pushState` 产生的历史记录] → 只在 hash 变化时 push，重复点击同一链接用 `replaceState`；浏览器返回时由浏览器的滚动恢复负责。
- [固定导航高度与 `scroll-mt` 写死后不同步] → 导航高度统一 `h-16`，间距用固定的 `scroll-mt-*`；若后续导航改高，两处需一起改，在代码注释中标注。
- [320px 下拥挤] → 用 320px、375px 实机/模拟器核对；若仍溢出，优先压缩链接内边距而不是隐藏链接。
- [占位 section 被误认为已完成内容] → 文案明确写「内容待补充」，且不添加项目卡片/联系表单等半成品 UI。

## Migration Plan

纯前端静态站点，无数据与接口迁移：

1. 本地 `npm run lint` 与 `npm run build` 通过。
2. `npm run preview` 走查导航、主题、减弱动效后合并部署。
3. 回滚策略：单次提交可整体 revert，不涉及持久化数据结构（主题 localStorage 键不变）。

## Open Questions

无。`vite.config.ts` 的 `base` 配置属于既有遗留问题，不在本次范围。
