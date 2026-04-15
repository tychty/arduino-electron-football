"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("arduino", {
  listPorts: () => electron.ipcRenderer.invoke("serial:list"),
  connect: (port) => electron.ipcRenderer.invoke("serial:connect", port),
  disconnect: () => electron.ipcRenderer.invoke("serial:disconnect"),
  // Returns an unsubscribe function — call it on cleanup
  onData: (callback) => {
    const handler = (_, value) => callback(value);
    electron.ipcRenderer.on("serial:data", handler);
    return () => electron.ipcRenderer.off("serial:data", handler);
  }
});
