import { useRef, useEffect, useState, useMemo } from 'react'
import FootballGoal from '../components/FootballGoal'
import { useSettingsCtx } from '../context/SettingsContext'
import { useLocaleCtx } from '../context/LocaleContext'
import type { RoundPhase } from '../hooks/useGame'
import { VIRTUAL_MISS_PIN } from '../../../shared/config'
import { useGoalLayout } from '../hooks/useGoalLayout'
import logoUrl from '../../media/logo.svg'
import goalBgUrl from '../../media/goal.svg'
import gameBgUrl from '../../media/game_bg.png'

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
  const { allPins, configs, hitLimit, hudLeftBound, hudRightBound, setHudLeftBound, setHudRightBound, flashDuration } = useSettingsCtx()
  const { t } = useLocaleCtx()
  const flashMiss = flashingPins.has(VIRTUAL_MISS_PIN)
  const flashHitPin = useMemo(() => [...flashingPins].find(p => p !== VIRTUAL_MISS_PIN) ?? null, [flashingPins])

  const activeScoringPins = useMemo(
    () => allPins.filter(pin => configs[pin]?.active && !configs[pin]?.miss),
    [allPins, configs]
  )
  const { goal, setGoal, getPinRect, setPinRect, clearLayout } = useGoalLayout(activeScoringPins)

  const [resultVisible, setResultVisible] = useState(false)
  useEffect(() => {
    if (roundPhase !== 'result') { setResultVisible(false); return }
    const t = setTimeout(() => setResultVisible(true), flashDuration)
    return () => clearTimeout(t)
  }, [roundPhase, flashDuration])

  const dragTarget = useRef<'left' | 'right' | null>(null)
  const hudLeftRef = useRef(hudLeftBound)
  const hudRightRef = useRef(hudRightBound)
  useEffect(() => { hudLeftRef.current = hudLeftBound }, [hudLeftBound])
  useEffect(() => { hudRightRef.current = hudRightBound }, [hudRightBound])

  useEffect(() => {
    if (!editLayout) return
    const onMove = (e: MouseEvent): void => {
      if (!dragTarget.current) return
      const norm = Math.max(0, Math.min(1, e.clientX / window.innerWidth))
      if (dragTarget.current === 'left') {
        setHudLeftBound(Math.min(norm, hudRightRef.current - 0.05))
      } else {
        setHudRightBound(Math.max(norm, hudLeftRef.current + 0.05))
      }
    }
    const onUp = (): void => { dragTarget.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [editLayout])

  const showIdle = roundPhase === 'idle' && !editLayout
  const showCountdown = roundPhase === 'countdown' && !editLayout
  const showResult = resultVisible && roundPhase === 'result' && lastRoundResult != null && !editLayout
  const showSummary = !!summaryData && !editLayout
  const showModal = showIdle || showResult || showSummary

  const modalClass =
    showResult && !lastRoundResult!.isMiss ? 'bg-blue'
    : showSummary ? 'bg-blue'
    : 'bg-red'

  const hudBoundsVw = (hudRightBound - hudLeftBound) * 100

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${gameBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>

      {/* Miss flash — full-screen radial gradient, exponential red vignette from viewport center */}
      {flashMiss && (() => {
        const fallMs = Math.max(0, flashDuration - 100)
        return (
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(160,0,0,0) 0%, rgba(160,0,0,0) 20%, rgba(160,0,0,0.05) 40%, rgba(160,0,0,0.16) 60%, rgba(160,0,0,0.38) 80%, rgba(160,0,0,0.55) 90%, rgba(160,0,0,0.75) 100%)',
              animation: `flash-rise 100ms ease-in, flash-fall ${fallMs}ms ease-out 100ms forwards`,
              pointerEvents: 'none',
              zIndex: 35,
            }}
          />
        )
      })()}

      {/* Hit flash — full-screen elliptical glow matching the struck goal circle shape */}
      {flashHitPin !== null && (() => {
        const r = getPinRect(flashHitPin)
        const gx = (hudLeftBound + goal.x) * window.innerWidth
        const gy = goal.y * window.innerHeight
        const gw = goal.w * window.innerWidth
        const gh = goal.h * window.innerHeight
        const cx = gx + (r.x1 + r.x2) / 2 * gw
        const cy = gy + (r.y1 + r.y2) / 2 * gh
        const rx = (r.x2 - r.x1) * gw / 2
        const ry = (r.y2 - r.y1) * gh / 2
        const glow = Math.min(window.innerWidth, window.innerHeight) * 0.05
        const outerRx = rx + glow
        const outerRy = ry + glow
        const cutPct = ((rx / outerRx + ry / outerRy) / 2 * 100).toFixed(1)
        const fallMs = Math.max(0, flashDuration - 100)
        return (
          <div
            style={{
              position: 'fixed', inset: 0,
              background: `radial-gradient(ellipse ${outerRx}px ${outerRy}px at ${cx}px ${cy}px, transparent ${cutPct}%, rgba(0,200,80,0.85) ${cutPct}%, rgba(0,200,80,0) 100%)`,
              animation: `flash-rise 100ms ease-in, flash-fall ${fallMs}ms ease-out 100ms forwards`,
              pointerEvents: 'none',
              zIndex: 35,
            }}
          />
        )
      })()}

      {/* Header HUD — full viewport width, no HUD bounds */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
          zIndex: 30,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: `calc(${hudLeftBound * 100}vw + 32px)`,
            paddingRight: `calc(${(1 - hudRightBound) * 100}vw + 32px)`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
            <span style={{ opacity: 0.65 }}>PLAYER: </span>
            <span style={{ opacity: editLayout ? 0.4 : 1 }}>{editLayout ? 'PLAYER NAME' : playerName.toUpperCase()}</span>
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
      </div>

      {/* Bounded content container */}
      <div
        style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: `${hudLeftBound * 100}vw`,
          right: `${(1 - hudRightBound) * 100}vw`,
          overflow: 'hidden',
          zIndex: 29,
        }}
      >

        {/* Football Goal (interactive area) */}
        <FootballGoal
          allPins={allPins}
          pinConfigs={configs}
          scores={scores}
          editMode={editLayout}
          onEndGame={onEndGame}
          goalBgUrl={goalBgUrl}
          goal={goal}
          setGoal={setGoal}
          getPinRect={getPinRect}
          setPinRect={setPinRect}
        />

        {/* Edit mode buttons — bottom-right of bounded container */}
        {editLayout && (
          <div
            style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 8, zIndex: 100 }}
          >
            <button
              onClick={clearLayout}
              style={{
                padding: '6px 16px',
                fontSize: 12,
                cursor: 'pointer',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
              }}
            >
              {t((l) => l.game.resetLayout)}
            </button>
            <button
              onClick={onEndGame}
              style={{
                padding: '6px 16px',
                fontSize: 12,
                cursor: 'pointer',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
              }}
            >
              {t((l) => l.game.done)}
            </button>
          </div>
        )}

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

        {/* Countdown content */}
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
      </div>

      {/* State modal — centered on viewport, clamped to HUD bounds if wider */}
      {showModal && (
        <div
          className={modalClass}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'max(400px, 70vw)',
            maxWidth: `${hudBoundsVw}vw`,
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.15)',
            overflow: 'hidden',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 40px',
            gap: 20,
            boxSizing: 'border-box',
            containerType: 'inline-size',
          }}
        >
          {showIdle && (
            <div style={{ fontSize: 'clamp(16px, 5cqw, 36px)', fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase', textAlign: 'center' }}>
              PRESS SPACE TO START
            </div>
          )}

          {showResult && (
            <>
              <div
                style={{
                  fontSize: 'clamp(32px, 8cqw, 80px)',
                  fontWeight: 900,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  textAlign: 'center',
                }}
              >
                {lastRoundResult!.isMiss ? 'MISS!' : 'GOOOAAAL!'}
              </div>
              <div style={{ fontSize: 'clamp(12px, 3.5cqw, 20px)', letterSpacing: 3, textTransform: 'uppercase', opacity: 0.85, textAlign: 'center' }}>
                {lastRoundResult!.isMiss
                  ? `${playerName.toUpperCase()} MISSES!`
                  : `${playerName.toUpperCase()} SCORES BIG!`}
              </div>
              <div
                style={{
                  width: 'clamp(80px, 20cqw, 140px)',
                  height: 'clamp(80px, 20cqw, 140px)',
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
                <div style={{ fontSize: 'clamp(28px, 9cqw, 56px)', fontWeight: 900, lineHeight: 1 }}>
                  {lastRoundResult!.points}
                </div>
                <div style={{ fontSize: 'clamp(9px, 2.5cqw, 13px)', letterSpacing: 2, opacity: 0.8 }}>POINTS</div>
              </div>
              <div
                style={{
                  marginTop: 24,
                  fontSize: 'clamp(12px, 3cqw, 20px)',
                  fontWeight: 700,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  opacity: 0.8,
                  textAlign: 'center',
                }}
              >
                PRESS SPACE TO START
              </div>
            </>
          )}

          {showSummary && (
            <>
              <div style={{ fontSize: 'clamp(12px, 3.5cqw, 20px)', letterSpacing: 4, opacity: 0.7, textTransform: 'uppercase', textAlign: 'center' }}>
                Game Over
              </div>
              <div style={{ fontSize: 'clamp(48px, 14cqw, 100px)', fontWeight: 900, lineHeight: 1, textAlign: 'center' }}>
                {summaryData!.score}
              </div>
              <div style={{ fontSize: 'clamp(9px, 2.5cqw, 13px)', letterSpacing: 3, opacity: 0.6, textTransform: 'uppercase', textAlign: 'center' }}>
                Points
              </div>
              <div style={{ fontSize: 'clamp(16px, 5cqw, 32px)', fontWeight: 700, letterSpacing: 2, marginTop: 8, textAlign: 'center' }}>
                RANK #{summaryData!.rank}
              </div>
              <div
                style={{
                  marginTop: 32,
                  fontSize: 'clamp(12px, 3cqw, 20px)',
                  fontWeight: 700,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  opacity: 0.8,
                  textAlign: 'center',
                }}
              >
                PRESS SPACE TO CONTINUE
              </div>
            </>
          )}
        </div>
      )}

      {/* HUD boundary drag lines — on outer container, full viewport height */}
      {editLayout && (
        <>
          {(['left', 'right'] as const).map((side) => {
            const pos = side === 'left' ? hudLeftBound : hudRightBound
            return (
              <div
                key={side}
                style={{
                  position: 'absolute',
                  top: 0, bottom: 0,
                  left: `${pos * 100}%`,
                  width: 2,
                  transform: 'translateX(-50%)',
                  background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 8px, transparent 8px, transparent 16px)',
                  zIndex: 50,
                  cursor: 'ew-resize',
                }}
              >
                <div
                  onMouseDown={(e) => { e.preventDefault(); dragTarget.current = side }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 10, height: 10,
                    background: 'white',
                    border: '1px solid rgba(255,255,255,0.4)',
                    cursor: 'ew-resize',
                  }}
                />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
