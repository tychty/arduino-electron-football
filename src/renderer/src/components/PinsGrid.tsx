import PinSettings from './PinSettings'
import { SettingsService } from '../hooks/useSettings'

interface Props {
  allPins: number[]
  peaks: Record<number, number>
  connected: boolean
  settings: SettingsService
  canAddPin: boolean
  onAddPin: () => void
  onDeletePin: (pin: number) => void
}

export default function PinsGrid({
  allPins,
  peaks,
  connected,
  settings,
  canAddPin,
  onAddPin,
  onDeletePin,
}: Props): JSX.Element {
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {allPins.map((pin) => (
          <PinSettings
            key={pin}
            pin={pin}
            peak={peaks[pin]}
            connected={connected}
            config={settings.pinConfig(pin)}
            hardware={settings.pinHardware(pin)}
            onConfigChange={(updates) => settings.setPinConfig(pin, updates)}
            onHardwareChange={(updates) => void settings.setPinHardware(pin, updates, connected)}
            onDelete={() => onDeletePin(pin)}
          />
        ))}
      </div>
      <button
        onClick={onAddPin}
        disabled={!canAddPin}
        style={{
          marginTop: 12,
          padding: '6px 14px',
          fontSize: 13,
          cursor: canAddPin ? 'pointer' : 'not-allowed',
          borderRadius: 4,
          border: '1px solid #ccc',
          background: '#fff',
          opacity: canAddPin ? 1 : 0.4,
        }}
      >
        + Add Pin
      </button>
    </div>
  )
}
