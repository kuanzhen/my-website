## Context

当前 `App.tsx` 在 Hero 之后渲染两个 `PlaceholderSection`（`#projects` / `#contact`），`Hero` 通过 `ProjectCta` 渲染一个站外链接（`PROJECTS_URL = 'https://bilibili.com'`），空地址时降级为禁用按钮。导航已有 `#projects` 锚点，但落到的是占位区。现有可复用资产：

- 主题 token：`bg-canvas` / `text-ink` / `text-ink-muted` / `border-line` / `bg-accent` / `text-accent-strong`，定义在 `src/index.css`，随 `.dark` 切换。
- 平滑滚动：`src/lib/smoothScroll.ts` 的 `scrollToHash`（固定 400ms、支持 `prefers-reduced-motion`）。
- 锚点点击处理：`NavBar.tsx` 内的 `handleAnchorClick`（拦截普通左键、`pushState`/`replaceState` 同步 hash、保留修饰键原生行为）。
- 视口高度工具类 `min-h-hero` 与 `scroll-mt-20` 约定（与导航 `h-16` 同步）。
- Vite 资源导入：`src/assets/` 下的图片在构建时生成带 `base` 的 URL。

约束见 `openspec/config.yaml`：无新增依赖、单页 + 锚点、样式只用 Tailwind、支持暗色、图片懒加载。需求见本变更 `specs/`。参见 `proposal.md` 了解动机与范围。

## Goals / Non-Goals

**Goals:**

- 用一份显式数据源驱动项目卡片，替换 `#projects` 占位区，卡片数量由数据决定（≥ 4）。
- 卡片布局、悬浮特效与主题适配全部用 Tailwind token 实现，不引入新的设计变量。
- Hero CTA 与导航共用同一套锚点点击与滚动行为，避免两套实现分叉。
- 截图走 Vite 静态导入 + 原生 `loading="lazy"`，并用固定宽高比容器消除懒加载造成的布局跳动。

**Non-Goals:**

- 不做项目详情页、筛选/排序/分页、搜索（proposal out-of-scope）。
- 不做 scroll-spy / 卡片入场动画；悬浮微特效只作用于卡片。
- 不实现图片内容管理系统，项目数据仍是构建期静态常量。
- 不改动 `#contact` 占位区与主题机制。

## Decisions

### 1. 数据模型与资源放置：`src/data/projects.ts` + `src/assets/projects/*.svg`

- **选择**：定义
  ```ts
  type Project = {
    id: string
    name: string
    summary: string
    githubUrl: string
    image: string
  }
  ```
  `image` 通过 `import xxx from '../assets/projects/xxx.svg'` 得到构建期 URL；导出 `PROJECTS: readonly Project[]`，至少 4 条。截图先用 4 张 16:10 的 SVG 占位图（渐变 + 网格 + 项目缩写），apply 完成后由用户替换为真实截图。
- **理由**：`App.tsx` 已采用顶部常量的数据风格，把项目数据抽到独立文件避免组件与数据耦合；Vite 静态导入天然适配 GitHub Pages 的 `base`，无需手拼路径。
- **替代方案**：`public/` 目录 + 字符串路径——同样可行，但 `public/` 文件不会被打包指纹化，缓存策略更差；而且现有 `hero.png` 已放在 `src/assets/`，保持一致。
- **为什么不强制运行时校验 ≥ 4**：数量是内容约束，由代码评审与 spec 验证保证；在渲染层加运行时断言会引入无用代码。

### 2. 组件拆分：`ProjectSection` + `ProjectCard`

- **选择**：`src/components/sections/ProjectSection.tsx` 负责 `section#projects`、标题与网格；`src/components/sections/ProjectCard.tsx` 负责单张卡片。卡片内部结构为：截图容器 → 名称（`h3`）→ 简介 → GitHub 链接。
- **理由**：与现有 `sections/PlaceholderSection.tsx` 的目录约定一致；卡片单独成文件便于后续替换数据或调整样式，`ProjectSection` 保持为纯布局层。
- **标题层级**：全页 `h1` 属于 Hero 姓名；区域标题 `h2`，卡片名称 `h3`，满足 spec「名称使用非 `h1` 标题元素」并保持大纲连续。
- **`#projects` 几何**：根元素使用 `scroll-mt-20` 与 `border-t border-line`，与占位区保持视觉衔接；不强制 `min-h-hero`，内容自然高度由卡片决定，长列表允许超过一屏。

### 3. 网格与卡片视觉：Tailwind 响应式列数 + token 描边

- **选择**：
  - 网格：`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`，容器 `mx-auto w-full max-w-6xl px-6`（与导航内容宽度一致）。
  - 卡片：`group flex flex-col overflow-hidden rounded-2xl border border-line bg-canvas`，标题 `text-ink`，简介 `text-ink-muted`。
