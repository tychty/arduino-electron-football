import { useState, useEffect } from 'react'
import { arduinoService } from '../services/arduinoService'
import {
  HIT_WINDOW_DEFAULT,
  FLASH_DURATION_DEFAULT,
  HIT_LIMIT_DEFAULT,
  LEADERBOARD_LIMIT_DEFAULT,
  NOISE_DEFAULT,
  NOISE_MIN,
  SCORE_POINTS_DEFAULT,
  SCORE_POINTS_MIN,
} from '../../../shared/config'

export interface PinConfig {
  active: boolean
  miss: boolean
  scoreValues: number[]
}

export interface PinHardware {
  noise: number
}

export interface GameSettings {
  hitWindowMs: number
  flashDuration: number
  hitLimit: number
  leaderboardLimit: number
}

export interface SettingsService {
  game: GameSettings
  setGame: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
  pinConfigs: Record<number, PinConfig>
  pinConfig: (pin: number) => PinConfig
  setPinConfig: (pin: number, updates: Partial<PinConfig>) => void
  pinHardware: (pin: number) => PinHardware
  setPinHardware: (pin: number, updates: Partial<PinHardware>, connected: boolean) => Promise<void>
  globalNoise: number
  setAllNoise: (value: number, connected: boolean) => Promise<void>
  hudLeftBound: number
  hudRightBound: number
  setHudLeftBound: (v: number) => void
  setHudRightBound: (v: number) => void
}

const GAME_KEYS: Record<keyof GameSettings, string> = {
  hitWindowMs: 'hitWindowMs',
  flashDuration: 'flashDuration',
  hitLimit: 'hitLimit',
  leaderboardLimit: 'leaderboardLimit',
}

const GAME_CLAMP: Record<keyof GameSettings, (v: number) => number> = {
  hitWindowMs: (v) => (isNaN(v) ? HIT_WINDOW_DEFAULT : v),
  flashDuration: (v) => (isNaN(v) ? FLASH_DURATION_DEFAULT : v),
  hitLimit: (v) => Math.floor(isNaN(v) ? HIT_LIMIT_DEFAULT : v),
  leaderboardLimit: (v) => Math.max(1, Math.floor(isNaN(v) ? LEADERBOARD_LIMIT_DEFAULT : v)),
}

function load<K extends keyof GameSettings>(key: K, def: GameSettings[K]): GameSettings[K] {
  return GAME_CLAMP[key](Number(localStorage.getItem(GAME_KEYS[key]) ?? def)) as GameSettings[K]
}

function loadGame(): GameSettings {
  return {
    hitWindowMs: load('hitWindowMs', HIT_WINDOW_DEFAULT),
    flashDuration: load('flashDuration', FLASH_DURATION_DEFAULT),
    hitLimit: load('hitLimit', HIT_LIMIT_DEFAULT),
    leaderboardLimit: load('leaderboardLimit', LEADERBOARD_LIMIT_DEFAULT),
  }
}

function parseScoreValues(raw: string): number[] {
  const vals = raw.split(/[,\.;|\\\/]+/)
    .map(s => Number(s.trim()))
    .filter(n => !isNaN(n) && n >= SCORE_POINTS_MIN)
  return vals.length > 0 ? vals : [SCORE_POINTS_DEFAULT]
}

function readPinConfig(pin: number): PinConfig {
  const stored = localStorage.getItem(`pin_${pin}_scoreValues`)
  let scoreValues: number[]
  if (stored !== null) {
    scoreValues = parseScoreValues(stored)
  } else {
    const old = localStorage.getItem(`pin_${pin}_scorePoints`)
    const migrated = old !== null ? Number(old) : NaN
    scoreValues = [isNaN(migrated) ? SCORE_POINTS_DEFAULT : migrated]
  }
  return {
    active: localStorage.getItem(`pin_${pin}_active`) !== 'false',
    miss: localStorage.getItem(`pin_${pin}_miss`) === 'true',
    scoreValues,
  }
}

function readPinHardware(pin: number): PinHardware {
  return {
    noise: Number(localStorage.getItem(`pin_${pin}_noise`) ?? NOISE_DEFAULT),
  }
}

