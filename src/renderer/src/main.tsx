import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import App from './App'
import { SettingsProvider } from './context/SettingsContext'
import { LeaderboardProvider } from './context/LeaderboardContext'
import { LocaleProvider } from './context/LocaleContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LocaleProvider>
      <SettingsProvider>
        <LeaderboardProvider>
          <App />
        </LeaderboardProvider>
      </SettingsProvider>
    </LocaleProvider>
  </React.StrictMode>
)
