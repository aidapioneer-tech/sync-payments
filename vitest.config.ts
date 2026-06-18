import { defineVitestConfig } from '@nuxt/test-utils/config'

// https://nuxt.com/docs/getting-started/testing
export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    // Берём только тесты проекта — не подхватываем *.test.ts из node_modules
    include: ['app/**/*.{test,spec}.ts', 'scripts/**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.output', '.nuxt']
  }
})
