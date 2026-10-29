## Context

见 `proposal.md` 的 Why。当前实现是单页 React SPA：`index.html` 只含主题防闪烁脚本与 `<title>寬真居士</title>`，正文由 `#root` 在客户端渲染；构建由 Vite 完成，发布在 GitHub Pages 的项目路径 `/my-website/` 下。项目没有路由、SSR、预渲染，也没有 `react-helmet` 一类运行时管理 `<head>` 的依赖。

现有语义结构已经具备较好的基础：唯一的 `h1`、每个区域的 `h2`、项目卡片的 `h3`、`article`、带 `aria-label` 的 `nav`、图片 `alt`、装饰层 `aria-hidden`。缺口集中在页面级地标（没有 `<header>`）与 section 的可访问名称（三个 section 都没有 `aria-labelledby`）。本次设计只补齐这些缺口，不重构组件。

## Goals / Non-Goals

**Goals:**

- 让不执行 JavaScript 的抓取工具也能从初始 HTML 读到标题、描述、canonical、robots 策略、社交元数据与 `Person` 结构化数据。
- 在不引入新依赖、不改变视觉与交互的前提下，把页面骨架补成可被辅助技术正确导航的地标结构。
- 让 `robots.txt` 的交付与 GitHub Pages 子路径部署的真实抓取规则一致，不制造「文件存在但不起作用」的误解。

**Non-Goals:**

- 不实现按路由或按语言切换的动态 `<head>`；站点只有一页，静态元数据足够。
- 不引入 SSR、预渲染、静态导出或 `react-helmet`。
- 不生成 `sitemap.xml`、`og:image`，也不新增页脚、跳转到主内容的 skip link 或任何可见内容。
- 不修复 `vite.config.ts` 未设置 `base` 导致的 `/assets/...` 子路径 404，这是独立问题。

## Decisions

### 元数据直接写在 `index.html`，不用 React 管理

**决定**：标题、description、canonical、robots meta、Open Graph、Twitter Card 与 JSON-LD 全部写入 `index.html` 的 `<head>` 或 `<body>` 末尾，作为静态 HTML 交付。

**理由**：站点只有一页，元数据不随路由或交互变化。静态写入能保证抓取工具在 JS 执行前就拿到全部信号，也避免新增运行时依赖和 hydration 时序问题。

**备选方案**：

- `react-helmet-async` 或 `useEffect` 动态写入：会增加依赖，且不执行 JS 的抓取工具读不到，收益为零。
- Vite HTML transform 插件从数据文件注入：能做到单一数据源，但对单页站点属于过度设计；本次用注释与任务清单约束一致性。

### 标题与描述采用确定的文案

**决定**：

- `title`：`寬真居士 · 全栈工程师 | 个人品牌站`
- `description`：`寬真居士的个人品牌站：全栈工程师，喜欢儒释道传统文化，自认为是马列主义者的 AI coder。这里收录他的项目与思考。`
- `canonical` / `og:url` / JSON-LD `url`：`https://kuanzhen.github.io/my-website/`
- `og:site_name`：`寬真居士`；`og:locale`：`zh_CN`
- `og:type`：`website`
- `twitter:card`：`summary`

**理由**：标题同时覆盖姓名与职业，控制在 60 个字符内；描述控制在 50–160 个字符内，直接复用 Hero 的身份文案并补一句站点内容，避免与标题重复。`og:type` 选择 `website` 而不是 `profile`：`profile` 类型需要 `profile:first_name` / `profile:last_name` 等字段，对「寬真居士」这种法名没有合理拆分，且各平台支持度不一致；人名身份交给 JSON-LD `Person` 表达更准确。没有分享图时 `twitter:card` 必须是 `summary`，否则平台会尝试放大不存在的图片。

**备选方案**：`og:type=profile`；标题只写姓名。前者语义更细但字段拆分裂；后者信息量不足，搜索结果无法说明站点主题。

### JSON-LD `Person` 静态内联，并保持与页面文案一致

**决定**：在 `index.html` 中使用一段 `<script type="application/ld+json">`，声明 `@context`、`@type: Person`、`name`、`jobTitle`、`description`、`url`、`sameAs`（仅 `https://github.com/kuanzhen`）。

**理由**：静态内联让不执行 JS 的爬虫也能读取；`sameAs` 只有用户确认过的 GitHub 主页，不猜测其他平台。JSON 内容全部是站内常量，不包含 `</script>`，无需额外转义。

**备选方案**：在 React 组件中注入 `<script>`。React 对 `<script>` 的特殊处理与 hydration 顺序会让实现更脆弱，且对非 JS 爬虫无效。

### `robots.txt` 放在 `public/`，同时用 `meta[name="robots"]` 兜底

**决定**：新增 `public/robots.txt`，内容对 `User-agent: *`、`Googlebot`、`Googlebot-Image` 声明 `Allow: /`；页面同时声明 `<meta name="robots" content="index, follow">`。

