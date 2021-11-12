const chalk = require('chalk')
const findUnusedModule = require('../src/index')
const path = require('path')

const { all, used, unused } = findUnusedModule({
  cwd: process.cwd(),
  entries: ['./src/system/sysCol/productDetail/v3/module/productDetailV3.vue'],
  // entries: ['./src/entry-manage', './src/entry-client'],
  includes: ['./src/system/sysCol/productDetail/v3/module/productDetailV3.vue'],
  // entries: ['./demo-project/suzhe2.js'],
  // includes: ['./src/modules/wxAddFans/**/*'],
  resolveRequirePath(curDir, requirePath) {
    if (requirePath.includes('@/')) {
      return path.resolve(process.cwd(), requirePath.replace('@', './src'))
    } else if (!requirePath.includes('.') || requirePath.includes('@fk') || requirePath.includes('@jz')) {
      return ''
    }
    return requirePath
  },
})
console.log(JSON.stringify(unused))
