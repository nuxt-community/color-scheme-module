export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
  ],
  colorMode: {
    // storage: 'cookie',
    // cookieAttrs: {
    //   path: '/',
    //   domain: 'localhost',
    //   secure: true,
    //   samesite: 'None',
    // },
  },
  compatibilityDate: '2024-09-11',
})
