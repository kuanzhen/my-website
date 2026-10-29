import { useContext } from 'react'

import { ThemeContext } from '../theme/theme-context'
import type { ThemeContextValue } from '../theme/theme-context'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (context === null) {
    throw new Error('useTheme 必须在 ThemeProvider 内使用')
  }

  return context
}
