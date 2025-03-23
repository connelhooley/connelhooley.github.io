import path from "path";
import { rm, mkdir, readFile, writeFile } from "fs/promises";

import { Eta } from "eta";
import RSS from "rss";

import { unified } from "unified";
import { reporter } from "vfile-reporter";
import { h } from "hastscript";
import { toString } from "hast-util-to-string";

import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify";
import remarkRehype from "remark-rehype";
import remarkRetext from "remark-retext";

import remarkRemoveFrontmatter from "@connelhooley/remark-remove-frontmatter";

import fsharp from "highlight.js/lib/languages/fsharp";
import { common } from "lowlight";

import enGb from "dictionary-en-gb";
import retextContractions from "retext-contractions";
import retextEnglish from "retext-english";
import retextEquality from "retext-equality";
import retextIndefiniteArticle from "retext-indefinite-article";
import retextIntensify from "retext-intensify";
import retextPassive from "retext-passive";
import retextQuotes from "retext-quotes";
import retextReadability from "retext-readability";
import retextRedundantAcronyms from "retext-redundant-acronyms";
import retextRepeatedWords from "retext-repeated-words";
import retextSimplify from "retext-simplify";
import retextSpell from "retext-spell";

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
import rehypeFootnotesHeading from "@connelhooley/rehype-footnotes-heading";
import rehypeCopyCodeButton from "@connelhooley/rehype-copy-code-button";
import rehypeMermaid, { mermaidStart, mermaidStop } from "@connelhooley/rehype-mermaid";
import rehypeNoJs from "@connelhooley/rehype-no-js";

