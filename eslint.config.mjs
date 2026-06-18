// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  // eslint-config-prettier отключает правила ESLint, конфликтующие с Prettier
  prettier
)
