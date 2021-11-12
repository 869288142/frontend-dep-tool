const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
require('@babel/types')
const fs = require('fs')
const { resolve, dirname, join, extname } = require('path')
const chalk = require('chalk')
const postcss = require('postcss')
const postcssLess = require('postcss-less')
const postcssScss = require('postcss-scss')
const postcssStripInlineComments = require('postcss-strip-inline-comments')
const JS_EXTS = ['.js', '.jsx', '.ts', '.tsx']
const CSS_EXTS = ['.css', '.less', '.scss']
const JSON_EXTS = ['.json']

let requirePathResolver = () => {}

const MODULE_TYPES = {
  JS: 1 << 0,
  CSS: 1 << 1,
  JSON: 1 << 2,
  VUE: 1 << 3,
}

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory()
  } catch (e) {}
  return false
}

const visitedModules = new Set()

function moduleResolver(curModulePath, requirePath) {
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

function completeModulePath(modulePath) {
  const EXTS = [...JSON_EXTS, ...JS_EXTS]

  for (const ext of [...EXTS, '.vue']) {
    if (modulePath.includes(ext)) {
      return modulePath
    }
  }

  function tryCompletePath(resolvePath) {
    for (let i = 0; i < EXTS.length; i++) {
      const tryPath = resolvePath(EXTS[i])
      if (fs.existsSync(tryPath)) {
        return tryPath
      }
    }
  }

  function reportModuleNotFoundError(modulePath) {
    // console.log(chalk.red('module not found: ' + modulePath))
  }
  if (!EXTS.some((ext) => modulePath.endsWith(ext))) {
    const tryModulePath = tryCompletePath((ext) => modulePath + ext)
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

function resolveBabelSyntaxtPlugins(modulePath) {
  const plugins = []
  plugins.push('jsx')
  plugins.push('typescript')
  return plugins
}

function resolvePostcssSyntaxtPlugin(modulePath) {
  return [postcssStripInlineComments, postcssScss]
}

function getModuleType(modulePath) {
  const moduleExt = extname(modulePath)

  if (JS_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.JS
  } else if (CSS_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.CSS
  } else if (JSON_EXTS.some((ext) => ext === moduleExt)) {
    return MODULE_TYPES.JSON
  } else if (moduleExt === '.vue') {
    return MODULE_TYPES.VUE
  }
}

function traverseCssModule(curModulePath, callback) {
  const moduleFileConent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const ast = postcss.parse(moduleFileConent, {
    syntax: resolvePostcssSyntaxtPlugin(curModulePath),
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
      const url = /.*url\((.+)\).*/.exec(decl.value)[1].replace(/['"]/g, '')
      const subModulePath = moduleResolver(curModulePath, url)
      if (!subModulePath) {
        return
      }
      callback && callback(subModulePath)
    }
  })
}

function traverseJsModule(curModulePath, callback) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const ast = parser.parse(moduleFileContent, {
    sourceType: 'unambiguous',
    plugins: resolveBabelSyntaxtPlugins(curModulePath),
  })

  traverse(ast, {
    ImportDeclaration(path) {
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

function traverseVueModule(curModulePath, callback) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  })

  const { parse } = require('@vue/compiler-dom')

  const descriptor = parse(moduleFileContent)

  const ast = parser.parse(descriptor.children.find((item) => item.tag === 'script').children[0].content, {
    sourceType: 'unambiguous',
    plugins: resolveBabelSyntaxtPlugins(curModulePath),
  })
  traverse(ast, {
    ImportDeclaration(path) {
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
  if (descriptor.children.find((item) => item.tag === 'style')) {
    const cssContent = descriptor.children
      .filter((item) => item.tag === 'style')
      .map((item) => item?.children?.[0]?.content ?? '')
      .join('\n')
    console.log(cssContent)
    const CSSast = postcss.parse(cssContent, {
      syntax: resolvePostcssSyntaxtPlugin(curModulePath),
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
        const url = /.*url\((.+)\).*/.exec(decl.value)[1].replace(/['"]/g, '')
        const subModulePath = moduleResolver(curModulePath, url)
        if (!subModulePath) {
          return
        }
        callback && callback(subModulePath)
      }
    })
  }
}

function traverseModule(curModulePath, callback) {
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

module.exports.traverseModule = traverseModule
module.exports.setRequirePathResolver = (resolver) => {
  requirePathResolver = resolver
}
