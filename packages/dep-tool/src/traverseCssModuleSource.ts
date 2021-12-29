import { Callback, moduleResolver, traverseModule } from './traverseModule'
import { parseCssAST } from './parseCssAST'
import { ResolverOptions } from './ResolverOptions'

export function traverseCssModuleSource(
  moduleFileConent: string,
  curModulePath: string,
  callback: Callback,
  resolverOptions: ResolverOptions
) {
  const ast = parseCssAST(moduleFileConent)
  ast.walkAtRules('import', (rule) => {
    const subModulePath = moduleResolver(curModulePath, rule.params.replace(/['"]/g, ''), resolverOptions)
    if (!subModulePath) {
      return
    }
    callback && callback(subModulePath)
    traverseModule(subModulePath, callback, resolverOptions)
  })
  // TODO open css url 
  // ast.walkDecls((decl) => {
  //   if (decl.value.includes('url(')) {
  //     const url = /.*url\((.+)\).*/.exec(decl.value)?.[1]?.replace(/['"]/g, '') ?? ''
  //     const subModulePath = moduleResolver(curModulePath, url, resolverOptions)
  //     if (!subModulePath) {
  //       return
  //     }
  //     callback && callback(subModulePath)
  //   }
  // })
}
