import { usePinSettings } from './usePinSettings'

interface Props {
  pin: number
  peak: number | undefined
  connected: boolean
}

export default function PinSettings({ pin, peak, connected }: Props): JSX.Element {
  const { debounce, noise, setDebounce, setNoise } = usePinSettings(pin, connected)

  return (
    <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 6 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#888' }}>pin {pin}</div>
        <div style={{ fontSize: 48, lineHeight: 1 }}>{peak ?? '—'}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>debounce {debounce}ms</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="range" min={100} max={500} step={10} value={debounce} style={{ flex: 1 }} onChange={(e) => setDebounce(Number(e.target.value))} />
            <input type="number" min={1} value={debounce} style={{ width: 52 }} onChange={(e) => setDebounce(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>noise {noise}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="range" min={0} max={10} step={1} value={Math.min(noise, 10)} style={{ flex: 1 }} onChange={(e) => setNoise(Number(e.target.value))} />
            <input type="number" min={0} value={noise} style={{ width: 52 }} onChange={(e) => setNoise(Number(e.target.value))} />
          </div>
        </div>
      </div>
    </div>
  )
}
