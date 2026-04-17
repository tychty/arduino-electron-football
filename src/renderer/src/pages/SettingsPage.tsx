import ConnectionPanel from '../ConnectionPanel'
import PinsGrid from '../PinsGrid'
import HitDebounceSettings from '../HitDebounceSettings'
import KeyboardDebounceSettings from '../KeyboardDebounceSettings'
import FlashDurationSettings from '../FlashDurationSettings'
import HitLimitSettings from '../HitLimitSettings'
import { PortInfo } from '../useConnection'
import { PinConfig } from '../usePinConfigs'

interface Props {
  ports: PortInfo[]
  selected: string
  connected: boolean
  connectionError: string | null
  allPins: number[]
  peaks: Record<number, number>
  pinConfigs: Record<number, PinConfig>
  canAddPin: boolean
  hitDebounceMs: number
  kbDebounceMs: number
  flashDuration: number
  hitLimit: number
  onSetSelected: (port: string) => void
  onRefresh: () => Promise<void>
  onConnect: () => Promise<void>
  onDisconnect: () => void
  onAddPin: () => void
  onDeletePin: (pin: number) => void
  onConfigChange: (pin: number, updates: Partial<PinConfig>) => void
  onHitDebounceChange: (v: number) => void
  onKbDebounceChange: (v: number) => void
  onFlashDurationChange: (v: number) => void
  onHitLimitChange: (v: number) => void
  onBack: () => void
}

export default function SettingsPage({
  ports,
  selected,
  connected,
  connectionError,
  allPins,
  peaks,
  pinConfigs,
  canAddPin,
  hitDebounceMs,
  kbDebounceMs,
  flashDuration,
  hitLimit,
  onSetSelected,
  onRefresh,
  onConnect,
  onDisconnect,
  onAddPin,
  onDeletePin,
  onConfigChange,
  onHitDebounceChange,
  onKbDebounceChange,
  onFlashDurationChange,
  onHitLimitChange,
  onBack,
}: Props): JSX.Element {
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
          <HitLimitSettings value={hitLimit} onChange={onHitLimitChange} />
          <HitDebounceSettings value={hitDebounceMs} onChange={onHitDebounceChange} />
          <KeyboardDebounceSettings value={kbDebounceMs} onChange={onKbDebounceChange} />
          <FlashDurationSettings value={flashDuration} onChange={onFlashDurationChange} />
        </div>
      </section>

      <section>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>Pins</h3>
        <PinsGrid
          allPins={allPins}
          peaks={peaks}
          connected={connected}
          pinConfigs={pinConfigs}
          canAddPin={canAddPin}
          onAddPin={onAddPin}
          onDeletePin={onDeletePin}
          onConfigChange={onConfigChange}
        />
      </section>
    </div>
  )
}
