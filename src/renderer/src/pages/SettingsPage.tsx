import ConnectionPanel from '../components/ConnectionPanel'
import PinsGrid from '../components/PinsGrid'
import HitLimitSettings from '../components/HitLimitSettings'
import SliderSetting from '../components/SliderSetting'
import { PortInfo } from '../services/arduinoService'
import { useSettingsCtx } from '../context/SettingsContext'
import {
  HIT_DEBOUNCE_MIN, HIT_DEBOUNCE_MAX, HIT_DEBOUNCE_STEP,
  FLASH_DURATION_MIN, FLASH_DURATION_MAX, FLASH_DURATION_STEP,
} from '../../../shared/config'

interface Props {
  ports: PortInfo[]
  selected: string
  connected: boolean
  connectionError: string | null
  peaks: Record<number, number>
  onSetSelected: (port: string) => void
  onRefresh: () => Promise<void>
  onConnect: () => Promise<void>
  onDisconnect: () => void
  onBack: () => void
}

export default function SettingsPage({
  ports,
  selected,
  connected,
  connectionError,
  peaks,
  onSetSelected,
  onRefresh,
  onConnect,
  onDisconnect,
  onBack,
}: Props): JSX.Element {
  const { allPins, canAddPin, addPin, deletePin, settings } = useSettingsCtx()

  return (
    <div
      style={{
        padding: '24px 32px',
        fontFamily: 'monospace',
        maxWidth: 900,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: '#888',
            padding: 0,
          }}
        >
          ← back
        </button>
      </div>

      <h2 style={{ margin: '0 0 24px', fontSize: 18 }}>Settings</h2>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>
          Connection
        </h3>
        <ConnectionPanel
          ports={ports}
          selected={selected}
          connected={connected}
          error={connectionError}
          onSetSelected={onSetSelected}
          onRefresh={onRefresh}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>Game</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <HitLimitSettings
            value={settings.game.hitLimit}
            onChange={(v) => settings.setGame('hitLimit', v)}
          />
          <SliderSetting
            label="hit debounce"
            value={settings.game.hitDebounceMs}
            min={HIT_DEBOUNCE_MIN} max={HIT_DEBOUNCE_MAX} step={HIT_DEBOUNCE_STEP}
            unit="ms"
            onChange={(v) => settings.setGame('hitDebounceMs', v)}
          />
          <SliderSetting
            label="flash duration"
            value={settings.game.flashDuration}
            min={FLASH_DURATION_MIN} max={FLASH_DURATION_MAX} step={FLASH_DURATION_STEP}
            unit="ms"
            onChange={(v) => settings.setGame('flashDuration', v)}
          />
        </div>
      </section>

      <section>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>Pins</h3>
        <PinsGrid
          allPins={allPins}
          peaks={peaks}
          connected={connected}
          settings={settings}
          canAddPin={canAddPin}
          onAddPin={addPin}
          onDeletePin={deletePin}
        />
      </section>
    </div>
  )
}
