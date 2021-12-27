import findUnusedModule from '../src/index'
describe('parse npm module', () => {
  it('parse eslint', () => {
    const { unused } = findUnusedModule({
      cwd: __dirname,
      entries: ['./unsedTest/index.js'],
      includes: ['./unsedTest/**/*'],
      resolverOptions: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    })
    expect(unused.length).toEqual(1)
    expect(unused[0]).toMatch('unsed.js')
  })
})
