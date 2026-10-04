'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const vm = require('node:vm');
const preservation = require('../scripts/preserve-content');
const builtinPermalink = require('hexo/lib/plugins/filter/post_permalink');

const sourceDirectory = path.resolve(__dirname, '../source');
const manifest = preservation.readManifest(sourceDirectory);
const config = { root: '/', url: manifest.siteUrl, permalink: 'posts/:title/' };

function createHexoMock(posts) {
  const filters = new Map();
  const generators = new Map();
  return {
    source_dir: sourceDirectory,
    config,
    filters,
    generators,
    model: name => {
      assert.equal(name, 'Post');
      return { toArray: () => posts };
    },
    extend: {
      filter: { register: (name, callback, priority) => filters.set(name, { callback, priority }) },
      generator: { register: (name, callback) => generators.set(name, callback) }
    }
  };
}

test('the frozen manifest preserves all 35 source posts and 106 historical paths', () => {
  assert.equal(manifest.posts.length, 35);
  const routes = manifest.posts.flatMap(post => [post.path, ...post.aliases]);
  assert.equal(routes.length, 106);
  assert.equal(new Set(routes).size, 106);
  assert.equal(manifest.posts.reduce((sum, post) => sum + (post.assets?.length || 0), 0), 6);
  for (const post of manifest.posts) {
    const original = fs.readFileSync(path.join(sourceDirectory, post.source), 'utf8');
    assert.match(original, /^---\s*\n/);
    assert.match(post.date, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    for (const asset of post.assets || []) assert.ok(fs.statSync(path.join(sourceDirectory, asset.source)).isFile());
  }
  assert.equal(manifest.posts.find(post => post.slug === 'About-Me').path, '/2021/about/');
});

test('older public Gitalk threads with actual comments remain attached to their existing articles', () => {
  const threads = [
    { slug: '一段迷茫的日子', path: '/2024/clveyzdag0000lhx5gc313y2f/', id: '3d03329aa22c35888bb2e865f0b1b5be' },
    { slug: '一些幻想和现实', path: '/2023/clmefrg1g000ubpx5evu2907c/', id: 'c404d6e55708c1704b2f54f14a1e96ee' }
  ];
  for (const thread of threads) {
    const legacy = manifest.posts.find(post => post.slug === thread.slug);
    assert.ok(legacy.aliases.includes(thread.path));
    const post = preservation.applyPostMetadata({ source: legacy.source, slug: legacy.slug }, legacy, config);
    assert.ok(post.legacy_comments.some(comment => comment.path === thread.path && comment.id === thread.id));
  }
  assert.ok(!manifest.posts.some(post => post.title === '毕设日记本'));
});

test('legacy canonical URLs ignore newly assigned database IDs and preserve both comment threads', () => {
  const legacy = manifest.posts.find(post => post.slug === 'Lecture-Note-on-Free-Fermion-System');
  const post = { source: legacy.source, slug: legacy.slug, _id: 'a-new-database-id' };
  const mock = createHexoMock([post]);
  preservation.register(mock);
  const filter = mock.filters.get('post_permalink');
  assert.ok(filter.priority < 10);
  const filtered = filter.callback(post);
  assert.equal(builtinPermalink.call(mock, filtered), legacy.path);
  assert.deepEqual(post.legacy_aliases, legacy.aliases);
  assert.equal(post.legacy_comments.length, 2);
  for (const thread of post.legacy_comments) assert.equal(thread.id, crypto.createHash('md5').update(thread.path).digest('hex'));
  assert.equal(post.comment_path, legacy.path);
  assert.equal(post.comment_id, post.legacy_comments[0].id);
});

test('new articles get stable filename-based URLs and explicit permalinks remain supported', () => {
  const first = preservation.applyPostMetadata({ source: '_posts/new-note.md', slug: 'new-note', _id: 'first-id' }, null, config);
  const second = preservation.applyPostMetadata({ source: '_posts/new-note.md', slug: 'new-note', _id: 'different-id' }, null, config);
  assert.equal(first.__permalink, '/posts/new-note/');
  assert.equal(first.__permalink, second.__permalink);
  assert.equal(first.comment_id, second.comment_id);
  assert.deepEqual(first.legacy_comments, []);
  const custom = preservation.applyPostMetadata({ source: '_posts/custom.md', slug: 'custom', __permalink: 'notes/custom/' }, null, config);
  assert.equal(custom.__permalink, '/notes/custom/');
  assert.equal(preservation.browserPath('/posts/中文 笔记/', { root: '/blog/' }), '/blog/posts/%E4%B8%AD%E6%96%87%20%E7%AC%94%E8%AE%B0/');
});

test('relative article diagrams resolve to the canonical article directory without changing Markdown', () => {
  const legacy = manifest.posts.find(post => post.assets?.length);
  const original = fs.readFileSync(path.join(sourceDirectory, legacy.source));
  const rendered = {
    source: legacy.source,
    slug: legacy.slug,
    content: '<p><img src="1.png"><img src="https://example.com/image.png"><img src="/images/logo.jpg"></p>',
    excerpt: '<img src="2.png">',
    more: '<img src="3.png#diagram">'
  };
  preservation.applyPostMetadata(rendered, legacy, config);
  preservation.rewritePostImages(rendered, sourceDirectory, config);
  assert.ok(rendered.content.includes(`src="${legacy.path}1.png"`));
  assert.ok(rendered.content.includes('src="https://example.com/image.png"'));
  assert.ok(rendered.content.includes('src="/images/logo.jpg"'));
  assert.equal(rendered.excerpt, `<img src="${legacy.path}2.png">`);
  assert.equal(rendered.more, `<img src="${legacy.path}3.png#diagram">`);
  assert.deepEqual(fs.readFileSync(path.join(sourceDirectory, legacy.source)), original);
});

test('the generator emits 71 alias redirects and all six diagrams with original bytes', async () => {
  const posts = manifest.posts.map(legacy => ({ source: legacy.source, slug: legacy.slug }));
  const mock = createHexoMock(posts);
  preservation.register(mock);
  mock.filters.get('before_generate').callback();
  const routes = mock.generators.get('preserved-post-content')({ posts: { toArray: () => posts } });
  const redirects = routes.filter(route => typeof route.data === 'string');
  const diagrams = routes.filter(route => typeof route.data === 'function');
  assert.equal(redirects.length, 71);
  assert.equal(diagrams.length, 6);
  for (const legacy of manifest.posts) {
    for (const alias of legacy.aliases) {
      const route = redirects.find(route => route.path === alias.slice(1));
      assert.ok(route);
      assert.ok(route.data.includes(`rel="canonical" href="${manifest.siteUrl.replace(/\/$/, '')}${legacy.path}"`));
      assert.ok(route.data.includes('location.search+location.hash'));
      new vm.Script(route.data.match(/<script>([\s\S]*?)<\/script>/)[1]);
    }
    for (const asset of legacy.assets || []) {
      const route = diagrams.find(route => route.path === preservation.assetRoute(legacy.path, asset.file));
      assert.ok(route);
      const chunks = [];
      for await (const chunk of route.data()) chunks.push(chunk);
      assert.deepEqual(Buffer.concat(chunks), fs.readFileSync(path.join(sourceDirectory, asset.source)));
    }
  }
});

test('new Markdown articles can use nested sibling asset folders', t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-preservation-test-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const folder = path.join(temporary, '_posts/new-note/figures');
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'plot.png'), Buffer.from('test-diagram'));
  fs.writeFileSync(path.join(folder, '.DS_Store'), 'ignored');
  const post = { source: '_posts/new-note.md', slug: 'new-note' };
  const assets = preservation.listPostAssets(post, temporary);
  assert.deepEqual(assets.map(asset => asset.file), ['figures/plot.png']);
  preservation.applyPostMetadata(post, null, config);
  post.content = '<img src="figures/plot.png">';
  preservation.rewritePostImages(post, temporary, config);
  assert.equal(post.content, '<img src="/posts/new-note/figures/plot.png">');
});
