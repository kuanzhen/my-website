## 1. 文档级 SEO 元数据

- [x] 1.1 将 `index.html` 的 `<title>` 改为 `寬真居士 · 全栈工程师 | 个人品牌站`，并确认全页只有一个 `<title>`
- [x] 1.2 在 `<head>` 中加入唯一的 `<meta name="description">`，内容为 `寬真居士的个人品牌站：全栈工程师，喜欢儒释道传统文化，自认为是马列主义者的 AI coder。这里收录他的项目与思考。`，核对长度在 50–160 个字符之间
- [x] 1.3 加入 `<link rel="canonical" href="https://kuanzhen.github.io/my-website/" />`，确认是带结尾斜杠的绝对 URL、不含 query 或 hash
- [x] 1.4 加入 `<meta name="robots" content="index, follow, max-image-preview:large" />`，确认没有 `noindex` 或 `nofollow`
- [x] 1.5 确认 `<html lang="zh-CN">` 保留且没有重复语言声明，并在 `<head>` 中加注释提醒 title、description、canonical 需要同步修改

## 2. 社交身份元数据

- [x] 2.1 加入 Open Graph 六个基础字段：`og:title`、`og:description`、`og:type=website`、`og:url`、`og:site_name=寬真居士`、`og:locale=zh_CN`，确认每个字段只出现一次且 `og:url` 与 canonical 一致
- [x] 2.2 加入 Twitter Card 三个字段：`twitter:card=summary`、`twitter:title`、`twitter:description`，确认没有 `twitter:image`、没有 `summary_large_image`、没有虚构账号
- [x] 2.3 在 `index.html` 末尾加入 `application/ld+json` 的 `Person` 结构化数据，包含 `name`、`jobTitle`、`description`、`url`、`sameAs: ["https://github.com/kuanzhen"]`
- [x] 2.4 用本地 JSON 解析确认 JSON-LD 语法有效，并逐项核对 OG、Twitter Card、JSON-LD 中的姓名、职业、简介与页面 `PROFILE` 文案一致

## 3. robots.txt

- [x] 3.1 新建 `public/robots.txt`，对 `User-agent: *`、`Googlebot`、`Googlebot-Image` 声明 `Allow: /`，不出现 `Disallow: /` 或屏蔽 `/assets/` 的规则，并加注释说明该文件在 `kuanzhen.github.io/my-website/` 路径下的读取限制
- [x] 3.2 运行 `npm run build`，确认 `dist/robots.txt` 存在且内容与 `public/robots.txt` 一致
- [x] 3.3 用 `curl` 或本地预览请求 `/robots.txt`，确认返回 200 且内容类型为 `text/plain`

## 4. 语义化 HTML 审查与修正

- [x] 4.1 按审查清单核对现有组件：唯一 `h1`、`h2`/`h3` 层级、`nav aria-label`、`article`、`ul/li`、图片 `alt`、外链 `rel` 与新标签页提示、装饰层 `aria-hidden`，记录需要修改与无需修改的项
- [x] 4.2 在 `src/App.tsx` 中用不带布局类的 `<header>` 包裹 `<NavBar />`，确认导航仍由 `nav` 的 `fixed` 定位，不占据文档流高度
- [x] 4.3 给 `Hero` 的 `h1` 添加 `id="hero-title"` 并给其 `<section>` 添加 `aria-labelledby="hero-title"`
- [x] 4.4 给 `ProjectSection` 的 `h2` 添加 `id="projects-title"` 并给其 `<section>` 添加 `aria-labelledby="projects-title"`
- [x] 4.5 给 `PlaceholderSection` 的 `h2` 添加唯一 `id`（联系我使用 `contact-title`）并给其 `<section>` 添加对应的 `aria-labelledby`
- [x] 4.6 给 `AboutSection` 的 `h2` 添加 `id="about-title"` 并给其 `<section>` 添加 `aria-labelledby="about-title"`
- [x] 4.7 处理 4.1 中发现的其他语义问题；若无需修改，逐项说明原因，不新增页脚、skip link 或任何可见内容
- [x] 4.8 运行 `npm run dev` 或 `npm run preview`，确认地标列表为 banner → 主导航 → main，四个区域名称正确，Tab 顺序与修改前一致

## 5. 构建与验收

- [x] 5.1 运行 `npm run lint` 与 `npm run build`，确认无新增 lint 或 TypeScript 错误
- [x] 5.2 检查 `dist/index.html`：title、description、canonical、robots meta、OG、Twitter Card、JSON-LD 均存在且无重复
- [x] 5.3 用 schema.org 校验工具或 Google 富媒体搜索结果测试验证 `Person` 结构化数据可解析
- [x] 5.4 用 Open Graph 调试工具与 X Card 校验器确认链接预览标题、描述正确，且无破图
- [x] 5.5 在亮色与暗色主题下对比首屏、项目区、联系我占位区的修改前后截图，确认布局、配色、动画与滚动定位没有变化
- [x] 5.6 运行 Lighthouse SEO 审计，记录评分与剩余问题；单独确认 `/assets/...` 子路径 404 属于既有构建配置问题，不归入本次变更

> 验证备注（2026-10-29）：Lighthouse SEO 得分 100。5.3 / 5.4 的在线校验入口（schema.org validator、Google Rich Results Test、各平台 OG 调试器）需要公网可访问的部署地址，本次在本地完成等价的 JSON-LD 解析与字段断言、OG / Twitter 字段一致性检查；部署后仍应在这些工具中复验一次。
