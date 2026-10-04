'use strict';

const fs = require('node:fs');
const path = require('node:path');

const usage = '用法：npm run post -- "文章标题" [--slug english-slug] [--date "2026-10-04 12:30:00"]';

function fail(message) {
  throw new Error(`${message}\n${usage}`);
}

function singaporeDate() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Singapore',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

function normalizeDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(value);
  if (!match) fail('日期请填写 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss。');
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const normalized = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  // Treat the components as UTC only to check for calendar rollover. The saved
  // value is local Singapore time, interpreted by Hexo's timezone setting.
  const calendarValue = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  const timestamp = new Date(`${calendarValue}Z`);
  if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString().slice(0, 19) !== calendarValue) {
    fail('日期或时间无效，请检查月份、天数和时间。');
  }
  return normalized;
}

function main(args = process.argv.slice(2)) {
if (args.includes('--help') || args.includes('-h')) {
  console.log(usage);
  return;
}

const titles = [];
const options = {};
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--slug' || arg === '--date') {
    if (options[arg] !== undefined) fail(`${arg} 只能填写一次。`);
    const value = args[++index];
    if (!value || value.startsWith('--')) fail(`${arg} 后缺少内容。`);
    options[arg] = value;
  } else if (arg.startsWith('-')) {
    fail(`未知选项：${arg}`);
  } else {
    titles.push(arg);
  }
}

const title = titles.join(' ').trim();
if (!title) fail('请先填写文章标题。');
const slug = options['--slug'] || title.normalize('NFKC')
  .replace(/[^\p{L}\p{N}_-]+/gu, '-')
  .replace(/^-+|-+$/g, '');
if (!slug || !/^[\p{L}\p{N}_-][\p{L}\p{N}_.-]*$/u.test(slug) ||
    /[.]$/.test(slug) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(slug)) {
  fail('文章文件名无效，请用 --slug 指定由文字、数字或短横线组成的文件名。');
}
const date = options['--date'] ? normalizeDate(options['--date']) : singaporeDate();
const postDirectory = path.resolve(__dirname, '..', 'source', '_posts');
const filename = path.join(postDirectory, `${slug}.md`);
const markdown = `---\ntitle: ${JSON.stringify(title)}\ndate: ${JSON.stringify(date)}\ntags: []\ncategories: []\n---\n\n在这里用 Markdown 写正文。\n`;

try {
  fs.mkdirSync(postDirectory, { recursive: true });
  fs.writeFileSync(filename, markdown, { encoding: 'utf8', flag: 'wx' });
} catch (error) {
  if (error.code === 'EEXIST') fail(`文章已存在：${filename}。请换一个标题或 --slug。`);
  fail(`创建文章失败：${error.message}`);
}

console.log(`已创建：${filename}`);
console.log('打开这个 .md 文件写正文；保存后运行 npm run preview 预览。');
return filename;
}

module.exports = { main, normalizeDate, singaporeDate };
if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
