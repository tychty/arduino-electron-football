import { usePinSettings } from './usePinSettings'
import { PinConfig } from './usePinConfigs'
import SliderSetting from './SliderSetting'
import {
  DEBOUNCE_MIN,
  DEBOUNCE_MAX,
  DEBOUNCE_STEP,
  NOISE_MIN,
  NOISE_MAX,
  NOISE_STEP,
  SCORE_POINTS_MIN,
} from './config'

interface Props {
  pin: number
  peak: number | undefined
  connected: boolean
  config: PinConfig
  onConfigChange: (updates: Partial<PinConfig>) => void
  onDelete: () => void
}

function keybindLabel(pin: number): string {
  return `key: ${(pin + 1) % 10}`
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
  const pinTooHigh = pin > 9

  return (
    <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 6 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#888' }}>pin {pin}</div>
          <div style={{ fontSize: 48, lineHeight: 1 }}>{peak ?? '—'}</div>
          {pinTooHigh ? (
            <div style={{ fontSize: 11, color: '#c0392b', marginTop: 2 }}>no keybind (pin &gt; 9)</div>
          ) : (
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{keybindLabel(pin)}</div>
          )}
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
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={config.active}
              onChange={(e) => onConfigChange({ active: e.target.checked })}
            />
            active
          </label>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}
          >
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
            min={SCORE_POINTS_MIN}
            value={config.scorePoints}
            style={{ width: 60 }}
            onChange={(e) => onConfigChange({ scorePoints: Number(e.target.value) })}
          />
        </div>

        <SliderSetting
          label="debounce"
          value={debounce}
          min={DEBOUNCE_MIN}
          max={DEBOUNCE_MAX}
          step={DEBOUNCE_STEP}
          unit="ms"
          inputWidth={52}
          onChange={setDebounce}
        />

        <SliderSetting
          label="noise"
          value={Math.min(noise, NOISE_MAX)}
          min={NOISE_MIN}
          max={NOISE_MAX}
          step={NOISE_STEP}
          inputWidth={52}
          onChange={setNoise}
        />
      </div>
    </div>
  )
}
