# crawl-indexing Specification

## Purpose

定义站点对搜索引擎爬虫的放行规则与 GitHub Pages 子路径部署下的可索引性保障，确保首页、页面锚点与静态资源不会被 robots 规则误伤，并明确哪些放行手段在本部署结构下真正生效。

## Requirements

### Requirement: robots.txt 允许通用爬虫与 Googlebot

仓库 MUST 在 `public/robots.txt` 提供爬虫规则，使站点路径 `https://kuanzhen.github.io/my-website/robots.txt` 返回 200 且内容为纯文本。规则 MUST 对 `User-agent: *` 与 `User-agent: Googlebot` 声明 `Allow: /`，MUST NOT 出现 `Disallow: /`，并 MUST NOT 屏蔽 `/assets/`、`/favicon.svg` 等资源路径。

#### Scenario: 爬虫读取 robots.txt

- **GIVEN** 站点已部署到 GitHub Pages
- **WHEN** 请求 `https://kuanzhen.github.io/my-website/robots.txt`
- **THEN** 返回 200，内容类型为 `text/plain`
- **AND** 规则对通用爬虫与 Googlebot 均允许抓取全站

#### Scenario: 规则误伤静态资源

- **GIVEN** `robots.txt` 中出现 `Disallow: /assets/` 或 `Disallow: /`
- **WHEN** 执行部署前检查
- **THEN** 检查判定为不合规
- **AND** 必须移除该规则后才可发布

#### Scenario: robots.txt 文件缺失

- **GIVEN** 构建产物中不存在 `robots.txt`
- **WHEN** 部署前检查构建产物
- **THEN** 检查判定为不合规
- **AND** 必须将文件放入 `public/` 并重新构建

### Requirement: 子路径部署下仍保证页面可索引

由于 GitHub Pages 只从域名根 `/robots.txt` 读取爬虫规则，站点 MUST NOT 依赖 `/my-website/robots.txt` 作为唯一的放行手段。页面 MUST 通过 `<meta name="robots" content="index, follow">` 声明可索引，且 HTML 响应与页面中 MUST NOT 出现 `noindex`、`nofollow` 或等效的阻止索引指令。

#### Scenario: Google 只读取域名根 robots.txt

- **GIVEN** Googlebot 按协议只请求 `https://kuanzhen.github.io/robots.txt`
- **WHEN** 该地址没有为本项目提供规则或返回 404
- **THEN** 爬虫默认允许抓取，子路径 robots.txt 不参与判定
- **AND** 页面自身的 robots meta 仍声明 `index, follow`

#### Scenario: 页面被误加阻止索引指令

- **GIVEN** 页面中出现 `noindex` 或 `nofollow`，或响应头带有阻止索引的 `X-Robots-Tag`
- **WHEN** 执行部署前检查
- **THEN** 检查判定为不合规
- **AND** 必须移除阻止索引的指令后才可发布

#### Scenario: 域名根 robots.txt 禁止本项目路径（边界）

- **GIVEN** 站主的用户站点仓库在 `https://kuanzhen.github.io/robots.txt` 中写入了 `Disallow: /my-website/`
- **WHEN** Googlebot 读取域名根规则
- **THEN** 页面内的 robots meta 无法覆盖该禁止规则，页面仍会被排除
- **AND** 必须在用户站点仓库中修改根 robots.txt，本项目无法单独解决

### Requirement: 页面内链接使用可抓取的普通链接

站内导航、Hero CTA 与项目 GitHub 链接 MUST 使用带真实 `href` 的原生 `<a>` 元素，MUST NOT 仅依赖 JavaScript 点击事件才能到达目标。页面内锚点链接的 `href` SHALL 指向已存在的 `#home`、`#projects`、`#contact`、`#about`。

#### Scenario: 不执行脚本的爬虫解析链接

- **GIVEN** 抓取工具不执行 JavaScript
- **WHEN** 解析页面 HTML 中的 `<a>` 元素
- **THEN** 导航与 CTA 链接均带有可解析的 `href`
- **AND** 页面内锚点的 `href` 指向页面中存在的 section id

#### Scenario: 链接仅有点击事件

- **GIVEN** 某个导航项被实现为没有 `href` 的 `<a>` 或 `<div>`
- **WHEN** 执行构建后语义检查
- **THEN** 检查判定为不合规
- **AND** 必须改为带 `href` 的原生链接
