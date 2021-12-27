import vueSFCParser from '@cprize/vue-sfc-parser'
import fs from 'fs'
import { ResolverOptions } from './ResolverOptions'
import { traverseCssModuleSource } from './traverseCssModuleSource'
import { traverseJsModuleSource } from './traverseJsModuleSource'
import { Callback } from './traverseModule'

export function traverseVueModule(curModulePath: string, callback: Callback, resolverOptions: ResolverOptions) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const descriptor = vueSFCParser.parse(moduleFileContent)

  const jsContent = descriptor.script.map((item) => item.content).join('')
  traverseJsModuleSource(jsContent, curModulePath, callback, resolverOptions)
  const cssContent = descriptor.style.map((item) => item.content).join('')
  traverseCssModuleSource(cssContent, curModulePath, callback, resolverOptions)
}
