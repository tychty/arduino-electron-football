import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron'
import { join } from 'path'
import { readFileSync, appendFileSync, writeFileSync, copyFileSync, existsSync, statSync } from 'fs'
import { SerialManager } from './serial'
import { WINDOW_WIDTH, WINDOW_HEIGHT, LEADERBOARD_FILENAME } from '../shared/config'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined
declare const MAIN_WINDOW_VITE_NAME: string

let mainWindow: BrowserWindow | null = null
const serial = new SerialManager()

function leaderboardPath(): string {
  return join(app.getPath('userData'), LEADERBOARD_FILENAME)
}

function createWindow(): void {
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    // frame: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow?.setFullScreen(!mainWindow.isFullScreen())
    }
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  serial.disconnect()
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('serial:list', async () => {
  return serial.listPorts()
})

ipcMain.handle('serial:connect', async (_event, portPath: string) => {
  await serial.connect(
    portPath,
    (pin: number, peak: number) => {
      mainWindow?.webContents.send('serial:data', pin, peak)
    },
    (msg: string) => {
      mainWindow?.webContents.send('serial:error', msg)
    }
  )
})

ipcMain.handle('serial:disconnect', async () => {
  serial.disconnect()
})

ipcMain.handle('serial:command', async (_event, command: string) => {
  serial.sendCommand(command)
})

ipcMain.handle('serial:autoConnect', async () => {
  const ports = await serial.listPorts()
  for (const port of ports) {
    const success = await serial.tryConnect(
      port.path,
      (pin: number, peak: number) => mainWindow?.webContents.send('serial:data', pin, peak),
      (msg: string) => mainWindow?.webContents.send('serial:error', msg)
    )
    if (success) return port.path
  }
  return null
})

const csvEscape = (val: string): string => {
  if (/[;"'\n\r]/.test(val)) return `"${val.replace(/"/g, '""')}"`
  return val
}

ipcMain.handle('leaderboard:read', () => {
  const path = leaderboardPath()
  if (!existsSync(path)) return []
  const content = readFileSync(path, 'utf8')
  return content
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(';')
      if (parts.length >= 5) {
        const [name, company, email, score, date] = parts.map((p) =>
          p.startsWith('"') ? p.slice(1, -1).replace(/""/g, '"') : p
        )
        return { name, company, email, score: Number(score), date }
      }
      const [name, score, date] = parts
      return { name, company: '', email: '', score: Number(score), date }
    })
})

ipcMain.handle('leaderboard:append', (_event, name: string, company: string, email: string, score: number, date: string) => {
  const row = [name, company, email, String(score), date].map(csvEscape).join(';')
  appendFileSync(leaderboardPath(), `${row}\n`, 'utf8')
})

ipcMain.handle('leaderboard:path', () => leaderboardPath())

ipcMain.handle('leaderboard:showInFolder', () => {
  shell.showItemInFolder(leaderboardPath())
})

ipcMain.handle('leaderboard:clear', () => {
  const path = leaderboardPath()
  if (existsSync(path) && statSync(path).size > 0) {
    const ts = new Date().toISOString().replace(/:/g, '-')
    const backup = path.replace(/\.csv$/, `.${ts}.csv`)
    copyFileSync(path, backup)
  }
  writeFileSync(path, '', 'utf8')
})
