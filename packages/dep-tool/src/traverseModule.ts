/* eslint-disable @typescript-eslint/ban-ts-comment */
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import { resolve, dirname, join, extname } from 'path'
import chalk from 'chalk'
import postcss from 'postcss'
import postcssScss from 'postcss-scss'
import fs from 'fs'
import vueSFCParser from '@cprize/vue-sfc-parser'

const JS_EXTS = ['.js', '.jsx', '.ts', '.tsx']
const CSS_EXTS = ['.css', '.less', '.scss']
const JSON_EXTS = ['.json']

// eslint-disable-next-line @typescript-eslint/no-empty-function
let
 = (_curModulePath: string, _requirePath: string) => ({})

type Callback = (path: string) => void

const MODULE_TYPES = {
  JS: 1 << 0,
  CSS: 1 << 1,
  JSON: 1 << 2,
  VUE: 1 << 3,
}

function isDirectory(filePath: string) {
  try {
    return fs.statSync(filePath).isDirectory()
  } catch (e) {}
  return false
}

const visitedModules = new Set()

function moduleResolver(curModulePath: string, requirePath: string) {
  if (typeof requirePathResolver === 'function') {
    const res = requirePathResolver(dirname(curModulePath), requirePath)
    if (typeof res === 'string') {
      requirePath = res
    }
  }

  requirePath = resolve(dirname(curModulePath), requirePath)

  // 过滤掉第三方模块
  if (requirePath.includes('node_modules')) {
    return ''
  }

  requirePath = completeModulePath(requirePath)

  if (visitedModules.has(requirePath)) {
    return ''
  } else {
    visitedModules.add(requirePath)
  }
  return requirePath
}

function completeModulePath(modulePath: string) {
  const EXTS = [...JSON_EXTS, ...JS_EXTS]

  for (const ext of [...EXTS, '.vue']) {
    if (modulePath.includes(ext)) {
      return modulePath
    }
  }

  function tryCompletePath(resolvePath: (a: string) => string) {
    for (let i = 0; i < EXTS.length; i++) {
      const tryPath = resolvePath(EXTS[i] ?? '')
      if (fs.existsSync(tryPath)) {
        return tryPath
      }
    }
    return ''
  }

  function reportModuleNotFoundError(modulePath: string) {
    console.log(chalk.red(`module not found: ${modulePath}`))
  }
  if (!EXTS.some((ext) => modulePath.endsWith(ext))) {
    const tryModulePath = tryCompletePath((ext: string) => modulePath + ext)
    if (!tryModulePath) {
      // reportModuleNotFoundError(modulePath);
    } else {
      return tryModulePath
    }
  }
  if (isDirectory(modulePath)) {
    const tryModulePath = tryCompletePath((ext) => join(modulePath, `index${ext}`))
    if (!tryModulePath) {
      reportModuleNotFoundError(modulePath)
    } else {
      return tryModulePath
    }
  }
  return modulePath
}

function resolveBabelSyntaxtPlugins() {
  const plugins = []
  plugins.push('jsx')
  plugins.push('typescript')
  return plugins
}
function resolvePostcssSyntaxtPlugin() {
  return [postcssScss]
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

function traverseCssModule(curModulePath: string, callback: Callback) {
  const moduleFileConent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const ast = postcss.parse(moduleFileConent, {
    // @ts-ignore
    syntax: resolvePostcssSyntaxtPlugin(),
  })
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

function traverseJsModule(curModulePath: string, callback: Callback) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const ast = parser.parse(moduleFileContent, {
    sourceType: 'unambiguous',
    // @ts-ignore
    plugins: resolveBabelSyntaxtPlugins(),
  })

  traverse(ast, {
    ImportDeclaration(path) {
      // @ts-ignore
      const subModulePath = moduleResolver(curModulePath, path.get('source.value').node)
      if (!subModulePath) {
        return
      }
      callback && callback(subModulePath)
      traverseModule(subModulePath, callback)
    },
    CallExpression(path) {
      if (path.get('callee').toString() === 'require' || path.get('callee').toString() === 'import') {
        const subModulePath = moduleResolver(curModulePath, path.get('arguments.0').toString().replace(/['"]/g, ''))
        if (!subModulePath) {
          return
        }
        callback && callback(subModulePath)
        traverseModule(subModulePath, callback)
      }
    },
    ExportDeclaration(path) {
      // FIXME: 需要判断是否为 export from 形式，临时用try-catch处理保护
      try {
        // @ts-ignore
        const subModulePath = moduleResolver(curModulePath, path.get('source.value').node)
        if (!subModulePath) {
          return
        }
        callback && callback(subModulePath)
        traverseModule(subModulePath, callback)
      } catch {}
      // console.log(path.get('source.value'));
      // console.log(path.isEx);
    },
  })
}

function traverseVueModule(curModulePath: string, callback: Callback) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const descriptor = vueSFCParser.parse(moduleFileContent)

  const ast = parser.parse(descriptor.script.map((item) => item.content).join(''), {
    sourceType: 'unambiguous',
    // @ts-ignore
    plugins: resolveBabelSyntaxtPlugins(),
  })
  traverse(ast, {
    ImportDeclaration(path) {
      // @ts-ignore
      const subModulePath = moduleResolver(curModulePath, path.get('source.value').node)
      if (!subModulePath) {
        return
      }

      callback && callback(subModulePath)
      traverseModule(subModulePath, callback)
    },
    CallExpression(path) {
      if (path.get('callee').toString() === 'require' || path.get('callee').toString() === 'import') {
        const subModulePath = moduleResolver(curModulePath, path.get('arguments.0').toString().replace(/['"]/g, ''))
        if (!subModulePath) {
          return
        }

        callback && callback(subModulePath)
        traverseModule(subModulePath, callback)
      }
    },
  })
  const cssContent = descriptor.style.map((item) => item.content).join('')
  const CSSast = postcss.parse(cssContent, {
    // @ts-ignore
    syntax: resolvePostcssSyntaxtPlugin(),
  })

  CSSast.walkAtRules('import', (rule) => {
    const subModulePath = moduleResolver(curModulePath, rule.params.replace(/['"]/g, ''))
    if (!subModulePath) {
      return
    }
    callback && callback(subModulePath)
    traverseModule(subModulePath, callback)
  })
  CSSast.walkDecls((decl) => {
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

function traverseModule(curModulePath: string, callback: Callback) {
  curModulePath = completeModulePath(curModulePath)

  const moduleType = getModuleType(curModulePath)

  if (moduleType & MODULE_TYPES.JS) {
    traverseJsModule(curModulePath, callback)
  } else if (moduleType & MODULE_TYPES.CSS) {
    traverseCssModule(curModulePath, callback)
  } else if (moduleType & MODULE_TYPES.VUE) {
    traverseVueModule(curModulePath, callback)
  }
}

const setRequirePathResolver = (resolver: (curDir: string, requirePath: string) => string) => {
  requirePathResolver = resolver
}

export { traverseModule, setRequirePathResolver }
