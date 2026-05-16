// ==================== 国际化 ====================
const i18n = {
  en: {
    title: '📁 File Merger Pro',
    selectDir: '📂 Select Directory',
    noDirSelected: 'No directory selected (drag a folder here)',
    excludeDirsLabel: 'Exclude Directories',
    excludeDirsHint: '(glob patterns, relative to root)',
    dirPlaceholder: 'e.g. node_modules or **/test/**',
    excludeFilesLabel: 'Exclude Files',
    excludeFilesHint: '(glob patterns, relative to root)',
    filePlaceholder: 'e.g. *.log or **/*.test.js',
    addBtn: 'Add',
    browseDirBtn: '📁 Browse',
    browseFileBtn: '📄 Browse',
    whiteListLabel: 'Whitelist extensions',
    whiteListHint: '(comma separated, empty = all)',
    whiteListPlaceholder: 'js,ts,json,md',
    maxSizeLabel: 'Max file size',
    maxSizeHint: '(KB, 0 = no limit)',
    excludeBinary: 'Exclude binary files',
    ignoreHidden: 'Ignore hidden files/folders',
    customFooterLabel: 'Custom footer',
    customFooterHint: '(Markdown)',
    footerPlaceholder: 'Content appended at the end...',
    outputNameLabel: 'Output filename template',
    outputNameHint: '(supports {folderName}, {timestamp})',
    previewBtn: '🔍 Scan & Preview',
    saveBtn: '💾 Merge & Save',
    previewTitle: 'Preview (first 200 lines)',
    historyClear: 'Clear history',
    noHistory: 'No history',
    scanError: 'Please select a directory first.',
    processing: 'Scanning and processing files...',
    previewDone: 'Preview complete. Ready to save.',
    mergeFailed: 'Merge failed.',
    configChanged: 'Configuration changed. Please re-preview.',
    savedTo: 'Saved to ',
    saveFailed: 'Save failed.',
    dropFileError: 'Please drag a folder, not a file.',
    dropTypeErrorDir: 'Expected a folder.',
    dropTypeErrorFile: 'Expected a file.',
    outsideRoot: 'Selected path is outside the working directory.',
    rootSelected: 'You selected the root directory itself, which is not allowed.'
  },
  zh: {
    title: '📁 文件合并工具',
    selectDir: '📂 选择目录',
    noDirSelected: '未选择目录（可拖拽文件夹到此处）',
    excludeDirsLabel: '排除目录',
    excludeDirsHint: '（glob 模式，相对于根目录）',
    dirPlaceholder: '例如：node_modules 或 **/test/**',
    excludeFilesLabel: '排除文件',
    excludeFilesHint: '（glob 模式，相对于根目录）',
    filePlaceholder: '例如：*.log 或 **/*.test.js',
    addBtn: '添加',
    browseDirBtn: '📁 浏览',
    browseFileBtn: '📄 浏览',
    whiteListLabel: '白名单扩展名',
    whiteListHint: '（逗号分隔，留空表示包含全部）',
    whiteListPlaceholder: 'js,ts,json,md',
    maxSizeLabel: '文件大小上限',
    maxSizeHint: '（KB，0 表示无限制）',
    excludeBinary: '排除二进制文件',
    ignoreHidden: '忽略隐藏文件/文件夹',
    customFooterLabel: '自定义尾部内容',
    customFooterHint: '（Markdown 格式）',
    footerPlaceholder: '追加在文件末尾的内容...',
    outputNameLabel: '输出文件名模板',
    outputNameHint: '（支持 {folderName}、{timestamp}）',
    previewBtn: '🔍 扫描并预览',
    saveBtn: '💾 合并并保存',
    previewTitle: '预览（前 200 行）',
    historyClear: '清除历史',
    noHistory: '无历史记录',
    scanError: '请先选择目录。',
    processing: '正在扫描并处理文件...',
    previewDone: '预览完成，可点击保存。',
    mergeFailed: '合并失败。',
    configChanged: '配置已更改，请重新预览。',
    savedTo: '已保存到 ',
    saveFailed: '保存失败。',
    dropFileError: '请拖拽一个文件夹，而不是文件。',
    dropTypeErrorDir: '需要文件夹。',
    dropTypeErrorFile: '需要文件。',
    outsideRoot: '所选路径不在工作目录内。',
    rootSelected: '不能选择根目录本身。'
  }
};

