import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync, appendFileSync, existsSync } from 'fs'
import { SerialManager } from './serial'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined
declare const MAIN_WINDOW_VITE_NAME: string

let mainWindow: BrowserWindow | null = null
const serial = new SerialManager()

function leaderboardPath(): string {
  return join(app.getPath('userData'), 'leaderboard.csv')
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false
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

ipcMain.handle('leaderboard:read', () => {
  const path = leaderboardPath()
  if (!existsSync(path)) return []
  const content = readFileSync(path, 'utf8')
  return content
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, score, date] = line.split(',')
      return { name, score: Number(score), date }
    })
})

ipcMain.handle('leaderboard:append', (_event, name: string, score: number, date: string) => {
  appendFileSync(leaderboardPath(), `${name},${score},${date}\n`, 'utf8')
})
