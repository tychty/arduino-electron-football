import { useState } from 'react'
import SliderSetting from './SliderSetting'
import {
  HIT_DEBOUNCE_DEFAULT,
  HIT_DEBOUNCE_MIN,
  HIT_DEBOUNCE_MAX,
  HIT_DEBOUNCE_STEP,
} from './config'

const KEY = 'hitDebounceMs'

export function useHitDebounce(): { hitDebounceMs: number; setHitDebounceMs: (v: number) => void } {
  const [hitDebounceMs, setHitDebounceState] = useState<number>(
    () => Number(localStorage.getItem(KEY) ?? HIT_DEBOUNCE_DEFAULT)
  )

  const setHitDebounceMs = (v: number): void => {
    setHitDebounceState(v)
    localStorage.setItem(KEY, String(v))
  }

  return { hitDebounceMs, setHitDebounceMs }
}

interface Props {
  value: number
  onChange: (value: number) => void
}

export default function HitDebounceSettings({ value, onChange }: Props): JSX.Element {
  return (
    <SliderSetting
      label="hit debounce"
      value={value}
      min={HIT_DEBOUNCE_MIN}
      max={HIT_DEBOUNCE_MAX}
      step={HIT_DEBOUNCE_STEP}
      unit="ms"
      onChange={onChange}
    />
  )
}
