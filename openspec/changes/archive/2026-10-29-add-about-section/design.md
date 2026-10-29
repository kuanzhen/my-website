## Context

当前页面顺序为 Hero（`#home`）→ 项目展示区（`#projects`）→ 联系我占位（`#contact`）。`App.tsx` 依次渲染 `Hero`、`ProjectSection`、`PlaceholderSection`；`NavBar.tsx` 的 `NAV_LINKS` 有「首页 / 项目 / 联系我」三个链接，点击统一走 `src/lib/anchorNavigation.ts` 的 `handleAnchorClick`（平滑滚动 + hash 同步 + 修饰键原生行为）。主题 token、`min-h-hero`、`scroll-mt-20` 约定与项目卡片样式均已存在。参见 `proposal.md` 了解动机与范围，需求见本变更 `specs/`。

约束：

- 无新增 npm 依赖，仍是单页 + 锚点。
- 样式只用 Tailwind，图片全部 lazy loading，支持暗色。
- 导航在 320px 下必须完整显示品牌、四个链接与主题切换控件，不折叠不隐藏。

## Goals / Non-Goals

**Goals:**

- 用独立数据源承载照片与三段简介，组件只负责布局，内容替换不碰组件。
- 关于我区域与现有 section 保持相同的锚点、边框、标题与滚动偏移约定。
- 导航新增「关于」后仍在 320px 内完整可用。
- 照片懒加载且不造成布局跳动。

**Non-Goals:**

- 不做联系表单、社交链接、技能条、时间线或独立页面。
- 不引入入场动画；关于我与项目区一样保持静态呈现。
- 不改动项目区、Hero、主题机制与 `#contact` 内容。
- 不做图片裁剪/上传 UI，照片仍是构建期静态资源。

## Decisions

### 1. 内容数据独立到 `src/data/about.ts`

- **选择**：
  ```ts
  export const ABOUT = {
    photo: aboutPortrait,
    paragraphs: [/* 恰好三段 */],
    brand: '混血哲谈',
  } as const
  ```
  照片通过 `import aboutPortrait from '../assets/about/portrait.svg'` 引入；三段简介为字符串数组，组件按顺序渲染。
- **理由**：与 `PROJECTS` 的数据组织方式一致；站主替换文案与照片时只改数据文件，不触碰布局代码。`brand` 固定但放在数据中，避免文案散落在 JSX。
- **替代方案**：把文案直接写在 `App.tsx` 的 `PROFILE` 常量里——会让 App 承担越来越多内容职责，且照片导入与布局参数混在一起，放弃。

### 2. 组件结构：`AboutSection` 单文件

- **选择**：`src/components/sections/AboutSection.tsx` 接收 `photo` / `paragraphs` / `brand`，根元素为：
  ```
  <section id="about" class="scroll-mt-20 border-t border-line px-6 py-24">
    <div class="mx-auto w-full max-w-6xl">
      <h2>关于我</h2>
      <div class="mt-12 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <div class="aspect-[4/5] ..."><img loading="lazy" ... /></div>
        <div class="space-y-5">三段简介</div>
      </div>
      <p class="mt-10 ...">混血哲谈</p>
    </div>
  </section>
  ```
- **理由**：左右 2:3 的网格在桌面把更多宽度留给文字；`md:` 以下自动退化为单列（照片在上、简介在下），满足窄屏堆叠要求；`scroll-mt-20` 与导航 `h-16` 对齐，沿用既有约定。关于我放在 `#contact` 之后，是页面最后一个 section，导航链接也置于末尾，DOM 顺序与视觉顺序一致。
- **替代方案**：`flex` + 固定宽度照片——在中间宽度需要额外断点控制，网格更直接。

### 3. 照片：4:5 容器 + `object-cover` + 原生懒加载

