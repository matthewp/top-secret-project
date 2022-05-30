import { contextBridge, ipcRenderer } from 'electron';
import { load } from './process.js';

declare global {
  var api: {
    load: (url: string) => Promise<string>;
    handleCmdOrCtrlT: (callback: any) => void;
  }
}

contextBridge.exposeInMainWorld('api', {
  load: load.bind(null, ipcRenderer),
  handleCmdOrCtrlT: (callback) => ipcRenderer.on('ctrl-cmd-t', callback)
});

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.



window.addEventListener('DOMContentLoaded', () => {
});