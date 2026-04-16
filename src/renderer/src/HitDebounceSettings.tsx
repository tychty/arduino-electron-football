import { useState } from 'react'

const KEY = 'hitDebounceMs'
const DEFAULT = 300

export function useHitDebounce(): { hitDebounceMs: number; setHitDebounceMs: (v: number) => void } {
  const [hitDebounceMs, setHitDebounceState] = useState<number>(
    () => Number(localStorage.getItem(KEY) ?? DEFAULT)
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
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: '#888' }}>hit debounce {value}ms</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="range"
          min={10}
          max={1000}
          step={10}
          value={value}
          style={{ flex: 1 }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          type="number"
          min={10}
          value={value}
          style={{ width: 60 }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
