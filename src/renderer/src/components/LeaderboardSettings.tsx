import { useState, useEffect } from 'react'
import { useLeaderboardCtx } from '../context/LeaderboardContext'
import { arduinoService } from '../services/arduinoService'

export default function LeaderboardSettings(): JSX.Element {
  const { clear } = useLeaderboardCtx()
  const [confirming, setConfirming] = useState(false)
  const [leaderboardPath, setLeaderboardPath] = useState('')

  useEffect(() => {
    arduinoService.getLeaderboardPath().then(setLeaderboardPath)
  }, [])

  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>
        Leaderboard
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leaderboardPath ? (
          <button
            onClick={() => window.arduino.leaderboard.showInFolder()}
            style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textAlign: 'left' }}
          >
            {leaderboardPath}
          </button>
        ) : null}
        {confirming ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#888' }}>clear all entries?</span>
            <button
              onClick={async () => { await clear(); setConfirming(false) }}
              style={{ fontSize: 12, cursor: 'pointer', color: '#c0392b', background: 'none', border: '1px solid #c0392b', borderRadius: 4, padding: '2px 8px' }}
            >
              yes, clear
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{ fontSize: 12, cursor: 'pointer', color: '#888', background: 'none', border: '1px solid #aaa', borderRadius: 4, padding: '2px 8px' }}
            >
              cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{ fontSize: 13, cursor: 'pointer', color: '#c0392b', background: 'none', border: '1px solid #c0392b', borderRadius: 4, padding: '4px 12px', alignSelf: 'flex-start' }}
          >
            reset leaderboard
          </button>
        )}
      </div>
    </section>
  )
}
