## Why

站点目前只有一个 `<title>`，缺少 description、canonical、社交预览与结构化数据；搜索引擎与社交平台只能看到「寬真居士」四个字，无法判断这个站点属于谁、提供什么。同时页面缺少 `<header>` 地标，各 section 也没有可访问名称，语义化 HTML 尚未经过系统审查。本次变更补齐基础 SEO 与社交身份信号，并把现有语义结构固化为可验证的要求。

## What Changes

- 在 `index.html` 中补齐文档级 SEO 元数据：描述性 `title`、`meta[name="description"]`、`link[rel="canonical"]`、`meta[name="robots"]`（`index, follow`）。
- 添加 Open Graph 与 Twitter Card 元数据，使微信、Telegram、Slack、X 等平台能生成正确的链接预览；本次不提供 `og:image`。
- 添加 schema.org `Person` 结构化数据（JSON-LD），声明姓名、职业、简介与站点 URL，并通过 `sameAs` 关联 GitHub 主页 `https://github.com/kuanzhen`。
- 新增 `public/robots.txt`，显式允许通用爬虫与 Googlebot 抓取；同时用 `meta[name="robots"]` 作为实际生效的放行手段（原因见 Impact）。
- 审查并修正语义化 HTML：补 `<header>` 地标、为三个 section 关联标题作为可访问名称、核对标题层级、图片替代文本、链接可辨识名称与装饰元素的辅助技术隐藏。
- 不改变任何视觉设计、布局、动画或主题行为。

## Capabilities

### New Capabilities

- `seo-metadata`：文档级 SEO 元数据（`title`、`description`、`canonical`、`robots` meta、`lang`）的取值规则、唯一性与验证标准。
- `social-identity`：Open Graph、Twitter Card 与 JSON-LD `Person` 结构化数据的内容、格式和降级规则，以及 `sameAs` 的收录边界。
- `crawl-indexing`：`robots.txt` 的允许规则、`meta[name="robots"]` 兜底，以及 GitHub Pages 子路径部署带来的可抓取性约束。
- `semantic-html`：页面地标、section 可访问名称、标题层级、图片替代文本与链接语义的审查标准。

### Modified Capabilities

（无。现有 `hero-section`、`project-section`、`site-navigation`、`theme-switching` 的行为要求保持不变；本次只新增文档级与页面骨架级要求。）

## Impact

- 代码：`index.html`（元数据与 JSON-LD）、`public/robots.txt`（新增）、`src/App.tsx`、`src/components/Navigation/NavBar.tsx`、`src/components/Hero/Hero.tsx`、`src/components/sections/ProjectSection.tsx`、`src/components/sections/PlaceholderSection.tsx`、`src/components/sections/AboutSection.tsx`（地标与 `aria-labelledby`）。
- 依赖：无新增运行时或构建依赖。
- 现有功能：主题防闪烁脚本、固定导航、平滑滚动、项目卡片悬浮与粒子动画均不受影响；语义修正不得改变视觉呈现与 Tab 顺序。
- 部署约束：GitHub Pages 的项目站点（`https://kuanzhen.github.io/my-website/`）只从域名根 `/robots.txt` 读取爬虫规则，仓库内的 `public/robots.txt` 发布会落在 `/my-website/robots.txt`，Google 不会抓取该位置。因此本变更中真正生效的放行手段是 `meta[name="robots"]`；`robots.txt` 仍按要求交付，并在 `design.md` 中记录该限制。
- 既有风险（本次不处理）：`vite.config.ts` 未设置 `base`，构建产物的 `/assets/...` 根绝对路径在子路径部署下会 404，与 SEO 元数据的绝对 URL 无关。

## Out of Scope

- 不制作或接入 `og:image`、Twitter 大图卡片及任何分享图。
- 不生成 `sitemap.xml`，不向 Google Search Console 提交站点或站点地图。
- 不引入 SSR、预渲染或静态导出；无 JS 环境下仍看不到正文。
- 不新增页脚、联系信息、社交链接按钮或其他可见内容。
- 不修改视觉设计、配色、动画与主题逻辑。
- 不做关键词研究、正文改写、性能优化（LCP/CLS）与多页面路由。
