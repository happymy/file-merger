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
    compressOutput: 'Compress output (remove extra spaces, language tags)',
    maxCharsLabel: 'Max chars per part (0 = no split)',
    splitPartFooterLabel: 'Per-part footer (added to each part except the last one)',
    splitPartFooterPlaceholder: 'e.g. (to be continued...)',
    customFooterLabel: 'Custom footer (end of file)',
    customFooterHint: '(Markdown)',
    footerPlaceholder: 'Content appended at the very end...',
    outputNameLabel: 'Output filename template',
    outputNameHint: '(supports {folderName}, {timestamp})',
    previewBtn: '🔍 Scan & Preview',
    saveBtn: '💾 Merge & Save',
    previewTitle: 'Preview',
    copyBtn: '📋 Copy',
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
    rootSelected: 'You selected the root directory itself, which is not allowed.',
    copySuccess: 'Copied!',
    copyFailed: 'Copy failed',
    splitTab: (i, chars) => `Part ${i} (${chars} chars)`,
    fullFileTab: 'Full file'            // 单一部分标签
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
    compressOutput: '压缩输出（去除多余空格、语言标记）',
    maxCharsLabel: '每段最大字符数（0 = 不拆分）',
    splitPartFooterLabel: '分段尾部内容（添加到除最后一段外的每个分段末尾）',
    splitPartFooterPlaceholder: '例如：（未完待续...）',
    customFooterLabel: '自定义尾部内容（文件最末尾）',
    customFooterHint: '（Markdown 格式）',
    footerPlaceholder: '追加在文件末尾的内容...',
    outputNameLabel: '输出文件名模板',
    outputNameHint: '（支持 {folderName}、{timestamp}）',
    previewBtn: '🔍 扫描并预览',
    saveBtn: '💾 合并并保存',
    previewTitle: '预览',
    copyBtn: '📋 复制',
    historyClear: '清除历史',
    noHistory: '无历史记录',
    scanError: '请先选择目录。',
    processing: '正在扫描并处理文件...',
    previewDone: '预览完成，可保存。',
    mergeFailed: '合并失败。',
    configChanged: '配置已更改，请重新预览。',
    savedTo: '已保存到 ',
    saveFailed: '保存失败。',
    dropFileError: '请拖拽一个文件夹，而不是文件。',
    dropTypeErrorDir: '需要文件夹。',
    dropTypeErrorFile: '需要文件。',
    outsideRoot: '所选路径不在工作目录内。',
    rootSelected: '不能选择根目录本身。',
    copySuccess: '已复制！',
    copyFailed: '复制失败',
    splitTab: (i, chars) => `分段 ${i} (${chars} 字符)`,
    fullFileTab: '完整文件'
  }
};

let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('zh') ? 'zh' : 'en');
function t(key, ...args) {
  let val = i18n[currentLang][key] || key;
  if (typeof val === 'function') return val(...args);
  return val;
}

function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'BUTTON' || el.tagName === 'LABEL' || el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H3') {
      el.textContent = t(key);
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.getElementById('langEnBtn').classList.toggle('active', currentLang === 'en');
  document.getElementById('langZhBtn').classList.toggle('active', currentLang === 'zh');
  // 如果预览标签存在，重新渲染（语言变化时）
  if (parts.length > 0) renderTabs();
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
  compressOutput: false,
  maxCharsPerPart: 0,
  splitPartFooter: '',
  customFooter: '',
  outputFileName: 'merged-{timestamp}.md'
};
let mergedMarkdown = '';
let compressedMarkdown = '';
let fileBlocks = [];
let compressedBlocks = [];
let parts = [];
let currentPartIndex = 0;
let isDirty = true;

// DOM 元素
const dirPathDisplay = document.getElementById('dirPathDisplay');
const excludeBinaryCheckbox = document.getElementById('excludeBinary');
const ignoreHiddenCheckbox = document.getElementById('ignoreHidden');
const compressOutputCheckbox = document.getElementById('compressOutput');
const maxCharsPerPartInput = document.getElementById('maxCharsPerPart');
const splitPartFooterTextarea = document.getElementById('splitPartFooter');
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
const previewTabs = document.getElementById('previewTabs');
const copyCurrentPartBtn = document.getElementById('copyCurrentPartBtn');
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
async function refreshHistory() { recentDirs = await window.electronAPI.getHistory(); renderHistoryDropdown(); }
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
    clearDiv.addEventListener('click', async () => { await window.electronAPI.clearHistory(); refreshHistory(); historyDropdown.classList.add('hidden'); });
    historyDropdown.appendChild(clearDiv);
  }
}
historyBtn.addEventListener('click', e => { e.stopPropagation(); historyDropdown.classList.toggle('hidden'); });
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
  currentConfig = saved ? migrateConfig(saved) : {
    excludeDirs: [], excludeFiles: [], excludeBinary: false, ignoreHidden: false,
    compressOutput: false, maxCharsPerPart: 0, splitPartFooter: '',
    whiteListExts: [], maxFileSizeKB: 0, customFooter: '', outputFileName: 'merged-{timestamp}.md'
  };
  populateUIFromConfig();
  await window.electronAPI.addHistory(dirPath);
  refreshHistory();
  resetPreview();
}

