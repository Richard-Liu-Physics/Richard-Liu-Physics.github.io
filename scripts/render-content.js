'use strict';

const MarkdownIt = require('markdown-it');
const math = require('@abreto/markdown-it-katex');
const katex = require('katex');
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function renderMarkdown(data) {
  const parser = new MarkdownIt({ html: true, breaks: true, linkify: true, typographer: false });
  parser.use(math);
  // Normalize the rendering input, never the original Markdown source.
  const renderMath = (tokens, index, displayMode) => {
    const latex = tokens[index].content.replace(/\\(begin|end)\{align\*?\}/g, '\\$1{aligned}');
    try {
      const html = katex.renderToString(latex, { displayMode, throwOnError: true, strict: false });
      return displayMode ? `<div class="blog-math-block">${html}</div>\n` : html;
    } catch (error) {
      throw new Error(`Formula in ${data.path || 'Markdown'}: ${error.message}`);
    }
  };
  parser.renderer.rules.math_inline = (tokens, index) => renderMath(tokens, index, false);
  parser.renderer.rules.math_block = (tokens, index) => renderMath(tokens, index, true);
  parser.use(require('hexo-renderer-markdown-it-katex/lib/anchors'), { level: 2, collisionSuffix: '' });
  return parser.render(data.text);
}

function register(instance) {
  for (const extension of ['md', 'markdown', 'mkd', 'mkdn', 'mdwn', 'mdtxt', 'mdtext']) {
    instance.extend.renderer.register(extension, 'html', renderMarkdown, true);
  }
  instance.extend.filter.unregister('after_render:html', require('hexo-renderer-markdown-it-katex/lib/katex').filter);
  // The original search plugin concatenates root + post.path. Fixed legacy
  // paths begin with '/', so normalize the search links to same-site paths.
  const searchGenerator = require('hexo-generator-searchdb/lib/xml_generator');
  instance.extend.generator.register('xml', function(locals) {
    const result = searchGenerator.call(this, locals);
    result.data = result.data.replace(/<url>\/{2,}/g, '<url>/');
    return result;
  });
  instance.extend.tag.register('pdf', args => {
    const url = args[0];
    if (!url || !/^(?:\/(?!\/)|https?:\/\/)/i.test(url)) throw new Error('PDF link must be an absolute site path or HTTPS URL');
    const href = escapeHTML(url);
    return `<figure class="blog-pdf"><object data="${href}" type="application/pdf" width="100%" height="640"><p><a href="${href}">打开 PDF</a></p></object><figcaption><a href="${href}" target="_blank" rel="noopener">打开 PDF ↗</a> · <a href="${href}" download>下载 PDF</a></figcaption></figure>`;
  });
  const MetingTag = require('hexo-tag-aplayer/lib/tag/playerMeting').default;
  instance.extend.tag.register('meting', function(args) {
    const output = new MetingTag(instance, args, this._id).generate();
    const [id, server, type] = args;
    const href = server === 'netease' && /^\d+$/.test(id)
      ? `https://music.163.com/#/${type === 'playlist' ? 'playlist' : 'song'}?id=${id}` : '';
    return output + (href ? `<p class="blog-music-link"><a href="${escapeHTML(href)}" target="_blank" rel="noopener">在网易云音乐中听这首歌 ↗</a></p>` : '');
  });
}

module.exports = { renderMarkdown, register };
if (typeof hexo !== 'undefined') register(hexo);
