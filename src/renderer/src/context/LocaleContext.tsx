import { createContext, useContext, ReactNode } from 'react'
import { useLocale, LocaleService } from '../hooks/useLocale'

const LocaleContext = createContext<LocaleService | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }): JSX.Element {
  const locale = useLocale()
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocaleCtx(): LocaleService {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocaleCtx must be used within a LocaleProvider')
  return ctx
}
