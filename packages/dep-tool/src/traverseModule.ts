/* eslint-disable @typescript-eslint/ban-ts-comment */
import { extname } from 'path'
import { getModuleResolver } from '../src/moduleResolver'
import { traverseJsModule } from './traverseJsModule'
import { traverseCssModule } from './traverseCssModule'
import { traverseVueModule } from './traverseVueModule'
import { ResolverOptions } from './ResolverOptions'
import path from 'path'
const JS_EXTS = ['.js', '.jsx', '.ts', '.tsx']
const CSS_EXTS = ['.css', '.less', '.scss']
const JSON_EXTS = ['.json']

export type Callback = (path: string) => void

const MODULE_TYPES = {
  JS: 1 << 0,
  CSS: 1 << 1,
  JSON: 1 << 2,
  VUE: 1 << 3,
}

const visitedModules = new Set()

export function moduleResolver(curModulePath: string, requirePath: string, resolverOptions: ResolverOptions) {
  // FIXME if parse fail return false?
  requirePath = getModuleResolver(resolverOptions)(path.dirname(curModulePath), requirePath).toString()

  // 过滤掉第三方模块
  if (requirePath.includes('node_modules')) {
    return ''
  }

  if (visitedModules.has(requirePath)) {
    return ''
  } else {
    visitedModules.add(requirePath)
  }
  return requirePath
}

function getModuleType(modulePath: string) {
  const moduleExt = extname(modulePath)

  if (JS_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.JS
  } else if (CSS_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.CSS
  } else if (JSON_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.JSON
  } else if (moduleExt === '.vue') {
    return MODULE_TYPES.VUE
  } else {
    return -1
  }
}

function traverseModule(curModulePath: string, callback: Callback, resolverOptions: ResolverOptions) {
  const moduleType = getModuleType(curModulePath)

  if (moduleType & MODULE_TYPES.JS) {
    traverseJsModule(curModulePath, callback, resolverOptions)
  } else if (moduleType & MODULE_TYPES.CSS) {
    traverseCssModule(curModulePath, callback, resolverOptions)
  } else if (moduleType & MODULE_TYPES.VUE) {
    traverseVueModule(curModulePath, callback, resolverOptions)
  }
}

export { traverseModule }
