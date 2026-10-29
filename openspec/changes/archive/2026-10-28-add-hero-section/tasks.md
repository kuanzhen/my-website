> 执行约定：严格按 Phase 顺序执行；每个 Phase 结束后暂停，总结变更并等待确认后再进入下一个 Phase。

## 1. 主题机制基础

- [x] 1.1 在 `src/index.css` 的 `@import "tailwindcss";` 之后声明 `@custom-variant dark (&:where(.dark, .dark *));`，确认声明顺序正确
- [x] 1.2 在 `src/index.css` 中为 `:root` 与 `.dark` 分别定义主题 token（背景、文字、渐变、粒子色），并设置 `color-scheme`
- [x] 1.3 新建 `src/lib/theme.ts`：实现 `'system' | 'light' | 'dark'` 的读取、写入与系统解析，所有 `localStorage` 访问包在 `try/catch` 中，非法值回退为 `system`
- [x] 1.4 在 `index.html` 的 `<head>` 中插入阻塞式 inline script：同步读取持久化值 + `matchMedia`，立即设置 `<html>` 的 `.dark` 类；同时补充 `color-scheme` 与 `theme-color` 元信息
- [x] 1.5 新建 `src/hooks/useResolvedTheme.ts`：返回 `preference`、`resolvedTheme`、`setPreference`，在 `system` 状态下监听 `matchMedia` 的 `change` 事件
- [x] 1.6 新建 `src/theme/ThemeProvider.tsx`，用 context 包裹全局并提供上述三项；在 `src/main.tsx` 挂载
- [x] 1.7 本地验证：用一个临时带 `dark:` 的块确认 variant 生效；将系统设为深色后刷新，确认首帧即为暗色、无白闪

## 2. 背景层与 Hero 结构

- [x] 2.1 新建 `src/components/Hero/HeroBackground.tsx`：用多个 `radial-gradient` 构建渐变底（不使用整屏 `filter: blur()`），颜色全部取自主题 token
- [x] 2.2 加主题变量驱动的可读性遮罩层，**位于粒子层之上、内容层之下**（初版误放在渐变层内，加入连线后已上移）
- [x] 2.3 新建 `src/components/Hero/Hero.tsx`：`min-h-hero`、水平垂直居中、`z-0/z-10/z-20/z-30/z-40` 分层堆叠；接收 `name` / `role` / `intro` 三个 props
- [x] 2.4 在 `Hero.tsx` 中落实语义：姓名使用页面唯一的 `h1`，职业与介绍使用非标题元素；长文本用 `text-balance` / `text-pretty`
- [x] 2.5 替换 `src/App.tsx`：定义占位文案常量，组合 `ThemeProvider` 与 `Hero`，移除计数器卡片
- [x] 2.6 响应式核对：320px 宽度、横屏手机（高约 375px）、超宽屏、浏览器 200%/400% 缩放，确认无横向溢出、无内容裁切

## 3. Canvas 粒子层

- [x] 3.1 新建 `src/components/Hero/ParticleField.tsx`：创建 canvas，`pointer-events-none` + `aria-hidden="true"`
- [x] 3.2 用容器上的 `ResizeObserver` 驱动尺寸更新；`devicePixelRatio` 截断到 2；粒子数量按容器面积计算并设硬上限；对微小尺寸变化做阈值过滤
- [x] 3.3 实现粒子缓慢漂移的绘制循环，仅在首屏绘制完成后（`requestIdleCallback`，回退 `setTimeout`）启动，不阻塞首屏
- [x] 3.4 处理 `visibilitychange`：后台时暂停，返回时重置时间基准，避免粒子瞬移
- [x] 3.5 实现 `prefers-reduced-motion: reduce` 分支：只绘制一帧静态粒子、不启动 rAF，并监听该偏好的运行中变化
- [x] 3.6 从 CSS 变量读取粒子配色；主题变化时更新颜色，但不重新生成粒子、不改变粒子位置
- [x] 3.7 补全 effect 清理：取消 rAF、断开 observer、移除事件监听；在 StrictMode 下确认无双重循环与泄漏
- [x] 3.8 验证降级：注释掉粒子层初始化模拟 Canvas 失败，确认渐变与文案完整、无脚本错误
- [x] 3.9 为邻近粒子绘制淡色连线，形成星图结构：阈值随容器短边自适应并夹在上下限内，透明度随距离衰减
- [x] 3.10 连线绘制按距离分档批量 `stroke`，点绘制在连线之上；确认减弱动效时静态一帧仍包含连线，亮/暗两主题下文字对比度无回退

