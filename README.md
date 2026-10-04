# The Waste Lands

保留 Hexo 和 Markdown 的个人博客，使用本地 `WasteLands` 主题。原有文章在 `source/_posts/`，配图、PDF 和独立页面继续留在 `source/`。

35 篇原文章保留原文和附件；迁移清单 `source/_data/legacy-posts.json` 固定原链接，并为其他旧地址提供跳转，共继承 106 个文章地址。旧 `public/`、`db.json` 和 `.deploy_git/` 留在本地，构建使用独立临时数据库，网站生成到 `dist/`。

## 修改首页

打开 `_config.yml`，修改 `home:` 下的首页文字和配图配置；站点标题修改顶层 `title:`。保持 YAML 的缩进，文字包含冒号时用引号包起来。

例如，`|` 表示保留换行，下面的文字都缩进四个空格：

```yaml
home:
  eyebrow: PHYSICS, POETRY & LIFE
  title: |
    The Waste
    Lands
  description: |
    物理也好，诗歌也好，
    都是一生的浪漫。
  quote: |
    这里可以写一句你喜欢的话。
    也可以保留多行。
  cover: /images/1.JPG
  logo: /images/Logo.jpg
```

这只是配置格式示例，按你的想法修改文字即可。替换配图时，将图片放在 `source/images/`，再修改 `cover:` 的路径。

## 写文章

使用 Node.js 22，在博客文件夹第一次运行：

```sh
npm ci
```

新建文章：

```sh
npm run post -- "新的文章标题"
```

命令会创建 `source/_posts/新的文章标题.md`，日期默认使用新加坡时间，不会覆盖已有文章。打开它，用 Markdown 写正文。文件开头可以填写标签和分类：

```md
---
title: "新的文章标题"
date: "2026-10-04 12:30:00"
tags: [生活, 随笔]
categories: [随笔]
---

这里是正文。

## 小标题

![图片说明](/images/my-photo.jpg)
```

上面的图片放在 `source/images/my-photo.jpg`。PDF 同样可放在 `source/pdf/`，用 `[阅读 PDF](/pdf/my-note.pdf)` 链接。

需要指定英文文件名或补写日期时：

```sh
npm run post -- "新的文章标题" --slug my-new-post --date "2026-10-04 12:30:00"
```

也可以直接在 `source/_posts/` 新建 `.md`，使用同样的文章头部格式。

## 本地预览

```sh
npm run preview
```

在浏览器打开 `http://localhost:4000/`。修改首页、文章或主题并保存后，会自动重新生成并刷新浏览器；按 `Ctrl+C` 停止。配置或文章有错误时，终端会显示原因，修正并保存后会再次构建。

只生成网站：

```sh
npm run build
```

网站输出在 `dist/`。提交源文件即可，生成的网站和 `node_modules/` 不需要提交。

## 发布到 GitHub

源代码分支是 `codex/blog-source`，旧 `master` 分支保留原网站历史。第一次接入时，需要 GitHub 登录、配置 `origin` 和分支跟踪，并在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。Pages 的 `github-pages` 环境如果限制部署分支，请允许 `codex/blog-source`。

这台电脑的 `origin`、分支跟踪和 GitHub Pages 已配置完成，可以直接使用下面的发布命令。在新电脑上下载源码时使用：

```sh
git clone -b codex/blog-source git@github.com:Richard-Liu-Physics/Richard-Liu-Physics.github.io.git blog
cd blog
npm ci
```

写好文章或修改首页后：

```sh
npm run publish -- "写了一篇新文章"
```

命令会构建网站、提交本地修改，并 `git push` 源码。GitHub Actions 收到推送后自动构建、发布到 [richard-liu-physics.github.io](https://richard-liu-physics.github.io/)。可以在仓库 Actions 查看发布进度。

你也可以使用 Git 命令发布：

```sh
git add .
git commit -m "写了一篇新文章"
git push
```

不需要手动上传 `dist/`，也不需要旧的 `hexo deploy`。仅保存在本地的文章不会上传，`publish` 或 `git push` 才会推送已提交的内容。

部署工作流使用 [GitHub Pages 官方 Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
