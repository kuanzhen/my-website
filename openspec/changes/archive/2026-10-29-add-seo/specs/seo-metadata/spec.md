## Purpose

定义个人品牌站文档级 SEO 元数据的取值、唯一性与长度边界，包括标题、描述、canonical、robots meta 与页面语言，使搜索引擎能准确识别站点主题与正式地址，并避免重复或相互冲突的元数据。

## ADDED Requirements

### Requirement: 文档标题唯一且描述站点身份

页面 MUST 有且仅有一个 `<title>`。标题 SHALL 同时包含站主姓名「寬真居士」与身份「全栈工程师」，长度 MUST NOT 超过 60 个字符，MUST NOT 使用「首页」「Welcome」「Untitled」等无信息量文案。

#### Scenario: 正常加载首页

- **GIVEN** 访客或爬虫请求站点首页
- **WHEN** HTML 文档被解析
- **THEN** 文档中存在且仅存在一个 `<title>`
- **AND** 标题同时包含「寬真居士」与「全栈工程师」

#### Scenario: 标题长度接近上限

- **GIVEN** 标题按规范填写为「寬真居士 · 全栈工程师 | 个人品牌站」
- **WHEN** 在搜索结果或浏览器标签页中展示
- **THEN** 标题长度不超过 60 个字符
- **AND** 姓名与身份不会被省略号截断

#### Scenario: 标题重复或为空

- **GIVEN** 页面被错误地写入两个 `<title>`，或标题内容为空
- **WHEN** 执行构建后元数据检查
- **THEN** 检查判定为不合规
- **AND** 必须修正为唯一且有内容的标题后才可发布

### Requirement: 页面提供唯一的描述元数据

页面 MUST 有且仅有一个 `<meta name="description">`，其 `content` SHALL 用一句完整的话概述站点主人与站点内容，长度 MUST 介于 50 与 160 个字符之间，MUST NOT 包含 HTML 标签、换行或关键词堆砌。

#### Scenario: 正常读取描述

- **GIVEN** 站点首页已构建
- **WHEN** 爬虫或社交平台读取 `<meta name="description">`
- **THEN** 页面上存在且仅存在一个 description meta
- **AND** 其内容包含「寬真居士」与「全栈工程师」，长度在 50 至 160 个字符之间
- **AND** 内容为纯文本，不包含 HTML 标签或换行

#### Scenario: 描述超过长度上限

- **GIVEN** description 的 `content` 超过 160 个字符
- **WHEN** 执行构建后元数据检查
- **THEN** 检查判定为不合规
- **AND** 必须精简到上限以内，而不是依赖搜索引擎自行截断

#### Scenario: 描述缺失或为空

- **GIVEN** 页面没有 description meta，或 `content` 为空字符串
- **WHEN** 爬虫读取页面元数据
- **THEN** 该页面不满足本要求
- **AND** 搜索引擎将只能自行截取正文作为摘要

### Requirement: canonical 指向唯一的正式地址

页面 MUST 有且仅有一个 `<link rel="canonical">`，其 `href` SHALL 为绝对 URL `https://kuanzhen.github.io/my-website/`，带结尾斜杠，MUST NOT 包含查询参数或 hash 片段。

#### Scenario: 正常声明 canonical

- **GIVEN** 站点首页已构建
- **WHEN** 解析页面中的 canonical 链接
- **THEN** 存在且仅存在一个 canonical 链接
- **AND** `href` 为 `https://kuanzhen.github.io/my-website/`

#### Scenario: 通过带 hash 的地址访问

- **GIVEN** 访客通过 `https://kuanzhen.github.io/my-website/#projects` 打开页面
- **WHEN** 爬虫读取 canonical
- **THEN** canonical 仍为不带 hash 的 `https://kuanzhen.github.io/my-website/`
- **AND** 页面内锚点不会被当作独立页面收录

#### Scenario: canonical 使用相对路径或空值

- **GIVEN** canonical 的 `href` 被写成相对路径、空字符串或带查询参数的地址
- **WHEN** 执行构建后元数据检查
- **THEN** 检查判定为不合规
- **AND** 必须修正为带结尾斜杠的绝对 URL

### Requirement: robots meta 明确放行索引

页面 MUST 有且仅有一个 `<meta name="robots">`，其内容 SHALL 包含 `index` 与 `follow`，MUST NOT 包含 `noindex` 或 `nofollow`，可选包含 `max-image-preview:large`。

#### Scenario: 正常声明索引策略

- **GIVEN** 站点首页已构建
- **WHEN** 爬虫读取 `meta[name="robots"]`
- **THEN** 存在且仅存在一个 robots meta
- **AND** 内容包含 `index` 与 `follow`
- **AND** 内容不包含 `noindex` 或 `nofollow`

#### Scenario: robots meta 与 robots.txt 同时存在

- **GIVEN** 页面既有 robots meta，又存在 `public/robots.txt`
- **WHEN** 爬虫同时读取两者
- **THEN** 两者都不阻止首页与静态资源被抓取
- **AND** 不存在任何一处声明 `noindex` 或 `Disallow: /`

### Requirement: 页面根元素声明正确语言

`<html>` 元素 MUST 声明 `lang="zh-CN"`，且页面 MUST NOT 声明多个互相冲突的 `lang` 值。正文中的英文技术术语与 GitHub 链接不需要单独声明语言。

#### Scenario: 辅助技术与翻译服务读取语言

- **GIVEN** 页面已构建
- **WHEN** 屏幕阅读器或浏览器翻译服务读取文档语言
- **THEN** 根元素的 `lang` 为 `zh-CN`
- **AND** 页面中不存在与之冲突的根级语言声明

#### Scenario: 正文含英文术语

- **GIVEN** 页面正文包含「AI coder」「GitHub」等英文术语
- **WHEN** 读取根元素语言
- **THEN** 根元素仍为 `zh-CN`
- **AND** 不为单个英文术语添加会改变整页语言的声明
