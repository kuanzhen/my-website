> 执行约定：严格按 Phase 顺序执行。照片与三段简介为占位内容，由站主在 apply 后替换。
> 归档提示：同步主规范时，需把 `openspec/specs/site-navigation/spec.md` 的 Purpose 从「首页、项目、联系我三个区域」改为四个区域（delta 不承载 Purpose 修改）。

## 1. 内容与照片资源

- [x] 1.1 新建 `src/assets/about/portrait.svg`：4:5（800×1000）竖幅占位人像，渐变背景 + 抽象剪影 + 标注「PORTRAIT」，明确为占位图
- [x] 1.2 新建 `src/data/about.ts`：导入占位照片，导出 `ABOUT`（`photo` / 三段 `paragraphs` / `brand: '混血哲谈'`）

## 2. 关于我区域

- [x] 2.1 新建 `src/components/sections/AboutSection.tsx`：`section#about`、`scroll-mt-20`、`border-t border-line`、`h2`「关于我」
- [x] 2.2 在组件内实现 `md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]` 左右布局，窄屏单列堆叠；照片容器 `aspect-[4/5]` + `object-cover` + `loading="lazy"` + 可读 `alt`
- [x] 2.3 渲染三段简介（`text-ink-muted`、段落间距）与品牌标签「混血哲谈」（`<p>`，无链接、无 `tabIndex`、无点击处理）
- [x] 2.4 修改 `src/App.tsx`：在联系我占位 section 之后追加 `AboutSection`，确认它是页面最后一个 section

## 3. 导航新增「关于」

- [x] 3.1 在 `src/components/Navigation/NavBar.tsx` 的 `NAV_LINKS` 末尾添加 `{ href: '#about', label: '关于' }`
- [x] 3.2 压缩基础间距（`px-2` / `gap-1`），`sm:` 以上恢复 `px-6` / `gap-5`，确认 320px 下品牌、四个链接与主题切换控件全部可见且无横向溢出
- [x] 3.3 验证 Tab 顺序为 品牌 → 首页 → 项目 → 联系我 → 关于 → 主题切换，焦点指示清晰

## 4. 交互与视觉验证

- [x] 4.1 验证导航「关于」平滑滚动到 `#about`、hash 同步、标题不被固定导航遮挡；减弱动效下瞬时落位
- [x] 4.2 验证照片懒加载：首屏不请求、接近区域才加载；固定宽高比使加载前后无布局跳动；改坏地址时无破图图标且简介与标签仍正常
- [x] 4.3 验证亮/暗主题下照片容器、三段简介、品牌标签的配色与对比度（正文与标签 ≥ 4.5:1）
- [x] 4.4 在 320 / 768 / 1280 宽度下走查布局：窄屏堆叠、宽屏左右排列，无横向溢出与内容截断

## 5. 清理与整体验证

- [x] 5.1 运行 `npm run lint`，确认无错误与未使用导入
- [x] 5.2 运行 `npm run build`，确认构建通过且无 TS 报错
- [x] 5.3 回归导航「项目」「联系我」跳转、项目区与联系我占位文案、主题切换与 hash 同步
- [x] 5.4 运行 `openspec validate add-about-section --strict`，确认规范校验通过
