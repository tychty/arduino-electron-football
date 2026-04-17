import FootballGoal from '../FootballGoal'
import { PinConfig } from '../useSettings'

interface Props {
  allPins: number[]
  pinConfigs: Record<number, PinConfig>
  hits: Record<number, number>
  totalHits: number
  hitLimit: number
  score: number
  flashPin: number | null
  flashMiss: boolean
  onEndGame: () => void
}

export default function GamePage({
  allPins,
  pinConfigs,
  hits,
  totalHits,
  hitLimit,
  score,
  flashPin,
  flashMiss,
  onEndGame,
}: Props): JSX.Element {
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
        pinConfigs={pinConfigs}
        hits={hits}
        flashPin={flashPin}
        flashMiss={flashMiss}
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
