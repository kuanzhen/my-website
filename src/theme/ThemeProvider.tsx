import type { ReactNode } from 'react'

import { useResolvedTheme } from '../hooks/useResolvedTheme'
import { ThemeContext } from './theme-context'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useResolvedTheme()

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
