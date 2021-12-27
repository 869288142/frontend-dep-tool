import fs from 'fs'
import { traverseJsModuleSource } from './traverseJsModuleSource'
import { Callback } from './traverseModule'
import { ResolverOptions } from './ResolverOptions'
export function traverseJsModule(curModulePath: string, callback: Callback, resolverOptions: ResolverOptions) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  traverseJsModuleSource(moduleFileContent, curModulePath, callback, resolverOptions)
}