function migrateConfig(cfg) {
  return {
    ...cfg,
    excludeDirs: (cfg.excludeDirs || []).map(i => typeof i === 'string' ? { pattern: i, enabled: true } : i),
    excludeFiles: (cfg.excludeFiles || []).map(i => typeof i === 'string' ? { pattern: i, enabled: true } : i),
    compressOutput: cfg.compressOutput || false,
    maxCharsPerPart: cfg.maxCharsPerPart || 0,
    splitPartFooter: cfg.splitPartFooter || ''
  };
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
    cb.addEventListener('change', e => {
      const idx = +e.target.dataset.index;
      items[idx].enabled = cb.checked;
      markDirty();
      renderTags(container, items);
    });
  });
  container.querySelectorAll('.remove-tag').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = +e.target.dataset.index;
      items.splice(idx, 1);
      markDirty();
      renderTags(container, items);
    });
  });
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function populateUIFromConfig() {
  renderTags(excludeDirsContainer, currentConfig.excludeDirs);
  renderTags(excludeFilesContainer, currentConfig.excludeFiles);
  excludeBinaryCheckbox.checked = currentConfig.excludeBinary;
  ignoreHiddenCheckbox.checked = currentConfig.ignoreHidden;
  compressOutputCheckbox.checked = currentConfig.compressOutput || false;
  maxCharsPerPartInput.value = currentConfig.maxCharsPerPart || 0;
  splitPartFooterTextarea.value = currentConfig.splitPartFooter || '';
  whiteListExtsInput.value = (currentConfig.whiteListExts || []).join(',');
  maxFileSizeKBInput.value = currentConfig.maxFileSizeKB || 0;
  customFooterTextarea.value = currentConfig.customFooter || '';
  outputFileNameInput.value = currentConfig.outputFileName || 'merged-{timestamp}.md';
}

function getConfigFromUI() {
  return {
    ...currentConfig,
    excludeDirs: currentConfig.excludeDirs.slice(),
    excludeFiles: currentConfig.excludeFiles.slice(),
    excludeBinary: excludeBinaryCheckbox.checked,
    ignoreHidden: ignoreHiddenCheckbox.checked,
    compressOutput: compressOutputCheckbox.checked,
    maxCharsPerPart: parseInt(maxCharsPerPartInput.value) || 0,
    splitPartFooter: splitPartFooterTextarea.value,
    whiteListExts: whiteListExtsInput.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    maxFileSizeKB: parseInt(maxFileSizeKBInput.value) || 0,
    customFooter: customFooterTextarea.value,
    outputFileName: outputFileNameInput.value.trim() || 'merged-{timestamp}.md'
  };
}

async function saveConfigToDir() {
  if (!currentDir) return;
  const cfg = getConfigFromUI();
  await window.electronAPI.saveConfig(currentDir, cfg);
  currentConfig = cfg;
  isDirty = false;
}

function markDirty() {
  if (!isDirty) {
    isDirty = true;
    resetPreview();
    saveBtn.disabled = true;
    statusDiv.textContent = t('configChanged');
  }
}

[
  excludeBinaryCheckbox, ignoreHiddenCheckbox, compressOutputCheckbox, maxCharsPerPartInput,
  splitPartFooterTextarea, whiteListExtsInput, maxFileSizeKBInput, customFooterTextarea, outputFileNameInput
].forEach(el => {
  el.addEventListener('input', markDirty);
  el.addEventListener('change', markDirty);
});

function resetPreview() {
  mergedMarkdown = '';
  compressedMarkdown = '';
  fileBlocks = [];
  compressedBlocks = [];
  parts = [];
  currentPartIndex = 0;
  previewArea.textContent = '';
  previewTabs.innerHTML = '';
}

// ========== 添加排除项 ==========
function addExcludeItem(container, itemsArray, inputElement) {
  const val = inputElement.value.trim();
  if (!val || itemsArray.some(i => i.pattern === val)) { inputElement.value = ''; return; }
  itemsArray.push({ pattern: val, enabled: true });
  markDirty();
  renderTags(container, itemsArray);
  inputElement.value = '';
}
addExcludeDirBtn.addEventListener('click', () => addExcludeItem(excludeDirsContainer, currentConfig.excludeDirs, newExcludeDirInput));
addExcludeFileBtn.addEventListener('click', () => addExcludeItem(excludeFilesContainer, currentConfig.excludeFiles, newExcludeFileInput));
newExcludeDirInput.addEventListener('keypress', e => { if (e.key === 'Enter') addExcludeItem(excludeDirsContainer, currentConfig.excludeDirs, newExcludeDirInput); });
newExcludeFileInput.addEventListener('keypress', e => { if (e.key === 'Enter') addExcludeItem(excludeFilesContainer, currentConfig.excludeFiles, newExcludeFileInput); });

