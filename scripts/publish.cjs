'use strict';

const { spawnSync } = require('node:child_process');
const { ROOT, build } = require('./runtime.cjs');

function git(args, { root = ROOT, capture = false, allowed = [0] } = {}) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.error) throw new Error(`无法运行 Git：${result.error.message}`);
  if (!allowed.includes(result.status)) {
    const guidance = args[0] === 'push'
      ? '推送失败。请检查网络和 GitHub 登录；本地提交已经保存，可运行 git push 重试。'
      : args[0] === 'commit'
        ? '提交失败。请检查 Git 的 user.name 和 user.email，修改仍保存在本地。'
        : `Git ${args[0]} 失败，请先解决仓库状态。`;
    throw new Error(guidance);
  }
  return result;
}

async function publish(args = process.argv.slice(2), { root = ROOT, buildSite = build } = {}) {
  const branchResult = git(['symbolic-ref', '--quiet', '--short', 'HEAD'], { root, capture: true, allowed: [0, 1] });
  const branch = branchResult.stdout.trim();
  if (!branch || branchResult.status !== 0) throw new Error('当前处于 detached HEAD。请先切换到 codex/blog-source 分支再发布。');
  const origin = git(['remote', 'get-url', 'origin'], { root, capture: true, allowed: [0, 2, 128] });
  if (origin.status !== 0) throw new Error('尚未设置 GitHub origin，请先完成 README 中的一次性接入配置。');

  await buildSite({ root });
  git(['add', '-A'], { root });
  const changes = git(['diff', '--cached', '--quiet'], { root, capture: true, allowed: [0, 1] });
  if (changes.status === 1) git(['commit', '-m', args.join(' ').trim() || 'Update blog'], { root });
  else console.log('没有新的文件改动，正在推送已有提交。');
  git(['push', '--set-upstream', 'origin', branch], { root });
  console.log('源码已推送。GitHub Actions 将自动发布网站，可在仓库 Actions 查看进度。');
}

module.exports = { publish, git };
if (require.main === module) {
  publish().catch(error => {
    console.error(`发布未完成：${error.message}`);
    process.exitCode = 1;
  });
}
