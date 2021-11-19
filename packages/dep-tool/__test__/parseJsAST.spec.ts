import { parseJsAST } from '../src/parseJsAST'

describe('parse js AST', () => {
  it('parse ts', () => {
    expect(() => {
      parseJsAST('let a: number = 1')
    }).not.toThrowError()
  })

  it('parse js', () => {
    expect(() => {
      parseJsAST('let a = 1')
    }).not.toThrowError()
  })

  it('parse jsx', () => {
    expect(() => {
      parseJsAST('<div></div>')
    }).not.toThrowError()
  })
})
