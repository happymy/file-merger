const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

let mainWindow;

// 历史记录文件路径
const historyPath = path.join(app.getPath('userData'), 'recent-dirs.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
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

// ---------- 历史记录工具 ----------
function loadHistory() {
  try {
    if (fs.existsSync(historyPath)) {
      return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveHistory(dirs) {
  const unique = [...new Set(dirs)]; // 去重
  const limited = unique.slice(0, 8); // 最多8个
  fs.writeFileSync(historyPath, JSON.stringify(limited), 'utf-8');
}

// ---------- IPC Handlers ----------

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// 验证路径是否为目录
ipcMain.handle('is-directory', (event, dirPath) => {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
});

// 读取配置
ipcMain.handle('read-config', (event, dirPath) => {
  const configPath = path.join(dirPath, '.file-merger-config.json');
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {}
  return null;
});

// 保存配置
ipcMain.handle('save-config', (event, dirPath, config) => {
  const configPath = path.join(dirPath, '.file-merger-config.json');
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
});

// 获取历史记录
ipcMain.handle('get-history', () => loadHistory());

// 添加历史记录
ipcMain.handle('add-history', (event, dirPath) => {
  const history = loadHistory();
  const updated = [dirPath, ...history.filter(d => d !== dirPath)];
  saveHistory(updated);
  return updated.slice(0, 8);
});

// 清除历史
ipcMain.handle('clear-history', () => {
  saveHistory([]);
  return [];
});

// 启动 Worker 进行扫描和内容处理
ipcMain.handle('start-merge', async (event, dirPath, options) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: { dirPath, options }
    });

    worker.on('message', (msg) => {
      // 转发进度给渲染进程
      if (msg.type === 'progress') {
        mainWindow.webContents.send('merge-progress', msg.data);
      } else if (msg.type === 'result') {
        resolve(msg.data); // 返回最终合并的 Markdown 字符串
      } else if (msg.type === 'error') {
        reject(new Error(msg.message));
      }
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker 异常退出，代码：${code}`));
    });
  });
});

// 保存文件对话框
ipcMain.handle('save-file-dialog', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  });
  if (result.canceled) return null;
  return result.filePath;
});

// 写入文件
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
});

// 在文件夹中显示
ipcMain.handle('show-item-in-folder', (event, fullPath) => {
  shell.showItemInFolder(fullPath);
});