import resolve from 'enhanced-resolve'
import { ResolverOptions } from './ResolverOptions'

export function getModuleResolver(resolverOptions: ResolverOptions) {
  return resolve.create.sync(resolverOptions)
}