export function useSettings(allPins: number[]): SettingsService {
  const [game, setGameState] = useState<GameSettings>(loadGame)
  const [pinConfigs, setPinConfigs] = useState<Record<number, PinConfig>>(() =>
    Object.fromEntries(allPins.map((p) => [p, readPinConfig(p)]))
  )
  const [pinHardwares, setPinHardwares] = useState<Record<number, PinHardware>>(() =>
    Object.fromEntries(allPins.map((p) => [p, readPinHardware(p)]))
  )
  const [globalNoise, setGlobalNoise] = useState<number>(() =>
    Number(localStorage.getItem('global_noise') ?? NOISE_DEFAULT)
  )
  const [hudLeftBound, setHudLeftBoundState] = useState<number>(() => {
    const v = Number(localStorage.getItem('hudLeftBound'))
    return isNaN(v) ? 0 : v
  })
  const [hudRightBound, setHudRightBoundState] = useState<number>(() => {
    const v = Number(localStorage.getItem('hudRightBound'))
    return isNaN(v) || v === 0 ? 1 : v
  })

  const pinKey = allPins.join(',')
  useEffect(() => {
    setPinConfigs(Object.fromEntries(allPins.map((p) => [p, readPinConfig(p)])))
    setPinHardwares(Object.fromEntries(allPins.map((p) => [p, readPinHardware(p)])))
  }, [pinKey])

  const setGame = <K extends keyof GameSettings>(key: K, value: GameSettings[K]): void => {
    const clamped = GAME_CLAMP[key](value as number) as GameSettings[K]
    setGameState((prev) => ({ ...prev, [key]: clamped }))
    localStorage.setItem(GAME_KEYS[key], String(clamped))
  }

  const pinConfig = (pin: number): PinConfig => pinConfigs[pin] ?? readPinConfig(pin)

  const setPinConfig = (pin: number, updates: Partial<PinConfig>): void => {
    setPinConfigs((prev) => ({ ...prev, [pin]: { ...prev[pin], ...updates } }))
    if (updates.active !== undefined)
      localStorage.setItem(`pin_${pin}_active`, String(updates.active))
    if (updates.miss !== undefined) localStorage.setItem(`pin_${pin}_miss`, String(updates.miss))
    if (updates.scoreValues !== undefined)
      localStorage.setItem(`pin_${pin}_scoreValues`, updates.scoreValues.join(','))
  }

  const pinHardware = (pin: number): PinHardware => pinHardwares[pin] ?? readPinHardware(pin)

  const setPinHardware = async (
    pin: number,
    updates: Partial<PinHardware>,
    connected: boolean
  ): Promise<void> => {
    const clamped: Partial<PinHardware> = {}
    if (updates.noise !== undefined) {
      clamped.noise = updates.noise
      localStorage.setItem(`pin_${pin}_noise`, String(clamped.noise))
      if (connected) await arduinoService.setNoiseTolerance(clamped.noise, pin)
    }
    setPinHardwares((prev) => ({ ...prev, [pin]: { ...prev[pin], ...clamped } }))
  }

  const setAllNoise = async (value: number, connected: boolean): Promise<void> => {
    const clamped = Math.max(NOISE_MIN, value)
    localStorage.setItem('global_noise', String(clamped))
    const updates: Record<number, PinHardware> = {}
    for (const pin of allPins) {
      localStorage.setItem(`pin_${pin}_noise`, String(clamped))
      updates[pin] = { noise: clamped }
    }
    setGlobalNoise(clamped)
    setPinHardwares((prev) => ({ ...prev, ...updates }))
    if (connected) await arduinoService.setNoiseTolerance(clamped)
  }

  const setHudLeftBound = (v: number): void => {
    const clamped = Math.max(0, Math.min(1, v))
    setHudLeftBoundState(clamped)
    localStorage.setItem('hudLeftBound', String(clamped))
  }

  const setHudRightBound = (v: number): void => {
    const clamped = Math.max(0, Math.min(1, v))
    setHudRightBoundState(clamped)
    localStorage.setItem('hudRightBound', String(clamped))
  }

  return { game, setGame, pinConfigs, pinConfig, setPinConfig, pinHardware, setPinHardware, globalNoise, setAllNoise, hudLeftBound, hudRightBound, setHudLeftBound, setHudRightBound }
}
