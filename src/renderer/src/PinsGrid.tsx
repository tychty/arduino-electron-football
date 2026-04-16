import { PINS } from './pins'
import PinSettings from './PinSettings'

interface Props {
  peaks: Record<number, number>
  connected: boolean
}

export default function PinsGrid({ peaks, connected }: Props): JSX.Element {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
      {PINS.map((pin) => (
        <PinSettings
          key={pin}
          pin={pin}
          peak={peaks[pin]}
          connected={connected}
        />
      ))}
    </div>
  )
}
