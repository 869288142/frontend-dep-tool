import moduleResolver from '../src/moduleResolver'

describe('parse template', () => {
  it('parse template', () => {
    console.log(moduleResolver(__dirname, './test.spec.ts'))
  })
})
