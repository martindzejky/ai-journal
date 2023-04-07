// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
    modules: [
        // used modules
        '@vueuse/nuxt',
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        'nuxt-icon',
        'nuxt-vuefire',
    ],

    // https://vuefire.vuejs.org/nuxt/getting-started.html
    // https://github.com/chrisspiegl/test-nuxt-vuefire-ssr/blob/main/nuxt.config.ts
    vuefire: {
        auth: true,
        config: {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
        },
    },
};
