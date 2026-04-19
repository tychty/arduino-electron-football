import type { LeaderboardEntry } from '../services/arduinoService'

interface Props {
  entries: LeaderboardEntry[]
  onNewGame: () => void
  onSettings: () => void
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function LeaderboardPage({ entries, onNewGame, onSettings }: Props): JSX.Element {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 32px',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ margin: '0 0 32px', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 }}>
        Leaderboard
      </h1>

      {entries.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: 14, marginBottom: 32 }}>no scores yet</div>
      ) : (
        <table
          style={{
            width: '100%',
            maxWidth: 480,
            borderCollapse: 'collapse',
            marginBottom: 32,
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', color: '#888', textAlign: 'left' }}>
              <th style={{ padding: '6px 12px', fontWeight: 600 }}>#</th>
              <th style={{ padding: '6px 12px', fontWeight: 600 }}>name</th>
              <th style={{ padding: '6px 12px', fontWeight: 600, textAlign: 'right' }}>score</th>
              <th style={{ padding: '6px 12px', fontWeight: 600, textAlign: 'right' }}>date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}
              >
                <td style={{ padding: '8px 12px', color: '#aaa' }}>{i + 1}</td>
                <td style={{ padding: '8px 12px', fontWeight: i === 0 ? 700 : 400 }}>{entry.name}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold' }}>
                  {entry.score}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#aaa' }}>
                  {formatDate(entry.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onNewGame}
          style={{
            padding: '12px 32px',
            fontSize: 15,
            cursor: 'pointer',
            borderRadius: 4,
            border: 'none',
            background: '#2d8a2d',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          New Game
        </button>
        <button
          onClick={onSettings}
          style={{
            padding: '12px 24px',
            fontSize: 15,
            cursor: 'pointer',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#333',
          }}
        >
          Settings
        </button>
      </div>
    </div>
  )
}
