import { rm, cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { glob } from "glob";

import { unified } from "unified";
import { h } from "hastscript";
import { toString } from "hast-util-to-string";
import { matter } from "vfile-matter";

import { Eta } from "eta";
import RSS from "rss";

import babel from "@babel/core";

import postcss from "postcss";
import postcssNesting from "postcss-nesting";
import postcssImport from "postcss-import";
import postcssCustomMedia from "postcss-custom-media";
import autoprefixer from "autoprefixer";

import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify";
import remarkRehype from "remark-rehype";

import remarkRemoveFrontmatter from "@connelhooley/remark-remove-frontmatter";

import fsharp from "highlight.js/lib/languages/fsharp";
import { common } from "lowlight";

import rehypeParse from "rehype-parse";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeDocument from "rehype-document";
import rehypeMeta from "rehype-meta"
import rehypeFormat from "rehype-format";
import rehypeExternalLinks from "rehype-external-links";
import rehypeInferReadingTimeMeta from "rehype-infer-reading-time-meta";
import rehypeStringify from "rehype-stringify";

import rehypeInferTocMeta from "@connelhooley/rehype-infer-toc-meta";
import rehypeCopyCodeButton from "@connelhooley/rehype-copy-code-button";
import rehypeMermaid, { mermaidStart, mermaidStop } from "@connelhooley/rehype-mermaid";
import rehypeNoJs from "@connelhooley/rehype-no-js";

const srcDir = "./src";
const tempDir = "./temp";
const distDir = "./dist";

const eta = new Eta({
  views: path.join(srcDir, "templates"),
  functionHeader: `const _globals = ${JSON.stringify({
    name: "Connel Hooley",
    year: new Date().getFullYear(),
    email: "me@connelhooley.uk",
    mastodon: "https://mastodon.social/@connel",
    linkedIn: "https://uk.linkedin.com/in/connelhooley",
  })};`,
});

const defaultRehypeDocumentOptions = {
  language: "en-GB",
  meta: [
    { name: "fediverse:creator", content: "@connel@mastodon.social" },
    { name: "apple-mobile-web-app-title", content: "Connel Hooley" },
  ],
  link: [
    { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "shortcut icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", type: "image/png", href: "/apple-touch-icon.png", sizes: "180x180" },
    { rel: "manifest", href: "/site.webmanifest" },
  ],
  css: [
    "/vendor/highlight.js/css/ir-black.min.css",
    "/vendor/font-awesome/css/fontawesome.min.css",
    "/vendor/font-awesome/css/brands.min.css",
    "/vendor/font-awesome/css/solid.min.css",
    "/css/main.css",
  ],
  js: [
    "/vendor/dayjs/js/dayjs.min.js",
    "/vendor/dayjs/js/relativeTime.min.js",
    "/js/copy-code.js",
    "/js/dropdown-menu.js",
    "/js/relative-date.js",
    "/js/mobile-menu.js"
  ],
};

const defaultRehypeMetaOptions = {
  author: "Connel Hooley",
  authorTwitter: "@connel_dev",
  siteTwitter: "@connel_dev",
  origin: "https://connelhooley.uk",
  copyright: true,
  image: {
    alt: "C H",
    url: "https://connelhooley.uk/logo.png",
    height: "1200",
    width: "1200",
  },
  name: "Connel Hooley",
  separator: " | ",
  og: true,
  twitter: true,
  siteTags: [
    "Dev",
    "Development",
    "Software",
  ],
};

console.log("Clearing temp");
await rm(tempDir, { recursive: true, force: true });
await mkdir(tempDir);
console.log("Cleared temp");

console.log("Clearing dist");
await rm(distDir, { recursive: true, force: true });
await mkdir(distDir);
console.log("Cleared dist");

export const buildCss = async () => {
  console.log("Building CSS");
  const srcCssFilePaths = await glob(srcDir + "/styles/**/!(_)*.css");
  await Promise.all(srcCssFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      "css",
      path.relative(path.join(srcDir, "styles"), srcFilePath));
    const content = await readFile(srcFilePath);
    const plugins = [
      postcssImport,
      postcssCustomMedia,
      postcssNesting,
      autoprefixer,
    ];
    const result = await postcss(plugins).process(content, { from: srcFilePath, to: distFilePath });
    await mkdir(path.dirname(distFilePath), { recursive: true });
    await writeFile(distFilePath, result.css);
    if (result.map) {
      await writeFile(distFilePath + ".map", result.map);
    }
  }));
  console.log("Built CSS");
};

