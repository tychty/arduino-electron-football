import SliderSetting from './SliderSetting'
import { KB_DEBOUNCE_MIN, KB_DEBOUNCE_MAX, KB_DEBOUNCE_STEP } from '../../shared/config'

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
