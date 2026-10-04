'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function acquireBuildLock(root) {
  const directory = path.join(root, '.blog-build-lock');
  const deadline = Date.now() + 30000;
  while (true) {
    try {
      fs.mkdirSync(directory);
      fs.writeFileSync(path.join(directory, 'pid'), String(process.pid));
      return () => fs.rmSync(directory, { recursive: true, force: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        const pid = Number(fs.readFileSync(path.join(directory, 'pid'), 'utf8'));
        if (Number.isSafeInteger(pid) && pid > 0) {
          try { process.kill(pid, 0); } catch (probeError) {
            if (probeError.code === 'ESRCH') {
              fs.rmSync(directory, { recursive: true, force: true });
              continue;
            }
          }
        }
      } catch (readError) {
        if (readError.code === 'ENOENT' && !fs.existsSync(directory)) continue;
        // Another builder may still be creating its pid file.
      }
      if (Date.now() > deadline) throw new Error('另一个进程仍在构建博客，请稍后重试。');
      await sleep(200);
    }
  }
}

async function build({ root = ROOT, quiet = false } = {}) {
  root = path.resolve(root);
  const release = await acquireBuildLock(root);
  let cacheDirectory;
  let stagingDirectory;
  let hexo;
  try {
    // Hexo's output argument relocates its database, not the website output.
    // A fresh database on every build keeps the original db.json untouched.
    cacheDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'waste-lands-cache-'));
    stagingDirectory = fs.mkdtempSync(path.join(root, '.blog-build-'));
    const Hexo = require('hexo');
    hexo = new Hexo(root, { _: ['generate'], output: cacheDirectory, silent: quiet });
    await hexo.init();
    const destination = path.join(root, 'dist');
    if (path.resolve(hexo.public_dir) !== destination) {
      throw new Error('为保护旧网站，请将 _config.yml 的 public_dir 设置为 dist。');
    }
    if (fs.existsSync(destination) && (!fs.lstatSync(destination).isDirectory() || fs.lstatSync(destination).isSymbolicLink())) {
      throw new Error('dist 必须是普通目录；构建已停止。');
    }
    const stagedSite = path.join(stagingDirectory, 'site');
    hexo.public_dir = stagedSite + path.sep;
    await hexo.call('generate', { force: true, bail: true });
    const homepage = path.join(stagedSite, 'index.html');
    if (!fs.existsSync(homepage) || fs.statSync(homepage).size < 100) {
      throw new Error('首页生成失败，现有 dist 保持不变。请检查主题或配置。');
    }
    const count = hexo.route.list().length;
    await hexo.exit();
    hexo = null;

    // Both directories are on the same filesystem. Only swap after a complete
    // successful build so preview requests never see partially written files.
    const previous = path.join(stagingDirectory, 'previous');
    const hadPrevious = fs.existsSync(destination);
    if (hadPrevious) fs.renameSync(destination, previous);
    try {
      fs.renameSync(stagedSite, destination);
    } catch (error) {
      if (hadPrevious) fs.renameSync(previous, destination);
      throw error;
    }
    if (!quiet) console.log(`博客已生成：${destination}（${count} 个文件）`);
    return { directory: destination, count };
  } finally {
    if (hexo) await hexo.exit().catch(error => console.error(`关闭构建实例失败：${error.message}`));
    if (cacheDirectory) fs.rmSync(cacheDirectory, { recursive: true, force: true });
    if (stagingDirectory) fs.rmSync(stagingDirectory, { recursive: true, force: true });
    release();
  }
}

module.exports = { ROOT, build };
