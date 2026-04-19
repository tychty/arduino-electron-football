import FootballGoal from '../components/FootballGoal'
import { useSettingsCtx } from '../context/SettingsContext'

interface Props {
  scores: Readonly<Record<number, number>>
  totalHits: number
  score: number
  flashingPins: ReadonlySet<number>
  onEndGame: () => void
  endless?: boolean
  editLayout?: boolean
}

export default function GamePage({
  scores,
  totalHits,
  score,
  flashingPins,
  onEndGame,
  endless,
  editLayout,
}: Props): JSX.Element {
  const { allPins, configs, hitLimit } = useSettingsCtx()

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <FootballGoal
        allPins={allPins}
        pinConfigs={configs}
        scores={scores}
        flashingPins={flashingPins}
        editMode={editLayout}
        score={score}
        totalHits={totalHits}
        hitLimit={hitLimit}
        endless={endless}
        onEndGame={onEndGame}
      />
    </div>
  )
}