- **理由**：320px 单列、768px 两列、1280px 三列，覆盖 spec 的三档场景且不会把卡片压到不可读；`max-w-6xl` 与导航对齐，宽屏不无限拉伸。
- **主题**：背景/文字/边框全部用主题工具类，`.dark` 下自动换值，不需要额外 `dark:` 类；不硬编码颜色。

### 4. 悬浮微特效用 `hover:` + `motion-reduce:` 变体

- **选择**：卡片加 `transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-accent hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0`。
- **理由**：抬升与描边/阴影同时出现，满足「轻微抬升 + 边框/阴影强调」；`motion-reduce` 只关掉位移与过渡，边框与阴影强调仍保留，符合 spec 的受限环境场景；不用 JS 监听，零运行时开销。
- **替代方案**：CSS `@media (hover: hover)` 手写规则——Tailwind 的 `hover:` 变体在 v4 已按设备能力处理，不需要额外封装。

### 5. 截图容器固定宽高比，图片懒加载

- **选择**：截图容器 `aspect-[16/10] overflow-hidden bg-line/40`，`<img src={image} alt={`${name} 项目截图`} loading="lazy" decoding="async" className="h-full w-full object-cover" />`。
- **理由**：原生 `loading="lazy"` 满足性能约束与 spec「未进入视口不请求」；`aspect-[16/10]` 在图片到达前就占好位置，避免懒加载导致的布局跳动。首屏 Hero 已占满视口，`#projects` 位于折叠线以下，不会拖慢首屏。
- **替代方案**：`IntersectionObserver` 手动懒加载——原生已覆盖需求，且不会因 JS 未执行而永久不加载。

### 6. Hero CTA 复用锚点处理，抽到共享模块

- **选择**：把 `NavBar` 内的 `handleAnchorClick` 抽到 `src/lib/anchorNavigation.ts`，`NavBar` 与 `ProjectCta` 共用。`ProjectCta` 改为固定 `<a href="#projects" onClick={...}>`，删除 `url` prop、禁用分支与「新标签页打开」说明；`Hero` 删除 `projectsUrl` prop；`App.tsx` 删除 `PROJECTS_URL`。
- **理由**：spec 要求 CTA 与导航行为一致（平滑滚动、hash 同步、修饰键原生行为、减弱动效）；复制逻辑会埋下两处行为分叉的隐患。共享函数保持单一入口。
- **替代方案**：在 Hero 里单独调用 `scrollToHash` 并手写 hash 同步——与导航重复，放弃。
- **键盘顺序**：`ProjectCta` 仍是普通 `<a>`，Hero 在 `<nav>` 之后，Tab 自然落在主题切换之后，不需要 `tabIndex`。

### 7. `App.tsx` 装配：项目区替换占位

- **选择**：`PLACEHOLDER_SECTIONS` 只保留 `contact`；在 Hero 之后直接渲染 `<ProjectSection projects={PROJECTS} />`，再渲染联系我占位。
- **理由**：DOM 顺序即导航顺序；`#projects` 唯一，避免重复 id。
- **替代方案**：保留数组并在其中渲染不同组件——混合类型会让数组类型与可读性变差，直接写两行 JSX 更清楚。

## Risks / Trade-offs

- [SVG 占位图被误认为最终视觉] → 文件名与注释标注「占位截图，apply 后替换」；图片内容保持抽象，不伪装成真实产品界面。
- [卡片 `bg-canvas` 与页面底色相同，暗色下边界偏弱] → 用 `border-line` 描边 + 悬浮时 `border-accent` 强调；若仍不可辨，可在 `index.css` 增加 `--surface` token，而不是硬编码颜色。
- [4 张卡片在 768px 两列时最后一行留空] → 属于网格自然行为，不影响可用性；不为了视觉对称而隐藏卡片。
- [懒加载图片在快速滚动时短暂空白] → 固定宽高比容器保证布局不跳动；占位底色 `bg-line/40` 提供过渡，不出现白块闪烁。
- [抽离 `handleAnchorClick` 改动现有导航] → 只做移动不做逻辑修改，并由 Phase 4 的回归走查覆盖导航点击与 hash 同步。
- [CTA 移除「未配置即禁用」能力后，`#projects` 尚不存在时会跳到空位置] → `ProjectSection` 与 CTA 改动在同一变更内落地，`scrollToHash` 找不到目标时本就静默返回，不会抛错。

## Migration Plan

纯前端静态站点，无数据与接口迁移：

1. 本地 `npm run lint` 与 `npm run build` 通过。
2. `npm run preview` 走查项目区、卡片悬浮、CTA 与导航跳转、亮/暗主题。
3. 回滚策略：单次提交整体 revert；项目数据与截图资源都是新增文件，不涉及持久化结构。

## Open Questions

无。项目名称、简介、GitHub 地址与截图属于内容填充，按 proposal 约定在 apply 阶段用占位数据落地，由用户后续替换，不改变规范与实现方式。
