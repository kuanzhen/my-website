/** 与导航栏 h-16（4rem）加一点呼吸空间对齐，等同 section 上的 scroll-mt-20 */
const NAV_OFFSET = 80
/** 固定时长：原生 smooth 会随距离变长，底部回顶部实测可到 770ms */
const DURATION_MS = 400

/**
 * 供排查用：在控制台读 document.documentElement.dataset.scrollEngine，
 * 返回 js-400-v2 才说明当前页面跑的是这套实现，而不是缓存里的旧构建。
 */
document.documentElement.dataset.scrollEngine = 'js-400-v2'

let frameId: number | null = null

/** 开头快、结尾收束，主观上更「跟手」 */
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** 逐帧跳转期间打标记，供 CSS 临时关闭毛玻璃等昂贵效果（见 index.css 的 .nav-glass 规则） */
function startJsScroll(): void {
  document.documentElement.classList.add('is-js-scrolling')
}

function finishJsScroll(): void {
  document.documentElement.classList.remove('is-js-scrolling')
}

/**
 * 以固定时长滚动到锚点目标。
 * 不用原生 scroll-behavior：它的时长随距离增长且无法指定。
 * 减弱动效偏好下直接落位，不播放动画。
 */
export function scrollToHash(hash: string): void {
  const target = document.getElementById(hash.replace(/^#/, ''))
  if (!target) return

  const maxY = document.documentElement.scrollHeight - window.innerHeight
  const targetY = Math.min(
    Math.max(target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, 0),
    maxY,
  )

  // 新的跳转取消上一段未完成的动画，避免两段 rAF 抢同一个滚动位置
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
    finishJsScroll()
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetY)
    return
  }

  const startY = window.scrollY
  const delta = targetY - startY
  if (delta === 0) return

  const start = performance.now()
  startJsScroll()

  const step = (now: number) => {
    const progress = Math.min((now - start) / DURATION_MS, 1)
    window.scrollTo(0, startY + delta * easeOutCubic(progress))

    if (progress < 1) {
      frameId = requestAnimationFrame(step)
      return
    }

    frameId = null
    finishJsScroll()
    // 兜底：若逐帧跳转被浏览器合并或忽略，最后再落位一次
    if (Math.abs(window.scrollY - targetY) > 1) {
      window.scrollTo(0, targetY)
    }
  }

  frameId = requestAnimationFrame(step)
}
