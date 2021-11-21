import path from 'path'
import { traverseCssModule } from '../src/traverseCssModule'
describe('parse import', () => {
  it('parse import', (done) => {
    traverseCssModule(path.resolve(__dirname, './demo/scssImport.scss'), (str: string) => {
      expect(str).toMatch('d.scss')
      done()
    })
  })
})
