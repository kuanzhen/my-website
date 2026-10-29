import type { MouseEvent as ReactMouseEvent } from 'react'
import { scrollToHash } from './smoothScroll'

/**
 * 页面内锚点的统一点击处理：导航链接与 Hero CTA 共用。
 * 只接管普通左键点击；修饰键与中键保留浏览器原生行为（新标签页等）。
 * hash 用 pushState 同步，重复点击同一目标时改用 replaceState，避免堆历史记录。
 */
export function handleAnchorClick(
  event: ReactMouseEvent<HTMLAnchorElement>,
  href: string,
): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  event.preventDefault()
  if (window.location.hash === href) {
    window.history.replaceState(null, '', href)
  } else {
    window.history.pushState(null, '', href)
  }
  scrollToHash(href)
}
