import { useConnection } from './useConnection'

interface Props {
  onConnectedChange: (connected: boolean) => void
}

export default function ConnectionPanel({ onConnectedChange }: Props): JSX.Element {
  const { ports, selected, connected, error, setSelected, refresh, connect, disconnect } = useConnection()

  const handleConnect = async (): Promise<void> => {
    await connect()
    onConnectedChange(true)
  }

  const handleDisconnect = async (): Promise<void> => {
    await disconnect()
    onConnectedChange(false)
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
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
        <button onClick={refresh} disabled={connected} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </div>

      <div>
        {!connected ? (
          <button onClick={handleConnect} disabled={!selected}>
            Connect
          </button>
        ) : (
          <button onClick={handleDisconnect}>Disconnect</button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 8, color: '#c0392b' }}>Error: {error}</div>
      )}
    </div>
  )
}
