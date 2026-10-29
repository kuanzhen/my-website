## MODIFIED Requirements

### Requirement: Hero 提供指向项目的 CTA

Hero SHALL 在自我介绍下方提供一个文案为「我的项目」的 CTA，指向页面内锚点 `#projects`。点击该 CTA MUST 复用站点既有的平滑滚动机制滚动到项目展示区，MUST NOT 跳转站外、MUST NOT 打开新标签页、MUST NOT 刷新页面，地址栏 hash SHALL 同步为 `#projects`。CTA MUST 始终可点击，不再依赖外部链接是否配置，也不得出现 `target="_blank"` 或「在新标签页打开」的辅助说明。

#### Scenario: 正常点击 CTA

- **GIVEN** 访客位于首页首屏
- **WHEN** 访客点击「我的项目」
- **THEN** 页面平滑滚动到 `#projects` 项目展示区
- **AND** 当前页面不刷新、不打开新标签页
- **AND** 地址栏 hash 变为 `#projects`

#### Scenario: 目标顶部不被导航遮挡

- **GIVEN** 导航栏固定在视口顶部
- **WHEN** CTA 触发的滚动结束
- **THEN** 项目展示区的标题完整可见
- **AND** 标题不被导航栏覆盖

#### Scenario: 用键盘触达 CTA

- **GIVEN** 访客只使用键盘操作
- **WHEN** 访客按 Tab 键移动焦点
- **THEN** 焦点在主题切换控件之后到达 CTA，焦点指示清晰可见
- **AND** 按 Enter 可触发滚动到项目展示区

#### Scenario: 减弱动效下的 CTA 跳转

- **GIVEN** 访客的操作系统启用了「减弱动态效果」偏好
- **WHEN** 访客点击「我的项目」
- **THEN** 页面立即定位到 `#projects`，不出现滚动动画
- **AND** 地址栏 hash 同样同步为 `#projects`

#### Scenario: 两套主题下的按钮可读性

- **GIVEN** 站点分别处于亮色与暗色主题
- **WHEN** CTA 渲染完成
- **THEN** 按钮文字与按钮底色的对比度不低于 4.5:1
- **AND** 焦点环在按钮底色与渐变背景上都清晰可见
