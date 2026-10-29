> 执行约定：严格按 Phase 顺序执行；每个 Phase 结束后暂停，总结变更并等待确认后再进入下一个 Phase。

## 1. 导航结构

- [x] 1.1 新建 `src/components/sections/PlaceholderSection.tsx`：接收 `id` / `title` / `description`，根元素用 `min-h-hero`、居中布局、`border-t border-line`，文字使用 `text-ink` / `text-ink-muted`
- [x] 1.2 在 `src/App.tsx` 的 Hero 之后追加 `#projects` 与 `#contact` 两个 `PlaceholderSection`，文案分别为「项目」「联系我」并注明「内容待补充」
- [x] 1.3 给 `src/components/Hero/Hero.tsx` 的根 `section` 添加 `id="home"`，确认不与其他 id 重复
- [x] 1.4 新建 `src/components/Navigation/NavBar.tsx`：`<nav aria-label="主导航">`，左侧品牌链接指向 `#home`，右侧三个链接依次指向 `#home` / `#projects` / `#contact`（本 Phase 先不含毛玻璃与主题按钮）
- [x] 1.5 在 `src/App.tsx` 中把 `NavBar` 挂在 `<main>` 之前，确认 DOM 顺序为 导航 → Hero → 项目 → 联系我
- [x] 1.6 验证：三个链接 `href` 正确、三个 section id 唯一且可定位、页面无横向溢出、`npm run build` 通过

## 2. 平滑滚动与固定定位

- [x] 2.1 新建 `src/lib/smoothScroll.ts`：`scrollToHash` 用 `preventDefault` + rAF 固定 400ms 缓动滚动，`pushState`/`replaceState` 同步 hash（CSS 侧刻意不设 `scroll-behavior: smooth`，避免与逐帧动画叠加）
- [x] 2.2 在 `scrollToHash` 中检测 `prefers-reduced-motion: reduce`，命中时直接 `scrollTo` 瞬时落位而非平滑动画
- [x] 2.3 `NavBar` 使用 `fixed inset-x-0 top-0 z-50` 与固定高度 `h-16`；确认导航不占据文档流空间
- [x] 2.4 给目标 section 统一加 `scroll-mt-20`（`#home`、`#projects`、`#contact`），并在代码注释中标注需与导航高度同步
- [x] 2.5 采用统一机制：三个目标 section 都使用 `scroll-mt-20`；**不使用** `scroll-padding-top`，因为它会与 `scroll-margin-top` 叠加成双倍偏移
- [x] 2.6 验证：固定定位生效、点击落位与 hash 同步、长距离 400ms 上限与连续点击取消（逐条见 Phase 4 的 CDP 实测）

## 3. 毛玻璃背景

- [x] 3.1 为 `NavBar` 添加 `bg-canvas supports-[backdrop-filter]:bg-canvas/70 backdrop-blur-md border-b border-line`
- [x] 3.2 确认不支持 `backdrop-filter` 时渲染为不透明底色（`.bg-canvas` 基础规则），且 Tailwind 产物中 `-webkit-backdrop-filter` 前缀存在
- [x] 3.3 对比度实测：70% 底色下正文最坏 7.92:1（亮）/ 6.51:1（暗）；次要文字在极端背景会掉到 3.36:1，因此导航链接改用 `text-ink`，悬停用 `accent-strong`（6.70:1 / 13.57:1）；焦点环 4.99:1 / 10.89:1
- [x] 3.4 CDP 实测导航计算样式为 `backdrop-filter: blur(12px)` 与 70% 透明底色；导航内链接与按钮均可正常命中

## 4. 主题按钮迁移与可访问性

- [x] 4.1 在 `NavBar` 右侧（三个链接之后）挂载现有 `ThemeToggle`
- [x] 4.2 从 `src/components/Hero/Hero.tsx` 移除 `ThemeToggle` 导入与右上角绝对定位容器，确认 Hero 不再渲染该控件
- [x] 4.3 调整 320px 下的紧凑排版（品牌与链接 `text-sm`、`gap-2`、`px-3`，`sm:` 以上放大）；CDP 实测 320px 下 `scrollWidth=320`、四个元素全部在视口内（最后一个按钮右边缘 308）
- [x] 4.4 CDP 实测 Tab 顺序为 品牌标识 → 首页 → 项目 → 联系我 → 主题切换；焦点环 `outline-accent` 在导航底色上 4.99:1（亮）/ 10.89:1（暗）
- [x] 4.5 CDP 实测发现短视口下 h1 被导航压住（640×360 压 1px，320×200 压 25px），已把 Hero 的 `max-height:32rem` 分支改为 `pt-20 pb-10`，复测 h1 顶部 84 / 80，均未被遮挡
- [x] 4.6 CDP 实测：默认走 JS 逐帧平滑滚动；`prefers-reduced-motion: reduce` 下直接瞬时落位，点击「联系我」300ms 内已落位（`contactTop=80`）

## 5. 清理与整体验证

- [x] 5.1 运行 `npm run lint`，确认无错误与未使用导入
- [x] 5.2 运行 `npm run build`，确认构建通过且无 TS 报错
- [x] 5.3 回归主题机制：刷新保留显式选择、系统偏好跟随、禁用本地存储不报错、首屏无 FOUC（已由 Phase 4 CDP 实测覆盖）
- [x] 5.4 在 320 / 375 / 768 / 1440 宽度与亮/暗两套主题下整体走查导航、封面、两个占位 section 的视觉一致性（已由 Phase 4 CDP 实测覆盖）
- [x] 5.5 运行 `openspec validate --changes add-navigation --strict`，确认规范校验通过
