import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SettingsProvider } from './context/SettingsContext'
import { LeaderboardProvider } from './context/LeaderboardContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <LeaderboardProvider>
        <App />
      </LeaderboardProvider>
    </SettingsProvider>
  </React.StrictMode>
)
