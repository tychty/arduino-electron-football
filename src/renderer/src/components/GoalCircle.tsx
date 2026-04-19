interface Props {
  scorePoints: number
  hitCount: number
  flashing: boolean
  editMode?: boolean
  pin?: number
}

export default function GoalCircle({ scorePoints, hitCount, flashing, editMode, pin }: Props): JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: flashing ? '#ffdd00' : '#ffffff',
        border: '2px solid #333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: flashing ? 'none' : 'background-color 0.3s',
        userSelect: 'none',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 1 }}>{scorePoints}pt</div>
      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
        {editMode ? `#${pin}` : `×${hitCount}`}
      </div>
    </div>
  )
}
