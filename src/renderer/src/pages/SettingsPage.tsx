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
  HIT_WINDOW_MIN, HIT_WINDOW_SLIDER_MAX, HIT_WINDOW_STEP,
  FLASH_DURATION_MIN, FLASH_DURATION_MAX, FLASH_DURATION_STEP,
} from '../../../shared/config'

interface Props {
  ports: PortInfo[]
  selected: string
  connected: boolean
  peaks: Record<number, number>
  onSetSelected: (port: string) => void
  onBack: () => void
  onEditLayout: () => void
}

const LANGUAGE_LABELS: Record<Language, string> = { en: 'EN', ru: 'RU', kz: 'ҚАЗ' }
const LANGUAGES: Language[] = ['en', 'ru', 'kz']

export default function SettingsPage({
  ports,
  selected,
  connected,
  peaks,
  onSetSelected,
  onBack,
  onEditLayout,
}: Props): JSX.Element {
  const { allPins, canAddPin, addPin, deletePin, settings } = useSettingsCtx()
  const { t, language, setLanguage } = useLocaleCtx()

  return (
    <div className="bg-blue" style={{ position: 'fixed', inset: 0, overflowY: 'auto', color: '#fff' }}>
    <div
      style={{
        position: 'relative',
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
            color: 'rgba(255,255,255,0.55)',
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
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          {t((l) => l.settings.editLayout)}
        </button>
      </div>

      <h2 style={{ margin: '0 0 24px', fontSize: 18 }}>{t((l) => l.settings.title)}</h2>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
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
                border: '1px solid rgba(255,255,255,0.3)',
                background: language === lang ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontFamily: 'monospace',
              }}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {t((l) => l.settings.connection)}
        </h3>
        <ConnectionPanel
          ports={ports}
          selected={selected}
          onSetSelected={onSetSelected}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {t((l) => l.settings.game)}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <HitLimitSettings
            value={settings.game.hitLimit}
            onChange={(v) => settings.setGame('hitLimit', v)}
          />
          <SliderSetting
            label={t((l) => l.settings.hitWindow)}
            value={settings.game.hitWindowMs}
            min={HIT_WINDOW_MIN} max={HIT_WINDOW_SLIDER_MAX} step={HIT_WINDOW_STEP}
            unit="ms"
            onChange={(v) => settings.setGame('hitWindowMs', v)}
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
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
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
    </div>
  )
}
