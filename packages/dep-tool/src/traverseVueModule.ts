import vueSFCParser from '@cprize/vue-sfc-parser'
import fs from 'fs'
import { traverseCssModuleSource } from './traverseCssModuleSource'
import { traverseJsModuleSource } from './traverseJsModuleSource'
import { Callback } from './traverseModule'

export function traverseVueModule(curModulePath: string, callback: Callback) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const descriptor = vueSFCParser.parse(moduleFileContent)

  const jsContent = descriptor.script.map((item) => item.content).join('')
  traverseJsModuleSource(jsContent, curModulePath, callback)
  const cssContent = descriptor.style.map((item) => item.content).join('')
  traverseCssModuleSource(cssContent, curModulePath, callback)
}
