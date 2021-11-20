export function removeInlineComment(moduleFileConent: string) {
  moduleFileConent = moduleFileConent.replace(/^\s*\/\/.*/gm, '')
  return moduleFileConent
}
