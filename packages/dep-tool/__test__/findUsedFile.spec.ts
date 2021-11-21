import findUnusedModule from '../src/index'
describe('parse npm module', () => {
  it('parse eslint', () => {
    const { all, used, unused } = findUnusedModule({
      cwd: __dirname,
      entries: ['./demo/index.js'],
      includes: ['./demo/**/*'],
    })
    console.log(JSON.stringify(unused))
    console.log(JSON.stringify(all))
    console.log(JSON.stringify(used))
  })
})
