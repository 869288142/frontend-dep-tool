import { parseCssAST } from '../src/parseCssAST'

describe('parse css AST', () => {
  it('parse css', () => {
    expect(() => {
      parseCssAST('.a {}')
    }).not.toThrowError()
  })

  it('parse scss', () => {
    expect(() => {
      parseCssAST('.a { & .c {} }')
    }).not.toThrowError()
  })

  it('parse scss comment', () => {
    expect(() => {
      parseCssAST('.a { & .c { // } }')
    }).not.toThrowError()
  })
})
