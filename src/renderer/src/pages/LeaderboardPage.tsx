import type { LeaderboardEntry } from '../services/arduinoService'
import logoUrl from '../../media/logo.svg'
import bgUrl from '../../media/bg.svg'

interface Props {
  entries: LeaderboardEntry[]
  onNewGame: () => void
}

export default function LeaderboardPage({ entries, onNewGame }: Props): JSX.Element {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom, #4F1111, #B52727)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px 32px',
        overflowY: 'auto',
      }}
    >
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', opacity: 0.2, pointerEvents: 'none' }} />
      {/* Logos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
        <img src={logoUrl} alt="Lenovo" style={{ height: 36 }} />
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.3)' }} />
        <div style={{ fontSize: 13, letterSpacing: 2, textAlign: 'center', lineHeight: 1.4, opacity: 0.85 }}>
          FIFA<br />WORLD CUP 26™
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 'clamp(32px, 5vw, 64px)',
          fontWeight: 900,
          letterSpacing: 6,
          textTransform: 'uppercase',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        LEADERBOARD
      </h1>
      <div
        style={{
          fontSize: 'clamp(11px, 1.4vw, 18px)',
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: 0.75,
          marginBottom: 36,
          textAlign: 'center',
        }}
      >
        TOP SCORERS OF THE DAY
      </div>

      {/* Table */}
      <div style={{ width: '100%', maxWidth: 680 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 100px',
            gap: '0 16px',
            borderBottom: '2px solid rgba(255,255,255,0.3)',
            paddingBottom: 10,
            marginBottom: 4,
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: 3, opacity: 0.65, textTransform: 'uppercase' }}>Rank</div>
          <div style={{ fontSize: 12, letterSpacing: 3, opacity: 0.65, textTransform: 'uppercase' }}>Player Name</div>
          <div style={{ fontSize: 12, letterSpacing: 3, opacity: 0.65, textTransform: 'uppercase', textAlign: 'right' }}>Score</div>
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.4, fontSize: 14, padding: '24px 0' }}>
            No scores yet
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 100px',
                gap: '0 16px',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700 }}>{i + 1}</div>
              <div style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase' }}>{entry.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'right' }}>{entry.score}</div>
            </div>
          ))
        )}
      </div>

      {/* Press space */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 48,
          fontSize: 'clamp(14px, 2vw, 24px)',
          fontWeight: 900,
          letterSpacing: 5,
          textTransform: 'uppercase',
          opacity: 0.9,
          textAlign: 'center',
        }}
      >
        PRESS SPACE TO START
      </div>
    </div>
  )
}
