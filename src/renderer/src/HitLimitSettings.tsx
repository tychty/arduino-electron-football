import { useState } from 'react'
import { HIT_LIMIT_DEFAULT } from './config'

const KEY = 'hitLimit'

export function useHitLimit(): { hitLimit: number; setHitLimit: (v: number) => void } {
  const [hitLimit, setHitLimitState] = useState<number>(
    () => Number(localStorage.getItem(KEY) ?? HIT_LIMIT_DEFAULT)
  )

  const setHitLimit = (v: number): void => {
    const clamped = Math.max(1, Math.floor(v))
    setHitLimitState(clamped)
    localStorage.setItem(KEY, String(clamped))
  }

  return { hitLimit, setHitLimit }
}

interface Props {
  value: number
  onChange: (value: number) => void
}

export default function HitLimitSettings({ value, onChange }: Props): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <span style={{ width: 160, color: '#555' }}>hit limit</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!isNaN(n) && n >= 1) onChange(n)
        }}
        style={{ width: 70, padding: '3px 6px', fontSize: 13, borderRadius: 4, border: '1px solid #ccc' }}
      />
      <span style={{ color: '#888' }}>hits</span>
    </div>
  )
}
