import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { SerialManager } from './serial'

let mainWindow: BrowserWindow | null = null
const serial = new SerialManager()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
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
