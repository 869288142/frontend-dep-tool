import { traverseModule, setRequirePathResolver } from './traverseModule'

import { resolve, normalize } from 'path'
import fastGlob from 'fast-glob'

const defaultOptions = {
  cwd: '',
  entries: [],
  includes: ['**/*', '!node_modules'],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resolveRequirePath: () => {},
}

function findUnusedModule(options: {
  cwd: string
  entries: string[]
  includes: string[]
  resolveRequirePath: () => string
}) {
  let { includes } = Object.assign(defaultOptions, options)

  const { cwd, entries, resolveRequirePath } = Object.assign(defaultOptions, options)

  includes = includes.map((includePath) => (cwd ? `${cwd.replace(/\\/g, '/')}/${includePath}` : includePath))

  const allFiles: string[] = fastGlob.sync(includes).map((item) => normalize(item))
  const entryModules: string[] = []
  const usedModules: string[] = []

  setRequirePathResolver(resolveRequirePath)
  entries.forEach((entry) => {
    const entryPath = resolve(cwd, entry)
    entryModules.push(entryPath)
    traverseModule(entryPath, (modulePath) => {
      usedModules.push(modulePath)
    })
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