export const buildJs = async () => {
  console.log("Building JS");
  const srcFilePaths = await glob(srcDir + "/scripts/**/*.js", { nodir: true });
  await Promise.all(srcFilePaths.map(async srcFilePath => {
    const result = await babel.transformFileAsync(srcFilePath, {
      presets: ["@babel/preset-env"],
    });
    const distFilePath = path.join(
      distDir,
      "js",
      path.relative(path.join(srcDir, "scripts"), srcFilePath));
    await mkdir(path.dirname(distFilePath), { recursive: true });
    await writeFile(distFilePath, result.code);
    if (result.map) {
      await writeFile(distFilePath + ".map", result.map);
    }
  }));
  console.log("Built JS");
};

export const copyStaticAssets = async () => {
  console.log("Copying static assets");
  const srcFilePaths = await glob(srcDir + "/static/**/*", { nodir: true });
  await Promise.all(srcFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "static"), srcFilePath));
    await cp(srcFilePath, distFilePath);
  }));
  console.log("Copied static assets");
};

export const copyBlogAssets = async () => {
  console.log("Copying blog assets");
  const srcImgFilePaths = await glob(srcDir + "/content/blog/**/*.{png,svg}");
  await Promise.all(srcImgFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "content"), srcFilePath));
    await cp(srcFilePath, distFilePath);
  }));
  console.log("Copied blog assets");
};

export const copySlidesAssets = async () => {
  console.log("Copying slides assets");
  const srcImgFilePaths = await glob(srcDir + "/content/slides/**/*.{png,gif}");
  await Promise.all(srcImgFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "content"), srcFilePath));
    await cp(srcFilePath, distFilePath);
  }));
  console.log("Copied slides assets");
};

export const renderHome = async () => {
  console.log("Rendering home");
  const renderedTemplate = await eta.renderAsync("home");
  const parsedFile = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeDocument, defaultRehypeDocumentOptions)
    .use(rehypeMeta, defaultRehypeMetaOptions)
    .use(rehypeNoJs)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(renderedTemplate);
  await writeFile(path.join(distDir, "index.html"), parsedFile.toString("utf-8"));
  console.log("Rendered home");
};

export const renderExperience = async () => {
  const loadExperienceContent = async () => {
    console.log("Loading experience content");
    const srcMdFilePaths = await glob(srcDir + "/content/experience/**/*.md");
    const experiences = await Promise.all(srcMdFilePaths.map(async srcFilePath => {
      const parsedFile = await unified()
        .use(() => (_, file) => matter(file))
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeExternalLinks, {
          rel: ["external", "nofollow", "noopener", "noreferrer"],
          target: "_blank",
          contentProperties: {
            class: "external-link-icon-wrapper",
          },
          content() {
            return [
              h("i.fa-solid fa-arrow-up-right-from-square", { "aria-hidden": "true" }),
              h("span.sr-only", "(opens in a new window)"),
            ];
          },
        })
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(await readFile(srcFilePath));
      return {
        content: parsedFile.toString("utf-8"),
        data: parsedFile.data.matter,
      };
    }));
    experiences.sort((a, b) => {
      const startA = a.data.start;
      const startB = b.data.start;
      if (startA < startB) return 1;
      if (startA > startB) return -1;
      return 0;
    });
    console.log("Loaded experience content");
    return experiences;
  };

  const experiences = await loadExperienceContent();
  console.log("Rendering experience page");
  const renderedTemplate = await eta.renderAsync("experience", {
    route: "/experience/",
    items: experiences,
  });
  const parsedFile = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeDocument, defaultRehypeDocumentOptions)
    .use(rehypeMeta, {
      ...defaultRehypeMetaOptions,
      title: "Experience",
      pathname: "/experience/",
    })
    .use(rehypeNoJs)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(renderedTemplate);
  const distFilePath = path.join(distDir, "experience", "index.html");
  await mkdir(path.dirname(distFilePath), { recursive: true });
  await writeFile(distFilePath, parsedFile.toString("utf-8"));
  console.log("Rendered experience page");
};

