import FootballGoal from '../FootballGoal'
import { useSettingsCtx } from '../SettingsContext'

interface Props {
  scores: Readonly<Record<number, number>>
  totalHits: number
  score: number
  flashingPins: ReadonlySet<number>
  onEndGame: () => void
}

export default function GamePage({
  scores,
  totalHits,
  score,
  flashingPins,
  onEndGame,
}: Props): JSX.Element {
  const { allPins, configs, hitLimit } = useSettingsCtx()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888' }}>score</div>
          <div style={{ fontSize: 56, fontWeight: 'bold', lineHeight: 1 }}>{score}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888' }}>hits</div>
          <div style={{ fontSize: 56, fontWeight: 'bold', lineHeight: 1, color: '#555' }}>
            {totalHits}
            <span style={{ fontSize: 20, color: '#aaa', fontWeight: 400 }}>/{hitLimit}</span>
          </div>
        </div>
      </div>

      <FootballGoal
        allPins={allPins}
        pinConfigs={configs}
        scores={scores}
        flashingPins={flashingPins}
      />

      <button
        onClick={onEndGame}
        style={{
          padding: '10px 28px',
          fontSize: 14,
          cursor: 'pointer',
          borderRadius: 4,
          border: '1px solid #ccc',
          background: '#fff',
          color: '#555',
          marginTop: 8,
        }}
      >
        End Game
      </button>
    </div>
  )
}
