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
let mergedMarkdown = '';
let isDirty = true;

// DOM 元素
const dirPathDisplay = document.getElementById('dirPathDisplay');
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

// 排除标签相关
const excludeDirsContainer = document.getElementById('excludeDirsContainer');
const excludeFilesContainer = document.getElementById('excludeFilesContainer');
const newExcludeDirInput = document.getElementById('newExcludeDir');
const newExcludeFileInput = document.getElementById('newExcludeFile');
const addExcludeDirBtn = document.getElementById('addExcludeDirBtn');
const addExcludeFileBtn = document.getElementById('addExcludeFileBtn');
const pickExcludeDirBtn = document.getElementById('pickExcludeDirBtn');
const pickExcludeFileBtn = document.getElementById('pickExcludeFileBtn');

// ========== 历史记录 ==========
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

// ========== 目录选择 ==========
selectDirBtn.addEventListener('click', async () => {
  const dir = await window.electronAPI.selectDirectory();
  if (dir) selectDirectory(dir);
});

async function selectDirectory(dirPath) {
  currentDir = dirPath;
  dirPathDisplay.textContent = dirPath;
  const saved = await window.electronAPI.readConfig(dirPath);
  if (saved) {
    currentConfig = saved;
  } else {
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
  }
  populateUIFromConfig();
  await window.electronAPI.addHistory(dirPath);
  refreshHistory();
  // 清空预览
  previewArea.textContent = '';
  mergedMarkdown = '';
  isDirty = true;
  saveBtn.disabled = true;
  hideProgress();
  statusDiv.textContent = '';
}

