import { useState, useEffect } from 'react'
import { useLeaderboardCtx } from '../context/LeaderboardContext'
import { arduinoService } from '../services/arduinoService'
import { useLocaleCtx } from '../context/LocaleContext'
import { useSettingsCtx } from '../context/SettingsContext'

export default function LeaderboardSettings(): JSX.Element {
  const { clear } = useLeaderboardCtx()
  const { t } = useLocaleCtx()
  const { leaderboardLimit, setLeaderboardLimit } = useSettingsCtx()
  const [confirming, setConfirming] = useState(false)
  const [leaderboardPath, setLeaderboardPath] = useState('')

  useEffect(() => {
    arduinoService.getLeaderboardPath().then(setLeaderboardPath)
  }, [])

  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>
        {t((l) => l.settings.leaderboard)}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ width: 160, color: '#555' }}>{t((l) => l.settings.leaderboardLimit)}</span>
          <input
            type="number"
            min={1}
            value={leaderboardLimit}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              if (!isNaN(n) && n >= 1) setLeaderboardLimit(n)
            }}
            style={{ width: 70, padding: '3px 6px', fontSize: 13, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
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
            <span style={{ fontSize: 13, color: '#888' }}>{t((l) => l.settings.clearAllEntries)}</span>
            <button
              onClick={async () => { await clear(); setConfirming(false) }}
              style={{ fontSize: 12, cursor: 'pointer', color: '#c0392b', background: 'none', border: '1px solid #c0392b', borderRadius: 4, padding: '2px 8px' }}
            >
              {t((l) => l.settings.yesClear)}
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{ fontSize: 12, cursor: 'pointer', color: '#888', background: 'none', border: '1px solid #aaa', borderRadius: 4, padding: '2px 8px' }}
            >
              {t((l) => l.settings.cancel)}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{ fontSize: 13, cursor: 'pointer', color: '#c0392b', background: 'none', border: '1px solid #c0392b', borderRadius: 4, padding: '4px 12px', alignSelf: 'flex-start' }}
          >
            {t((l) => l.settings.resetLeaderboard)}
          </button>
        )}
      </div>
    </section>
  )
}
