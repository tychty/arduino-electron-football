import { useState } from 'react'
import SliderSetting from './SliderSetting'
import {
  FLASH_DURATION_DEFAULT,
  FLASH_DURATION_MIN,
  FLASH_DURATION_MAX,
  FLASH_DURATION_STEP,
} from './config'

const KEY = 'flashDuration'

export function useFlashDuration(): {
  flashDuration: number
  setFlashDuration: (v: number) => void
} {
  const [flashDuration, setFlashDurationState] = useState<number>(
    () => Number(localStorage.getItem(KEY) ?? FLASH_DURATION_DEFAULT)
  )

  const setFlashDuration = (v: number): void => {
    setFlashDurationState(v)
    localStorage.setItem(KEY, String(v))
  }

  return { flashDuration, setFlashDuration }
}

interface Props {
  value: number
  onChange: (value: number) => void
}

export default function FlashDurationSettings({ value, onChange }: Props): JSX.Element {
  return (
    <SliderSetting
      label="flash duration"
      value={value}
      min={FLASH_DURATION_MIN}
      max={FLASH_DURATION_MAX}
      step={FLASH_DURATION_STEP}
      unit="ms"
      onChange={onChange}
    />
  )
}
