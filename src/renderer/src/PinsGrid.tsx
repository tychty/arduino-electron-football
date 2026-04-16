import PinSettings from './PinSettings'
import { PinConfig } from './usePinConfigs'

interface Props {
  allPins: number[]
  peaks: Record<number, number>
  connected: boolean
  pinConfigs: Record<number, PinConfig>
  onAddPin: () => void
  onDeletePin: (pin: number) => void
  onConfigChange: (pin: number, updates: Partial<PinConfig>) => void
}

export default function PinsGrid({
  allPins,
  peaks,
  connected,
  pinConfigs,
  onAddPin,
  onDeletePin,
  onConfigChange,
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
            config={pinConfigs[pin] ?? { active: true, miss: false, scorePoints: 1 }}
            onConfigChange={(updates) => onConfigChange(pin, updates)}
            onDelete={() => onDeletePin(pin)}
          />
        ))}
      </div>
      <button
        onClick={onAddPin}
        style={{
          marginTop: 12,
          padding: '6px 14px',
          fontSize: 13,
          cursor: 'pointer',
          borderRadius: 4,
          border: '1px solid #ccc',
          background: '#fff',
        }}
      >
        + Add Pin
      </button>
    </div>
  )
}
