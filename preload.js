const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  translate: (payload) => ipcRenderer.invoke('translate', payload),
  hide: () => ipcRenderer.send('hide-window'),
  quit: () => ipcRenderer.send('quit-app'),
  onFocusInput: (cb) => ipcRenderer.on('focus-input', cb)
});
