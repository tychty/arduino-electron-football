import { useState } from 'react'
import { useLocaleCtx } from '../context/LocaleContext'

interface Props {
  score: number
  onDone: (name: string | null) => void
}

export default function EndGameModal({ score, onDone }: Props): JSX.Element {
  const [name, setName] = useState('')
  const { t } = useLocaleCtx()

  const handleSave = (): void => {
    onDone(name.trim() || null)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: '36px 40px',
          minWidth: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 14, color: '#555' }}>{t((l) => l.game.gameOver)}</div>
        <div style={{ fontSize: 64, fontWeight: 'bold', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, color: '#888' }}>{t((l) => l.game.points)}</div>
        <input
          type="text"
          placeholder={t((l) => l.game.enterYourName)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          style={{
            padding: '8px 12px',
            fontSize: 15,
            borderRadius: 4,
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        />
        <button
          onClick={handleSave}
          style={{
            padding: '10px 28px',
            fontSize: 14,
            cursor: 'pointer',
            borderRadius: 4,
            border: 'none',
            background: '#2d8a2d',
            color: '#fff',
            width: '100%',
          }}
        >
          {t((l) => l.game.saveScore)}
        </button>
      </div>
    </div>
  )
}
