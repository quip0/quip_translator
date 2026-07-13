const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  translate: (payload) => ipcRenderer.invoke('translate', payload),
  tts: (payload) => ipcRenderer.invoke('tts', payload),
  hide: () => ipcRenderer.send('hide-window'),
  quit: () => ipcRenderer.send('quit-app'),
  onFocusInput: (cb) => ipcRenderer.on('focus-input', cb)
});
