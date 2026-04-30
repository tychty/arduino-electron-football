import { useRef, useEffect } from 'react'
import GoalCircle from './GoalCircle'
import { PinConfig } from '../hooks/useSettings'
import { GoalRect, PinRect, useGoalLayout } from '../hooks/useGoalLayout'
import { VIRTUAL_MISS_PIN } from '../../../shared/config'
import { useLocaleCtx } from '../context/LocaleContext'
import type { RoundPhase } from '../hooks/useGame'

const HANDLE = 10
const HALF = HANDLE / 2
const MIN_GOAL = 80
const MIN_PIN = 0.05

interface Props {
  allPins: number[]
  pinConfigs: Record<number, PinConfig>
  scores: Readonly<Record<number, number>>
  flashingPins: ReadonlySet<number>
  editMode?: boolean
  score: number
  totalHits: number
  hitLimit: number
  endless?: boolean
  onEndGame: () => void
  roundPhase?: RoundPhase
  countdownValue?: number
  lastRoundResult?: { isMiss: boolean; points: number } | null
  summaryData?: { score: number; rank: number } | null
}

type DragTarget =
  | { kind: 'goal-move' }
  | { kind: 'goal-nw' | 'goal-ne' | 'goal-sw' | 'goal-se' | 'goal-n' | 'goal-s' | 'goal-w' | 'goal-e' }
  | { kind: 'pin-move'; pin: number }
  | { kind: 'pin-tl'; pin: number }
  | { kind: 'pin-br'; pin: number }

interface DragState {
  target: DragTarget
  mx0: number
  my0: number
  g0: GoalRect
  p0?: PinRect
}

function clampGoal(g: GoalRect): GoalRect {
  return { ...g, w: Math.max(MIN_GOAL, g.w), h: Math.max(MIN_GOAL, g.h) }
}

function clampPin(p: PinRect): PinRect {
  const x1 = Math.max(0, Math.min(1 - MIN_PIN, p.x1))
  const y1 = Math.max(0, Math.min(1 - MIN_PIN, p.y1))
  return {
    x1,
    y1,
    x2: Math.max(x1 + MIN_PIN, Math.min(1, p.x2)),
    y2: Math.max(y1 + MIN_PIN, Math.min(1, p.y2)),
  }
}

function handleStyle(cursor: string, extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(0,0,0,0.35)',
    borderRadius: 2,
    cursor,
    zIndex: 20,
    ...extra,
  }
}

