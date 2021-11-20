import { parseCssAST } from '../src/parseCssAST'
import { removeInlineComment } from '../src/removeInlineComment'

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

  it('parse scss with inline comment', () => {
    expect(() => {
      parseCssAST(`.a { & .c {
        //
      } }`)
    }).not.toThrowError()
  })
})

describe('deal with inline comment', () => {
  it('remove scss inline comment', () => {
    expect(removeInlineComment('// a\n').trim()).toEqual('')
  })
})
