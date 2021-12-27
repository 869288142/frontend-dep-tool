import traverse from '@babel/traverse'
import { Callback, moduleResolver, traverseModule } from './traverseModule'
import { parseJsAST } from './parseJsAST'
import { ResolverOptions } from './ResolverOptions'
export function traverseJsModuleSource(
  moduleFileContent: string,
  curModulePath: string,
  callback: Callback,
  resolverOptions: ResolverOptions
) {
  const ast = parseJsAST(moduleFileContent)
  // curModulePath = path.dirname(curModulePath)
  traverse(ast, {
    // import x from y   import y
    ImportDeclaration(path) {
      // @ts-ignore
      const subModulePath = moduleResolver(curModulePath, path.get('source.value').node, resolverOptions)
      if (!subModulePath) {
        return
      }
      callback && callback(subModulePath)
      traverseModule(subModulePath, callback, resolverOptions)
    },
    CallExpression(path) {
      if (path.get('callee').toString() === 'import') {
        const subModulePath = moduleResolver(
          curModulePath,
          path.get('arguments.0').toString().replace(/['"]/g, ''),
          resolverOptions
        )
        if (!subModulePath) {
          return
        }
        callback && callback(subModulePath)
        traverseModule(subModulePath, callback, resolverOptions)
      }
    },
    ExportDeclaration(path) {
      // FIXME: 需要判断是否为 export from 形式，临时用try-catch处理保护
      try {
        // @ts-ignore
        const subModulePath = moduleResolver(curModulePath, path.get('source.value').node, resolverOptions)
        if (!subModulePath) {
          return
        }
        callback && callback(subModulePath)
        traverseModule(subModulePath, callback, resolverOptions)
      } catch {}
    },
  })
}
