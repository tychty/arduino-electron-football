import SliderSetting from './SliderSetting'
import { HIT_DEBOUNCE_MIN, HIT_DEBOUNCE_MAX, HIT_DEBOUNCE_STEP } from '../../shared/config'

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
