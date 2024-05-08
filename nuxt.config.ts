// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "nuxt-content-assets", // Must be added before @nuxt/content
    "@nuxt/content",
    // TODO: rss feed = https://content.nuxt.com/v1/community/integrations
    // TODO: Favicon
  ],
  content: {
    highlight: {
      langs: [
        "csharp",
        "fsharp",
        "json",
        "css",
        "scss",
        "javascript",
        "js",
        "jsx",
        "typescript",
        "ts",
        "tsx",
        "ocaml",
        "bash"
      ],
      theme: "slack-dark",
    },
    markdown: {
      anchorLinks: true,
      rehypePlugins: {
        "rehype-external-links": {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      },
      remarkPlugins: [
        "remark-reading-time",
      ],
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
