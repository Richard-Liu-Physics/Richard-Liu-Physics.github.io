(() => {
  'use strict';

  const root = document.getElementById('waste-lands-blog');
  if (!root) return;
  root.classList.add('blog-has-js');

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const externalLink = (text, href, className) => {
    const link = element('a', className, text);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  };

  async function request(url, type = 'json') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'omit',
        headers: type === 'json' ? { Accept: 'application/vnd.github.text+json' } : {},
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return type === 'text' ? await response.text() : await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  // Navigation remains ordinary page links. Only the mobile disclosure needs JS.
  const menu = root.querySelector('.blog-menu-toggle');
  const navigation = root.querySelector('#blog-main-nav');
  if (menu && navigation) {
    const setMenu = open => {
      navigation.dataset.menuOpen = String(open);
      menu.setAttribute('aria-expanded', String(open));
      menu.querySelector('span').textContent = open ? '−' : '＋';
    };
    setMenu(false);
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menu.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.blog-header')) setMenu(false);
    });
  }

  // Load the site's generated XML index on the first archive search.
  const search = root.querySelector('[data-blog-search]');
  if (search) {
    const form = search.querySelector('form');
    const input = search.querySelector('input');
    const clear = search.querySelector('.blog-search-clear');
    const status = search.querySelector('.blog-search-status');
    const results = search.querySelector('.blog-search-results');
    const archive = root.querySelector('[data-blog-archive-default]');
    let indexPromise;
    let revision = 0;
    let debounce;

    const loadIndex = () => {
      if (!indexPromise) {
        indexPromise = request(search.dataset.blogSearchUrl, 'text').then(xml => {
          const documentXML = new DOMParser().parseFromString(xml, 'application/xml');
          if (documentXML.querySelector('parsererror')) throw new Error('Invalid search index');
          return [...documentXML.querySelectorAll('entry')].map(entry => {
            const contentDocument = new DOMParser().parseFromString(entry.querySelector('content')?.textContent || '', 'text/html');
            contentDocument.querySelectorAll('script,style,.katex-mathml').forEach(node => node.remove());
            const title = entry.querySelector('title')?.textContent || '';
            const content = (contentDocument.body.textContent || '').replace(/\s+/g, ' ').trim();
            const categories = [...entry.querySelectorAll('category')].map(node => node.textContent);
            const tags = [...entry.querySelectorAll('tag')].map(node => node.textContent);
            // The generator can prepend '/' to an already absolute post path.
            const sourceURL = (entry.querySelector('url')?.textContent || '').replace(/^\/{2,}/, '/');
            let url;
            try {
              url = new URL(sourceURL, window.location.origin);
              if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol)) return null;
            } catch { return null; }
            return { title, content, categories, tags, href: url.pathname + url.search + url.hash, searchable: [title, content, ...categories, ...tags].join(' ').toLocaleLowerCase() };
          }).filter(Boolean);
        }).catch(error => {
          indexPromise = undefined;
          throw error;
        });
      }
      return indexPromise;
    };

    async function runSearch() {
      const currentRevision = ++revision;
      const query = input.value.trim();
      clear.hidden = !query;
      results.replaceChildren();
      results.hidden = !query;
      status.hidden = !query;
      if (archive) archive.hidden = Boolean(query);
      if (!query) return;
      status.textContent = '正在找这篇文字…';
      try {
        const entries = await loadIndex();
        if (revision !== currentRevision) return;
        const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
        const matches = entries.filter(entry => terms.every(term => entry.searchable.includes(term))).sort((left, right) => {
          const score = entry => terms.filter(term => entry.title.toLocaleLowerCase().includes(term)).length;
          return score(right) - score(left);
        });
        status.textContent = matches.length ? `找到 ${matches.length} 篇文字` : '没有找到，换一个词试试。';
        const fragment = document.createDocumentFragment();
        for (const entry of matches) {
          const link = element('a', 'blog-search-result');
          link.href = entry.href;
          link.append(element('span', 'blog-search-result-title', entry.title));
          const metadata = [...entry.categories, ...entry.tags.map(tag => `# ${tag}`)].join(' · ');
          if (metadata) link.append(element('span', 'blog-search-result-meta', metadata));
          const position = entry.content.toLocaleLowerCase().indexOf(terms[0]);
          const start = Math.max(0, position - 32);
          const excerpt = `${start ? '…' : ''}${entry.content.slice(start, start + 130)}${entry.content.length > start + 130 ? '…' : ''}`;
          if (excerpt) link.append(element('span', 'blog-search-result-summary', excerpt));
          fragment.append(link);
        }
        results.append(fragment);
      } catch {
        if (revision !== currentRevision) return;
        status.textContent = '搜索暂时无法加载，可以继续按年份、分类或标签浏览。';
        if (archive) archive.hidden = false;
      }
    }
    form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(debounce); runSearch(); });
    input.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(runSearch, 180); });
    clear.addEventListener('click', () => { input.value = ''; clearTimeout(debounce); runSearch(); input.focus(); });
  }

  // Gitalk's old MD5 labels identify the preserved discussions. Read public
  // issues and comments directly; replies happen on GitHub without site secrets.
  const comments = root.querySelector('[data-blog-comments]');
  if (comments) {
    const owner = comments.dataset.blogCommentOwner;
    const repository = comments.dataset.blogCommentRepo;
    if (!/^[\w.-]+$/.test(owner || '') || !/^[\w.-]+$/.test(repository || '')) return;
    const repositoryURL = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
    const repositoryAPI = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
    let metadata = [];
    try {
      const parsed = JSON.parse(comments.dataset.blogComments);
      if (Array.isArray(parsed)) metadata = [...new Map(parsed.filter(item => item && /^[a-f\d]{32}$/i.test(item.id)).map(item => [item.id, item])).values()];
    } catch { /* A malformed mapping still leaves the repository link usable. */ }

    const discussionURL = identifier => `${repositoryURL}/issues?q=${encodeURIComponent(`is:issue label:${identifier}`)}`;
    const replyLink = externalLink('在 GitHub 留言 ↗', metadata.length ? discussionURL(metadata[0].id) : `${repositoryURL}/issues`, 'blog-comment-reply');
    comments.append(replyLink);
    const status = comments.querySelector('.blog-comment-status');
    const cachePrefix = 'waste-lands-public-comments:';
    async function cachedRequest(url) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(cachePrefix + url));
        if (saved && Date.now() - saved.savedAt < 5 * 60 * 1000) return saved.value;
      } catch { /* Storage can be unavailable in private browsing. */ }
      const value = await request(url);
      try { sessionStorage.setItem(cachePrefix + url, JSON.stringify({ savedAt: Date.now(), value })); } catch { /* Optional cache. */ }
      return value;
    }

    function renderComment(comment) {
      const card = element('article', 'blog-comment');
      const meta = element('div', 'blog-comment-meta');
      const login = comment.user?.login || 'GitHub 用户';
      meta.append(externalLink(login, `https://github.com/${encodeURIComponent(login)}`, 'blog-comment-author'));
      if (comment.created_at && !Number.isNaN(Date.parse(comment.created_at))) {
        const time = element('time', '', new Date(comment.created_at).toLocaleDateString('zh-CN'));
        time.dateTime = comment.created_at;
        meta.append(time);
      }
      meta.append(externalLink('原评论 ↗', `${repositoryURL}/issues/${comment.issueNumber}#issuecomment-${Number(comment.id)}`));
      card.append(meta, element('div', 'blog-comment-body', comment.body_text || comment.body || ''));
      return card;
    }

    async function renderThread(issue, paths) {
      const issueNumber = Number(issue.number);
      if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) return;
      const issueURL = `${repositoryURL}/issues/${issueNumber}`;
      const thread = element('section', 'blog-comment-thread');
      const heading = element('div', 'blog-comment-thread-header');
      const pathLabel = element('span', '', paths.length > 1 ? '旧文章讨论' : `文章讨论 · ${paths[0] || ''}`);
      heading.append(pathLabel, externalLink('在 GitHub 回复 ↗', issueURL, 'blog-comment-reply'));
      thread.append(heading);
      comments.insertBefore(thread, replyLink);
      let nextPage = 1;
      let loadMore;
      async function loadPage() {
        if (loadMore) { loadMore.disabled = true; loadMore.textContent = '正在加载…'; }
        try {
          const list = await cachedRequest(`${repositoryAPI}/issues/${issueNumber}/comments?per_page=100&page=${nextPage}`);
          if (!Array.isArray(list)) throw new Error('Invalid comments');
          const fragment = document.createDocumentFragment();
          list.forEach(comment => fragment.append(renderComment({ ...comment, issueNumber })));
          if (loadMore) thread.insertBefore(fragment, loadMore); else thread.append(fragment);
          nextPage++;
          if (list.length === 100) {
            if (!loadMore) {
              loadMore = element('button', 'blog-comment-load-more');
              loadMore.type = 'button';
              loadMore.addEventListener('click', loadPage);
              thread.append(loadMore);
            }
            loadMore.disabled = false;
            loadMore.textContent = '加载更多评论';
          } else if (loadMore) loadMore.remove();
          if (!list.length && nextPage === 2) thread.append(element('p', 'blog-comment-status', '这里还没有评论。'));
        } catch {
          thread.append(element('p', 'blog-comment-status', '评论暂时无法加载，可以在 GitHub 阅读。'));
          if (loadMore) { loadMore.disabled = false; loadMore.textContent = '重试加载'; }
        }
      }
      await loadPage();
    }

    let loaded = false;
    async function loadComments() {
      if (loaded) return;
      loaded = true;
      if (!metadata.length) { status.textContent = '评论保存在 GitHub。'; return; }
      status.textContent = '正在加载 GitHub 评论…';
      const issues = new Map();
      let incomplete = false;
      const mapping = new Map(metadata.map(item => [item.id, item.path]));
      // Cache repository pages across article visits. This retains discussions
      // on every old label with one request for the current 61-issue repository.
      // Larger repositories paginate, with a bounded first load and GitHub links.
      const maximumIssuePages = 5;
      for (let issuePage = 1; issuePage <= maximumIssuePages; issuePage++) {
        try {
          const list = await cachedRequest(`${repositoryAPI}/issues?state=all&per_page=100&page=${issuePage}&sort=created&direction=asc`);
          if (!Array.isArray(list)) throw new Error('Invalid issues');
          for (const issue of list) {
            if (issue.pull_request) continue;
            const paths = (issue.labels || []).map(label => mapping.get(typeof label === 'string' ? label : label.name)).filter(Boolean);
            if (paths.length) issues.set(issue.number, { issue, paths: [...new Set(paths)] });
          }
          if (list.length < 100) break;
          if (issuePage === maximumIssuePages) incomplete = true;
        } catch { incomplete = true; break; }
      }
      for (const { issue, paths } of issues.values()) await renderThread(issue, paths);
      if (incomplete) status.textContent = '部分旧讨论暂时无法加载，可通过 GitHub 链接阅读。';
      else if (!issues.size) status.textContent = '这里还没有讨论。';
      else status.textContent = '旧网址下的讨论已保留，点击 GitHub 链接继续回复。';
      if (issues.size) replyLink.href = `${repositoryURL}/issues/${[...issues.keys()][0]}`;
      else if (!incomplete) {
        const parameters = new URLSearchParams({
          title: comments.dataset.blogPageTitle || document.title,
          body: comments.dataset.blogPageUrl || window.location.href,
          labels: `Gitalk,${metadata[0].id}`,
        });
        replyLink.href = `${repositoryURL}/issues/new?${parameters}`;
      }
      if (metadata.length > 1) {
        const paths = element('details', 'blog-comment-paths');
        paths.append(element('summary', '', '查看旧网址下的讨论'));
        for (const item of metadata) paths.append(externalLink(item.path, discussionURL(item.id), 'blog-comment-reply'));
        comments.append(paths);
      }
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); loadComments(); }
      }, { rootMargin: '200px' });
      observer.observe(comments);
    } else loadComments();
  }
})();
