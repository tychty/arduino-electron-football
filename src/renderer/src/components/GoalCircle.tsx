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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '3.2vw', fontWeight: 900, lineHeight: 1, color: '#fff', textShadow: '-8px -8px 0 #000, 8px -8px 0 #000, -8px 8px 0 #000, 8px 8px 0 #000, 0 -8px 0 #000, 0 8px 0 #000, -8px 0 0 #000, 8px 0 0 #000, -5px -8px 0 #000, 5px -8px 0 #000, -5px 8px 0 #000, 5px 8px 0 #000, -8px -5px 0 #000, 8px -5px 0 #000, -8px 5px 0 #000, 8px 5px 0 #000, -3px -8px 0 #000, 3px -8px 0 #000, -3px 8px 0 #000, 3px 8px 0 #000, -8px -3px 0 #000, 8px -3px 0 #000, -8px 3px 0 #000, 8px 3px 0 #000' }}>
        {editMode ? `#${pin}` : scorePoints}
      </div>
      <div style={{ fontSize: '2.2vw', fontWeight: 900, color: '#fff', marginTop: '4%', textShadow: '-5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000, 5px 5px 0 #000, 0 -5px 0 #000, 0 5px 0 #000, -5px 0 0 #000, 5px 0 0 #000, -3px -5px 0 #000, 3px -5px 0 #000, -3px 5px 0 #000, 3px 5px 0 #000, -5px -3px 0 #000, 5px -3px 0 #000, -5px 3px 0 #000, 5px 3px 0 #000' }}>
        {editMode ? `×${hitCount}` : 'PTS'}
      </div>
    </div>
  )
}