export const renderProjects = async () => {
  const loadProjectsContent = async () => {
    console.log("Loading projects content");
    const srcMdFilePaths = await glob(srcDir + "/content/projects/**/*.md");
    const projects = await Promise.all(srcMdFilePaths.map(async srcFilePath => {
      const parsedFile = await unified()
        .use(() => (_, file) => matter(file))
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeExternalLinks, {
          rel: ["external", "nofollow", "noopener", "noreferrer"],
          target: "_blank",
          contentProperties: {
            class: "external-link-icon-wrapper",
          },
          content() {
            return [
              h("i.fa-solid fa-arrow-up-right-from-square", { "aria-hidden": "true" }),
              h("span.sr-only", "(opens in a new window)"),
            ];
          },
        })
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(await readFile(srcFilePath));
      return {
        content: parsedFile.toString("utf-8"),
        data: parsedFile.data.matter,
      };
    }));
    projects.sort((a, b) => {
      const orderA = new Date(a.data.order);
      const orderB = new Date(b.data.order);
      if (orderA < orderB) return -1;
      if (orderA > orderB) return 1;
      return 0;
    });
    console.log("Loaded projects content");
    return projects;
  };

  const projects = await loadProjectsContent();
  console.log("Rendering projects page");
  const renderedTemplate = await eta.renderAsync("projects", {
    route: "/projects/",
    items: projects,
  });
  const parsedFile = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeDocument, defaultRehypeDocumentOptions)
    .use(rehypeMeta, {
      ...defaultRehypeMetaOptions,
      title: "Projects",
      pathname: "/projects/",
    })
    .use(rehypeNoJs)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(renderedTemplate);
  const distFilePath = path.join(distDir, "projects", "index.html");
  await mkdir(path.dirname(distFilePath), { recursive: true });
  await writeFile(distFilePath, parsedFile.toString("utf-8"));
  console.log("Rendered projects page");
};

