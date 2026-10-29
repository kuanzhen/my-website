import { handleAnchorClick } from '../../lib/anchorNavigation'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_LINKS = [
  { href: '#home', label: '首页' },
  { href: '#projects', label: '项目' },
  { href: '#contact', label: '联系我' },
  { href: '#about', label: '关于' },
] as const

/**
 * 顶部导航：左侧品牌标识，右侧四个页面内锚点链接与主题切换控件。
 * DOM 顺序即 Tab 顺序：品牌 → 首页 → 项目 → 联系我 → 关于 → 主题切换。
 * 毛玻璃采用渐进增强：默认不透明底色，支持 backdrop-filter 时才转半透明。
 * 320px 下基础间距收紧到 px-2 / gap-1，避免第四个链接把导航撑出横向滚动。
 */
export function NavBar() {
  return (
    <nav
      aria-label="主导航"
      className="nav-glass fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas px-2 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70 sm:px-6"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-1 sm:gap-6">
        <a
          href="#home"
          onClick={(event) => handleAnchorClick(event, '#home')}
          className="text-sm font-medium tracking-wide text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
        >
          寬真居士
        </a>

        <div className="flex items-center gap-1 sm:gap-5">
          <ul className="flex items-center gap-1 sm:gap-5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => handleAnchorClick(event, link.href)}
                  className="text-sm text-ink hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
