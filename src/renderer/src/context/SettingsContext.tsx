import { createContext, useContext, ReactNode } from 'react'
import { usePins } from '../hooks/usePins'
import { useSettings, SettingsService, PinConfig } from '../hooks/useSettings'

interface SettingsContextValue {
  allPins: number[]
  canAddPin: boolean
  addPin: () => void
  deletePin: (pin: number) => void
  configs: Record<number, PinConfig>
  hitWindowMs: number
  setHitWindowMs: (v: number) => void
  flashDuration: number
  setFlashDuration: (v: number) => void
  hitLimit: number
  setHitLimit: (v: number) => void
  leaderboardLimit: number
  setLeaderboardLimit: (v: number) => void
  settings: SettingsService
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }): JSX.Element {
  const { allPins, canAddPin, addPin, deletePin } = usePins()
  const settings = useSettings(allPins)

  const value: SettingsContextValue = {
    allPins,
    canAddPin,
    addPin,
    deletePin,
    configs: settings.pinConfigs,
    hitWindowMs: settings.game.hitWindowMs,
    setHitWindowMs: (v) => settings.setGame('hitWindowMs', v),
    flashDuration: settings.game.flashDuration,
    setFlashDuration: (v) => settings.setGame('flashDuration', v),
    hitLimit: settings.game.hitLimit,
    setHitLimit: (v) => settings.setGame('hitLimit', v),
    leaderboardLimit: settings.game.leaderboardLimit,
    setLeaderboardLimit: (v) => settings.setGame('leaderboardLimit', v),
    settings,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsCtx(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsCtx must be used within a SettingsProvider')
  return ctx
}
