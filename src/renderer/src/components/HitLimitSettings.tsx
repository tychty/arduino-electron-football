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
