import type { CaptureOptions } from '../main/utils/capture';
import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron/renderer';

// Custom APIs for renderer
const api = {
  onWinResized: (callback: () => void) => {
    ipcRenderer.on('resized', callback);
    return () => void ipcRenderer.off('resized', callback);
  },
  captureDOM: (options: CaptureOptions) => {
    return ipcRenderer.invoke('captureDOM', options);
  },
  openDirectoryDialog: () => ipcRenderer.invoke('openDirectoryDialog'),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  }
  catch (error) {
    console.error(error);
  }
}
else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI;
  // @ts-expect-error (define in dts)
  window.api = api;
}
