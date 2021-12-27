import { traverseModule } from './traverseModule'

import { resolve, normalize } from 'path'
import fastGlob from 'fast-glob'
import { ResolverOptions } from './ResolverOptions'

const defaultOptions = {
  cwd: '',
  entries: [],
  includes: ['**/*', '!node_modules'],
}

function findUnusedModule(options: {
  cwd: string
  entries: string[]
  includes: string[]
  resolverOptions: ResolverOptions
}) {
  let { includes } = Object.assign(defaultOptions, options)

  const { cwd, entries, resolverOptions } = Object.assign(defaultOptions, options)

  includes = includes.map((includePath) => (cwd ? `${cwd.replace(/\\/g, '/')}/${includePath}` : includePath))

  const allFiles: string[] = fastGlob.sync(includes).map((item) => normalize(item))
  const entryModules: string[] = []
  const usedModules: string[] = []

  entries.forEach((entry) => {
    const entryPath = resolve(cwd, entry)
    entryModules.push(entryPath)
    traverseModule(
      entryPath,
      (modulePath) => {
        usedModules.push(modulePath)
      },
      resolverOptions
    )
  })

  const unusedModules = allFiles.filter((filePath) => {
    const resolvedFilePath = resolve(filePath)
    return (
      !entryModules.includes(resolvedFilePath) &&
      !usedModules.includes(resolvedFilePath) &&
      !resolvedFilePath.includes('.svg')
    )
  })
  return {
    all: allFiles,
    used: usedModules,
    unused: unusedModules,
  }
}

export default findUnusedModule
