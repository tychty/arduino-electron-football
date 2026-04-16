import { usePinSettings } from './usePinSettings'

interface Props {
  pin: number
  peak: number | undefined
  connected: boolean
}

export default function PinSettings({ pin, peak, connected }: Props): JSX.Element {
  const { debounce, noise, setDebounce, setNoise } = usePinSettings(pin, connected)

  return (
    <div style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <strong>Pin {pin}</strong>
        <span style={{ fontSize: 48 }}>{peak ?? '—'}</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Debounce: {debounce}ms</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <input
            type="range"
            min={100}
            max={500}
            step={10}
            value={debounce}
            onChange={(e) => setDebounce(Number(e.target.value))}
          />
          <input
            type="number"
            min={1}
            value={debounce}
            style={{ width: 64 }}
            onChange={(e) => setDebounce(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label>Noise tolerance: {noise}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={Math.min(noise, 10)}
            onChange={(e) => setNoise(Number(e.target.value))}
          />
          <input
            type="number"
            min={0}
            value={noise}
            style={{ width: 64 }}
            onChange={(e) => setNoise(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}
