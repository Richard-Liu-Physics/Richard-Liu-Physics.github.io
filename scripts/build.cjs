'use strict';

const { build } = require('./runtime.cjs');

module.exports = { build };
if (require.main === module) {
  build().catch(error => {
    console.error(`构建失败：${error.message}`);
    process.exitCode = 1;
  });
}
