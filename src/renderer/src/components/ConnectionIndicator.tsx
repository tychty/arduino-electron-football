import { useLocaleCtx } from '../context/LocaleContext'

interface Props {
  connected: boolean
  tryingPort: string | null
}

export default function ConnectionIndicator({ connected, tryingPort }: Props): JSX.Element {
  const { t } = useLocaleCtx()

  const label = connected
    ? t((l) => l.connection.deckConnected)
    : tryingPort
      ? tryingPort
      : t((l) => l.connection.deckNotConnected)

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: connected ? '#2d8a2d' : tryingPort ? '#e6a817' : '#888',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: connected ? '#2d8a2d' : tryingPort ? '#e6a817' : '#bbb',
        }}
      />
      {label}
    </div>
  )
}