let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('zh') ? 'zh' : 'en');
function t(key) {
  return i18n[currentLang][key] || key;
}

function applyLanguage() {
  // 设置 data-i18n 元素的文本
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'BUTTON' || el.tagName === 'LABEL' || el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H3') {
      el.textContent = t(key);
    } else {
      el.innerHTML = t(key);
    }
  });
  // 设置 placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  // 更新语言按钮激活状态
  document.getElementById('langEnBtn').classList.toggle('active', currentLang === 'en');
  document.getElementById('langZhBtn').classList.toggle('active', currentLang === 'zh');
  // 更新状态消息（如果有正在显示的状态）
  // 注意：状态消息为动态，需通过更新状态函数重新设置
}

document.getElementById('langEnBtn').addEventListener('click', () => {
  currentLang = 'en';
  localStorage.setItem('lang', 'en');
  applyLanguage();
});
document.getElementById('langZhBtn').addEventListener('click', () => {
  currentLang = 'zh';
  localStorage.setItem('lang', 'zh');
  applyLanguage();
});

// ==================== 主逻辑 ====================
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
    historyDropdown.innerHTML = `<div>${t('noHistory')}</div>`;
  } else {
    recentDirs.forEach(dir => {
      const div = document.createElement('div');
      div.textContent = dir;
      div.addEventListener('click', () => selectDirectory(dir));
      historyDropdown.appendChild(div);
    });
    const clearDiv = document.createElement('div');
    clearDiv.textContent = t('historyClear');
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
    currentConfig = migrateConfig(saved);
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
  previewArea.textContent = '';
  mergedMarkdown = '';
  isDirty = true;
  saveBtn.disabled = true;
  hideProgress();
  statusDiv.textContent = '';
}

function migrateConfig(cfg) {
  const newCfg = { ...cfg };
  if (Array.isArray(newCfg.excludeDirs)) {
    newCfg.excludeDirs = newCfg.excludeDirs.map(item => typeof item === 'string' ? { pattern: item, enabled: true } : item);
  } else {
    newCfg.excludeDirs = [];
  }
  if (Array.isArray(newCfg.excludeFiles)) {
    newCfg.excludeFiles = newCfg.excludeFiles.map(item => typeof item === 'string' ? { pattern: item, enabled: true } : item);
  } else {
    newCfg.excludeFiles = [];
  }
  return newCfg;
}

// ========== 标签渲染 ==========
function renderTags(container, items) {
  container.innerHTML = '';
  items.forEach((item, index) => {
    const tag = document.createElement('span');
    tag.className = 'tag' + (item.enabled ? '' : ' disabled');
    tag.innerHTML = `
      <input type="checkbox" class="tag-checkbox" data-index="${index}" ${item.enabled ? 'checked' : ''}>
      <span>${escapeHtml(item.pattern)}</span>
      <span class="remove-tag" data-index="${index}">✕</span>
    `;
    container.appendChild(tag);
  });

  container.querySelectorAll('.tag-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      items[idx].enabled = cb.checked;
      markDirty();
      renderTags(container, items);
    });
  });

  container.querySelectorAll('.remove-tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      items.splice(idx, 1);
      markDirty();
      renderTags(container, items);
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function populateUIFromConfig() {
  renderTags(excludeDirsContainer, currentConfig.excludeDirs);
  renderTags(excludeFilesContainer, currentConfig.excludeFiles);
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
    excludeDirs: currentConfig.excludeDirs.slice(),
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
    statusDiv.textContent = t('configChanged');
  }
}

// 监听其他输入的变化
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
  if (itemsArray.some(item => item.pattern === val)) {
    inputElement.value = '';
    return;
  }
  itemsArray.push({ pattern: val, enabled: true });
  markDirty();
  renderTags(container, itemsArray);
  inputElement.value = '';
}

