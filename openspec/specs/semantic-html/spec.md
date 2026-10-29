# semantic-html Specification

## Purpose

定义个人品牌站的页面地标、区域名称、标题层级与交互元素语义标准，使屏幕阅读器、键盘用户与不执行脚本的爬虫都能正确理解页面结构，同时确保语义修正不改变任何视觉呈现与交互行为。

## Requirements

### Requirement: 页面提供完整且唯一的地标结构

页面 MUST 提供一个页面级 `<header>`（banner 地标）包裹顶部导航，MUST 提供一个 `<nav>` 地标且带有可访问名称，MUST 有且仅有一个 `<main>` 地标容纳全部正文内容。MUST NOT 出现重复的 banner 或 main 地标。

#### Scenario: 屏幕阅读器列出地标

- **GIVEN** 访客使用屏幕阅读器打开站点
- **WHEN** 调出页面地标列表
- **THEN** 依次出现 banner、导航与 main 地标
- **AND** 导航地标的名称为「主导航」
- **AND** 页面中只有一个 main 地标

#### Scenario: 固定导航包裹后布局不变

- **GIVEN** 顶部导航被 `<header>` 包裹
- **WHEN** 页面首次绘制并滚动
- **THEN** 导航仍固定在视口顶部，不占据文档流高度
- **AND** 下方内容的起始位置与包裹前一致，不产生额外空白

#### Scenario: 出现重复地标

- **GIVEN** 页面中出现两个 top-level `<header>` 或两个 `<main>`
- **WHEN** 执行语义审查
- **THEN** 审查判定为不合规
- **AND** 必须合并或降级为普通容器后才可发布

### Requirement: 每个内容 section 具有可访问名称

页面中每个顶层 `<section>` MUST 通过 `aria-labelledby` 关联自身标题，或通过 `aria-label` 提供名称。`#home`、`#projects`、`#contact`、`#about` 四个 section 的名称 SHALL 分别为「寬真居士」「项目」「联系我」「关于我」。用于 `aria-labelledby` 的标题 MUST 具有页面内唯一的 `id`。

#### Scenario: 屏幕阅读器列出区域

- **GIVEN** 页面已渲染
- **WHEN** 屏幕阅读器在区域之间跳转
- **THEN** 四个区域分别被读出「寬真居士」「项目」「联系我」「关于我」
- **AND** 不会出现无名区域或重复名称

#### Scenario: 标题 id 重复

- **GIVEN** 两个标题使用了相同的 `id`，或多个 section 指向同一个 `id`
- **WHEN** 执行语义审查
- **THEN** 审查判定为不合规
- **AND** 必须为每个标题分配唯一 `id` 后才可发布

#### Scenario: 新增无标题 section（边界）

- **GIVEN** 后续变更新增一个没有标题元素的内容 section
- **WHEN** 该 section 渲染
- **THEN** 它必须通过 `aria-label` 提供名称
- **AND** 不得以无名 section 的形式出现在辅助技术的区域列表中

### Requirement: 标题层级连续且不跳级

页面 MUST 有且仅有一个 `<h1>`，其内容为站主姓名「寬真居士」。项目展示区、联系我占位区与关于我区域的标题 MUST 为 `<h2>`，项目卡片名称 MUST 为 `<h3>`。标题层级 MUST NOT 跳级，MUST NOT 为了视觉样式而使用标题元素。

#### Scenario: 文档大纲连续

- **GIVEN** 页面已渲染
- **WHEN** 生成文档大纲
- **THEN** 大纲从唯一的 `h1` 开始，下接三个 `h2`，项目卡片为 `h3`
- **AND** 不存在从 `h1` 直接跳到 `h3` 的情况

#### Scenario: 项目卡片标题

- **GIVEN** 项目展示区渲染了 4 张卡片
- **WHEN** 检查每张卡片的名称元素
- **THEN** 四个名称均为 `h3`，且与区域标题的 `h2` 形成父子关系
- **AND** 不会出现第二个 `h1`

#### Scenario: 为视觉字号使用标题（边界）

- **GIVEN** 某个非标题文本为了放大字号而被写成 `<h2>` 或 `<h3>`
- **WHEN** 执行语义审查
- **THEN** 审查判定为不合规
- **AND** 必须改用非标题元素并保留原有视觉样式

### Requirement: 交互元素、图片与装饰层语义正确

导航链接、Hero CTA 与项目 GitHub 链接 MUST 使用原生 `<a>`；主题切换 MUST 使用原生 `<button>` 并提供可访问名称与当前状态；在新标签页打开的外链 MUST 让辅助技术知晓。内容图片 MUST 提供描述性 `alt`，纯装饰的渐变层、粒子 Canvas 与遮罩 MUST 对辅助技术隐藏且不可聚焦。

#### Scenario: 屏幕阅读器读取交互元素名称

- **GIVEN** 访客使用屏幕阅读器浏览页面
- **WHEN** 焦点依次经过品牌标识、导航链接、主题切换、CTA 与 GitHub 链接
- **THEN** 每个元素都有可辨识的名称
- **AND** 主题切换会读出当前主题与切换后的主题
- **AND** GitHub 链接会提示将在新标签页打开

#### Scenario: 装饰层不进入无障碍树

- **GIVEN** Hero 渲染了渐变背景、粒子 Canvas 与可读性遮罩
- **WHEN** 屏幕阅读器读取页面内容
- **THEN** 这些装饰层不会被朗读
- **AND** Canvas 不在 Tab 顺序中

#### Scenario: 内容图片缺少替代文本

- **GIVEN** 项目截图没有 `alt`，或 `alt` 为空
- **WHEN** 执行语义审查
- **THEN** 审查判定为不合规
- **AND** 必须补充与项目名称可辨识的描述性替代文本

### Requirement: 语义修正不改变视觉与交互行为

本次语义修正 MUST NOT 改变布局、配色、动画、主题行为、Tab 顺序或新增可见内容。新增的 `<header>` 包裹、`aria-labelledby`、`id` 与其他可访问性属性 MUST 在视觉上不产生位移或额外高度。

#### Scenario: 修正前后视觉一致

- **GIVEN** 语义修正前后的构建产物分别在相同视口下渲染
- **WHEN** 对比首屏、项目区与联系我占位区的截图
- **THEN** 布局、字号、配色与间距保持一致
- **AND** 没有新增可见文字或元素

#### Scenario: Tab 顺序保持不变

- **GIVEN** 访客只使用键盘
- **WHEN** 从地址栏开始按 Tab 移动焦点
- **THEN** 焦点顺序仍为品牌标识 → 首页 → 项目 → 联系我 → 关于 → 主题切换 → CTA → 各项目 GitHub 链接
- **AND** 语义修正没有引入新的可聚焦元素

#### Scenario: 首屏主题脚本不受影响（边界）

- **GIVEN** 页面头部已新增 SEO 元数据与 JSON-LD
- **WHEN** 暗色偏好访客冷启动页面
- **THEN** 主题判定脚本仍先于首屏绘制执行，不出现亮色闪烁
- **AND** JSON-LD 或其他新增标签不会阻塞或改变主题判定结果
