import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      store: {
        get: (key) => ipcRenderer.invoke('store:get', key),
        set: (key, value) => ipcRenderer.invoke('store:set', key, value),
        delete: (key) => ipcRenderer.invoke('store:delete', key)
      },
      onQuickAddTask: (callback) => {
        ipcRenderer.on('quick-add-task', (_, data) => callback(data))
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
}
