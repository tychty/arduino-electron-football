import { useState, useEffect } from 'react'
import { useLocaleCtx } from '../context/LocaleContext'

export interface PlayerInfo {
  name: string
  company: string
  email: string
}

interface Props {
  onConfirm: (info: PlayerInfo) => void
  onCancel: () => void
}

function isValidEmail(v: string): boolean {
  return /\S+@\S+\.\S+/.test(v)
}

export default function PlayerInfoModal({ onConfirm, onCancel }: Props): JSX.Element {
  const { t } = useLocaleCtx()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; company?: string; email?: string }>({})

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'F2') {
        setName('John Doe')
        setCompany('Acme Corp')
        setEmail('john.doe@acme.com')
        setErrors({})
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const handleSubmit = (): void => {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = t((l) => l.playerInfo.required)
    if (!company.trim()) errs.company = t((l) => l.playerInfo.required)
    if (!email.trim()) errs.email = t((l) => l.playerInfo.required)
    else if (!isValidEmail(email.trim())) errs.email = t((l) => l.playerInfo.emailInvalid)

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onConfirm({ name: name.trim(), company: company.trim(), email: email.trim() })
  }

  const fieldStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 15,
    borderRadius: 4,
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box',
  }

  const errorStyle: React.CSSProperties = {
    color: '#c00',
    fontSize: 12,
    marginTop: 2,
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
          minWidth: 340,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
          {t((l) => l.playerInfo.title)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            type="text"
            placeholder={t((l) => l.playerInfo.name)}
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            style={{ ...fieldStyle, borderColor: errors.name ? '#c00' : '#ccc' }}
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            type="text"
            placeholder={t((l) => l.playerInfo.company)}
            value={company}
            onChange={(e) => { setCompany(e.target.value); setErrors((p) => ({ ...p, company: undefined })) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ ...fieldStyle, borderColor: errors.company ? '#c00' : '#ccc' }}
          />
          {errors.company && <div style={errorStyle}>{errors.company}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            type="email"
            placeholder={t((l) => l.playerInfo.email)}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ ...fieldStyle, borderColor: errors.email ? '#c00' : '#ccc' }}
          />
          {errors.email && <div style={errorStyle}>{errors.email}</div>}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            padding: '12px',
            fontSize: 15,
            cursor: 'pointer',
            borderRadius: 4,
            border: 'none',
            background: '#2d8a2d',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {t((l) => l.playerInfo.start)}
        </button>
      </div>
    </div>
  )
}
