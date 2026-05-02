interface Props {
  scorePoints: number
  hitCount: number
  editMode?: boolean
  pin?: number
}

export default function GoalCircle({ scorePoints, hitCount, editMode, pin }: Props): JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#CC0000',
        boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s',
        userSelect: 'none',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: '2.2vw', fontWeight: 900, lineHeight: 1, color: '#fff' }}>
        {editMode ? `#${pin}` : scorePoints}
      </div>
      <div style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.75)', letterSpacing: 1, marginTop: '4%' }}>
        {editMode ? `×${hitCount}` : 'PTS'}
      </div>
    </div>
  )
}
