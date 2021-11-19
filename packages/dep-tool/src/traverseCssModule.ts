import fs from 'fs'
import { Callback } from './traverseModule'
import { traverseCssModuleSource } from './traverseCssModuleSource'

export function traverseCssModule(curModulePath: string, callback: Callback) {
  const moduleFileConent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  traverseCssModuleSource(moduleFileConent, curModulePath, callback)
}
