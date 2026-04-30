import FootballGoal from '../components/FootballGoal'
import { useSettingsCtx } from '../context/SettingsContext'
import type { RoundPhase } from '../hooks/useGame'
import { VIRTUAL_MISS_PIN } from '../../../shared/config'
import logoUrl from '../../media/logo.svg'
import goalBgUrl from '../../media/goal.svg'

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
  playerName?: string
}

const TRIANGLE_PATTERN = [
  'repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(0,0,0,0.07) 30px, rgba(0,0,0,0.07) 32px)',
  'repeating-linear-gradient(-60deg, transparent, transparent 30px, rgba(0,0,0,0.07) 30px, rgba(0,0,0,0.07) 32px)',
].join(', ')

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
  playerName = '',
}: Props): JSX.Element {
  const { allPins, configs, hitLimit } = useSettingsCtx()
  const flashMiss = flashingPins.has(VIRTUAL_MISS_PIN)

  const showIdle = roundPhase === 'idle' && !editLayout
  const showCountdown = roundPhase === 'countdown' && !editLayout
  const showResult = roundPhase === 'result' && lastRoundResult != null && !editLayout
  const showSummary = !!summaryData && !editLayout

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0d200d', overflow: 'hidden' }}>

      {/* Miss flash */}
      {flashMiss && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(160, 0, 0, 0.45)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* Header HUD */}
      {!editLayout && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 32px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
            <span style={{ opacity: 0.65 }}>PLAYER: </span>
            <span>{playerName.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={logoUrl} alt="Lenovo" style={{ height: 28 }} />
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.8, textAlign: 'center', lineHeight: 1.3 }}>
              FIFA<br />WORLD CUP 26™
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
            <div><span style={{ opacity: 0.65 }}>SCORE: </span>{score}</div>
            {!endless && (
              <div><span style={{ opacity: 0.65 }}>KICKS: </span>{totalHits}/{hitLimit}</div>
            )}
          </div>
        </div>
      )}

      {/* Football Goal (interactive area) */}
      <FootballGoal
        allPins={allPins}
        pinConfigs={configs}
        scores={scores}
        flashingPins={flashingPins}
        editMode={editLayout}
        onEndGame={onEndGame}
        goalBgUrl={goalBgUrl}
      />

      {/* Footer */}
      {!editLayout && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0, right: 0,
            textAlign: 'center',
            fontSize: 11,
            opacity: 0.55,
            letterSpacing: 1,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          Powered by Lenovo in Partnership with FIFA
        </div>
      )}

      {/* Idle overlay */}
      {showIdle && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#6B0000',
            backgroundImage: TRIANGLE_PATTERN,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: 'clamp(20px, 3vw, 40px)', fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase' }}>
            PRESS SPACE TO START
          </div>
        </div>
      )}

      {/* Countdown overlay */}
      {showCountdown && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: 'clamp(80px, 20vh, 200px)',
              fontWeight: 900,
              lineHeight: 1,
              textShadow: '0 8px 40px rgba(0,0,0,0.9)',
            }}
          >
            {countdownValue}
          </div>
        </div>
      )}

      {/* Round result overlay */}
      {showResult && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: lastRoundResult!.isMiss ? '#6B0000' : '#0d1b3e',
            backgroundImage: TRIANGLE_PATTERN,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontSize: 'clamp(40px, 8vw, 96px)',
              fontWeight: 900,
              letterSpacing: 4,
              textTransform: 'uppercase',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {lastRoundResult!.isMiss ? 'MISS!' : 'GOOOAAAL!'}
          </div>
          <div style={{ fontSize: 'clamp(12px, 1.8vw, 20px)', letterSpacing: 3, textTransform: 'uppercase', opacity: 0.85 }}>
            {lastRoundResult!.isMiss
              ? `${playerName.toUpperCase()} MISSES!`
              : `${playerName.toUpperCase()} SCORES BIG!`}
          </div>
          <div
            style={{
              width: 'clamp(100px, 14vw, 160px)',
              height: 'clamp(100px, 14vw, 160px)',
              borderRadius: '50%',
              background: '#CC0000',
              border: '4px solid rgba(255,255,255,0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1 }}>
              {lastRoundResult!.points}
            </div>
            <div style={{ fontSize: 'clamp(9px, 1.2vw, 14px)', letterSpacing: 2, opacity: 0.8 }}>POINTS</div>
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 'clamp(12px, 1.8vw, 22px)',
              fontWeight: 700,
              letterSpacing: 5,
              textTransform: 'uppercase',
              opacity: 0.8,
            }}
          >
            PRESS SPACE TO START
          </div>
        </div>
      )}

      {/* Game over / summary overlay */}
      {showSummary && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#0d1b3e',
            backgroundImage: TRIANGLE_PATTERN,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: 'clamp(14px, 2vw, 22px)', letterSpacing: 4, opacity: 0.7, textTransform: 'uppercase' }}>
            Game Over
          </div>
          <div style={{ fontSize: 'clamp(60px, 12vw, 120px)', fontWeight: 900, lineHeight: 1 }}>
            {summaryData!.score}
          </div>
          <div style={{ fontSize: 'clamp(9px, 1.2vw, 14px)', letterSpacing: 3, opacity: 0.6, textTransform: 'uppercase' }}>
            Points
          </div>
          <div style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 700, letterSpacing: 2, marginTop: 8 }}>
            RANK #{summaryData!.rank}
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 'clamp(12px, 1.8vw, 20px)',
              fontWeight: 700,
              letterSpacing: 5,
              textTransform: 'uppercase',
              opacity: 0.8,
            }}
          >
            PRESS SPACE TO CONTINUE
          </div>
        </div>
      )}
    </div>
  )
}
