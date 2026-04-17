import { useState } from 'react'
import SliderSetting from './SliderSetting'
import {
  KB_DEBOUNCE_DEFAULT,
  KB_DEBOUNCE_MIN,
  KB_DEBOUNCE_MAX,
  KB_DEBOUNCE_STEP,
} from '../../shared/config'

const KEY = 'kbDebounceMs'

export function useKeyboardDebounce(): {
  kbDebounceMs: number
  setKbDebounceMs: (v: number) => void
} {
  const [kbDebounceMs, setKbDebounceState] = useState<number>(
    () => Number(localStorage.getItem(KEY) ?? KB_DEBOUNCE_DEFAULT)
  )

  const setKbDebounceMs = (v: number): void => {
    setKbDebounceState(v)
    localStorage.setItem(KEY, String(v))
  }

  return { kbDebounceMs, setKbDebounceMs }
}

interface Props {
  value: number
  onChange: (value: number) => void
}

export default function KeyboardDebounceSettings({ value, onChange }: Props): JSX.Element {
  return (
    <SliderSetting
      label="keyboard debounce"
      value={value}
      min={KB_DEBOUNCE_MIN}
      max={KB_DEBOUNCE_MAX}
      step={KB_DEBOUNCE_STEP}
      unit="ms"
      onChange={onChange}
    />
  )
}
