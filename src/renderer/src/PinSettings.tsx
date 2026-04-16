import { usePinSettings } from './usePinSettings'
import { PinConfig } from './usePinConfigs'

interface Props {
  pin: number
  peak: number | undefined
  connected: boolean
  config: PinConfig
  onConfigChange: (updates: Partial<PinConfig>) => void
  onDelete: () => void
}

export default function PinSettings({
  pin,
  peak,
  connected,
  config,
  onConfigChange,
  onDelete,
}: Props): JSX.Element {
  const { debounce, noise, setDebounce, setNoise } = usePinSettings(pin, connected)

  return (
    <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#888' }}>pin {pin}</div>
          <div style={{ fontSize: 48, lineHeight: 1 }}>{peak ?? '—'}</div>
        </div>
        <button
          onClick={onDelete}
          style={{
            padding: '2px 8px',
            fontSize: 12,
            cursor: 'pointer',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#888',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.active}
              onChange={(e) => onConfigChange({ active: e.target.checked })}
            />
            active
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.miss}
              onChange={(e) => onConfigChange({ miss: e.target.checked })}
            />
            miss
          </label>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>score points</div>
          <input
            type="number"
            min={1}
            value={config.scorePoints}
            style={{ width: 60 }}
            onChange={(e) => onConfigChange({ scorePoints: Number(e.target.value) })}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>debounce {debounce}ms</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="range"
              min={100}
              max={500}
              step={10}
              value={debounce}
              style={{ flex: 1 }}
              onChange={(e) => setDebounce(Number(e.target.value))}
            />
            <input
              type="number"
              min={1}
              value={debounce}
              style={{ width: 52 }}
              onChange={(e) => setDebounce(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>noise {noise}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={Math.min(noise, 10)}
              style={{ flex: 1 }}
              onChange={(e) => setNoise(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              value={noise}
              style={{ width: 52 }}
              onChange={(e) => setNoise(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
