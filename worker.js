const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const { minimatch } = require('minimatch');
const { isBinaryFileSync } = require('isbinaryfile');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');

const { dirPath, options } = workerData;
const {
  excludeDirs = [],
  excludeFiles = [],
  excludeBinary = false,
  ignoreHidden = false,
  whiteListExts = [],
  maxFileSizeKB = 0,
} = options;

function shouldExcludeDir(relativeDir) {
  const rel = relativeDir.split(path.sep).join('/');
  return excludeDirs.some(p => minimatch(rel, p, { dot: true }));
}

function shouldExcludeFile(relativeFile) {
  const rel = relativeFile.split(path.sep).join('/');
  return excludeFiles.some(p => minimatch(rel, p, { dot: true }));
}

function isHidden(entryPath) {
  return path.basename(entryPath).startsWith('.');
}

function collectFiles() {
  const results = [];
  function walk(currentDir, relativePrefix) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = relativePrefix ? path.posix.join(relativePrefix, entry.name) : entry.name;

      if (ignoreHidden && isHidden(fullPath)) continue;

      if (entry.isDirectory()) {
        if (shouldExcludeDir(relPath)) continue;
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        if (entry.name === '.file-merger-config.json') continue;
        if (shouldExcludeFile(relPath)) continue;

        if (whiteListExts.length > 0) {
          const ext = path.extname(entry.name).slice(1).toLowerCase();
          if (!whiteListExts.includes(ext)) continue;
        }

        if (maxFileSizeKB > 0) {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.size / 1024 > maxFileSizeKB) continue;
          } catch {
            continue;
          }
        }

        results.push({ fullPath, relPath });
      }
    }
  }
  walk(dirPath, '');
  return results;
}

function readFileContent(fullPath) {
  try {
    const buffer = fs.readFileSync(fullPath);
    if (excludeBinary && isBinaryFileSync(fullPath)) {
      return null;
    }
    const isBin = isBinaryFileSync(fullPath);
    if (isBin) {
      return { type: 'binary', base64: buffer.toString('base64'), size: buffer.length };
    }
    // 编码检测
    const detected = jschardet.detect(buffer);
    let text;
    if (detected.encoding && detected.encoding !== 'UTF-8' && detected.encoding !== 'ascii') {
      try {
        text = iconv.decode(buffer, detected.encoding);
      } catch {
        text = buffer.toString('utf-8');
      }
    } else {
      text = buffer.toString('utf-8');
    }
    return { type: 'text', text };
  } catch (e) {
    return { type: 'error', message: e.message };
  }
}

function getLanguageFromExt(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
    html: 'html', css: 'css', json: 'json', md: 'markdown',
    py: 'python', java: 'java', cpp: 'cpp', c: 'c', h: 'c',
    rb: 'ruby', php: 'php', go: 'go', rs: 'rust', sh: 'bash',
    yml: 'yaml', yaml: 'yaml', xml: 'xml', sql: 'sql', txt: 'text',
    toml: 'toml', ini: 'ini', cfg: 'ini', bat: 'batch', ps1: 'powershell',
  };
  return map[ext] || '';
}

(async () => {
  try {
    const files = collectFiles();
    let md = '';
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const content = readFileContent(file.fullPath);
      if (content === null) {
        parentPort.postMessage({ type: 'progress', data: { current: i+1, total } });
        continue;
      }

      const relPath = file.relPath.split('\\').join('/');
      md += `## ${relPath}\n\n`;

      if (content.type === 'binary') {
        md += `\`\`\`\n[二进制文件，大小：${(content.size / 1024).toFixed(1)} KB]\n\`\`\`\n\n`;
      } else if (content.type === 'text') {
        const lang = getLanguageFromExt(relPath);
        md += `\`\`\`${lang}\n${content.text}\n\`\`\`\n\n`;
      } else {
        md += `\`\`\`\n[读取错误: ${content.message}]\n\`\`\`\n\n`;
      }

      parentPort.postMessage({ type: 'progress', data: { current: i+1, total } });
    }

    if (options.customFooter && options.customFooter.trim()) {
      md += `\n---\n\n${options.customFooter}\n`;
    }

    parentPort.postMessage({ type: 'result', data: md });
  } catch (err) {
    parentPort.postMessage({ type: 'error', message: err.message });
  }
})();