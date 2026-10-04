'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { ROOT, build } = require('./runtime.cjs');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.mp4': 'video/mp4', '.webm': 'video/webm'
};

const reloadScript = '<script data-blog-preview>(function(){var revision;var events=new EventSource("/__blog/events");events.onmessage=function(event){if(revision!==undefined&&revision!==event.data)location.reload();revision=event.data;};})();</script>';

function resolveFile(directory, requestURL) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(requestURL, 'http://localhost').pathname); }
  catch { return { status: 400 }; }
  if (pathname.includes('\0') || pathname.includes('\\')) return { status: 400 };
  if (pathname.split('/').some(segment => segment === '..' || segment.startsWith('.'))) return { status: 403 };
  let filename = path.resolve(directory, `.${pathname}`);
  if (filename !== directory && !filename.startsWith(directory + path.sep)) return { status: 403 };
  try {
    if (fs.statSync(filename).isDirectory()) filename = path.join(filename, 'index.html');
    if (!fs.statSync(filename).isFile()) return { status: 404 };
    const realDirectory = fs.realpathSync(directory);
    const realFilename = fs.realpathSync(filename);
    if (!realFilename.startsWith(realDirectory + path.sep)) return { status: 403 };
    return { status: 200, filename };
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return { status: 404 };
    return { status: 500 };
  }
}

function sendFile(request, response, filename, status = 200) {
  const extension = path.extname(filename).toLowerCase();
  const headers = { 'Content-Type': MIME[extension] || 'application/octet-stream', 'Cache-Control': 'no-cache' };
  try {
    if (extension === '.html') {
      const html = fs.readFileSync(filename, 'utf8');
      const body = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, reloadScript + '</body>') : html + reloadScript;
      headers['Content-Length'] = Buffer.byteLength(body);
      response.writeHead(status, headers);
      response.end(request.method === 'HEAD' ? undefined : body);
    } else {
      headers['Content-Length'] = fs.statSync(filename).size;
      response.writeHead(status, headers);
      if (request.method === 'HEAD') response.end();
      else {
        const stream = fs.createReadStream(filename);
        stream.on('error', () => response.destroy());
        stream.pipe(response);
      }
    }
  } catch {
    if (!response.headersSent) response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('页面暂不可用，请刷新重试。');
  }
}

async function startPreview({ root = ROOT, port = 4000, buildSite = build } = {}) {
  root = path.resolve(root);
  await buildSite({ root, quiet: true });
  const directory = path.join(root, 'dist');
  const clients = new Set();
  const watchers = [];
  let revision = 0;
  let pending = false;
  let closed = false;
  let timer;
  let activeBuild;

  async function drainBuilds() {
    while (pending && !closed) {
      pending = false;
      try {
        await buildSite({ root, quiet: true });
        revision += 1;
        for (const client of clients) client.write(`data: ${revision}\n\n`);
        console.log('已重新生成，浏览器将自动刷新。');
      } catch (error) {
        console.error(`重新构建失败：${error.message}。修正文件后保存即可重试。`);
      }
    }
  }

  function scheduleBuild() {
    if (closed) return;
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!activeBuild) {
        activeBuild = drainBuilds().finally(() => { activeBuild = undefined; });
      }
    }, 250);
  }

  const server = http.createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    if (request.url === '/__blog/events' && request.method === 'GET') {
      response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      response.write(`data: ${revision}\n\n`);
      clients.add(response);
      const heartbeat = setInterval(() => response.write(': keepalive\n\n'), 15000);
      heartbeat.unref();
      request.on('close', () => { clearInterval(heartbeat); clients.delete(response); });
      return;
    }
    const result = resolveFile(directory, request.url);
    if (result.filename) { sendFile(request, response, result.filename, result.status); return; }
    const errorPage = path.join(directory, '404.html');
    if (result.status === 404 && fs.existsSync(errorPage)) { sendFile(request, response, errorPage, 404); return; }
    response.writeHead(result.status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end({ 400: '请求路径无效。', 403: '此路径无法访问。', 404: '没有找到这个页面。', 500: '读取页面失败。' }[result.status]);
  });

  try {
    for (const relative of ['source', 'themes', 'scripts']) {
      const watched = path.join(root, relative);
      if (!fs.existsSync(watched)) continue;
      watchers.push(fs.watch(watched, { recursive: true }, (event, filename) => {
        if (filename && String(filename).split(/[\\/]/).some(segment => segment.startsWith('.') || segment === 'node_modules')) return;
        scheduleBuild();
      }));
    }
    watchers.push(fs.watch(root, (event, filename) => {
      if (filename && /^_config(?:\.[\w-]+)?\.ya?ml$/.test(String(filename))) scheduleBuild();
    }));
    for (const watcher of watchers) watcher.on('error', error => console.error(`监测文件失败：${error.message}`));
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
  } catch (error) {
    for (const watcher of watchers) watcher.close();
    server.close();
    if (error.code === 'EADDRINUSE') throw new Error(`端口 ${port} 已被占用，请先关闭之前的预览。`);
    throw error;
  }

  console.log(`博客预览：http://localhost:${server.address().port}/`);
  console.log('修改首页、文章或主题后保存，会自动重建和刷新。按 Ctrl+C 停止。');

  async function close() {
    closed = true;
    clearTimeout(timer);
    for (const watcher of watchers) watcher.close();
    for (const client of clients) client.end();
    await new Promise(resolve => {
      server.close(resolve);
      server.closeAllConnections();
    });
    if (activeBuild) await activeBuild;
  }

  return { server, close };
}

module.exports = { startPreview, resolveFile, sendFile };
if (require.main === module) {
  startPreview().then(preview => {
    const stop = () => preview.close().catch(error => { console.error(error.message); process.exitCode = 1; });
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  }).catch(error => {
    console.error(`预览启动失败：${error.message}`);
    process.exitCode = 1;
  });
}
