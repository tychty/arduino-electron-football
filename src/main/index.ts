import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { SerialManager } from './serial'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined
declare const MAIN_WINDOW_VITE_NAME: string

let mainWindow: BrowserWindow | null = null
const serial = new SerialManager()

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
