## MODIFIED Requirements

### Requirement: 页面提供导航可定位的 section 锚点

页面 SHALL 提供 `#home`、`#projects`、`#contact` 三个带有稳定 `id` 的 section。`#home` MUST 位于 Hero。`#projects` MUST 为真实项目展示区，不再是「内容待补充」占位；`#contact` SHALL 仍为明确标注「内容待补充」的占位 section，且该占位 section MUST 至少占满一个视口高度，使跳转结果可被明显观察到。

#### Scenario: 三个导航链接各自找到目标 section

- **GIVEN** 页面已渲染完成
- **WHEN** 分别访问 `#home`、`#projects`、`#contact`
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

#### Scenario: 占位 section 在两套主题下可读

- **GIVEN** 站点分别处于亮色与暗色主题
- **WHEN** 访客查看联系我占位 section
- **THEN** 标题与说明文字的对比度不低于 4.5:1
- **AND** 区块背景与页面整体配色一致，不出现突兀的色块
