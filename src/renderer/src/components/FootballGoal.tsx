import GoalCircle from './GoalCircle'
import { PinConfig } from '../hooks/useSettings'
import { VIRTUAL_MISS_PIN } from '../../../shared/config'
import { useLocaleCtx } from '../context/LocaleContext'

interface Props {
  allPins: number[]
  pinConfigs: Record<number, PinConfig>
  scores: Readonly<Record<number, number>>
  flashingPins: ReadonlySet<number>
}

export default function FootballGoal({
  allPins,
  pinConfigs,
  scores,
  flashingPins,
}: Props): JSX.Element {
  const { t } = useLocaleCtx()

  const activeScoringPins = allPins.filter((pin) => {
    const config = pinConfigs[pin]
    return config?.active && !config?.miss
  })

  const flashMiss = flashingPins.has(VIRTUAL_MISS_PIN)

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
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          {t((l) => l.game.noActiveScoringPins)}
        </div>
      ) : (
        activeScoringPins.map((pin) => (
          <GoalCircle
            key={pin}
            scorePoints={pinConfigs[pin]?.scorePoints ?? 1}
            hitCount={scores[pin] ?? 0}
            flashing={flashingPins.has(pin)}
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
          {t((l) => l.game.miss)}
        </div>
      )}
    </div>
  )
}
