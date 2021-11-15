import resolve from 'enhanced-resolve'

const myResolve = resolve.create.sync({
  extensions: ['.ts', '.js'],
})

export default function moduleResolver(ctx: string, path: string) {
  return myResolve(ctx, path)
}
