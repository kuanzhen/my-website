import { useTheme } from '../../hooks/useTheme'
import type { ThemePreference } from '../../lib/theme'

/** 三态循环：跟随系统 → 亮色 → 暗色 → 跟随系统 */
const NEXT: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const LABELS: Record<ThemePreference, string> = {
  system: '跟随系统',
  light: '亮色',
  dark: '暗色',
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'light') {
    return (
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }

  if (preference === 'dark') {
    return (
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  const next = NEXT[preference]

  return (
    <>
      <button
        type="button"
        onClick={() => setPreference(next)}
        aria-label={`当前主题：${LABELS[preference]}，点击切换为${LABELS[next]}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas/70 text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ThemeIcon preference={preference} />
      </button>
      {/* 状态变化播报：按钮自身名称变化不一定被读屏软件重读，用 live region 兜底 */}
      <span aria-live="polite" className="sr-only">
        当前主题：{LABELS[preference]}
      </span>
    </>
  )
}
