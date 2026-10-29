import { handleAnchorClick } from '../../lib/anchorNavigation'

type ProjectCtaProps = {
  label: string
}

/**
 * 首屏的项目入口：页面内锚点 #projects。
 * 复用 anchorNavigation 的点击处理，与导航「项目」链接共享平滑滚动与 hash 同步。
 * 刻意不加 transition：本变更只允许卡片悬浮与粒子漂移两种动效。
 */
const SHAPE_CLASSES =
  'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2'

const ACTIVE_CLASSES =
  'bg-accent text-white hover:bg-accent-strong focus-visible:outline-ink dark:text-canvas'

export function ProjectCta({ label }: ProjectCtaProps) {
  return (
    <a
      href="#projects"
      onClick={(event) => handleAnchorClick(event, '#projects')}
      className={`${SHAPE_CLASSES} ${ACTIVE_CLASSES}`}
    >
      {label}
    </a>
  )
}
