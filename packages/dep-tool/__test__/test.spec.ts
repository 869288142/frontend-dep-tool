import chalk from 'chalk'
import path from 'path'
import findUnusedModule from '../src/index'

const { all, used, unused } = findUnusedModule({
  cwd: process.cwd(),
  // entries: ['./demo-project/suzhe2.js'],
  // includes: ['./src/modules/wxAddFans/**/*'],
  resolveRequirePath(curDir: string, requirePath: string) {
    if (requirePath.includes('@/')) {
      return path.resolve(process.cwd(), requirePath.replace('@', './src'))
    } else if (!requirePath.includes('.') || requirePath.includes('@fk') || requirePath.includes('@jz')) {
      return ''
    }
    return requirePath
  },
})
console.log(JSON.stringify(unused))