export const renderBlog = async () => {
  const loadBlogContent = async () => {
    console.log("Loading blog content");
    const blog = {
      posts: [],
      languages: new Set(),
      technologies: new Set(),
    };
    const srcMdFilePaths = await glob(srcDir + "/content/blog/*/*/*/*/index.md");
    await mermaidStart();
    await Promise.all(srcMdFilePaths.map(async srcFilePath => {
      const srcFilePathParsed = path.parse(srcFilePath);
      const parsedFile = await unified()
        .use(() => (_, file) => matter(file))
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeInferReadingTimeMeta, { age: 21 })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, {
          behavior: "append",
          headingProperties: { "class": "content-heading" },
          properties: { "class": "content-heading-link" },
          content(node) {
            return [
              h("span", [
                h("i.fa-solid fa-link", { "aria-hidden": "true" }),
                h("span.sr-only", `Go to ${toString(node)} section`),
              ]),
            ];
          },
        })
        .use(rehypeInferTocMeta)
        .use(rehypeHighlight, {
          plainText: ["mermaid"],
          languages: { ...common, fsharp },
        })
        .use(rehypeCopyCodeButton)
        .use(rehypeMermaid)
        .use(rehypeExternalLinks, {
          rel: ["external", "nofollow", "noopener", "noreferrer"],
          target: "_blank",
          contentProperties: {
            class: "external-link-icon-wrapper",
          },
          content() {
            return [
              h("i.fa-solid fa-arrow-up-right-from-square", { "aria-hidden": "true" }),
              h("span.sr-only", "(opens in a new window)"),
            ];
          },
        })
        .use(rehypeStringify)
        .process(await readFile(srcFilePath));
      const data = parsedFile.data.matter;
      const relativePath = path.relative(path.join(srcDir, "content"), srcFilePathParsed.dir);
      const [year, month, day] = relativePath.split(path.sep).slice(1, 4);
      data.date = new Date(`${year}-${month}-${day}T${data.time}Z`);
      data.readingTime = parsedFile.data.meta.readingTime;
      data.toc = parsedFile.data.meta.toc;
      if (process.env.NODE_ENV !== "development" && data.draft) return;
      const tempFilePath = path.join(
        tempDir,
        relativePath,
        "index.html");
      const distFilePath = path.join(
        distDir,
        relativePath,
        "index.html");
      const route = path.join(
        "/",
        relativePath,
        "/");
      await mkdir(path.dirname(tempFilePath), { recursive: true });
      await writeFile(tempFilePath, parsedFile.toString("utf-8"));
      blog.posts.push({
        route,
        meta: {
          srcFilePath,
          tempFilePath,
          distFilePath,
        },
        data,
      });
      data?.languages?.forEach(language => blog.languages.add(language));
      data?.technologies?.forEach(technology => blog.technologies.add(technology));
    }));
    mermaidStop();
    blog.posts.sort((a, b) => {
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
    blog.posts.forEach((post, index) => {
      if (index > 0) {
        const { prev, next, ...nextPost } = blog.posts[index - 1]
        post.next = nextPost;
      }
      if (index + 1 <= blog.posts.length - 1) {
        const { prev, next, ...prevPost } = blog.posts[index + 1]
        post.prev = prevPost;
      }
    });
    console.log("Loaded blog content");
    return blog;
  };
  const renderBlogPosts = async ({ posts }) => {
    console.log("Rendering blog posts");
    await Promise.all(posts.map(async post => {
      const content = await readFile(post.meta.tempFilePath);
      const renderedTemplate = await eta.renderAsync("blog-post", { content, ...post });
      const parsedFile = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeDocument, defaultRehypeDocumentOptions)
        .use(rehypeMeta, {
          ...defaultRehypeMetaOptions,
          type: "article",
          title: post.data.title,
          description: post.data.description,
          readingTime: post.data.readingTime,
          published: post.data.date.toISOString(),
          pathname: post.route,
          tags: [
            ...(post.data?.languages ?? []),
            ...(post.data?.technologies ?? []),
          ],
        })
        .use(rehypeNoJs)
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(renderedTemplate);
      await mkdir(path.dirname(post.meta.distFilePath), { recursive: true });
      await writeFile(post.meta.distFilePath, parsedFile.toString("utf-8"));
    }));
    console.log("Rendered blog posts");
  };
  const renderPagedCollection = async ({ items, basePath, baseRoute, pageSize = 5, title, isTechnology = false, isLanguage = false }) => {
    const paginate = () => {
      const pages = [];
      const pageCount = Math.ceil(items.length / pageSize);
      const getPageRoute = (pageNumber) => {
        return pageNumber === 1
          ? baseRoute
          : `${baseRoute}page/${pageNumber}/`;
      };
      const getPagePath = (pageNumber) => {
        return pageNumber === 1
          ? path.join(basePath, "index.html")
          : path.join(basePath, "page", pageNumber.toString(), "index.html");
      };
      let pageNumber = 0;
      for (let i = 0; i < items.length; i += pageSize) {
        pageNumber++;
        pages.push({
          route: getPageRoute(pageNumber),
          path: getPagePath(pageNumber),
          items: items.slice(i, i + pageSize),
          prevPageRoute: pageNumber === 1
            ? null
            : getPageRoute(pageNumber - 1),
          nextPageRoute: pageNumber === pageCount
            ? null
            : getPageRoute(pageNumber + 1),
        });
      }
      return { pageCount, pages };
    };
    console.log(`Rendering '${title}' paged collection`);
    const { pages } = paginate();
    await Promise.all(pages.map(async (page) => {
      const renderedTemplate = await eta.renderAsync("paged-collection", {
        title,
        isTechnology,
        isLanguage,
        ...page,
      });
      const parsedFile = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeDocument, defaultRehypeDocumentOptions)
        .use(rehypeMeta, {
          ...defaultRehypeMetaOptions,
          title,
          pathname: page.route,
        })
        .use(rehypeNoJs)
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(renderedTemplate);
      const distFilePath = path.join(distDir, page.path);
      await mkdir(path.dirname(distFilePath), { recursive: true });
      await writeFile(distFilePath, parsedFile.toString("utf-8"));
    }));
    console.log(`Rendered '${title}' paged collection`);
  };
  const renderRssFeed = async ({ posts }) => {
    console.log("Rendering RSS feed");
    const rss = new RSS({
      title: defaultRehypeMetaOptions.name,
      description: "My personal dev blog",
      site_url: defaultRehypeMetaOptions.origin,
      image_url: defaultRehypeMetaOptions.image.url,
      feed_url: path.join(defaultRehypeMetaOptions.origin, "rss.xml"),
      language: defaultRehypeDocumentOptions.language,
      categories: defaultRehypeMetaOptions.siteTags,
      managingEditor: defaultRehypeMetaOptions.author,
      webMaster: defaultRehypeMetaOptions.author,
    });
    posts.slice(0, 500).forEach(post => {
      rss.item({
        title: post.data.title,
        description: post.data.description,
        url: path.join(defaultRehypeMetaOptions.origin, post.route),
        date: post.data.date,
        categories: [
          ...(post.data?.languages ?? []),
          ...(post.data?.technologies ?? []),
        ],
      });
    });
    const xml = rss.xml({ indent: true });
    const distFilePath = path.join(distDir, "rss.xml");
    await writeFile(distFilePath, xml);
    console.log("Rendered RSS feed");
  };

  const { posts, languages, technologies } = await loadBlogContent();
  await Promise.all([
    renderBlogPosts({ posts }),
    renderPagedCollection({
      items: posts,
      basePath: "blog",
      baseRoute: "/blog/",
      title: "Blog",
      pageSize: 5,
    }),
    ...Array.from(languages).map(language => {
      return renderPagedCollection({
        items: posts.filter(post => post.data?.languages?.includes(language)),
        basePath: path.join("blog", "languages", language.replace("#", "Sharp")),
        baseRoute: `/blog/languages/${encodeURIComponent(language.replace("#", "Sharp"))}/`,
        title: language,
        isLanguage: true,
        pageSize: 5,
      });
    }),
    ...Array.from(technologies).map(technology => {
      return renderPagedCollection({
        items: posts.filter(post => post.data?.technologies?.includes(technology)),
        basePath: path.join("blog", "technologies", technology.replace("#", "Sharp")),
        baseRoute: `/blog/technologies/${encodeURIComponent(technology.replace("#", "Sharp"))}/`,
        title: technology,
        isTechnology: true,
        pageSize: 5,
      });
    }),
    renderRssFeed({ posts }),
  ]);
};

