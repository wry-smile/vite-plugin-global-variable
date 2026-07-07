import eslintConfig from '@antfu/eslint-config'

export default eslintConfig({
  typescript: true,
  vue: true,
  yaml: {
    overrides: {
      'pnpm/yaml-enforce-settings': ['off'],
    },
  },
  markdown: true,
  json: true,
  jsonc: true,
  json5: true,
  jsonld: true,
  formatters: true,
})
