import { parse } from '@vue/compiler-dom'

export default class {
  static parse(content: string) {
    const ast = parse(content)

    // @ts-ignore
    const script = ast.children
      // @ts-ignore
      .filter((item) => item.tag === 'script')

      .map((script) => {
        return {
          source: script.loc.source,
          // @ts-ignore
          content: (script?.children?.[0]?.content as string) ?? '',
        }
      })

    const template = ast.children
      // @ts-ignore
      .filter((item) => item.tag === 'template')
      .map((script) => {
        return {
          content: script.loc.source,
          source: script.loc.source,
        }
      })
    const style = ast.children
      // @ts-ignore
      .filter((item) => item.tag === 'style')
      .map((script) => {
        return {
          source: script.loc.source,
          // @ts-ignore
          content: (script?.children?.[0]?.content as string) ?? '',
        }
      })
    return {
      script,
      template,
      style,
    }
  }
}
