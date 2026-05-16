const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

let mainWindow;

// 历史记录文件路径
const historyPath = path.join(app.getPath('userData'), 'recent-dirs.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 920,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ========== 历史记录 ==========
function loadHistory() {
  try {
    if (fs.existsSync(historyPath)) {
      return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveHistory(dirs) {
  const unique = [...new Set(dirs)];
  const limited = unique.slice(0, 8);
  fs.writeFileSync(historyPath, JSON.stringify(limited), 'utf-8');
}

// ========== 路径校验与建议 ==========
function validateAndSuggestExclude(rootDir, selectedPath) {
  const rel = path.relative(rootDir, selectedPath);
  if (!rel) return null;
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('Selected path is outside the working directory.');
  }
  const parts = rel.split(path.sep);
  const isDir = !path.extname(selectedPath);
  const suggestion = isDir
    ? (parts.length === 1 ? parts[0] : `**/${parts[parts.length - 1]}/**`)
    : rel;
  return { relative: rel, suggestion };
}

// ========== IPC Handlers ==========

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('is-directory', (event, dirPath) => {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
});

ipcMain.handle('read-config', (event, dirPath) => {
  const configPath = path.join(dirPath, '.file-merger-config.json');
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {}
  return null;
});

ipcMain.handle('save-config', (event, dirPath, config) => {
  const configPath = path.join(dirPath, '.file-merger-config.json');
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('get-history', () => loadHistory());
ipcMain.handle('add-history', (event, dirPath) => {
  const history = loadHistory();
  const updated = [dirPath, ...history.filter(d => d !== dirPath)];
  saveHistory(updated);
  return updated.slice(0, 8);
});
ipcMain.handle('clear-history', () => {
  saveHistory([]);
  return [];
});

ipcMain.handle('pick-exclude-item', async (event, rootDir, isDirectory) => {
  const options = {
    properties: isDirectory ? ['openDirectory'] : ['openFile'],
    defaultPath: rootDir
  };
  const result = await dialog.showOpenDialog(mainWindow, options);
  if (result.canceled || result.filePaths.length === 0) return { error: null, suggestion: null };

  try {
    const info = validateAndSuggestExclude(rootDir, result.filePaths[0]);
    if (!info) return { error: 'You selected the root directory itself, which is not allowed.', suggestion: null };
    return { error: null, suggestion: info.suggestion };
  } catch (err) {
    return { error: err.message, suggestion: null };
  }
});

// 根据路径建议排除的glob模式
ipcMain.handle('suggest-exclude-glob', (event, rootDir, selectedPath) => {
  try {
    const info = validateAndSuggestExclude(rootDir, selectedPath);
    if (!info) return { error: 'You selected the root directory itself.', suggestion: null };
    return { error: null, suggestion: info.suggestion };
  } catch (err) {
    return { error: err.message, suggestion: null };
  }
});

// 启动 Worker 合并
ipcMain.handle('start-merge', async (event, dirPath, options) => {
  // 只传递启用的排除项
  const enabledDirs = (options.excludeDirs || [])
    .filter(item => item.enabled)
    .map(item => item.pattern);
  const enabledFiles = (options.excludeFiles || [])
    .filter(item => item.enabled)
    .map(item => item.pattern);

  const workerOptions = {
    excludeDirs: enabledDirs,
    excludeFiles: enabledFiles,
    excludeBinary: options.excludeBinary,
    ignoreHidden: options.ignoreHidden,
    whiteListExts: options.whiteListExts,
    maxFileSizeKB: options.maxFileSizeKB,
    customFooter: options.customFooter
  };

  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: { dirPath, options: workerOptions }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'progress') {
        mainWindow.webContents.send('merge-progress', msg.data);
      } else if (msg.type === 'result') {
        resolve(msg.data);
      } else if (msg.type === 'error') {
        reject(new Error(msg.message));
      }
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
});

// 保存文件对话框
ipcMain.handle('save-file-dialog', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath,
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  });
  if (result.canceled) return null;
  return result.filePath;
});

ipcMain.handle('pick-save-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('show-item-in-folder', (event, fullPath) => {
  shell.showItemInFolder(fullPath);
});

ipcMain.handle('path-basename', (event, filePath) => {
  return path.basename(filePath);
});