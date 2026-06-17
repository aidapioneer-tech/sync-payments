import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const extraAllowedHosts =
  process?.env.NUXT_ALLOWED_HOSTS?.split(',')
    .map((s: string) => s.trim())
    .filter(Boolean) ?? []

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@bitrix24/b24ui-nuxt',
    '@bitrix24/b24jssdk-nuxt',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/test-utils/module'
  ],
  ssr: false,
  devtools: { enabled: false },
  app: {
    baseURL: '/sync-payments/'
  },

  css: ['~/assets/css/main.css'],
  /**
   * @see https://nuxt.com/docs/guide/going-further/runtime-config#example
   */
  runtimeConfig: {
    public: {
      smartProcessIdPayment: 1036,
      dealForWorkCategoryId: 2,
      smartProcessIdDistributions: 1044,
      smartProcessStatusPaymentSuccess: 'DT1036_14:SUCCESS', // smartProcessIdPayment
      smartProcessStatusPaymentFail: 'DT1036_14:FAIL' // smartProcessStatusPayment
    }
  },
  devServer: {
    loadingTemplate: () => {
      return readFileSync('./template/devServer-loading.html', 'utf-8')
    }
  },
  compatibilityDate: '2025-07-16',
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Fix: "Blocked request. This host is not allowed" when using tunnels like ngrok
      allowedHosts: [...extraAllowedHosts]
      // Optionally set HMR host if needed behind proxy:
      // hmr: { protocol: 'wss', host: 'whale-viable-wasp.ngrok-free.app', port: 443 }
    }
  },
  b24ui: {
    colorMode: false
  }
})
