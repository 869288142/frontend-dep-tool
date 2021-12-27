import { traverseJsModule } from '../src/traverseJsModule'
import path from 'path'
describe('parse import', () => {
  it('parse import x from y', (done) => {
    traverseJsModule(
      path.resolve(__dirname, './demo/normalImport.ts'),
      (str: string) => {
        expect(str).toMatch('d.ts')
        done()
      },
      {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }
    )
  })

  it('parse sideEffect import', (done) => {
    traverseJsModule(
      path.resolve(__dirname, './demo/sideEffectImport.ts'),
      (str: string) => {
        expect(str).toMatch('d.ts')
        done()
      },
      {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }
    )
  })
  it('parse export import', (done) => {
    traverseJsModule(
      path.resolve(__dirname, './demo/exportImport.ts'),
      (str: string) => {
        expect(str).toMatch('d.ts')
        done()
      },
      {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }
    )
  })
  it('parse dynamic import', (done) => {
    traverseJsModule(
      path.resolve(__dirname, './demo/dynamicImport.ts'),
      (str: string) => {
        expect(str).toMatch('d.ts')
        done()
      },
      {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }
    )
  })
})
