export function removeInlineComment(moduleFileConent: string) {
  moduleFileConent = moduleFileConent.replace(/(\s*)\/\/.*/gm, '$1')
  return moduleFileConent
}
