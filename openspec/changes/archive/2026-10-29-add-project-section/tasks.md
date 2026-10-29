> 执行约定：严格按 Phase 顺序执行。项目数据与截图为占位内容，由用户在 apply 后替换。

## 1. 项目数据与截图资源

- [x] 1.1 新建 `src/assets/projects/`，放入 4 张 16:10（1200×750）SVG 占位截图，文件名与项目 id 对应
- [x] 1.2 新建 `src/data/projects.ts`：定义 `Project` 类型（`id` / `name` / `summary` / `githubUrl` / `image`），静态导入 4 张截图并导出 `PROJECTS`（≥ 4 条占位数据）

## 2. 项目展示区

- [x] 2.1 新建 `src/components/sections/ProjectCard.tsx`：截图（`loading="lazy"` / `decoding="async"` / `alt`）、`h3` 名称、简介、GitHub 外链
- [x] 2.2 新建 `src/components/sections/ProjectSection.tsx`：`section#projects`、`scroll-mt-20`、`h2`「项目」、`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` 网格
- [x] 2.3 修改 `src/App.tsx`：Hero 之后渲染 `ProjectSection`，`PLACEHOLDER_SECTIONS` 仅保留 `contact`
- [x] 2.4 验证：`#projects` 唯一、至少 4 张卡片、320px 单列无横向溢出、768px 两列、1280px 三列

## 3. 卡片微特效、主题与图片降级

- [x] 3.1 为卡片添加 `hover:-translate-y-1`、`hover:border-accent`、`hover:shadow-lg` 与 `transition-transform`，并用 `motion-reduce:` 关闭位移与过渡、保留描边/阴影强调
- [x] 3.2 截图容器固定 `aspect-[16/10]` 与占位底色，确认懒加载过程中布局不跳动
- [x] 3.3 亮/暗主题下检查卡片背景、边框、标题、简介、链接的对比度与配色一致性，确认未硬编码颜色

## 4. Hero CTA 改为页面内锚点

- [x] 4.1 新建 `src/lib/anchorNavigation.ts`：从 `NavBar.tsx` 抽出 `handleAnchorClick`，`NavBar` 改为从该模块导入
- [x] 4.2 修改 `src/components/ui/ProjectCta.tsx`：改为固定 `<a href="#projects">` 并使用共享点击处理，删除 `url` prop、禁用分支、`target="_blank"` 与「新标签页打开」说明
- [x] 4.3 修改 `src/components/Hero/Hero.tsx` 与 `src/App.tsx`：移除 `projectsUrl` / `PROJECTS_URL`
- [x] 4.4 验证：点击 CTA 平滑滚动到项目区且 hash 变为 `#projects`、不刷新不新开标签页；Tab 顺序仍在主题切换之后；减弱动效下瞬时落位

## 5. 清理与整体验证

- [x] 5.1 运行 `npm run lint`，确认无错误与未使用导入
- [x] 5.2 运行 `npm run build`，确认构建通过且无 TS 报错
- [x] 5.3 回归导航「项目」「联系我」跳转、主题切换、`#contact` 占位文案与 hash 同步
- [x] 5.4 在 320 / 375 / 768 / 1440 宽度与亮/暗两套主题下走查项目区视觉与卡片悬浮
- [x] 5.5 运行 `openspec validate add-project-section --strict`，确认规范校验通过
