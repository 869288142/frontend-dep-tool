import { Callback, moduleResolver, traverseModule } from './traverseModule'
import { parseCssAST } from './parseCssAST'

export function traverseCssModuleSource(moduleFileConent: string, curModulePath: string, callback: Callback) {
  const ast = parseCssAST(moduleFileConent)
  ast.walkAtRules('import', (rule) => {
    const subModulePath = moduleResolver(curModulePath, rule.params.replace(/['"]/g, ''))
    if (!subModulePath) {
      return
    }
    callback && callback(subModulePath)
    traverseModule(subModulePath, callback)
  })
  ast.walkDecls((decl) => {
    if (decl.value.includes('url(')) {
      const url = /.*url\((.+)\).*/.exec(decl.value)?.[1]?.replace(/['"]/g, '') ?? ''
      const subModulePath = moduleResolver(curModulePath, url)
      if (!subModulePath) {
        return
      }
      callback && callback(subModulePath)
    }
  })
}
