import Parser from '../src/index'

describe('parse sfc', () => {
  it('parse sfc', () => {
    const content = `
      <template>
          <wx-add-fans v-hoverTool="toolbarConfig" :module-id="moduleId" />
      </template>

      <script>
      import WxAddFans from './wxAddFans.vue';
      import toolbarConfig from '../config/toolbar.config';

      export default {
          name: 'WxAddFansManageView',
          components: {
              WxAddFans,
          },
          props: {
              moduleId: {
                  type: Number,
                  default: -1,
              },
          },
          data() {
              return {};
          },
          computed: {
              toolbarConfig() {
                  return {
                      id: this.moduleId,
                      ...toolbarConfig,
                  };
              },
          },
      };
      </script>

      <style></style>
`

    expect(Parser.parse(content).script).toBeInstanceOf(Array)
    expect(Parser.parse(content).template).toBeInstanceOf(Array)
    expect(Parser.parse(content).style).toBeInstanceOf(Array)
  })
})
describe('parse template', () => {
  it('parse template', () => {
    const content = `
    <template>
      <div></div>
    </template>

  `
    expect(Parser.parse(content).template[0]?.source.includes('<template>')).toBeTruthy()
  })
})

describe('parse script', () => {
  it('parse script', () => {
    const content = `
      <script>

      export default {
      };
      </script>`

    expect(Parser.parse(content).script[0]?.content).not.toBeUndefined()
    expect(Parser.parse(content).script[0]?.source).not.toBeUndefined()

    expect(Parser.parse(content).script[0]?.content.includes('<script>')).toBeFalsy()

    expect(Parser.parse(content).script[0]?.source.includes('<script>')).toBeTruthy()
  })
})

describe('parse style', () => {
  it('parse style', () => {
    const content = `
    <style></style>

`
    expect(Parser.parse(content).style[0]?.source.includes('<style>')).toBeTruthy()
    expect(Parser.parse(content).style[0]?.content.includes('<style>')).toBeFalsy()
  })

  it('parse mutilte style', () => {
    const content = `
    <style></style>
    <style></style>
    <style></style>`
    expect(Parser.parse(content).style.length).toBe(3)
  })
})