export async function createRouteWriter({ srcDir, distDir }) {
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

  await mermaidStart();

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir);

  const renderHomeRoute = async ({ type }) => {
    if (type !== "home") return;
    const renderedTemplate = await eta.renderAsync("home");
    const parsedRenderedTemplate = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, defaultRehypeMetaOptions)
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedRenderedTemplate.toString("utf-8");
  };

  const renderBlogPostRoute = async ({ type, routePath, data }) => {
    if (type !== "post") return;
    const parsedFile = await unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkRetext, data.date.getFullYear() < 2025 ? unified() : unified()
        .use(retextEnglish)
        .use(retextSpell, { dictionary: enGb })
        .use(retextContractions)
        .use(retextIndefiniteArticle)
        .use(retextIntensify)
        .use(retextPassive)
        .use(retextReadability)
        .use(retextRedundantAcronyms)
        .use(retextRepeatedWords)
        .use(retextSimplify)
        .use(retextEquality)
        .use(retextQuotes))
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
      .use(rehypeFootnotesHeading)
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
      .process(await readFile(data.filePath));

    console.warn(reporter(parsedFile));

    const renderedTemplate = await eta.renderAsync("blog-post", {
      ...data,
      routePath,
      readingTime: parsedFile.data.meta.readingTime,
      toc: parsedFile.data.meta.toc,
      content: parsedFile.toString("utf-8"),
    });
    const parsedRenderedTemplate = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, {
        ...defaultRehypeMetaOptions,
        type: "article",
        title: data.title,
        description: data.description,
        readingTime: data.readingTime,
        published: data.date.toISOString(),
        pathname: routePath,
        tags: [
          ...(data?.languages ?? []),
          ...(data?.technologies ?? []),
        ],
      })
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedRenderedTemplate.toString("utf-8");
  };

  const renderBlogCollectionRoute = async ({ type, routePath, data }) => {
    if (type !== "blog-collection") return;
    const renderedTemplate = await eta.renderAsync("blog-collection", {
      ...data,
      routePath,
    });
    const parsedRenderedTemplate = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, {
        ...defaultRehypeMetaOptions,
        title: data.title,
        pathname: data.routePath,
      })
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedRenderedTemplate.toString("utf-8");
  };

  const renderRssFeedRoute = async ({ type, routePath, data }) => {
    if (type !== "rss") return;
    const rss = new RSS({
      title: defaultRehypeMetaOptions.name,
      description: "My personal dev blog",
      site_url: defaultRehypeMetaOptions.origin,
      image_url: defaultRehypeMetaOptions.image.url,
      feed_url: path.join(defaultRehypeMetaOptions.origin, routePath),
      language: defaultRehypeDocumentOptions.language,
      categories: defaultRehypeMetaOptions.siteTags,
      managingEditor: defaultRehypeMetaOptions.author,
      webMaster: defaultRehypeMetaOptions.author,
    });
    data.posts.slice(0, 500).forEach(post => {
      rss.item({
        title: post.title,
        description: post.description,
        url: path.join(defaultRehypeMetaOptions.origin, post.routePath),
        date: post.date,
        categories: [
          ...(post?.languages ?? []),
          ...(post?.technologies ?? []),
        ],
      });
    });
    const xml = rss.xml({ indent: true });
    return xml;
  };

  const renderExperiencesRoute = async ({ type, routePath, data }) => {
    if (type !== "experience") return;
    const { experiences, ...restData } = data;
    const renderedExperiences = await Promise.all(experiences.map(async experience => {
      const parsedFile = await unified()
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
        .process(await readFile(experience.filePath));
      return {
        ...experience,
        content: parsedFile.toString("utf-8"),
      };
    }));
    const renderedTemplate = await eta.renderAsync("experience", {
      ...restData,
      routePath,
      experiences: renderedExperiences,
    });
    const parsedRenderedTemplate = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, {
        ...defaultRehypeMetaOptions,
        title: "Experience",
        pathname: routePath,
      })
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedRenderedTemplate.toString("utf-8");
  };

  const renderProjectsRoute = async ({ type, routePath, data }) => {
    if (type !== "projects") return;
    const { projects, ...restData } = data;
    const renderedProjects = await Promise.all(projects.map(async project => {
      const parsedFile = await unified()
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
        .process(await readFile(project.filePath));
      return {
        ...project,
        content: parsedFile.toString("utf-8"),
      };
    }));
    const renderedTemplate = await eta.renderAsync("projects", {
      ...restData,
      routePath,
      projects: renderedProjects,
    });
    const parsedRenderedTemplate = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, {
        ...defaultRehypeMetaOptions,
        title: "Projects",
        pathname: routePath,
      })
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedRenderedTemplate.toString("utf-8");
  };

  const renderSlidesRoute = async ({ type, routePath, data }) => {
    if (type !== "slides") return;
    const renderedTemplate = await eta.renderAsync("slides", { ...data });
    const parsedRenderedTemplate = await unified()
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
        title: data.title,
        pathname: routePath,
        tags: [
          ...(data?.languages ?? []),
          ...(data?.technologies ?? []),
        ],
      })
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedRenderedTemplate.toString("utf-8");
  };

  const renderSlidesMarkdownRoute = async ({ type, data }) => {
    if (type !== "slides-markdown") return;
    const parsedFile = await unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkRemoveFrontmatter)
      .use(remarkStringify, { rule: "-" })
      .process(await readFile(data.filePath));
    return parsedFile.toString("utf-8");
  };

  return {
    async writeRoutes({ routesUpdated, routesRemoved = [] }) {
      await Promise.all(routesRemoved.map(async ({ filePath, routePath }) => {
        const isDir = routePath.endsWith("/");
        const distFilePath = isDir
            ? path.join(distDir, filePath || routePath, "index.html")
            : path.join(distDir, filePath || routePath);
          await rm(distFilePath, { recursive: isDir, force: true });
        console.info("Route '%s' removed, deleted '%s'", routePath, distFilePath);
      }));
      await Promise.all(routesUpdated.map(async ({ type, filePath, routePath, data }) => {
        const rendered =
          await renderBlogPostRoute({ type, routePath, data }) ||
          await renderBlogCollectionRoute({ type, routePath, data }) ||
          await renderRssFeedRoute({ type, routePath, data }) ||
          await renderSlidesRoute({ type, routePath, data }) ||
          await renderSlidesMarkdownRoute({ type, routePath, data }) ||
          await renderExperiencesRoute({ type, routePath, data }) ||
          await renderProjectsRoute({ type, routePath, data }) ||
          await renderHomeRoute({ type, routePath, data });
        if (rendered) {
          const isDir = routePath.endsWith("/");
          const distFilePath = isDir
            ? path.join(distDir, filePath || routePath, "index.html")
            : path.join(distDir, filePath || routePath);
          await mkdir(path.dirname(distFilePath), { recursive: true });
          await writeFile(distFilePath, rendered);
          console.info("Route '%s' rendered to '%s'", routePath, distFilePath);
        } else {
          console.error("Route '%s' has unsupported type '%s'", routePath, type);
        }
      }));
    },
    stopWriter() {
      mermaidStop();
    }
  }
}