addExcludeDirBtn.addEventListener('click', () => {
  addExcludeItem(excludeDirsContainer, currentConfig.excludeDirs, newExcludeDirInput);
});
addExcludeFileBtn.addEventListener('click', () => {
  addExcludeItem(excludeFilesContainer, currentConfig.excludeFiles, newExcludeFileInput);
});

newExcludeDirInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addExcludeItem(excludeDirsContainer, currentConfig.excludeDirs, newExcludeDirInput);
});
newExcludeFileInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addExcludeItem(excludeFilesContainer, currentConfig.excludeFiles, newExcludeFileInput);
});

// ========== 图形化选择排除项 ==========
async function pickExcludeAndAdd(isDirectory) {
  if (!currentDir) {
    alert(t('scanError'));
    return;
  }
  const result = await window.electronAPI.pickExcludeItem(currentDir, isDirectory);
  if (!result) return;
  if (result.error) {
    alert(result.error.includes('root') ? t('rootSelected') : t('outsideRoot'));
    return;
  }
  if (result.suggestion) {
    const itemsArray = isDirectory ? currentConfig.excludeDirs : currentConfig.excludeFiles;
    const container = isDirectory ? excludeDirsContainer : excludeFilesContainer;
    if (!itemsArray.some(item => item.pattern === result.suggestion)) {
      itemsArray.push({ pattern: result.suggestion, enabled: true });
      markDirty();
      renderTags(container, itemsArray);
    }
  }
}

pickExcludeDirBtn.addEventListener('click', () => pickExcludeAndAdd(true));
pickExcludeFileBtn.addEventListener('click', () => pickExcludeAndAdd(false));

// ========== 拖拽添加排除项 ==========
function setupDropTarget(container, isDirectory) {
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.add('dragover');
  });
  container.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.remove('dragover');
  });
  container.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.remove('dragover');

    if (!currentDir) {
      alert(t('scanError'));
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    const droppedPath = files[0].path;

    let isDroppedItemDir;
    try {
      isDroppedItemDir = await window.electronAPI.isDirectory(droppedPath);
    } catch {
      alert('Unable to access dropped item.');
      return;
    }
    if (isDirectory && !isDroppedItemDir) {
      alert(t('dropTypeErrorDir'));
      return;
    }
    if (!isDirectory && isDroppedItemDir) {
      alert(t('dropTypeErrorFile'));
      return;
    }

    const result = await window.electronAPI.suggestExcludeGlob(currentDir, droppedPath);
    if (result.error) {
      alert(result.error.includes('root') ? t('rootSelected') : t('outsideRoot'));
      return;
    }
    if (result.suggestion) {
      const itemsArray = isDirectory ? currentConfig.excludeDirs : currentConfig.excludeFiles;
      if (!itemsArray.some(item => item.pattern === result.suggestion)) {
        itemsArray.push({ pattern: result.suggestion, enabled: true });
        markDirty();
        renderTags(container, itemsArray);
      }
    }
  });
}

setupDropTarget(excludeDirsContainer, true);
setupDropTarget(excludeFilesContainer, false);

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
    alert(t('scanError'));
    return;
  }
  await saveConfigToDir();
  showProgress();
  saveBtn.disabled = true;
  statusDiv.textContent = t('processing');
  previewArea.textContent = '';

  try {
    const options = { ...currentConfig };
    mergedMarkdown = await window.electronAPI.startMerge(currentDir, options);
    const lines = mergedMarkdown.split('\n');
    const previewText = lines.slice(0, 200).join('\n');
    previewArea.textContent = previewText + (lines.length > 200 ? '\n... (preview truncated, full content will be in saved file)' : '');
    saveBtn.disabled = false;
    statusDiv.textContent = t('previewDone');
    isDirty = false;
  } catch (err) {
    previewArea.textContent = `Error: ${err.message}`;
    statusDiv.textContent = t('mergeFailed');
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
    statusDiv.textContent = t('savedTo') + filePath;
    await window.electronAPI.showItemInFolder(filePath);
  } else {
    statusDiv.textContent = t('saveFailed');
    alert(t('saveFailed'));
  }
});

// ========== 目录拖拽 ==========
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
      alert(t('dropFileError'));
    }
  }
});

// 初始化语言界面和历史记录
applyLanguage();
refreshHistory();