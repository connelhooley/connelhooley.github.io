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
    sources: {
      blog: {
        driver: "fs",
        prefix: "/blog",
        base: resolve(__dirname, "blog"),
      },
      slides: {
        driver: "fs",
        prefix: "/slides",
        base: resolve(__dirname, "slides"),
      },
      experience: {
        driver: "fs",
        prefix: "/experience",
        base: resolve(__dirname, "experience"),
      },
      projects: {
        driver: "fs",
        prefix: "/projects",
        base: resolve(__dirname, "projects"),
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
