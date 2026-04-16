import { PortInfo } from './useConnection'

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
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <select
          value={selected}
          onChange={(e) => onSetSelected(e.target.value)}
          disabled={connected}
        >
          <option value="">-- select port --</option>
          {ports.map((p) => (
            <option key={p.path} value={p.path}>
              {p.path}
              {p.manufacturer ? ` (${p.manufacturer})` : ''}
            </option>
          ))}
        </select>
        <button onClick={onRefresh} disabled={connected} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </div>

      <div>
        {!connected ? (
          <button onClick={onConnect} disabled={!selected}>
            Connect
          </button>
        ) : (
          <button onClick={onDisconnect}>Disconnect</button>
        )}
      </div>

      {error && <div style={{ marginTop: 8, color: '#c0392b' }}>Error: {error}</div>}
    </div>
  )
}