async function pickExcludeAndAdd(isDirectory) {
  if (!currentDir) {
    alert(t('scanError'));
    return;
  }
  const result = await window.electronAPI.pickExcludeItem(currentDir, isDirectory);
  
  // 修复：如果用户取消选择，不显示任何提示直接返回
  if (!result || !result.suggestions) {
    if (result && result.error) {
      alert(result.error.includes('root') ? t('rootSelected') : t('outsideRoot'));
    }
    return;
  }
  
  const itemsArray = isDirectory ? currentConfig.excludeDirs : currentConfig.excludeFiles;
  const container = isDirectory ? excludeDirsContainer : excludeFilesContainer;
  
  // 添加所有新选择的项目
  let addedCount = 0;
  for (const suggestion of result.suggestions) {
    if (!itemsArray.some(item => item.pattern === suggestion)) {
      itemsArray.push({ pattern: suggestion, enabled: true });
      addedCount++;
    }
  }
  
  if (addedCount > 0) {
    markDirty();
    renderTags(container, itemsArray);
  }
}

pickExcludeDirBtn.addEventListener('click', () => pickExcludeAndAdd(true));
pickExcludeFileBtn.addEventListener('click', () => pickExcludeAndAdd(false));

function setupDropTarget(container, isDirectory) {
  container.addEventListener('dragover', e => { e.preventDefault(); container.classList.add('dragover'); });
  container.addEventListener('dragleave', () => container.classList.remove('dragover'));
  container.addEventListener('drop', async e => {
    e.preventDefault(); container.classList.remove('dragover');
    if (!currentDir) return alert(t('scanError'));
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const droppedPath = files[0].path;
    let isDir;
    try { isDir = await window.electronAPI.isDirectory(droppedPath); } catch { return alert('Unable to access item.'); }
    if (isDirectory && !isDir) return alert(t('dropTypeErrorDir'));
    if (!isDirectory && isDir) return alert(t('dropTypeErrorFile'));
    const res = await window.electronAPI.suggestExcludeGlob(currentDir, droppedPath);
    if (res.error) return alert(res.error.includes('root') ? t('rootSelected') : t('outsideRoot'));
    const arr = isDirectory ? currentConfig.excludeDirs : currentConfig.excludeFiles;
    if (!arr.some(i => i.pattern === res.suggestion)) { arr.push({ pattern: res.suggestion, enabled: true }); markDirty(); renderTags(container, arr); }
  });
}
setupDropTarget(excludeDirsContainer, true);
setupDropTarget(excludeFilesContainer, false);

// ========== 压缩与切分（基于文件块） ==========
function compressMarkdown(md) {
  return md
    .replace(/```\w+\n/g, '```\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s+$/gm, '');
}

function splitFromBlocks(blocks, maxChars, partFooter) {
  if (!maxChars || maxChars <= 0) {
    return blocks.length ? [blocks.join('')] : [''];
  }

  const result = [];
  let current = '';

  for (const block of blocks) {
    if (!block) continue;
    if (current.length + block.length > maxChars && current.length > 0) {
      result.push(current);
      current = '';
    }
    if (block.length > maxChars && current.length === 0) {
      let remaining = block;
      while (remaining.length > maxChars) {
        result.push(remaining.substring(0, maxChars));
        remaining = remaining.substring(maxChars);
      }
      current = remaining;
    } else {
      current += block;
    }
  }
  if (current) result.push(current);

  if (partFooter && result.length > 1) {
    for (let i = 0; i < result.length - 1; i++) {
      result[i] += '\n\n' + partFooter + '\n';
    }
  }

  return result.length ? result : [''];
}

function updatePartsView() {
  const doCompress = compressOutputCheckbox.checked;
  if (doCompress) {
    compressedBlocks = fileBlocks.map(block => compressMarkdown(block));
    compressedMarkdown = compressedBlocks.join('');
    parts = splitFromBlocks(compressedBlocks, parseInt(maxCharsPerPartInput.value) || 0, splitPartFooterTextarea.value);
  } else {
    compressedBlocks = fileBlocks;
    mergedMarkdown = fileBlocks.join('');
    parts = splitFromBlocks(fileBlocks, parseInt(maxCharsPerPartInput.value) || 0, splitPartFooterTextarea.value);
  }
  currentPartIndex = 0;
  renderTabs();
}

