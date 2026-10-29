# social-identity Specification

## Purpose

定义站点在社交平台与搜索引擎中的身份呈现，包括 Open Graph、Twitter Card 与 schema.org `Person` 结构化数据，使链接被分享时能正确显示站主姓名与简介，并使搜索引擎能把站点与同一个真人身份关联起来。

## Requirements

### Requirement: 提供完整的 Open Graph 基础字段

页面 MUST 为 `og:title`、`og:description`、`og:type`、`og:url`、`og:site_name`、`og:locale` 各提供且仅提供一个 meta 属性。`og:type` MUST 为 `website`，`og:site_name` MUST 为「寬真居士」，`og:locale` MUST 为 `zh_CN`，`og:url` MUST 与 canonical 一致，`og:title` 与 `og:description` MUST 与文档标题、description 保持一致。

#### Scenario: 社交平台读取链接预览

- **GIVEN** 包含站点地址的消息被粘贴到微信、Telegram 或 Slack
- **WHEN** 平台抓取页面 Open Graph 元数据
- **THEN** 预览标题为站点标题，描述为页面 description
- **AND** 六个基础字段各出现一次，没有重复或冲突

#### Scenario: 未提供分享图

- **GIVEN** 本次变更不提供 `og:image`
- **WHEN** 社交平台抓取 Open Graph 元数据
- **THEN** 页面不存在指向不存在资源的 `og:image`
- **AND** 平台退化为纯文字预览，不出现破图或空白图片位

#### Scenario: Open Graph 与文档元数据不一致

- **GIVEN** 页面标题或 description 已更新，但 Open Graph 仍保留旧文案
- **WHEN** 执行构建后元数据检查
- **THEN** 检查判定为不合规
- **AND** 必须让两处文案恢复一致后才可发布

### Requirement: 提供与无图状态匹配的 Twitter Card

页面 MUST 为 `twitter:card`、`twitter:title`、`twitter:description` 各提供且仅提供一个 meta 属性。`twitter:card` MUST 为 `summary`，MUST NOT 使用需要大图的 `summary_large_image`。MUST NOT 虚构 `twitter:site` 或 `twitter:creator` 账号。

#### Scenario: 在 X 上分享链接

- **GIVEN** 站点地址被发布到 X
- **WHEN** X 抓取 Twitter Card 元数据
- **THEN** 展示 `summary` 类型的文字卡片
- **AND** 卡片标题与描述和页面一致

#### Scenario: 无图却声明大图卡片

- **GIVEN** 页面没有 `twitter:image`，却声明 `twitter:card` 为 `summary_large_image`
- **WHEN** 执行构建后元数据检查
- **THEN** 检查判定为不合规
- **AND** 必须改为 `summary`，或不使用大图卡片类型

#### Scenario: 重复声明卡片类型

- **GIVEN** 页面中出现两个 `twitter:card` meta
- **WHEN** 平台解析元数据
- **THEN** 无法保证采用哪一个值，预览可能不符合预期
- **AND** 构建后检查必须将重复声明判定为不合规

### Requirement: 提供可解析的 Person 结构化数据

页面 MUST 在初始 HTML 响应中包含一段 `application/ld+json` 结构化数据，使用 `https://schema.org` 作为 `@context`，`@type` 为 `Person`，并包含 `name`、`jobTitle`、`description`、`url` 与 `sameAs`。`name` MUST 为「寬真居士」，`jobTitle` MUST 为「全栈工程师」，`url` MUST 与 canonical 一致，`sameAs` MUST 为数组且只包含绝对 `https` 地址。

#### Scenario: 结构化数据校验通过

- **GIVEN** 站点首页已构建
- **WHEN** 使用 schema.org 校验工具或富媒体搜索结果测试解析页面
- **THEN** `Person` 对象可被解析，没有语法错误
- **AND** `name`、`jobTitle`、`description`、`url` 与页面上可见的身份信息一致

#### Scenario: sameAs 收录 GitHub 主页

- **GIVEN** 站主的 GitHub 主页为 `https://github.com/kuanzhen`
- **WHEN** 解析 `sameAs` 数组
- **THEN** 数组中包含 `https://github.com/kuanzhen`
- **AND** 数组中没有空字符串、相对路径或占位地址

#### Scenario: 结构化数据出现在初始 HTML 中

- **GIVEN** 抓取工具不执行 JavaScript
- **WHEN** 请求站点首页并读取原始 HTML
- **THEN** `application/ld+json` 脚本已经存在于响应中
- **AND** 不依赖页面渲染完成后由脚本注入

#### Scenario: 结构化数据语法错误

- **GIVEN** `application/ld+json` 内容存在 JSON 语法错误
- **WHEN** 浏览器加载页面
- **THEN** 页面正文、主题切换与导航仍正常工作
- **AND** 校验工具报告该结构化数据不可用，必须修复后才可发布

### Requirement: 社交身份数据与页面内容保持同源一致

Open Graph、Twitter Card 与 JSON-LD 中的姓名、职业与简介 MUST 与页面渲染的身份信息一致。主题切换、语言环境或访问设备的变化 MUST NOT 改变这些元数据。

#### Scenario: 修改身份文案后重新构建

- **GIVEN** 站主修改了姓名、职业或一句话简介
- **WHEN** 重新构建并检查页面
- **THEN** 页面正文、OG、Twitter Card 与 JSON-LD 同时呈现新文案
- **AND** 不存在任何一处残留旧文案

#### Scenario: 切换主题或更换设备

- **GIVEN** 访客在亮色主题下访问，随后切换为暗色主题
- **WHEN** 对比切换前后页面头部的元数据
- **THEN** 所有社交身份元数据保持不变
- **AND** 不会因为主题状态而增减 meta 标签
