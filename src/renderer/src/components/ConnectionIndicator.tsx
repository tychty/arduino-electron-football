import { useLocaleCtx } from '../context/LocaleContext'

interface Props {
  connected: boolean
}

export default function ConnectionIndicator({ connected }: Props): JSX.Element {
  const { t } = useLocaleCtx()

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
        color: connected ? '#2d8a2d' : '#888',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: connected ? '#2d8a2d' : '#bbb',
        }}
      />
      {connected ? t((l) => l.connection.deckConnected) : t((l) => l.connection.deckNotConnected)}
    </div>
  )
}
