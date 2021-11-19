import fs from 'fs'
import { traverseJsModuleSource } from './traverseJsModuleSource'
import { Callback } from './traverseModule'

export function traverseJsModule(curModulePath: string, callback: Callback) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  traverseJsModuleSource(moduleFileContent, curModulePath, callback)
}