export default function FootballGoal({
  allPins,
  pinConfigs,
  scores,
  flashingPins,
  editMode,
  score,
  totalHits,
  hitLimit,
  endless,
  onEndGame,
  roundPhase,
  countdownValue,
  lastRoundResult,
  summaryData,
}: Props): JSX.Element {
  const { t } = useLocaleCtx()

  const activeScoringPins = allPins.filter((pin) => {
    const c = pinConfigs[pin]
    return c?.active && !c?.miss
  })

  const { goal, setGoal, getPinRect, setPinRect } = useGoalLayout(activeScoringPins)
  const flashMiss = flashingPins.has(VIRTUAL_MISS_PIN)

  useEffect(() => {
    if (!editMode) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onEndGame()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onEndGame, editMode])

  const dragRef = useRef<DragState | null>(null)
  const goalRef = useRef(goal)
  goalRef.current = goal
  const getPinRectRef = useRef(getPinRect)
  getPinRectRef.current = getPinRect

  useEffect(() => {
    if (!editMode) return

    const onMove = (e: MouseEvent): void => {
      const d = dragRef.current
      if (!d) return
      const dx = e.clientX - d.mx0
      const dy = e.clientY - d.my0
      const g = d.g0

      switch (d.target.kind) {
        case 'goal-move':
          setGoal({ ...g, x: g.x + dx, y: g.y + dy })
          break
        case 'goal-nw':
          setGoal(clampGoal({ x: g.x + dx, y: g.y + dy, w: g.w - dx, h: g.h - dy }))
          break
        case 'goal-ne':
          setGoal(clampGoal({ x: g.x, y: g.y + dy, w: g.w + dx, h: g.h - dy }))
          break
        case 'goal-sw':
          setGoal(clampGoal({ x: g.x + dx, y: g.y, w: g.w - dx, h: g.h + dy }))
          break
        case 'goal-se':
          setGoal(clampGoal({ ...g, w: g.w + dx, h: g.h + dy }))
          break
        case 'goal-n':
          setGoal(clampGoal({ ...g, y: g.y + dy, h: g.h - dy }))
          break
        case 'goal-s':
          setGoal(clampGoal({ ...g, h: g.h + dy }))
          break
        case 'goal-w':
          setGoal(clampGoal({ ...g, x: g.x + dx, w: g.w - dx }))
          break
        case 'goal-e':
          setGoal(clampGoal({ ...g, w: g.w + dx }))
          break
        case 'pin-move': {
          const p = d.p0!
          const pw = p.x2 - p.x1
          const ph = p.y2 - p.y1
          const x1 = Math.max(0, Math.min(1 - pw, p.x1 + dx / g.w))
          const y1 = Math.max(0, Math.min(1 - ph, p.y1 + dy / g.h))
          setPinRect(d.target.pin, { x1, y1, x2: x1 + pw, y2: y1 + ph })
          break
        }
        case 'pin-tl': {
          const p = d.p0!
          setPinRect(d.target.pin, clampPin({ ...p, x1: p.x1 + dx / g.w, y1: p.y1 + dy / g.h }))
          break
        }
        case 'pin-br': {
          const p = d.p0!
          setPinRect(d.target.pin, clampPin({ ...p, x2: p.x2 + dx / g.w, y2: p.y2 + dy / g.h }))
          break
        }
      }
    }

    const onUp = (): void => {
      dragRef.current = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [editMode, setGoal, setPinRect])

  const startDrag = (e: React.MouseEvent, target: DragTarget): void => {
    e.preventDefault()
    e.stopPropagation()
    const pin = 'pin' in target ? target.pin : undefined
    dragRef.current = {
      target,
      mx0: e.clientX,
      my0: e.clientY,
      g0: goalRef.current,
      p0: pin !== undefined ? getPinRectRef.current(pin) : undefined,
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: goal.x,
        top: goal.y,
        width: goal.w,
        height: goal.h,
        backgroundColor: flashMiss ? '#cc2222' : '#2d8a2d',
        transition: flashMiss ? 'none' : 'background-color 0.35s',
        borderRadius: editMode ? 4 : 8,
        border: editMode ? '2px dashed rgba(255,255,255,0.6)' : 'none',
        boxSizing: 'border-box',
        cursor: editMode ? 'move' : 'default',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      onMouseDown={editMode ? (e) => startDrag(e, { kind: 'goal-move' }) : undefined}
    >
      {editMode && (
        <>
          <div style={handleStyle('nw-resize', { left: -HALF, top: -HALF })} onMouseDown={(e) => startDrag(e, { kind: 'goal-nw' })} />
          <div style={handleStyle('n-resize', { left: '50%', top: -HALF, transform: 'translateX(-50%)' })} onMouseDown={(e) => startDrag(e, { kind: 'goal-n' })} />
          <div style={handleStyle('ne-resize', { right: -HALF, top: -HALF })} onMouseDown={(e) => startDrag(e, { kind: 'goal-ne' })} />
          <div style={handleStyle('w-resize', { left: -HALF, top: '50%', transform: 'translateY(-50%)' })} onMouseDown={(e) => startDrag(e, { kind: 'goal-w' })} />
          <div style={handleStyle('e-resize', { right: -HALF, top: '50%', transform: 'translateY(-50%)' })} onMouseDown={(e) => startDrag(e, { kind: 'goal-e' })} />
          <div style={handleStyle('sw-resize', { left: -HALF, bottom: -HALF })} onMouseDown={(e) => startDrag(e, { kind: 'goal-sw' })} />
          <div style={handleStyle('s-resize', { left: '50%', bottom: -HALF, transform: 'translateX(-50%)' })} onMouseDown={(e) => startDrag(e, { kind: 'goal-s' })} />
          <div style={handleStyle('se-resize', { right: -HALF, bottom: -HALF })} onMouseDown={(e) => startDrag(e, { kind: 'goal-se' })} />
        </>
      )}

      {activeScoringPins.length === 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
          }}
        >
          {t((l) => l.game.noActiveScoringPins)}
        </div>
      ) : (
        activeScoringPins.map((pin) => {
          const r = getPinRect(pin)
          return (
            <div
              key={pin}
              style={{
                position: 'absolute',
                left: `${r.x1 * 100}%`,
                top: `${r.y1 * 100}%`,
                width: `${(r.x2 - r.x1) * 100}%`,
                height: `${(r.y2 - r.y1) * 100}%`,
                cursor: editMode ? 'move' : 'default',
              }}
              onMouseDown={editMode ? (e) => startDrag(e, { kind: 'pin-move', pin }) : undefined}
            >
              <GoalCircle
                scorePoints={pinConfigs[pin]?.scorePoints ?? 1}
                hitCount={scores[pin] ?? 0}
                flashing={flashingPins.has(pin)}
                editMode={editMode}
                pin={pin}
              />
              {editMode && (
                <>
                  <div
                    style={handleStyle('nw-resize', { left: -HALF, top: -HALF, zIndex: 30 })}
                    onMouseDown={(e) => startDrag(e, { kind: 'pin-tl', pin })}
                  />
                  <div
                    style={handleStyle('se-resize', { right: -HALF, bottom: -HALF, zIndex: 30 })}
                    onMouseDown={(e) => startDrag(e, { kind: 'pin-br', pin })}
                  />
                </>
              )}
            </div>
          )
        })
      )}

      {flashMiss && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            pointerEvents: 'none',
          }}
        >
          {t((l) => l.game.miss)}
        </div>
      )}

      {roundPhase === 'idle' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: Math.max(12, goal.w * 0.07),
              fontWeight: 900,
              color: '#fff',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: 2,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {t((l) => l.game.pressSpaceToStart)}
          </div>
        </div>
      )}

      {roundPhase === 'countdown' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: Math.max(32, goal.h * 0.45),
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1,
              textShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
          >
            {countdownValue}
          </div>
        </div>
      )}

      {roundPhase === 'result' && lastRoundResult && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Math.max(6, goal.h * 0.04),
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: Math.max(16, goal.h * 0.18), fontWeight: 900, color: '#fff', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {lastRoundResult.isMiss ? t((l) => l.game.miss) : t((l) => l.game.goal)}
          </div>
          <div style={{ fontSize: Math.max(28, goal.h * 0.32), fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
            {lastRoundResult.points}
          </div>
          <div style={{ fontSize: Math.max(10, goal.h * 0.06), color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
            {t((l) => l.game.points)}
          </div>
          <div style={{ fontSize: Math.max(8, goal.w * 0.055), fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginTop: Math.max(4, goal.h * 0.04), textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {t((l) => l.game.pressSpaceToStart)}
          </div>
        </div>
      )}

      {summaryData && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Math.max(6, goal.h * 0.04),
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: Math.max(28, goal.h * 0.32), fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
            {summaryData.score}
          </div>
          <div style={{ fontSize: Math.max(10, goal.h * 0.06), color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
            {t((l) => l.game.points)}
          </div>
          <div style={{ fontSize: Math.max(14, goal.h * 0.12), fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            #{summaryData.rank} {t((l) => l.game.place)}
          </div>
          <div style={{ fontSize: Math.max(8, goal.w * 0.055), fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginTop: Math.max(4, goal.h * 0.04), textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {t((l) => l.game.pressSpaceToLeaderboard)}
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '8px 16px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 10, opacity: 0.7 }}>{t((l) => l.game.score)}</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', lineHeight: 1 }}>{score}</div>
        </div>
        {!endless && (
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{t((l) => l.game.hits)}</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', lineHeight: 1 }}>
              {totalHits}
              <span style={{ fontSize: 14, opacity: 0.6, fontWeight: 400 }}>/{hitLimit}</span>
            </div>
          </div>
        )}
        {editMode && (
          <button
            onClick={onEndGame}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              cursor: 'pointer',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              pointerEvents: 'auto',
            }}
          >
            {t((l) => l.game.done)}
          </button>
        )}
      </div>
    </div>
  )
}
