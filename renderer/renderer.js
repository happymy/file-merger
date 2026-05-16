let currentDir = null;
let currentConfig = {
  excludeDirs: [],
  excludeFiles: [],
  excludeBinary: false,
  ignoreHidden: false,
  whiteListExts: [],
  maxFileSizeKB: 0,
  customFooter: '',
  outputFileName: 'merged-{timestamp}.md'
};
let mergedMarkdown = ''; // 缓存生成的内容

// UI 元素
const dirPathDisplay = document.getElementById('dirPathDisplay');
const excludeDirsTextarea = document.getElementById('excludeDirs');
const excludeFilesTextarea = document.getElementById('excludeFiles');
const excludeBinaryCheckbox = document.getElementById('excludeBinary');
const ignoreHiddenCheckbox = document.getElementById('ignoreHidden');
const whiteListExtsInput = document.getElementById('whiteListExts');
const maxFileSizeKBInput = document.getElementById('maxFileSizeKB');
const customFooterTextarea = document.getElementById('customFooter');
const outputFileNameInput = document.getElementById('outputFileName');
const selectDirBtn = document.getElementById('selectDirBtn');
const historyBtn = document.getElementById('historyBtn');
const historyDropdown = document.getElementById('historyDropdown');
const previewBtn = document.getElementById('previewBtn');
const saveBtn = document.getElementById('saveBtn');
const previewArea = document.getElementById('previewArea');
const statusDiv = document.getElementById('status');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// 历史记录下拉
let recentDirs = [];

async function refreshHistory() {
  recentDirs = await window.electronAPI.getHistory();
  renderHistoryDropdown();
}

function renderHistoryDropdown() {
  historyDropdown.innerHTML = '';
  if (recentDirs.length === 0) {
    historyDropdown.innerHTML = '<div>无历史记录</div>';
  } else {
    recentDirs.forEach(dir => {
      const div = document.createElement('div');
      div.textContent = dir;
      div.addEventListener('click', () => selectDirectory(dir));
      historyDropdown.appendChild(div);
    });
    const clearDiv = document.createElement('div');
    clearDiv.textContent = '清除历史';
    clearDiv.style.fontStyle = 'italic';
    clearDiv.addEventListener('click', async () => {
      await window.electronAPI.clearHistory();
      refreshHistory();
      historyDropdown.classList.add('hidden');
    });
    historyDropdown.appendChild(clearDiv);
  }
}

historyBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  historyDropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => historyDropdown.classList.add('hidden'));

// 选择目录（通过对话框）
selectDirBtn.addEventListener('click', async () => {
  const dir = await window.electronAPI.selectDirectory();
  if (dir) selectDirectory(dir);
});

// 统一设置目录
async function selectDirectory(dirPath) {
  currentDir = dirPath;
  if (dirPathDisplay) dirPathDisplay.textContent = dirPath;
  
  // 加载配置
  const savedConfig = await window.electronAPI.readConfig(dirPath);
  if (savedConfig) {
    currentConfig = savedConfig;
    populateUIFromConfig();
  } else {
    // 重置为默认
    currentConfig = {
      excludeDirs: [],
      excludeFiles: [],
      excludeBinary: false,
      ignoreHidden: false,
      whiteListExts: [],
      maxFileSizeKB: 0,
      customFooter: '',
      outputFileName: 'merged-{timestamp}.md'
    };
    populateUIFromConfig();
  }
  
  // 添加到历史
  await window.electronAPI.addHistory(dirPath);
  refreshHistory();
  
  // 清空预览和进度
  if (previewArea) previewArea.textContent = '';
  mergedMarkdown = '';
  if (saveBtn) saveBtn.disabled = true;
  hideProgress();
  if (statusDiv) statusDiv.textContent = '';
}

// UI 填充
function populateUIFromConfig() {
  if (excludeDirsTextarea) excludeDirsTextarea.value = (currentConfig.excludeDirs || []).join('\n');
  if (excludeFilesTextarea) excludeFilesTextarea.value = (currentConfig.excludeFiles || []).join('\n');
  if (excludeBinaryCheckbox) excludeBinaryCheckbox.checked = currentConfig.excludeBinary || false;
  if (ignoreHiddenCheckbox) ignoreHiddenCheckbox.checked = currentConfig.ignoreHidden || false;
  if (whiteListExtsInput) whiteListExtsInput.value = (currentConfig.whiteListExts || []).join(',');
  if (maxFileSizeKBInput) maxFileSizeKBInput.value = currentConfig.maxFileSizeKB || 0;
  if (customFooterTextarea) customFooterTextarea.value = currentConfig.customFooter || '';
  if (outputFileNameInput) outputFileNameInput.value = currentConfig.outputFileName || 'merged-{timestamp}.md';
}

