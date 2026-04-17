import GoalCircle from './GoalCircle'
import { PinConfig } from './useSettings'

interface Props {
  allPins: number[]
  pinConfigs: Record<number, PinConfig>
  hits: Record<number, number>
  flashPin: number | null
  flashMiss: boolean
}

export default function FootballGoal({
  allPins,
  pinConfigs,
  hits,
  flashPin,
  flashMiss,
}: Props): JSX.Element {
  const activeScoringPins = allPins.filter((pin) => {
    const config = pinConfigs[pin]
    return config?.active && !config?.miss
  })

  return (
    <div
      style={{
        position: 'relative',
        width: 400,
        minHeight: 200,
        backgroundColor: flashMiss ? '#cc2222' : '#2d8a2d',
        transition: flashMiss ? 'none' : 'background-color 0.35s',
        borderRadius: 8,
        padding: 24,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {activeScoringPins.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>no active scoring pins</div>
      ) : (
        activeScoringPins.map((pin) => (
          <GoalCircle
            key={pin}
            scorePoints={pinConfigs[pin]?.scorePoints ?? 1}
            hitCount={hits[pin] ?? 0}
            flashing={flashPin === pin}
          />
        ))
      )}

      {flashMiss && (
        <div
          style={{
            position: 'absolute',
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            pointerEvents: 'none',
          }}
        >
          MISS
        </div>
      )}
    </div>
  )
}
