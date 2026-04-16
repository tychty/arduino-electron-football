interface Props {
  scorePoints: number
  hitCount: number
  flashing: boolean
}

export default function GoalCircle({ scorePoints, hitCount, flashing }: Props): JSX.Element {
  return (
    <div
      style={{
        width: 70,
        height: 70,
        borderRadius: '50%',
        backgroundColor: flashing ? '#ffdd00' : '#ffffff',
        border: '2px solid #333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: flashing ? 'none' : 'background-color 0.3s',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 1 }}>{scorePoints}pt</div>
      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>×{hitCount}</div>
    </div>
  )
}
