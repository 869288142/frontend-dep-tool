export function resolveBabelSyntaxtPlugins() {
  const plugins = []
  plugins.push('jsx')
  plugins.push('typescript')
  plugins.push('exportDefaultFrom')
  return plugins
}