**理由与部署约束**：robots.txt 协议规定爬虫只从域名根读取规则。GitHub Pages 项目站点的真实地址是 `https://kuanzhen.github.io/my-website/`，仓库里的 `public/robots.txt` 会发布到 `https://kuanzhen.github.io/my-website/robots.txt`，而 Googlebot 读取的是 `https://kuanzhen.github.io/robots.txt`。因此：

- `public/robots.txt` 是按需求交付的规范文件，在本项目迁移到自有域名或用户站点根目录后立即生效；
- 当前部署下真正生效的放行手段是页面内的 `meta[name="robots"]`（以及域名根没有禁止规则时「默认允许」）；
- 不把子路径 `robots.txt` 描述成「已被 Google 读取」，避免虚假的安全感。

**备选方案**：

- 只写 `public/robots.txt` 不写 meta：在项目子路径下等于没有放行声明，且文件也不被读取。
- 把 robots.txt 放进用户站点仓库：那不在本仓库范围内，无法作为本变更的交付物；已在风险中记录为站主需要自查的外部前提。

### 语义修正采用最小改动

**决定**：

- 在 `App.tsx` 中用 `<header>` 包裹 `<NavBar />`，`<header>` 不添加任何布局类；固定定位仍由 `nav` 自身承担。
- 给 Hero 的 `h1`、项目区、联系我占位区与关于我区的 `h2` 添加唯一 `id`（`hero-title`、`projects-title`、`contact-title`、`about-title`），四个 `<section>` 分别用 `aria-labelledby` 指向它们。
- 保留现有的 `nav aria-label="主导航"`、`article`、`ul/li`、`alt`、`aria-hidden` 与 `sr-only` 说明。
- 不新增 `<footer>`，不添加 skip link。

**理由**：`aria-labelledby` 复用页面上已经可见的标题，比重复写 `aria-label` 更不容易与文案脱节；`<header>` 包裹不改变布局，因为 `nav` 仍是 `position: fixed`。新增 `<footer>` 或 skip link 会带入可见内容或新的交互元素，超出本次范围。

**备选方案**：给每个 section 直接写 `aria-label`。实现更简单，但标题文案变更时需要同步两处，容易漂移。

### 一致性靠注释与验证清单，不引入工具

**决定**：在 `index.html` 的相关区块加简短注释，提示 `title`、description、canonical、OG、JSON-LD 需要同步修改；验证放在任务的构建后检查里，用 grep 与在线校验工具完成。

**理由**：当前只有一页，引入元数据生成脚本或测试框架的维护成本高于收益。未来出现多页或频繁改文案时，再考虑用 Vite 插件从单一数据源注入。

## Risks / Trade-offs

- **Google 不读取子路径 `robots.txt`** → 页面内 `meta[name="robots"]` 保证 `index, follow`；`robots.txt` 仍交付并在任务中验证其 200 响应；设计文档明确说明其在迁移到自有域名后才生效。若域名根 `robots.txt` 禁止了 `/my-website/`，页面无法自救，需要站主在用户站点仓库处理。
- **静态元数据重复，容易漂移** → `index.html` 内加同步注释，任务中包含「修改身份文案时逐项核对」的检查步骤；本次不引入生成工具。
- **`<header>` 包裹可能引入额外高度或滚动偏移** → `<header>` 不加布局类，导航保持 `fixed`；任务中比较包裹前后的首屏截图与 `scroll-mt` 定位。
- **JSON-LD 语法错误会影响富媒体结果** → 使用 schema.org 校验工具验证；JSON-LD 是 `application/ld+json`，语法错误不会执行，页面渲染和主题脚本不受影响。
- **`og:type=website` 对「个人身份」表达不如 `profile` 细** → 身份信息由 JSON-LD `Person` 承担；社交平台预览仍能正确显示姓名与简介。
- **无 JS 抓取工具看不到正文（SPA 固有限制）** → 元数据与 JSON-LD 已静态化；正文预渲染属于后续独立变更，本次明确不做。
- **既有 `base` 未配置问题会干扰上线验证** → 验证时区分「资源 404」与「SEO 元数据缺失」；本次不修改构建配置，但在任务中记录该前置问题的存在。
- **GitHub 主页 `sameAs` 可能不是站主最常用的身份入口** → 已由用户确认；后续如需增加主页，只改 `sameAs` 数组，不影响其他字段。

## Migration Plan

1. 修改 `index.html`、`public/robots.txt` 与语义相关的四个组件文件。
2. 运行 `npm run build`，检查 `dist/index.html` 中元数据、JSON-LD 与构建后的 `dist/robots.txt`。
3. 用 `npm run preview` 本地验证地标结构、标题层级与固定导航布局。
4. 部署后用 schema.org 校验器、Open Graph 调试工具与 Lighthouse SEO 复核。
5. 回滚策略：本次全部是静态元数据与无视觉影响的属性改动，按提交整体 revert 即可恢复原状；无数据迁移。

## Open Questions

无。
