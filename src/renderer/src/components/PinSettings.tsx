import { PinConfig, PinHardware } from '../hooks/useSettings'
import SliderSetting from './SliderSetting'
import { useLocaleCtx } from '../context/LocaleContext'
import {
  DEBOUNCE_MIN,
  DEBOUNCE_MAX,
  DEBOUNCE_STEP,
  NOISE_MIN,
  NOISE_MAX,
  NOISE_STEP,
  SCORE_POINTS_MIN,
} from '../../../shared/config'

interface Props {
  pin: number
  peak: number | undefined
  connected: boolean
  config: PinConfig
  hardware: PinHardware
  onConfigChange: (updates: Partial<PinConfig>) => void
  onHardwareChange: (updates: Partial<PinHardware>) => void
  onDelete: () => void
}

export default function PinSettings({
  pin,
  peak,
  connected,
  config,
  hardware,
  onConfigChange,
  onHardwareChange,
  onDelete,
}: Props): JSX.Element {
  const { t } = useLocaleCtx()
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
          <div style={{ fontSize: 11, color: '#888' }}>{t((l) => l.pins.pin)} {pin}</div>
          <div style={{ fontSize: 48, lineHeight: 1 }}>{peak ?? '—'}</div>
          {pinTooHigh ? (
            <div style={{ fontSize: 11, color: '#c0392b', marginTop: 2 }}>
              {t((l) => l.pins.noKeybind)}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              {t((l) => l.pins.key)}: {(pin + 1) % 10}
            </div>
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
            {t((l) => l.pins.active)}
          </label>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={config.miss}
              onChange={(e) => onConfigChange({ miss: e.target.checked })}
            />
            {t((l) => l.pins.miss)}
          </label>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{t((l) => l.pins.scorePoints)}</div>
          <input
            type="number"
            min={SCORE_POINTS_MIN}
            value={config.scorePoints}
            style={{ width: 60 }}
            onChange={(e) => onConfigChange({ scorePoints: Number(e.target.value) })}
          />
        </div>

        <SliderSetting
          label={t((l) => l.pins.debounce)}
          value={hardware.debounce}
          min={DEBOUNCE_MIN}
          max={DEBOUNCE_MAX}
          step={DEBOUNCE_STEP}
          unit="ms"
          inputWidth={52}
          onChange={(v) => onHardwareChange({ debounce: v })}
        />

        <SliderSetting
          label={t((l) => l.pins.noise)}
          value={hardware.noise}
          min={NOISE_MIN}
          max={NOISE_MAX}
          step={NOISE_STEP}
          inputWidth={52}
          onChange={(v) => onHardwareChange({ noise: v })}
        />
      </div>
    </div>
  )
}
