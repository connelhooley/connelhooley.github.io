import { resolve } from "path";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/content",
    //todo: https://content.nuxt.com/v1/community/integrations
  ],
  content: {
    markdown: {
      rehypePlugins: {
        "rehype-external-links": {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      },
    },
  },
  app: {
    buildAssetsDir: "files",
  },
  vite: {
    assetsInclude: [/\.docx/],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: [
    "@fortawesome/fontawesome-svg-core/styles.css",
    "~/assets/css/main.css",
  ],
});