## 4. 主题切换控件与可访问性

- [x] 4.1 新建 `src/components/ui/ThemeToggle.tsx`：按 `system → light → dark → system` 循环切换，样式全部使用 Tailwind 与 `dark:`
- [x] 4.2 为切换控件补充可访问名称与当前主题状态，使用 `focus-visible` 提供在渐变背景上可见的焦点环，支持 Enter / 空格触发
- [x] 4.3 在 Hero 内放置 `ThemeToggle`，核对 Tab 顺序与点击热区不与内容层重叠
- [x] 4.4 分别测量亮色与暗色主题下正文（目标 ≥ 4.5:1）与大字号姓名（目标 ≥ 3:1）的实际对比度，按结果调整遮罩层

## 5. 姓名展示字体

- [x] 5.1 确定姓名字族方案：走系统楷体栈，不加载任何字体文件（已逐项排除商业瘦金、开源篆书、自托管楷体切片与开源毛笔楷书）
- [x] 5.2 在 `src/index.css` 注册姓名字族 token：繁体楷体优先，逐级回退到简体楷体、Windows 楷体与 `serif`；不使用泛型 `cursive`
- [x] 5.3 姓名 `h1` 挂上该字族；去掉 `font-bold`（系统楷体同样会被合成假粗体）、字距放宽到 0.05em
- [x] 5.4 姓名文案改为繁体「寬真居士」，字号提到桌面 72px / 移动 60px；亮/暗两套主题与 320/375 窄屏下核对视觉重量与溢出；确认职业与介绍未被字体改动波及
- [x] 5.5 验证降级：模拟无楷体环境，确认回退到衬线字体、无豆腐块、对比度仍达标

## 6. 清理与整体验证

- [x] 6.1 删除未被引用的 `src/App.css`、`src/assets/react.svg`、`src/assets/vite.svg`、`public/icons.svg`；保留 `src/assets/hero.png`
- [x] 6.2 运行 `npm run lint` 与 `npm run build`，确认均无错误
- [x] 6.3 回归验证：刷新保留显式主题选择、清除本地存储后重新跟随系统、禁用本地存储时不报错、系统偏好变化时仅在未显式选择的情况下跟随
- [x] 6.4 用 `npm run preview` 观察首屏呈现顺序：先内容后粒子、无 FOUC、无动画除粒子漂移外

## 7. 项目 CTA

- [x] 7.1 新建 `src/components/ui/ProjectCta.tsx`：外链分支带 `target="_blank"` 与 `rel="noopener noreferrer"`，链接内含 `sr-only` 的「在新标签页打开」提示
- [x] 7.2 空链接分支渲染为 `disabled` 按钮，描边浅底样式、不可聚焦、不产生 `href`
- [x] 7.3 `Hero` 增加 `projectsUrl` / `projectsLabel` 两个 props，CTA 放在介绍下方
- [x] 7.4 `App.tsx` 增加 `PROJECTS_URL` 常量（当前为空字符串）并加注释说明填入后自动变为可点击
- [x] 7.5 核对亮/暗主题下按钮文字对比度、焦点环可见性、Tab 顺序，以及 320 / 375 / 900 宽度下的布局
- [x] 7.6 拿到项目链接后填入 `PROJECTS_URL`，复查新标签打开与 `rel` 属性（当前值：`https://bilibili.com`）
