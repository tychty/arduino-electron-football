import SliderSetting from './SliderSetting'
import { FLASH_DURATION_MIN, FLASH_DURATION_MAX, FLASH_DURATION_STEP } from '../../../shared/config'

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
