import { useState, useEffect } from 'react'
import { arduinoService } from '../services/arduinoService'
import {
  HIT_DEBOUNCE_DEFAULT,
  HIT_DEBOUNCE_MIN,
  HIT_DEBOUNCE_MAX,
  FLASH_DURATION_DEFAULT,
  FLASH_DURATION_MIN,
  FLASH_DURATION_MAX,
  KB_DEBOUNCE_DEFAULT,
  KB_DEBOUNCE_MIN,
  KB_DEBOUNCE_MAX,
  HIT_LIMIT_DEFAULT,
  DEBOUNCE_DEFAULT,
  DEBOUNCE_MIN,
  DEBOUNCE_MAX,
  NOISE_DEFAULT,
  NOISE_MIN,
  NOISE_MAX,
  SCORE_POINTS_DEFAULT,
  SCORE_POINTS_MIN,
} from '../../../shared/config'

export interface PinConfig {
  active: boolean
  miss: boolean
  scorePoints: number
}

export interface PinHardware {
  debounce: number
  noise: number
}

export interface GameSettings {
  hitDebounceMs: number
  flashDuration: number
  hitLimit: number
  kbDebounceMs: number
}

export interface SettingsService {
  game: GameSettings
  setGame: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
  pinConfigs: Record<number, PinConfig>
  pinConfig: (pin: number) => PinConfig
  setPinConfig: (pin: number, updates: Partial<PinConfig>) => void
  pinHardware: (pin: number) => PinHardware
  setPinHardware: (pin: number, updates: Partial<PinHardware>, connected: boolean) => Promise<void>
}

const GAME_KEYS: Record<keyof GameSettings, string> = {
  hitDebounceMs: 'hitDebounceMs',
  flashDuration: 'flashDuration',
  hitLimit: 'hitLimit',
  kbDebounceMs: 'kbDebounceMs',
}

const GAME_CLAMP: Record<keyof GameSettings, (v: number) => number> = {
  hitDebounceMs: (v) =>
    Math.max(HIT_DEBOUNCE_MIN, Math.min(HIT_DEBOUNCE_MAX, isNaN(v) ? HIT_DEBOUNCE_DEFAULT : v)),
  flashDuration: (v) =>
    Math.max(FLASH_DURATION_MIN, Math.min(FLASH_DURATION_MAX, isNaN(v) ? FLASH_DURATION_DEFAULT : v)),
  hitLimit: (v) => Math.max(1, Math.floor(isNaN(v) ? HIT_LIMIT_DEFAULT : v)),
  kbDebounceMs: (v) =>
    Math.max(KB_DEBOUNCE_MIN, Math.min(KB_DEBOUNCE_MAX, isNaN(v) ? KB_DEBOUNCE_DEFAULT : v)),
}

function load<K extends keyof GameSettings>(key: K, def: GameSettings[K]): GameSettings[K] {
  return GAME_CLAMP[key](Number(localStorage.getItem(GAME_KEYS[key]) ?? def)) as GameSettings[K]
}

function loadGame(): GameSettings {
  return {
    hitDebounceMs: load('hitDebounceMs', HIT_DEBOUNCE_DEFAULT),
    flashDuration: load('flashDuration', FLASH_DURATION_DEFAULT),
    hitLimit: load('hitLimit', HIT_LIMIT_DEFAULT),
    kbDebounceMs: load('kbDebounceMs', KB_DEBOUNCE_DEFAULT),
  }
}

function readPinConfig(pin: number): PinConfig {
  return {
    active: localStorage.getItem(`pin_${pin}_active`) !== 'false',
    miss: localStorage.getItem(`pin_${pin}_miss`) === 'true',
    scorePoints: Math.max(
      SCORE_POINTS_MIN,
      Number(localStorage.getItem(`pin_${pin}_scorePoints`) ?? SCORE_POINTS_DEFAULT)
    ),
  }
}

function readPinHardware(pin: number): PinHardware {
  return {
    debounce: Math.max(
      DEBOUNCE_MIN,
      Math.min(DEBOUNCE_MAX, Number(localStorage.getItem(`pin_${pin}_debounce`) ?? DEBOUNCE_DEFAULT))
    ),
    noise: Math.max(
      NOISE_MIN,
      Math.min(NOISE_MAX, Number(localStorage.getItem(`pin_${pin}_noise`) ?? NOISE_DEFAULT))
    ),
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
    if (updates.scorePoints !== undefined)
      localStorage.setItem(`pin_${pin}_scorePoints`, String(updates.scorePoints))
  }

  const pinHardware = (pin: number): PinHardware => pinHardwares[pin] ?? readPinHardware(pin)

  const setPinHardware = async (
    pin: number,
    updates: Partial<PinHardware>,
    connected: boolean
  ): Promise<void> => {
    const clamped: Partial<PinHardware> = {}
    if (updates.debounce !== undefined) {
      clamped.debounce = Math.max(DEBOUNCE_MIN, Math.min(DEBOUNCE_MAX, updates.debounce))
      localStorage.setItem(`pin_${pin}_debounce`, String(clamped.debounce))
      if (connected) await arduinoService.setDebounce(clamped.debounce, pin)
    }
    if (updates.noise !== undefined) {
      clamped.noise = Math.max(NOISE_MIN, Math.min(NOISE_MAX, updates.noise))
      localStorage.setItem(`pin_${pin}_noise`, String(clamped.noise))
      if (connected) await arduinoService.setNoiseTolerance(clamped.noise, pin)
    }
    setPinHardwares((prev) => ({ ...prev, [pin]: { ...prev[pin], ...clamped } }))
  }

  return { game, setGame, pinConfigs, pinConfig, setPinConfig, pinHardware, setPinHardware }
}
