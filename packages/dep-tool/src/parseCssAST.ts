import postcss from 'postcss'
import { removeInlineComment } from './removeInlineComment'
import { resolvePostcssSyntaxtPlugin } from './resolvePostcssSyntaxtPlugin'
export function parseCssAST(moduleFileConent: string) {
  moduleFileConent = removeInlineComment(moduleFileConent)
  return postcss.parse(moduleFileConent, {
    // @ts-ignore
    syntax: resolvePostcssSyntaxtPlugin(),
  })
}
