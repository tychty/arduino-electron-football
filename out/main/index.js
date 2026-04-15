"use strict";
const electron = require("electron");
const path = require("path");
const serialport = require("serialport");
const parserReadline = require("@serialport/parser-readline");
class SerialManager {
  constructor() {
    this.port = null;
  }
  async listPorts() {
    const ports = await serialport.SerialPort.list();
    return ports.map((p) => ({ path: p.path, manufacturer: p.manufacturer }));
  }
  async connect(path2, onData) {
    if (this.port?.isOpen) {
      this.port.close();
      this.port = null;
    }
    this.port = new serialport.SerialPort({ path: path2, baudRate: 9600 });
    const parser = this.port.pipe(new parserReadline.ReadlineParser({ delimiter: "\r\n" }));
    parser.on("data", (line) => {
      const match = line.trim().match(/^peak:\s*(\d+)$/);
      if (match) {
        onData(parseInt(match[1], 10));
      }
    });
  }
  disconnect() {
    if (this.port?.isOpen) {
      this.port.close();
    }
    this.port = null;
  }
}
let mainWindow = null;
const serial = new SerialManager();
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  serial.disconnect();
  if (process.platform !== "darwin") electron.app.quit();
});
electron.ipcMain.handle("serial:list", async () => {
  return serial.listPorts();
});
electron.ipcMain.handle("serial:connect", async (_event, portPath) => {
  await serial.connect(portPath, (value) => {
    mainWindow?.webContents.send("serial:data", value);
  });
});
electron.ipcMain.handle("serial:disconnect", async () => {
  serial.disconnect();
});
