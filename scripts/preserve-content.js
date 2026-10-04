'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function readManifest(sourceDirectory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceDirectory, '_data/legacy-posts.json'), 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.posts)) throw new Error('Invalid legacy post manifest');
  const sources = new Set();
  const routes = new Set();
  for (const post of manifest.posts) {
    if (!post.source.startsWith('_posts/') || post.source.split('/').includes('..') || sources.has(post.source)) {
      throw new Error(`Invalid or duplicate legacy source: ${post.source}`);
    }
    sources.add(post.source);
    for (const route of [post.path, ...post.aliases]) {
      if (!/^\/[\w/-]+\/$/.test(route) || route.includes('/../') || routes.has(route)) {
        throw new Error(`Invalid or duplicate legacy route: ${route}`);
      }
      routes.add(route);
    }
  }
  return manifest;
}

function postPath(post, legacyPost) {
  if (legacyPost) return legacyPost.path;
  if (post.__permalink) return post.__permalink.startsWith('/') ? post.__permalink : `/${post.__permalink}`;
  return `/posts/${String(post.slug).replace(/^\/+|\/+$/g, '')}/`;
}

function browserPath(route, config) {
  const root = `/${String(config.root || '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
  const pathname = `${root}/${route.replace(/^\/+/, '')}`;
  return pathname.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

function commentID(pathname) {
  return crypto.createHash('md5').update(pathname).digest('hex');
}

function applyPostMetadata(post, legacyPost, config) {
  post.__permalink = postPath(post, legacyPost);
  post.legacy_aliases = legacyPost ? legacyPost.aliases.slice() : [];
  post.legacy_comments = legacyPost
    ? [legacyPost.path, ...legacyPost.aliases].map(pathname => ({ path: pathname, id: commentID(pathname) }))
    : [];
  post.comment_path = legacyPost ? legacyPost.path : browserPath(post.__permalink, config);
  post.comment_id = commentID(post.comment_path);
  return post;
}

function assetRoute(postRoute, filename) {
  const directory = postRoute.replace(/\.html?$/, '').replace(/\/?$/, '/');
  return `${directory.replace(/^\/+/, '')}${filename}`;
}

function assetDirectory(post, sourceDirectory) {
  const source = post.source || '';
  return path.resolve(sourceDirectory, source.slice(0, -path.extname(source).length));
}

function listPostAssets(post, sourceDirectory) {
  const directory = assetDirectory(post, sourceDirectory);
  if (!post.source?.startsWith('_posts/') || !fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) return [];
  const files = [];
  const walk = current => {
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      if (item.name.startsWith('.') || item.isSymbolicLink()) continue;
      const filename = path.join(current, item.name);
      if (item.isDirectory()) walk(filename);
      else if (item.isFile()) files.push({ source: filename, file: path.relative(directory, filename).split(path.sep).join('/') });
    }
  };
  walk(directory);
  return files.sort((left, right) => left.file.localeCompare(right.file));
}

function rewritePostImages(data, sourceDirectory, config) {
  if (!data.source?.startsWith('_posts/')) return data;
  const directory = assetDirectory(data, sourceDirectory);
  const rewrite = content => typeof content === 'string' ? content.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(["'])([^"']*)\2/gi,
    (image, attribute, quote, source) => {
      if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(source)) return image;
      const match = source.match(/^([^?#]+)([?#].*)?$/);
      if (!match) return image;
      let relative;
      try { relative = decodeURIComponent(match[1]); } catch { return image; }
      const filename = path.resolve(directory, relative);
      if (!filename.startsWith(directory + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) return image;
      const asset = path.relative(directory, filename).split(path.sep).join('/');
      const href = browserPath(assetRoute(data.__permalink, asset), config) + (match[2] || '');
      return `${attribute}${quote}${href}${quote}`;
    }
  ) : content;
  for (const field of ['content', 'excerpt', 'more']) data[field] = rewrite(data[field]);
  return data;
}

function redirectHTML(target, title) {
  const escapedURL = escapeHTML(target);
  const scriptURL = JSON.stringify(target).replace(/</g, '\\u003c');
  return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)}</title><link rel="canonical" href="${escapedURL}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${escapedURL}"></head><body><p><a href="${escapedURL}">${escapeHTML(title)}</a></p><script>location.replace(${scriptURL}+location.search+location.hash);</script></body></html>\n`;
}

function register(hexoInstance) {
  const manifest = readManifest(hexoInstance.source_dir);
  const postsBySource = new Map(manifest.posts.map(post => [post.source, post]));
  const attachMetadata = post => applyPostMetadata(post, postsBySource.get(post.source), hexoInstance.config);

  // Hexo's built-in filter runs at priority 10 and honors __permalink.
  hexoInstance.extend.filter.register('post_permalink', post => {
    if (post && typeof post === 'object') attachMetadata(post);
    return post;
  }, 0);
  hexoInstance.extend.filter.register('before_generate', () => {
    for (const post of hexoInstance.model('Post').toArray()) attachMetadata(post);
  }, 1);
  hexoInstance.extend.filter.register('before_post_render', data => {
    if (data.source?.startsWith('_posts/')) attachMetadata(data);
    return data;
  }, 0);
  // Excerpt generation runs at priority 10; repair all rendered variants afterward.
  hexoInstance.extend.filter.register('after_post_render', data => rewritePostImages(data, hexoInstance.source_dir, hexoInstance.config), 20);

  hexoInstance.extend.generator.register('preserved-post-content', locals => {
    const routes = [];
    const activePosts = new Map(locals.posts.toArray().map(post => [post.source, post]));
    for (const legacyPost of manifest.posts) {
      if (!activePosts.has(legacyPost.source)) continue;
      const target = new URL(browserPath(legacyPost.path, hexoInstance.config), hexoInstance.config.url || manifest.siteUrl).href;
      for (const alias of legacyPost.aliases) {
        routes.push({ path: alias.slice(1), data: redirectHTML(target, legacyPost.title) });
      }
      for (const asset of legacyPost.assets || []) {
        if (!fs.existsSync(path.join(hexoInstance.source_dir, asset.source))) throw new Error(`Missing preserved post asset: ${asset.source}`);
      }
    }
    for (const post of activePosts.values()) {
      attachMetadata(post);
      for (const asset of listPostAssets(post, hexoInstance.source_dir)) {
        routes.push({ path: assetRoute(post.__permalink, asset.file), data: () => fs.createReadStream(asset.source) });
      }
    }
    return routes;
  });
}

module.exports = { readManifest, postPath, browserPath, commentID, applyPostMetadata, assetRoute, listPostAssets, rewritePostImages, redirectHTML, register };
if (typeof hexo !== 'undefined') register(hexo);
