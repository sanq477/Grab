"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", {
      store: {
        get: (key) => electron.ipcRenderer.invoke("store:get", key),
        set: (key, value) => electron.ipcRenderer.invoke("store:set", key, value),
        delete: (key) => electron.ipcRenderer.invoke("store:delete", key)
      },
      onQuickAddTask: (callback) => {
        electron.ipcRenderer.on("quick-add-task", (_, data) => callback(data));
      }
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
}
