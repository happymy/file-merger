const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  isDirectory: (dirPath) => ipcRenderer.invoke('is-directory', dirPath),
  pathBasename: (filePath) => ipcRenderer.invoke('path-basename', filePath),

  readConfig: (dirPath) => ipcRenderer.invoke('read-config', dirPath),
  saveConfig: (dirPath, config) => ipcRenderer.invoke('save-config', dirPath, config),

  getHistory: () => ipcRenderer.invoke('get-history'),
  addHistory: (dirPath) => ipcRenderer.invoke('add-history', dirPath),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  pickExcludeItem: (rootDir, isDirectory) => ipcRenderer.invoke('pick-exclude-item', rootDir, isDirectory),
  suggestExcludeGlob: (rootDir, selectedPath) => ipcRenderer.invoke('suggest-exclude-glob', rootDir, selectedPath),

  startMerge: (dirPath, options) => ipcRenderer.invoke('start-merge', dirPath, options),
  onMergeProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('merge-progress', handler);
    return () => ipcRenderer.removeListener('merge-progress', handler);
  },

  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  showItemInFolder: (fullPath) => ipcRenderer.invoke('show-item-in-folder', fullPath)
});