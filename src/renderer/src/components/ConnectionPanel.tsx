import { PortInfo } from '../services/arduinoService'
import { useLocaleCtx } from '../context/LocaleContext'

interface Props {
  ports: PortInfo[]
  selected: string
  connected: boolean
  error: string | null
  onSetSelected: (port: string) => void
  onRefresh: () => Promise<void>
  onConnect: () => Promise<void>
  onDisconnect: () => void
}

export default function ConnectionPanel({
  ports,
  selected,
  connected,
  error,
  onSetSelected,
  onRefresh,
  onConnect,
  onDisconnect,
}: Props): JSX.Element {
  const { t } = useLocaleCtx()

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <select
          value={selected}
          onChange={(e) => onSetSelected(e.target.value)}
          disabled={connected}
        >
          <option value="">{t((l) => l.connection.selectPort)}</option>
          {ports.map((p) => (
            <option key={p.path} value={p.path}>
              {p.path}
              {p.manufacturer ? ` (${p.manufacturer})` : ''}
            </option>
          ))}
        </select>
        <button onClick={onRefresh} disabled={connected} style={{ marginLeft: 8 }}>
          {t((l) => l.connection.refresh)}
        </button>
      </div>

      <div>
        {!connected ? (
          <button onClick={onConnect} disabled={!selected}>
            {t((l) => l.connection.connect)}
          </button>
        ) : (
          <button onClick={onDisconnect}>{t((l) => l.connection.disconnect)}</button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 8, color: '#c0392b' }}>
          {t((l) => l.connection.error)}: {error}
        </div>
      )}
    </div>
  )
}
