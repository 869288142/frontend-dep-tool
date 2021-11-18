import { getModuleResolver } from '../src/moduleResolver'
import path from 'path'
const moduleResolver = getModuleResolver({
  alias: {
    '@': path.resolve(__dirname, './resolver'),
  },
})

describe('parse npm module', () => {
  it('parse eslint', () => {
    expect(moduleResolver(__dirname, 'eslint')).toMatch('node_modules\\eslint')
  })
})

describe('parse default mainFiles', () => {
  it('parse index.js mainFiles', () => {
    expect(moduleResolver(__dirname, './resolver')).toMatch('index.js')
  })
})

describe('parse default extensions', () => {
  it('parse .js extensions', () => {
    expect(moduleResolver(__dirname, './resolver/index')).toMatch('index.js')
  })
})

describe('parse  alias', () => {
  it('parse @ alias', () => {
    expect(moduleResolver(__dirname, '@')).toMatch('resolver\\index.js')
  })
})
