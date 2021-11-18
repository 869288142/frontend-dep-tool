import resolve from 'enhanced-resolve'

interface ResolverOptions {
  extensions?: string[]
  alias?: Record<string, string>
}

export function getModuleResolver(resolverOptions: ResolverOptions) {
  return resolve.create.sync(resolverOptions)
}