- **选择**：照片容器 `aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-line bg-line/40`，图片 `h-full w-full object-cover`，属性 `loading="lazy" decoding="async"`，`alt` 使用「站主照片」而非空值。
- **理由**：竖幅人像比例在左右布局中更自然；固定宽高比让懒加载前后不位移；`object-cover` 保证替换成任意比例真实照片时仍铺满容器、不拉伸。关于我位于页面末尾，懒加载不会影响首屏。
- **占位资源**：`src/assets/about/portrait.svg`，4:5（800×1000），渐变背景 + 抽象人像剪影 + 「PORTRAIT」标注，明确是占位图，避免被误认为最终视觉。
- **替代方案**：`<div>` 背景图——无法获得 `alt` 语义与原生懒加载，放弃。

### 4. 品牌标签用不可交互的 `<p>`

- **选择**：`<p className="... inline-flex rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted">混血哲谈</p>`。
- **理由**：spec 要求纯文本、不可聚焦、不被屏幕阅读器读作链接；`<p>` 天然满足。用徽标样式与正文区分，但不加 `role`、`tabIndex` 或点击处理。颜色用主题 token，亮/暗对比度均 ≥ 4.5:1。
- **替代方案**：`<span>` + `aria-label`——多余；`<button>` 会被误读为可操作，放弃。

### 5. 导航新增「关于」并压缩基础间距

- **选择**：`NAV_LINKS` 末尾追加 `{ href: '#about', label: '关于' }`；基础样式从 `px-3 gap-2` 收紧为 `px-2 gap-1`（列表与右侧组同理），`sm:` 以上恢复 `px-6 gap-5/6`。
- **理由**：四个链接在 320px 下按当前间距只剩约 10px 余量，不同字体渲染可能溢出；压缩后预估总宽约 258px，留出约 46px 余量。字号保持 `text-sm`，不牺牲可读性与对比度。焦点顺序自然变为品牌 → 首页 → 项目 → 联系我 → 关于 → 主题切换。
- **替代方案**：320px 下隐藏品牌名或链接——与 `site-navigation` 规范冲突（必须全部可见可用），放弃；改用 `text-xs`——能放下但可读性下降，作为兜底而非首选。

### 6. 复用现有锚点机制，不新增滚动实现

- **选择**：`#about` 使用与其它 section 相同的 `scroll-mt-20`；导航点击继续走 `handleAnchorClick`。`App.tsx` 在 `PlaceholderSection` 之后渲染 `AboutSection`。
- **理由**：平滑滚动、hash 同步、减弱动效与连续点击取消都已由 `smoothScroll.ts` 覆盖，新增 section 只需提供稳定 id。
- **注意**：归档同步时，`openspec/specs/site-navigation/spec.md` 的 Purpose 仍写着「首页、项目、联系我三个区域」，需在归档阶段直接改为四个区域（delta 不承载 Purpose 修改）。

## Risks / Trade-offs

- [320px 下四链接仍可能溢出] → 基础间距压缩到 `px-2 / gap-1`，实现后用真实视口测量 `scrollWidth` 与最右元素边界；若仍溢出，再降到 `text-xs`，不隐藏链接。
- [真实照片比例与 4:5 不符被裁切] → `object-cover` 以中心裁切，站主替换时应提供竖幅或主体居中的照片；占位图与注释标明推荐比例。
- [三段简介过长导致区域过高] → 文案由站主控制，布局不设高度上限；`space-y` 保证段间距，长文案自然撑开，不截断。
- [关于我排在联系我之后，访客可能误以为联系信息是终点] → 导航提供「关于」入口，且页面向下滚动自然出现；不额外加引导动画，避免违反既有动效约束。
- [导航顺序变化影响既有焦点顺序断言] → 同步更新 `site-navigation` delta 的焦点顺序要求，并在验证阶段逐项 Tab 走查。
- [占位人像被误认为真实照片] → SVG 内标注「PORTRAIT」占位字样 + 数据文件注释，replace 时只改一个 import。

## Migration Plan

纯前端静态站点，无数据与接口迁移：

1. `npm run lint`、`npm run build` 通过。
2. `npm run preview` 走查关于我布局、照片懒加载、品牌标签、导航四链接与 320px 窄屏。
3. 回滚策略：单次提交整体 revert；照片与数据都是新增文件，不涉及持久化结构。

## Open Questions

无。三段简介与照片的具体内容属于内容填充，apply 阶段先用占位文案与占位图落地，由站主替换；不改变规范、布局方式与任务拆分。
