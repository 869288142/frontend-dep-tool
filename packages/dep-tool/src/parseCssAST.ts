import postcss from 'postcss'
import { resolvePostcssSyntaxtPlugin } from './resolvePostcssSyntaxtPlugin'
export function parseCssAST(moduleFileConent: string) {
  return postcss.parse(moduleFileConent, {
    // @ts-ignoreparse
    syntax: resolvePostcssSyntaxtPlugin(),
  })
}
