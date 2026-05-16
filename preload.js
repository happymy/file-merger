const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 目录操作
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  isDirectory: (dirPath) => ipcRenderer.invoke('is-directory', dirPath),
  pathBasename: (filePath) => ipcRenderer.invoke('path-basename', filePath),

  // 配置
  readConfig: (dirPath) => ipcRenderer.invoke('read-config', dirPath),
  saveConfig: (dirPath, config) => ipcRenderer.invoke('save-config', dirPath, config),

  // 历史
  getHistory: () => ipcRenderer.invoke('get-history'),
  addHistory: (dirPath) => ipcRenderer.invoke('add-history', dirPath),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // 排除选择器
  pickExcludeDir: (rootDir) => ipcRenderer.invoke('pick-exclude-dir', rootDir),
  pickExcludeFile: (rootDir) => ipcRenderer.invoke('pick-exclude-file', rootDir),

  // 合并与进度
  startMerge: (dirPath, options) => ipcRenderer.invoke('start-merge', dirPath, options),
  onMergeProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('merge-progress', handler);
    return () => ipcRenderer.removeListener('merge-progress', handler);
  },

  // 文件保存与显示
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  showItemInFolder: (fullPath) => ipcRenderer.invoke('show-item-in-folder', fullPath)
});