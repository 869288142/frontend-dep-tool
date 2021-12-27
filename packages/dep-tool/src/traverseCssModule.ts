import fs from 'fs'
import { Callback } from './traverseModule'
import { traverseCssModuleSource } from './traverseCssModuleSource'
import { ResolverOptions } from './ResolverOptions'
export function traverseCssModule(curModulePath: string, callback: Callback, resolverOptions: ResolverOptions) {
  const moduleFileConent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  traverseCssModuleSource(moduleFileConent, curModulePath, callback, resolverOptions)
}