function getConfigFromUI() {
  const whiteListRaw = whiteListExtsInput ? whiteListExtsInput.value.trim() : '';
  const whiteListExts = whiteListRaw ? whiteListRaw.split(',').map(s => s.trim().toLowerCase()) : [];
  
  return {
    excludeDirs: excludeDirsTextarea ? excludeDirsTextarea.value.split('\n').map(s => s.trim()).filter(Boolean) : [],
    excludeFiles: excludeFilesTextarea ? excludeFilesTextarea.value.split('\n').map(s => s.trim()).filter(Boolean) : [],
    excludeBinary: excludeBinaryCheckbox ? excludeBinaryCheckbox.checked : false,
    ignoreHidden: ignoreHiddenCheckbox ? ignoreHiddenCheckbox.checked : false,
    whiteListExts,
    maxFileSizeKB: maxFileSizeKBInput ? (parseInt(maxFileSizeKBInput.value) || 0) : 0,
    customFooter: customFooterTextarea ? customFooterTextarea.value : '',
    outputFileName: outputFileNameInput ? (outputFileNameInput.value.trim() || 'merged-{timestamp}.md') : 'merged-{timestamp}.md'
  };
}

async function saveConfigToDir() {
  if (!currentDir) return;
  const config = getConfigFromUI();
  await window.electronAPI.saveConfig(currentDir, config);
  currentConfig = config;
}

// 进度条
function showProgress() {
  if (progressContainer) progressContainer.classList.remove('hidden');
  if (progressFill) progressFill.style.width = '0%';
  if (progressText) progressText.textContent = '0%';
}

function hideProgress() {
  if (progressContainer) progressContainer.classList.add('hidden');
}

function updateProgress(current, total) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${percent}% (${current}/${total})`;
}

// 监听 Worker 进度
if (window.electronAPI && window.electronAPI.onMergeProgress) {
  window.electronAPI.onMergeProgress((data) => {
    updateProgress(data.current, data.total);
  });
}

// 生成输出文件名
function generateOutputFileName() {
  // 注意：在浏览器环境中没有 nodejs 的 path 模块，除非预加载或 polyfill
  // 这里简单处理，假设 currentDir 是字符串
  const folderName = currentDir ? currentDir.replace(/^.*[\\\/]/, '') : ''; 
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  let name = currentConfig.outputFileName || 'merged.md';
  name = name.replace('{folderName}', folderName || 'folder');
  name = name.replace('{timestamp}', timestamp);
  return name;
}

// 预览
if (previewBtn) {
  previewBtn.addEventListener('click', async () => {
    if (!currentDir) {
      alert('请先选择目录');
      return;
    }
    await saveConfigToDir();
    showProgress();
    if (saveBtn) saveBtn.disabled = true;
    if (statusDiv) statusDiv.textContent = '正在扫描并处理文件...';
    if (previewArea) previewArea.textContent = '';

    try {
      const options = { ...currentConfig };
      mergedMarkdown = await window.electronAPI.startMerge(currentDir, options);
      if (previewArea) {
        const lines = mergedMarkdown.split('\n');
        const previewText = lines.slice(0, 200).join('\n');
        previewArea.textContent = previewText + (lines.length > 200 ? '\n... (预览被截断，保存后可查看完整内容)' : '');
      }
      if (saveBtn) saveBtn.disabled = false;
      if (statusDiv) statusDiv.textContent = '预览完成，可点击保存按钮导出';
    } catch (err) {
      if (previewArea) previewArea.textContent = `错误: ${err.message}`;
      if (statusDiv) statusDiv.textContent = '合并失败';
    } finally {
      hideProgress();
    }
  });
}

// 保存
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    if (!currentDir || !mergedMarkdown) return;
    const defaultName = generateOutputFileName();
    const filePath = await window.electronAPI.saveFileDialog(defaultName);
    if (!filePath) return;

    const success = await window.electronAPI.writeFile(filePath, mergedMarkdown);
    if (success) {
      if (statusDiv) statusDiv.textContent = `已保存到 ${filePath}`;
      // 在文件夹中显示
      await window.electronAPI.showItemInFolder(filePath);
    } else {
      if (statusDiv) statusDiv.textContent = '保存失败';
      alert('保存失败');
    }
  });
}

// ---------- 拖拽功能 ----------
const dropZone = document.getElementById('dropZone');
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // 在 Electron 中，files[0].path 可能可用，取决于上下文和设置
      const droppedPath = files[0].path; 
      if (droppedPath) {
          const isDir = await window.electronAPI.isDirectory(droppedPath);
          if (isDir) {
            selectDirectory(droppedPath);
          } else {
            alert('请拖拽一个文件夹，而不是文件');
          }
      } else {
         alert('无法获取拖拽路径，请确保在 Electron 环境中运行');
      }
    }
  });
}

// 初始化历史
refreshHistory();