function renderTabs() {
  previewTabs.innerHTML = '';

  if (parts.length === 1) {
    const btn = document.createElement('button');
    btn.className = 'tab-btn active';
    btn.textContent = t('fullFileTab');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'copied'));
      currentPartIndex = 0;
      previewArea.textContent = parts[0];
      btn.classList.add('active');
    });
    previewTabs.appendChild(btn);
    previewArea.textContent = parts[0];
    return;
  }

  parts.forEach((part, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i === currentPartIndex ? ' active' : '');
    btn.textContent = t('splitTab', i + 1, part.length);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'copied'));
      currentPartIndex = i;
      previewArea.textContent = parts[i];
      btn.classList.add('active');
    });
    previewTabs.appendChild(btn);
  });
  if (parts.length > 0) previewArea.textContent = parts[currentPartIndex];
}

// ========== 进度 ==========
function showProgress() { progressContainer.classList.remove('hidden'); progressFill.style.width = '0%'; progressText.textContent = '0%'; }
function hideProgress() { progressContainer.classList.add('hidden'); }
function updateProgress(current, total) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${pct}% (${current}/${total})`;
}
window.electronAPI.onMergeProgress((data) => updateProgress(data.current, data.total));

// ========== 预览 ==========
previewBtn.addEventListener('click', async () => {
  if (!currentDir) return alert(t('scanError'));
  await saveConfigToDir();
  showProgress();
  saveBtn.disabled = true;
  statusDiv.textContent = t('processing');
  previewArea.textContent = '';

  try {
    const options = { ...currentConfig };
    const result = await window.electronAPI.startMerge(currentDir, options);
    mergedMarkdown = result.md;
    fileBlocks = result.fileBlocks;

    if (compressOutputCheckbox.checked) {
      compressedBlocks = fileBlocks.map(block => compressMarkdown(block));
      compressedMarkdown = compressedBlocks.join('');
    } else {
      compressedBlocks = fileBlocks;
      compressedMarkdown = mergedMarkdown;
    }

    updatePartsView();
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

// ========== 复制到剪贴板 ==========
copyCurrentPartBtn.addEventListener('click', async () => {
  const text = parts.length ? parts[currentPartIndex] : (compressOutputCheckbox.checked ? compressedMarkdown : mergedMarkdown);
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    statusDiv.textContent = t('copySuccess');
    
    // 添加视觉提示
    const originalText = copyCurrentPartBtn.textContent;
    copyCurrentPartBtn.textContent = '✅ ' + t('copySuccess');
    copyCurrentPartBtn.style.background = 'var(--accent-hover)';
    
    // 为当前活动的选项卡添加copied样式，并保持不变
    const activeTab = document.querySelector('.tab-btn.active');
    if(activeTab) {
      activeTab.classList.remove('active'); // 移除active样式
      activeTab.classList.add('copied');    // 添加copied样式
    }
    
    setTimeout(() => {
      copyCurrentPartBtn.textContent = originalText;
      copyCurrentPartBtn.style.background = 'var(--accent)';
    }, 2000);
  } catch {
    statusDiv.textContent = t('copyFailed');
  }
});

// ========== 保存 ==========
saveBtn.addEventListener('click', async () => {
  if (!currentDir || !fileBlocks.length) return;

  const outputBaseName = await generateOutputFileName();
  const maxChars = parseInt(maxCharsPerPartInput.value) || 0;
  const doCompress = compressOutputCheckbox.checked;

  if (!maxChars || parts.length <= 1) {
    const defaultPath = currentDir + '/' + outputBaseName;
    const content = doCompress ? compressedMarkdown : mergedMarkdown;
    const result = await window.electronAPI.saveFile(defaultPath, content);
    if (result) {
      statusDiv.textContent = t('savedTo') + result;
    } else {
      statusDiv.textContent = t('saveFailed');
    }
  } else {
    const base = outputBaseName.replace(/\.md$/i, '');
    const result = await window.electronAPI.saveParts(base, parts);
    if (result) {
      statusDiv.textContent = t('savedTo') + result;
    } else {
      statusDiv.textContent = t('saveFailed');
    }
  }
});

async function generateOutputFileName() {
  const folderName = currentDir ? await window.electronAPI.pathBasename(currentDir) : 'folder';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  let name = currentConfig.outputFileName || 'merged.md';
  name = name.replace('{folderName}', folderName).replace('{timestamp}', timestamp);
  return name;
}

// ========== 拖拽目录 ==========
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', async e => {
  e.preventDefault(); dropZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length) {
    const isDir = await window.electronAPI.isDirectory(files[0].path);
    if (isDir) selectDirectory(files[0].path);
    else alert(t('dropFileError'));
  }
});

// 初始化
applyLanguage();
refreshHistory();