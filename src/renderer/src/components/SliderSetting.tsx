interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  inputWidth?: number
  onChange: (value: number) => void
}

export default function SliderSetting({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  inputWidth = 60,
  onChange,
}: Props): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: '#888' }}>
        {label} {value}{unit}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ flex: 1 }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          type="number"
          value={value}
          style={{ width: inputWidth }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
