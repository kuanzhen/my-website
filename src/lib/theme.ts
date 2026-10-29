export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

const DEFAULT_PREFERENCE: ThemePreference = 'system'
const PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark']

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (PREFERENCES as readonly string[]).includes(value)
}

/** 读取用户显式选择的主题；存储不可用或内容非法时一律回退为 system。 */
export function getStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : DEFAULT_PREFERENCE
  } catch {
    return DEFAULT_PREFERENCE
  }
}

/** 持久化显式选择；隐私模式下写入会抛错，静默失败即可，主题在本次会话内仍然生效。 */
export function savePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // 忽略：存储被禁用不影响当前会话的主题切换
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference
}

/** 把解析后的主题落到 <html> 上。首屏由 index.html 的 inline script 抢先完成同样的工作。 */
export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')

  const meta = document.getElementById('theme-color-meta')
  if (meta !== null) {
    // 以 CSS 变量为唯一数据源，避免在 TS 里再维护一份色值
    const canvasColor = getComputedStyle(root).getPropertyValue('--canvas').trim()
    if (canvasColor !== '') {
      meta.setAttribute('content', canvasColor)
    }
  }
}
