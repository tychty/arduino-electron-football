import ConnectionPanel from '../ConnectionPanel'
import PinsGrid from '../PinsGrid'
import HitDebounceSettings from '../HitDebounceSettings'
import KeyboardDebounceSettings from '../KeyboardDebounceSettings'
import FlashDurationSettings from '../FlashDurationSettings'
import HitLimitSettings from '../HitLimitSettings'
import { PortInfo } from '../useConnection'
import { useSettingsCtx } from '../SettingsContext'

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
          <HitDebounceSettings
            value={settings.game.hitDebounceMs}
            onChange={(v) => settings.setGame('hitDebounceMs', v)}
          />
          <KeyboardDebounceSettings
            value={settings.game.kbDebounceMs}
            onChange={(v) => settings.setGame('kbDebounceMs', v)}
          />
          <FlashDurationSettings
            value={settings.game.flashDuration}
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
