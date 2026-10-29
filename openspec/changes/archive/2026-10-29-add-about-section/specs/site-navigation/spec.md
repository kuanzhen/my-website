## RENAMED Requirements

- FROM: `### Requirement: 导航栏提供三个页面内链接`
- TO: `### Requirement: 导航栏提供四个页面内链接`

## MODIFIED Requirements

### Requirement: 导航栏提供四个页面内链接

导航栏右侧 SHALL 依次提供「首页」「项目」「联系我」「关于」四个链接，分别指向 `#home`、`#projects`、`#contact`、`#about`。链接文字在亮/暗主题下的对比度 MUST 不低于 4.5:1，焦点状态 MUST 清晰可见。

#### Scenario: 正常渲染四个链接

- **GIVEN** 访客打开站点
- **WHEN** 导航栏渲染完成
- **THEN** 右侧依次出现「首页」「项目」「联系我」「关于」四个链接
- **AND** 四者的 `href` 分别指向 `#home`、`#projects`、`#contact`、`#about`

#### Scenario: 320px 窄屏下不溢出且链接仍可使用

- **GIVEN** 视口宽度为 320px
- **WHEN** 导航栏渲染完成
- **THEN** 品牌标识、四个链接与主题切换控件均完整显示，不出现横向溢出
- **AND** 四个链接均为可直接点击与键盘触达的可用状态，不被折叠或隐藏

#### Scenario: 两套主题下的链接可读性

- **GIVEN** 站点分别处于亮色与暗色主题
- **WHEN** 链接处于默认态与焦点态
- **THEN** 链接文字与导航栏底色的对比度不低于 4.5:1
- **AND** 焦点环在毛玻璃背景上清晰可见

### Requirement: 页面提供导航可定位的 section 锚点

页面 SHALL 提供 `#home`、`#projects`、`#contact`、`#about` 四个带有稳定 `id` 的 section。`#home` MUST 位于 Hero。`#projects` MUST 为真实项目展示区；`#contact` SHALL 为明确标注「内容待补充」的占位 section，且 MUST 至少占满一个视口高度；`#about` MUST 为页面末尾的真实「关于我」区域。

#### Scenario: 四个导航链接各自找到目标 section

- **GIVEN** 页面已渲染完成
- **WHEN** 分别访问 `#home`、`#projects`、`#contact`、`#about`
- **THEN** 每个 id 都能定位到页面中唯一对应的 section
- **AND** 不存在重复的 section id

#### Scenario: 项目 section 呈现真实内容

- **GIVEN** 页面已渲染完成
- **WHEN** 访客滚动到项目 section
- **THEN** 该 section 显示「项目」标题与不少于 4 张项目卡片
- **AND** 不出现「内容待补充」文案，也不呈现为空白占位

#### Scenario: 联系我 section 仍是明确的占位

- **GIVEN** 访客滚动到联系我 section
- **WHEN** 占位 section 渲染完成
- **THEN** 该 section 显示标题「联系我」
- **AND** 显示明确的「内容待补充」说明，不呈现为空白或误导性的完整内容

#### Scenario: 关于我 section 位于末尾并呈现真实内容

- **GIVEN** 页面已渲染完成
- **WHEN** 访客访问 `#about`
- **THEN** 该 section 位于联系我之后且是页面最后一个 section
- **AND** 显示「关于我」标题、站主照片、三段简介与品牌标签「混血哲谈」

#### Scenario: 占位 section 在两套主题下可读

- **GIVEN** 站点分别处于亮色与暗色主题
- **WHEN** 访客查看联系我占位 section
- **THEN** 标题与说明文字的对比度不低于 4.5:1
- **AND** 区块背景与页面整体配色一致，不出现突兀的色块

### Requirement: 导航栏内含可键盘访问的主题切换控件

主题切换控件 SHALL 位于导航栏右侧。键盘焦点顺序 MUST 为：品牌标识 → 首页 → 项目 → 联系我 → 关于 → 主题切换控件。焦点指示在毛玻璃背景上 MUST 清晰可见。

#### Scenario: 键盘焦点顺序

- **GIVEN** 访客只使用键盘操作
- **WHEN** 访客按 Tab 键依次移动焦点
- **THEN** 焦点按品牌标识、首页、项目、联系我、关于、主题切换控件的顺序移动
- **AND** 每一步的焦点指示都清晰可见

#### Scenario: 用键盘触发主题切换

- **GIVEN** 焦点位于主题切换控件
- **WHEN** 访客按 Enter 或空格
- **THEN** 主题按「跟随系统 → 亮色 → 暗色 → 跟随系统」循环切换
