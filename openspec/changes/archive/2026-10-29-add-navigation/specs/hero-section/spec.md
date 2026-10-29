## MODIFIED Requirements

### Requirement: 粒子层的动态受严格限制

粒子 SHALL 只允许缓慢漂移这一种运动形式。Hero 自身 MUST NOT 实现入场动画、滚动触发动画或渐变色块的流动。由顶部导航触发的页面级平滑滚动属于 `site-navigation` 规范定义的行为，不受本条限制。

#### Scenario: 除漂移外无其他动画

- **GIVEN** 访客停留在首页并上下滚动
- **WHEN** 页面滚动或首次进入
- **THEN** 除粒子缓慢漂移外，没有任何元素出现位移、缩放、淡入或渐变色块流动

#### Scenario: 导航触发的滚动不改变 Hero 内容

- **GIVEN** 访客点击导航栏中的链接
- **WHEN** 页面平滑滚动经过 Hero 区域
- **THEN** Hero 内的文字与背景不出现入场、位移或缩放动画
- **AND** 只有粒子继续缓慢漂移

## REMOVED Requirements

### Requirement: Hero 内的切换控件可被键盘访问

**Reason**: 本变更将主题切换控件从 Hero 右上角移入顶部导航栏，Hero 内不再提供该控件，原需求失去对象。

**Migration**: 控件迁入导航栏后，键盘可访问性与焦点顺序改由 `site-navigation` 的「导航栏内含可键盘访问的主题切换控件」覆盖；可访问名称与主题状态播报仍由 `theme-switching` 的「切换控件暴露当前主题状态」覆盖。
