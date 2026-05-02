import { useState, useCallback } from 'react'

export interface GoalRect { x: number; y: number; w: number; h: number }  // normalized 0-1 relative to window
export interface PinRect { x1: number; y1: number; x2: number; y2: number }

function defaultGoal(): GoalRect {
  return {
    x: 0.5 - 200 / window.innerWidth,
    y: 0.5 - 100 / window.innerHeight,
    w: 400 / window.innerWidth,
    h: 200 / window.innerHeight,
  }
}

function defaultPinRectGrid(idx: number, total: number): PinRect {
  const cols = Math.ceil(Math.sqrt(total))
  const rows = Math.ceil(total / cols)
  const col = idx % cols
  const row = Math.floor(idx / cols)
  const cw = 0.175
  const ch = 0.35
  const hGap = (1 - cols * cw) / (cols + 1)
  const vGap = (1 - rows * ch) / (rows + 1)
  const x1 = hGap + col * (cw + hGap)
  const y1 = vGap + row * (ch + vGap)
  return { x1, y1, x2: Math.min(1, x1 + cw), y2: Math.min(1, y1 + ch) }
}

const NEW_PIN_DEFAULT: PinRect = { x1: 0.4, y1: 0.4, x2: 0.6, y2: 0.6 }

function loadGoal(): GoalRect {
  try {
    const s = localStorage.getItem('goalRect')
    if (s) return JSON.parse(s) as GoalRect
  } catch { /**/ }
  return defaultGoal()
}

function loadPinRect(pin: number): PinRect | null {
  try {
    const s = localStorage.getItem(`pin_${pin}_rect`)
    if (s) return JSON.parse(s) as PinRect
  } catch { /**/ }
  return null
}

export function useGoalLayout(activePins: number[]) {
  const [goal, setGoalState] = useState<GoalRect>(loadGoal)
  const [pinRects, setPinRects] = useState<Record<number, PinRect>>(() => {
    const m: Record<number, PinRect> = {}
    activePins.forEach((pin, idx) => {
      m[pin] = loadPinRect(pin) ?? defaultPinRectGrid(idx, activePins.length)
    })
    return m
  })

  const setGoal = useCallback((r: GoalRect) => {
    setGoalState(r)
    localStorage.setItem('goalRect', JSON.stringify(r))
  }, [])

  const setPinRect = useCallback((pin: number, r: PinRect) => {
    setPinRects((prev) => ({ ...prev, [pin]: r }))
    localStorage.setItem(`pin_${pin}_rect`, JSON.stringify(r))
  }, [])

  const getPinRect = useCallback(
    (pin: number): PinRect => pinRects[pin] ?? loadPinRect(pin) ?? NEW_PIN_DEFAULT,
    [pinRects]
  )

  const clearLayout = useCallback(() => {
    localStorage.removeItem('goalRect')
    Object.keys(localStorage)
      .filter((k) => k.startsWith('pin_') && k.endsWith('_rect'))
      .forEach((k) => localStorage.removeItem(k))
    setGoalState(defaultGoal())
    const m: Record<number, PinRect> = {}
    activePins.forEach((pin, idx) => {
      m[pin] = defaultPinRectGrid(idx, activePins.length)
    })
    setPinRects(m)
  }, [activePins])

  return { goal, setGoal, getPinRect, setPinRect, clearLayout }
}
