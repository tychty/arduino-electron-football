import ConnectionPanel from '../components/ConnectionPanel'
import PinsGrid from '../components/PinsGrid'
import HitLimitSettings from '../components/HitLimitSettings'
import SliderSetting from '../components/SliderSetting'
import LeaderboardSettings from '../components/LeaderboardSettings'
import { PortInfo } from '../services/arduinoService'
import { useSettingsCtx } from '../context/SettingsContext'
import { useLocaleCtx } from '../context/LocaleContext'
import { Language } from '../locales'
import {
  HIT_DEBOUNCE_MIN, HIT_DEBOUNCE_MAX, HIT_DEBOUNCE_STEP,
  FLASH_DURATION_MIN, FLASH_DURATION_MAX, FLASH_DURATION_STEP,
} from '../../../shared/config'

interface Props {
  ports: PortInfo[]
  selected: string
  connected: boolean
  connectionError: string | null
  peaks: Record<number, number>
  onSetSelected: (port: string) => void
  onRefresh: () => Promise<void>
  onConnect: () => Promise<void>
  onDisconnect: () => void
  onBack: () => void
  onEditLayout: () => void
}

const LANGUAGE_LABELS: Record<Language, string> = { en: 'EN', ru: 'RU', kz: 'ҚАЗ' }
const LANGUAGES: Language[] = ['en', 'ru', 'kz']

export default function SettingsPage({
  ports,
  selected,
  connected,
  connectionError,
  peaks,
  onSetSelected,
  onRefresh,
  onConnect,
  onDisconnect,
  onBack,
  onEditLayout,
}: Props): JSX.Element {
  const { allPins, canAddPin, addPin, deletePin, settings } = useSettingsCtx()
  const { t, language, setLanguage } = useLocaleCtx()

  return (
    <div
      style={{
        padding: '24px 32px',
        fontFamily: 'monospace',
        maxWidth: 900,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: '#888',
            padding: 0,
          }}
        >
          {t((l) => l.settings.back)}
        </button>
        <button
          onClick={onEditLayout}
          style={{
            padding: '6px 14px',
            fontSize: 12,
            cursor: 'pointer',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#555',
            fontFamily: 'monospace',
          }}
        >
          {t((l) => l.settings.editLayout)}
        </button>
      </div>

      <h2 style={{ margin: '0 0 24px', fontSize: 18 }}>{t((l) => l.settings.title)}</h2>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>
          {t((l) => l.settings.language)}
        </h3>
        <div style={{ display: 'flex', gap: 4 }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                cursor: 'pointer',
                borderRadius: 4,
                border: '1px solid #ccc',
                background: language === lang ? '#333' : '#fff',
                color: language === lang ? '#fff' : '#555',
                fontFamily: 'monospace',
              }}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>
          {t((l) => l.settings.connection)}
        </h3>
        <ConnectionPanel
          ports={ports}
          selected={selected}
          connected={connected}
          error={connectionError}
          onSetSelected={onSetSelected}
          onRefresh={onRefresh}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>
          {t((l) => l.settings.game)}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <HitLimitSettings
            value={settings.game.hitLimit}
            onChange={(v) => settings.setGame('hitLimit', v)}
          />
          <SliderSetting
            label={t((l) => l.settings.hitDebounce)}
            value={settings.game.hitDebounceMs}
            min={HIT_DEBOUNCE_MIN} max={HIT_DEBOUNCE_MAX} step={HIT_DEBOUNCE_STEP}
            unit="ms"
            onChange={(v) => settings.setGame('hitDebounceMs', v)}
          />
          <SliderSetting
            label={t((l) => l.settings.flashDuration)}
            value={settings.game.flashDuration}
            min={FLASH_DURATION_MIN} max={FLASH_DURATION_MAX} step={FLASH_DURATION_STEP}
            unit="ms"
            onChange={(v) => settings.setGame('flashDuration', v)}
          />
        </div>
      </section>

      <LeaderboardSettings />

      <section>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#555', fontWeight: 600 }}>
          {t((l) => l.settings.pins)}
        </h3>
        <PinsGrid
          allPins={allPins}
          peaks={peaks}
          connected={connected}
          settings={settings}
          canAddPin={canAddPin}
          onAddPin={addPin}
          onDeletePin={deletePin}
        />
      </section>
    </div>
  )
}
