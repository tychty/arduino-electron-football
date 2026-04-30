import FootballGoal from '../components/FootballGoal'
import { useSettingsCtx } from '../context/SettingsContext'
import type { RoundPhase } from '../hooks/useGame'

interface Props {
  scores: Readonly<Record<number, number>>
  totalHits: number
  score: number
  flashingPins: ReadonlySet<number>
  roundPhase: RoundPhase
  countdownValue: number
  lastRoundResult?: { isMiss: boolean; points: number } | null
  summaryData?: { score: number; rank: number } | null
  onEndGame: () => void
  endless?: boolean
  editLayout?: boolean
}

export default function GamePage({
  scores,
  totalHits,
  score,
  flashingPins,
  roundPhase,
  countdownValue,
  lastRoundResult,
  summaryData,
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
        roundPhase={roundPhase}
        countdownValue={countdownValue}
        lastRoundResult={lastRoundResult}
        summaryData={summaryData}
      />
    </div>
  )
}
