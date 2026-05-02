import { PortInfo } from '../services/arduinoService'
import { useLocaleCtx } from '../context/LocaleContext'

interface Props {
  ports: PortInfo[]
  selected: string
  error: string | null
  onSetSelected: (port: string) => void
}

export default function ConnectionPanel({ ports, selected, error, onSetSelected }: Props): JSX.Element {
  const { t } = useLocaleCtx()

  return (
    <div style={{ marginBottom: 24 }}>
      {error && (
        <div style={{ marginBottom: 8, color: '#c0392b', fontSize: 12, fontFamily: 'monospace' }}>
          {t((l) => l.connection.error)}: {error}
        </div>
      )}
      <select value={selected} onChange={(e) => onSetSelected(e.target.value)}>
        <option value="">{t((l) => l.connection.selectPort)}</option>
        {ports.map((p) => (
          <option key={p.path} value={p.path}>
            {p.path}
            {p.manufacturer ? ` (${p.manufacturer})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