// ========== 标签列表渲染 ==========
function renderTags(container, items, onChange) {
  container.innerHTML = '';
  items.forEach((item, index) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${escapeHtml(item)} <span class="remove-tag" data-index="${index}">✕</span>`;
    container.appendChild(tag);
  });
  // 绑定删除事件
  container.querySelectorAll('.remove-tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      items.splice(idx, 1);
      markDirty();
      renderTags(container, items, onChange);
      if (onChange) onChange(items);
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function populateUIFromConfig() {
  renderTags(excludeDirsContainer, currentConfig.excludeDirs, (newDirs) => {
    currentConfig.excludeDirs = newDirs;
  });
  renderTags(excludeFilesContainer, currentConfig.excludeFiles, (newFiles) => {
    currentConfig.excludeFiles = newFiles;
  });
  excludeBinaryCheckbox.checked = currentConfig.excludeBinary;
  ignoreHiddenCheckbox.checked = currentConfig.ignoreHidden;
  whiteListExtsInput.value = (currentConfig.whiteListExts || []).join(',');
  maxFileSizeKBInput.value = currentConfig.maxFileSizeKB || 0;
  customFooterTextarea.value = currentConfig.customFooter || '';
  outputFileNameInput.value = currentConfig.outputFileName || 'merged-{timestamp}.md';
}

function getConfigFromUI() {
  const whiteListRaw = whiteListExtsInput.value.trim();
  const whiteListExts = whiteListRaw ? whiteListRaw.split(',').map(s => s.trim().toLowerCase()) : [];
  return {
    excludeDirs: currentConfig.excludeDirs.slice(), // 从标签列表实时获取
    excludeFiles: currentConfig.excludeFiles.slice(),
    excludeBinary: excludeBinaryCheckbox.checked,
    ignoreHidden: ignoreHiddenCheckbox.checked,
    whiteListExts,
    maxFileSizeKB: parseInt(maxFileSizeKBInput.value) || 0,
    customFooter: customFooterTextarea.value,
    outputFileName: outputFileNameInput.value.trim() || 'merged-{timestamp}.md'
  };
}

async function saveConfigToDir() {
  if (!currentDir) return;
  const config = getConfigFromUI();
  await window.electronAPI.saveConfig(currentDir, config);
  currentConfig = config;
  isDirty = false;
}

function markDirty() {
  if (!isDirty) {
    isDirty = true;
    mergedMarkdown = '';
    saveBtn.disabled = true;
    statusDiv.textContent = '配置已更改，需重新预览';
  }
}

// 绑定其他输入的变化监听
[
  excludeBinaryCheckbox, ignoreHiddenCheckbox, whiteListExtsInput,
  maxFileSizeKBInput, customFooterTextarea, outputFileNameInput
].forEach(el => {
  el.addEventListener('input', markDirty);
  el.addEventListener('change', markDirty);
});

// ========== 添加排除项 ==========
function addExcludeItem(container, itemsArray, inputElement) {
  const val = inputElement.value.trim();
  if (!val) return;
  if (!itemsArray.includes(val)) {
    itemsArray.push(val);
    markDirty();
    renderTags(container, itemsArray);
  }
  inputElement.value = '';
}

addExcludeDirBtn.addEventListener('click', () => {
  addExcludeItem(excludeDirsContainer, currentConfig.excludeDirs, newExcludeDirInput);
});
addExcludeFileBtn.addEventListener('click', () => {
  addExcludeItem(excludeFilesContainer, currentConfig.excludeFiles, newExcludeFileInput);
});

newExcludeDirInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addExcludeItem(excludeDirsContainer, currentConfig.excludeDirs, newExcludeDirInput);
  }
});
newExcludeFileInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addExcludeItem(excludeFilesContainer, currentConfig.excludeFiles, newExcludeFileInput);
  }
});

// ========== 图形化选择排除项 ==========
pickExcludeDirBtn.addEventListener('click', async () => {
  if (!currentDir) {
    alert('请先选择工作目录');
    return;
  }
  try {
    const result = await window.electronAPI.pickExcludeDir(currentDir);
    if (result && result.suggestion) {
      if (!currentConfig.excludeDirs.includes(result.suggestion)) {
        currentConfig.excludeDirs.push(result.suggestion);
        markDirty();
        renderTags(excludeDirsContainer, currentConfig.excludeDirs);
      }
    }
  } catch (err) {
    alert(err.message);
  }
});

pickExcludeFileBtn.addEventListener('click', async () => {
  if (!currentDir) {
    alert('请先选择工作目录');
    return;
  }
  try {
    const result = await window.electronAPI.pickExcludeFile(currentDir);
    if (result && result.suggestion) {
      if (!currentConfig.excludeFiles.includes(result.suggestion)) {
        currentConfig.excludeFiles.push(result.suggestion);
        markDirty();
        renderTags(excludeFilesContainer, currentConfig.excludeFiles);
      }
    }
  } catch (err) {
    alert(err.message);
  }
});

// ========== 进度条 ==========
function showProgress() {
  progressContainer.classList.remove('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
}
function hideProgress() {
  progressContainer.classList.add('hidden');
}
function updateProgress(current, total) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% (${current}/${total})`;
}

window.electronAPI.onMergeProgress((data) => {
  updateProgress(data.current, data.total);
});

// ========== 生成文件名 ==========
async function generateOutputFileName() {
  const folderName = currentDir ? await window.electronAPI.pathBasename(currentDir) : 'folder';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  let name = currentConfig.outputFileName || 'merged.md';
  name = name.replace('{folderName}', folderName);
  name = name.replace('{timestamp}', timestamp);
  return name;
}

// ========== 预览 ==========
previewBtn.addEventListener('click', async () => {
  if (!currentDir) {
    alert('请先选择目录');
    return;
  }
  await saveConfigToDir();
  showProgress();
  saveBtn.disabled = true;
  statusDiv.textContent = '正在扫描并处理文件...';
  previewArea.textContent = '';

  try {
    const options = { ...currentConfig };
    mergedMarkdown = await window.electronAPI.startMerge(currentDir, options);
    const lines = mergedMarkdown.split('\n');
    const previewText = lines.slice(0, 200).join('\n');
    previewArea.textContent = previewText + (lines.length > 200 ? '\n... (预览被截断，保存后可查看完整内容)' : '');
    saveBtn.disabled = false;
    statusDiv.textContent = '预览完成，可点击保存按钮导出';
    isDirty = false;
  } catch (err) {
    previewArea.textContent = `错误: ${err.message}`;
    statusDiv.textContent = '合并失败';
  } finally {
    hideProgress();
  }
});

// ========== 保存 ==========
saveBtn.addEventListener('click', async () => {
  if (!currentDir || !mergedMarkdown) return;
  const defaultName = await generateOutputFileName();
  const defaultPath = currentDir + (currentDir.endsWith('/') || currentDir.endsWith('\\') ? '' : '/') + defaultName;
  const filePath = await window.electronAPI.saveFileDialog(defaultPath);
  if (!filePath) return;

  const success = await window.electronAPI.writeFile(filePath, mergedMarkdown);
  if (success) {
    statusDiv.textContent = `已保存到 ${filePath}`;
    await window.electronAPI.showItemInFolder(filePath);
  } else {
    statusDiv.textContent = '保存失败';
    alert('保存失败');
  }
});

// ========== 拖拽支持 ==========
const dropZone = document.getElementById('dropZone');
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
    const droppedPath = files[0].path;
    const isDir = await window.electronAPI.isDirectory(droppedPath);
    if (isDir) {
      selectDirectory(droppedPath);
    } else {
      alert('请拖拽一个文件夹，而不是文件');
    }
  }
});

// 初始化
refreshHistory();