import * as parser from '@babel/parser'
import { resolveBabelSyntaxtPlugins } from './resolveBabelSyntaxtPlugins'

export function parseJsAST(moduleFileContent: string) {
  return parser.parse(moduleFileContent, {
    sourceType: 'unambiguous',
    // @ts-ignore
    plugins: resolveBabelSyntaxtPlugins(),
  })
}
