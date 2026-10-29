# site-navigation Specification

## Purpose

定义站点顶部固定导航栏的结构、页面内锚点 section、平滑滚动切换、常驻毛玻璃背景与键盘访问行为，使访客在页面的任何位置都能快速在首页、项目、联系我、关于四个区域之间切换，并在亮/暗两套主题与受限环境下保持可读可用。

## Requirements

### Requirement: 导航栏固定在视口顶部

导航栏 SHALL 固定在视口顶部，页面滚动时始终可见。导航栏 MUST NOT 随内容滚动离开视口，也 MUST NOT 在文档流中占据高度而把下方内容向下推。

#### Scenario: 页面滚动时保持可见

- **GIVEN** 访客位于首页首屏
- **WHEN** 访客向下滚动页面
- **THEN** 导航栏仍完整位于视口顶部且可见
- **AND** 页面内容从导航栏下方经过，不被导航栏推开

#### Scenario: 首屏绘制后不出现位置跳变

- **GIVEN** 访客打开站点
- **WHEN** 首屏首次绘制完成
- **THEN** 导航栏已经在最终的固定位置
- **AND** 不出现导航栏从页面中部跳到顶部的过程

### Requirement: 导航栏左侧展示品牌标识

导航栏左侧 SHALL 展示站点主人姓名「寬真居士」作为品牌标识，且该标识 SHALL 可点击回到首页。标识文字在亮色与暗色主题下的对比度 MUST 不低于 4.5:1。

#### Scenario: 点击品牌标识回到首页

- **GIVEN** 访客已滚动到项目或联系我区域
- **WHEN** 访客点击导航栏左侧的姓名
- **THEN** 页面回到首页 Hero 区域
- **AND** 页面不刷新

#### Scenario: 品牌标识可被键盘触达

- **GIVEN** 访客只使用键盘操作
- **WHEN** 访客按 Tab 键从地址栏开始依次移动焦点
- **THEN** 焦点首先到达品牌标识，焦点指示清晰可见
- **AND** 按 Enter 可触发回到首页

#### Scenario: 两套主题下的标识可读性

- **GIVEN** 站点分别处于亮色与暗色主题
- **WHEN** 导航栏渲染完成
- **THEN** 品牌标识文字与导航栏底色的对比度不低于 4.5:1

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

### Requirement: 点击导航链接平滑滚动到目标 section

点击任一导航链接时，页面 SHALL 在不刷新的前提下平滑滚动到目标 section，且目标 section 的顶部 MUST NOT 被固定导航栏遮挡。地址栏 hash SHALL 与目标 section 同步。

#### Scenario: 正常点击链接

- **GIVEN** 访客位于首页
- **WHEN** 访客点击「项目」
- **THEN** 页面平滑滚动到 `#projects`
- **AND** 页面不发生刷新或重新加载
- **AND** 地址栏 hash 变为 `#projects`

#### Scenario: 目标顶部不被导航遮挡

- **GIVEN** 导航栏固定在视口顶部
- **WHEN** 滚动到 `#projects` 或 `#contact` 后停下
- **THEN** 目标 section 的标题完整可见
- **AND** 标题不被导航栏覆盖

#### Scenario: 连续快速点击多个链接

- **GIVEN** 访客在滚动过程中
- **WHEN** 连续点击「项目」再点击「联系我」
- **THEN** 页面最终停在 `#contact`
- **AND** 不出现停在两个目标之间的位置

#### Scenario: 长距离跳转的时长受上限约束

- **GIVEN** 访客位于页面末尾的关于我 section
- **WHEN** 访客点击「首页」
- **THEN** 页面在约 400ms 内平滑回到顶部
- **AND** 耗时与相邻 section 之间的短距离跳转接近，不因距离增加而明显变长

### Requirement: 导航栏使用常驻毛玻璃背景

导航栏 SHALL 始终使用半透明底色叠加背景模糊（`backdrop-filter`），使下方滚动内容呈模糊透出效果。亮色与暗色主题 MUST 各自适配。浏览器不支持 `backdrop-filter` 时，导航栏 MUST 回退为不透明底色，且文字对比度仍不低于 4.5:1。

#### Scenario: 滚动时下方内容模糊透出

- **GIVEN** 页面内容滚动到导航栏下方
- **WHEN** 访客观察导航栏背景
- **THEN** 导航栏背后可见下方内容，且该内容呈模糊状态
- **AND** 导航栏上的文字与链接保持清晰可读

#### Scenario: 浏览器不支持背景模糊

- **GIVEN** 访客的浏览器不支持 `backdrop-filter`
- **WHEN** 导航栏渲染完成
- **THEN** 导航栏以不透明底色呈现
- **AND** 文字与链接的对比度仍不低于 4.5:1

#### Scenario: 毛玻璃不阻碍导航自身交互

- **GIVEN** 导航栏使用背景模糊
- **WHEN** 访客点击导航栏内的链接或主题切换控件
- **THEN** 点击正常命中目标控件
- **AND** 不会因模糊层或伪元素遮挡而失效

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

### Requirement: 减弱动效时跳转不前滑

在访客启用「减弱动态效果」偏好时，点击导航链接 SHALL 直接定位到目标 section，不产生平滑滚动过程；毛玻璃的静态模糊效果 MUST NOT 被视为需要关停的动画。

#### Scenario: 减弱动效下的导航跳转

- **GIVEN** 访客的操作系统启用了"减弱动态效果"偏好
- **WHEN** 访客点击「联系我」
- **THEN** 页面立即定位到 `#contact`，不出现滚动动画
- **AND** 导航栏的毛玻璃背景仍然正常呈现