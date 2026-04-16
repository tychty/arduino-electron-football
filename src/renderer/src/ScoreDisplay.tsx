interface Props {
  score: number
  onReset: () => void
}

export default function ScoreDisplay({ score, onReset }: Props): JSX.Element {
  return (
    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: '#888' }}>total score</div>
        <div style={{ fontSize: 48, fontWeight: 'bold', lineHeight: 1 }}>{score}</div>
      </div>
      <button
        onClick={onReset}
        style={{
          padding: '8px 18px',
          fontSize: 14,
          cursor: 'pointer',
          borderRadius: 4,
          border: '1px solid #ccc',
          background: '#fff',
        }}
      >
        Reset Score
      </button>
    </div>
  )
}
