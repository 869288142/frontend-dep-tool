import { traverseJsModule } from '../src/traverseJsModule'
import path from 'path'
describe('parse npm module', () => {
  it('parse eslint', () => {
    traverseJsModule(path.resolve(__dirname, './demo/index.ts'), (str: string) => {
      console.log(str)
    })
  })
})
