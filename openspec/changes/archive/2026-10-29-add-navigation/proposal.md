## Why

站点目前只有一个 Hero 首屏，访客无法从页面顶部了解站点结构，也无法快速跳转到其他内容区域。上一变更把导航栏明确列为 out-of-scope，现在需要补上：用一个固定在顶部的导航栏建立全站的信息骨架，并让 Hero、项目、联系我三个区域之间可以平滑切换。

## What Changes

- 新增固定在视口顶部的导航栏（`position: fixed`），滚动时始终可见，不随内容滚走。
- 导航栏左侧展示站点主人姓名「寬真居士」作为品牌标识，点击回到首页。
- 导航栏右侧依次为「首页」「项目」「联系我」三个页面内链接，分别指向 `#home`、`#projects`、`#contact`。
- 点击链接平滑滚动到对应 section，不刷新页面；滚动目标顶部不被固定导航遮挡。
- 导航栏使用**常驻毛玻璃**效果（`backdrop-blur` + 半透明底色），亮/暗两套主题各自适配；浏览器不支持 `backdrop-filter` 时回退为不透明底色。
- 新增两个**最小占位 section** `#projects`、`#contact`（仅 id、标题与占位说明），使导航链接有真实可滚动目标；实际内容留待后续变更。
- 把现有 `ThemeToggle` 从 Hero 右上角移入导航栏最右侧。
- 为 Hero 添加 `id="home"` 作为「首页」锚点。
- 尊重 `prefers-reduced-motion: reduce`：该偏好下平滑滚动退化为直接跳转。

## Capabilities

### New Capabilities

- `site-navigation`: 固定顶部导航栏的结构（品牌标识、三个内页链接、主题切换控件）、页面内锚点 section、平滑滚动行为、常驻毛玻璃背景、响应式与键盘可访问性、减弱动效降级。

### Modified Capabilities

- `hero-section`:
  - 修改「粒子层的动态受严格限制」：明确 Hero 自身仍不得实现入场/滚动触发动画，但**由导航触发的页面级平滑滚动是允许的**。
  - 移除「Hero 内的切换控件可被键盘访问」：主题切换控件已迁出 Hero，键盘可访问性改由 `site-navigation` 与 `theme-switching` 共同覆盖。

## Impact

**受影响的现有代码**

- `src/App.tsx`：新增 `NavBar`，并在 `Hero` 之后追加两个占位 section。
- `src/components/Hero/Hero.tsx`：`section` 增加 `id="home"`；移除 `ThemeToggle` 及其右上角绝对定位容器。
- `src/index.css`：新增 `html.is-js-scrolling .nav-glass` 规则（滚动动画期间临时禁用毛玻璃防掉帧）；不引入 `scroll-behavior: smooth`。导航配色沿用现有 `--canvas` / `--line` 体系，不新增硬编码颜色。
- 新增 `src/components/Navigation/NavBar.tsx`（PascalCase）。
- 新增 `src/lib/smoothScroll.ts`：`scrollToHash` 锚点滚动与 `prefers-reduced-motion` 降级。
- 新增占位 section 组件（如 `src/components/sections/PlaceholderSection.tsx`，供 `#projects` / `#contact` 复用）。

**影响评估**

- 无新增 npm 依赖、无新增图片或字体资源；品牌标识使用文字而非 logo。
- 主题机制：导航栏与占位 section 必须使用现有 token 与 `dark:` 变体，不得引入新的硬编码颜色，避免暗色主题割裂。
- 现有 `theme-switching` 规范不受影响：控件位置变化不改变主题解析、持久化与防闪烁行为。
- 现有 `hero-section` 的 CTA 需求**不变**：Hero 的「我的项目」继续指向站外链接（当前为 `https://bilibili.com`），与导航栏「项目」的页面内跳转并存；两者含义不同，本次不做合并。
- 布局风险：固定导航会覆盖滚动目标顶部，需用 `scroll-margin-top` 抵消；Hero 内容垂直居中，不受导航高度挤压，但短视口下需确认文案未被遮挡。
- 可访问性风险：毛玻璃背景下的链接文字对比度可能不足，需在亮/暗两套主题下实测 ≥ 4.5:1，并在 `backdrop-filter` 不可用时保持可读。
- 320px 窄屏风险：品牌名 + 三个链接 + 主题按钮可能溢出，需要紧凑排版并实测。
- `vite.config.ts` 的 `base: '/my-website/'` 缺失仍不在本次范围内（遗留风险不变）。

**out-of-scope（严禁开发）**

- 不做搜索。
- 不做多级的下拉菜单。
- 不做用户登录与注册。
- 不做移动端汉堡菜单 / 抽屉式菜单（链接始终直接可见）。
- 不做滚动位置高亮当前 section（scroll-spy / `aria-current`）。
- 不做导航栏的显隐动画（滚动隐藏、滚回显示等），导航栏始终可见。
- 不做 React Router 或任何多页面路由，站点仍是单页 + 锚点。
- 不填充 `#projects` / `#contact` 的实际内容（项目列表、联系方式表单等）。
- 不修改 Hero CTA 的外链行为。
