interface Props {
  currentValue: number
  hitCount: number
  editMode?: boolean
  pin?: number
}

const futuraStyle: React.CSSProperties = {
  fontFamily: 'Futura, Arial, sans-serif',
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '0.04em',
  color: '#FFF',
  WebkitTextStroke: '0.2em #E20518',
  paintOrder: 'stroke fill',
}

export default function GoalCircle({ currentValue, hitCount, editMode, pin }: Props): JSX.Element {
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
      <div style={{ ...futuraStyle, fontSize: '3.2vw' }}>
        {editMode ? `#${pin}` : currentValue}
      </div>
      <div style={{ ...futuraStyle, fontSize: '1.6vw', marginTop: '4%' }}>
        {editMode ? `\u00D7${hitCount}` : 'POINTS'}
      </div>
    </div>
  )
}
