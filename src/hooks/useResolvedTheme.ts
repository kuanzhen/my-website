import { useCallback, useEffect, useState } from 'react'

import {
  applyTheme,
  getStoredPreference,
  getSystemTheme,
  savePreference,
} from '../lib/theme'
import type { ResolvedTheme, ThemePreference } from '../lib/theme'

/**
 * 主题状态的唯一来源：显式选择持久化，未选择时跟随系统并监听其变化。
 * 返回值中的 resolvedTheme 已落盘到 <html>，可直接用于渲染判断。
 */
export function useResolvedTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(getStoredPreference)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  const resolvedTheme: ResolvedTheme = preference === 'system' ? systemTheme : preference

  // 仅在未做显式选择时，系统偏好的变化才应影响结果；监听本身常驻即可。
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    savePreference(next)
  }, [])

  return { preference, resolvedTheme, setPreference }
}