export const renderSlides = async () => {
  console.log("Rendering slides");
  const srcMdFilePaths = await glob(srcDir + "/content/slides/**/index.md");
  await Promise.all(srcMdFilePaths.map(async srcFilePath => {
    const srcFilePathParsed = path.parse(srcFilePath);
    const parsedMdFile = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkRemoveFrontmatter)
      .use(remarkStringify, { rule: "-" })
      .process(await readFile(srcFilePath));
    if (process.env.NODE_ENV !== "development" && parsedMdFile.data.draft) return;
    const relativePath = path.relative(path.join(srcDir, "content"), srcFilePathParsed.dir);
    const distMdFilePath = path.join(
      distDir,
      relativePath,
      "index.md");
    const distFilePath = path.join(
      distDir,
      relativePath,
      "index.html");
    const route = path.join(
      "/",
      relativePath,
      "/");
    const mdRoute = path.join(
      "/",
      relativePath,
      "index.md");
    await mkdir(path.dirname(distMdFilePath), { recursive: true });
    await writeFile(distMdFilePath, parsedMdFile.toString("utf-8"));
    const renderedTemplate = await eta.renderAsync("slides", { mdRoute });
    const parsedHtmlFile = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, {
        ...defaultRehypeDocumentOptions,
        css: [
          "/vendor/reveal.js/css/reset.css",
          "/vendor/reveal.js/css/reveal.css",
          "/vendor/reveal.js/css/theme/black.css",
          "/css/slides.css",
        ],
        js: [
          "/vendor/reveal.js/js/plugins/notes.js",
          "/vendor/reveal.js/js/plugins/highlight.js",
          "/vendor/reveal.js/js/plugins/markdown.js",
          "/vendor/reveal.js/js/reveal.js",
          "/js/slides.js",
        ],
      })
      .use(rehypeMeta, {
        ...defaultRehypeMetaOptions,
        title: parsedMdFile.data.title,
        published: parsedMdFile.data.date?.toISOString(),
        pathname: route,
        tags: [
          ...(parsedMdFile.data?.languages ?? []),
          ...(parsedMdFile.data?.technologies ?? []),
        ],
      })
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    await mkdir(path.dirname(distMdFilePath), { recursive: true });
    await writeFile(distFilePath, parsedHtmlFile.toString("utf-8"));
  }));
  console.log("Rendered slides");
};

await Promise.all([
  buildCss(),
  buildJs(),
  copyStaticAssets(),
  copyBlogAssets(),
  copySlidesAssets(),
  renderHome(),
  renderExperience(),
  renderProjects(),
  renderBlog(),
  renderSlides(),
]);

console.log("Site built successfully");
