## Why

站点首屏之后目前只有「项目」「联系我」两个「内容待补充」的占位 section，访客看不到站主的实际项目作品；Hero 的「我的项目」CTA 也指向一个站外占位链接（`https://bilibili.com`），无法形成「首屏 → 项目展示」的站内闭环。本变更把 `#projects` 占位区替换为真正的项目展示区，并让 Hero CTA 直接平滑滚动到该区。

## What Changes

- 新增项目展示区 `ProjectSection`，位于 Hero 正下方，占据 `#projects` 锚点（替换原「内容待补充」占位 section）。
- 卡片式布局：每张项目卡片包含项目截图、项目名称、项目简介（见解）、GitHub 链接四项内容。
- 至少展示 4 个项目。
- 项目卡片在鼠标悬浮时有微特效（轻微抬升 + 边框/阴影强调）。
- **BREAKING**：Hero 的「我的项目」CTA 从站外链接（`https://bilibili.com`）改为页面内锚点 `#projects`，点击复用现有平滑滚动机制跳到项目展示区；原「新标签页打开外链」及「链接未配置即禁用」的行为被移除。
- 项目截图使用 lazy loading，符合站点「首屏 < 2 秒、所有图片懒加载」的性能约束。

## Capabilities

### New Capabilities

- `project-section`: 项目展示区的卡片网格布局、项目数据模型（截图 / 名称 / 简介 / GitHub 链接）、悬浮微特效，以及图片懒加载与亮暗主题适配。

### Modified Capabilities

- `hero-section`: 「Hero 提供指向项目的 CTA」需求变更——CTA 由站外链接改为页面内 `#projects` 锚点，移除新标签页外链与「链接未配置」降级行为。
- `site-navigation`: 「页面提供导航可定位的 section 锚点」需求变更——`#projects` 不再是「内容待补充」占位 section，而是真实项目展示区（`#contact` 仍为占位）。

## Impact

**受影响的现有代码**

- `src/App.tsx`：在 Hero 之后用 `ProjectSection` 替换 `#projects` 占位 section；`#contact` 占位保留；新增项目数据源。
- `src/components/Hero/Hero.tsx`：CTA 的 props 与渲染改为页面内锚点。
- `src/components/ui/ProjectCta.tsx`：外链分支改为 `#projects` 锚点（复用平滑滚动），移除「未配置即禁用」的降级逻辑。
- 新增 `src/components/sections/ProjectSection.tsx` 与项目数据文件（如 `src/data/projects.ts`）。
- 新增 4 张项目截图资源（`src/assets/`，lazy loading）。

**影响评估**

- 无新增 npm 依赖、无路由变化，仍是单页 + 锚点。
- 主题机制：项目卡片与截图容器必须使用现有 token 与 `dark:` 变体，不引入硬编码颜色。
- 平滑滚动：CTA 复用 `site-navigation` 已有的 `scrollToHash`，不新增滚动实现；`#projects` section 沿用 `scroll-mt-20` 避免被固定导航遮挡。
- Hero 粒子动效约束不变：悬浮微特效只作用于项目卡片，触及不到 Hero 粒子层。
- 数据待定：项目名称、简介、GitHub 链接与截图为占位内容，apply 阶段由用户替换为真实数据；卡片数量下限为 4。

**out-of-scope（严禁开发）**

- 不做项目详情页。
- 不做项目搜索功能。
- 不引入 React Router / 多页面路由，站点仍是单页 + 锚点。
- 不改动 `#contact` 占位 section（仍是「内容待补充」）。
- 不为卡片增加筛选、排序、分类标签、分页等超出「展示 + 悬浮特效」的交互。