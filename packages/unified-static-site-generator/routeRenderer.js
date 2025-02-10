import path from "path";
import { readFile } from "fs/promises";

import RSS from "rss";

import { unified } from "unified";
import { h } from "hastscript";
import { toString } from "hast-util-to-string";

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
import rehypeFootnotesHeading from "@connelhooley/rehype-footnotes-heading";
import rehypeCopyCodeButton from "@connelhooley/rehype-copy-code-button";
import rehypeMermaid, { mermaidStart, mermaidStop } from "@connelhooley/rehype-mermaid";
import rehypeNoJs from "@connelhooley/rehype-no-js";

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

export async function renderRoute({ route, contentStore, templateRenderer, srcDir }) {
  if (route.path === "/") {
    const renderedTemplate = await templateRenderer("home");
    const parsedFile = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, defaultRehypeMetaOptions)
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedFile.toString("utf-8");
  } else if (route.path === "/feed.xml") {
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
      contentStore["blog"]
      .slice(0, 500)
      .forEach(post => {
        rss.item({
          title: post.title,
          description: post.description,
          url: path.join(defaultRehypeMetaOptions.origin, post.route.path),
          date: post.date,
          categories: [
            ...(post.languages ?? []),
            ...(post.technologies ?? []),
          ],
        });
      });
    const xml = rss.xml({ indent: true });
    return xml;
  } else if (route.path === "/experience/") {
    const experiences = await Promise.all(contentStore["experience"]
      .map(async experience => {
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
          .process(await readFile(path.join(srcDir, "content", experience.srcContentFilePath)));
        return {
          content: parsedFile.toString("utf-8"),
          data: experience,
        };
      }));
    const renderedTemplate = await templateRenderer("experience", {
      route: route.path,
      items: experiences,
    });
    const parsedFile = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, {
        ...defaultRehypeMetaOptions,
        title: "Experience",
        pathname: route.path,
      })
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedFile.toString("utf-8");
  } else if (route.path === "/projects/") {
    const projects = await Promise.all(contentStore["projects"]
      .map(async project => {
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
          .process(await readFile(path.join(srcDir, "content", project.srcContentFilePath)));
        return {
          content: parsedFile.toString("utf-8"),
          data: project,
        };
      }));
    const renderedTemplate = await templateRenderer("projects", {
      route: route.path,
      items: projects,
    });
    const parsedFile = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, defaultRehypeDocumentOptions)
      .use(rehypeMeta, {
        ...defaultRehypeMetaOptions,
        title: "Projects",
        pathname: route.path,
      })
      .use(rehypeNoJs)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    return parsedFile.toString("utf-8");
  } else if (route.path === "/blog/") {
  } else if (route.path.match(/^\/blog\/page\/\d+\/$/)) {
  } else if (route.path.match(/^\/blog\/technologies\/[^\/]+\/$/)) {
  } else if (route.path.match(/^\/blog\/technologies\/[^\/]+\/page\/\d+\/$/)) {
  } else if (route.path.match(/^\/blog\/languages\/[^\/]+\/$/)) {
  } else if (route.path.match(/^\/blog\/languages\/[^\/]+\/page\/\d+\/$/)) {
  } else if (route.path.match(/^\/blog\/\d+\/\d+\/\d+\/[^\/]+\/$/)) {
  } else if (route.path.match(/^\/slides\/[^\/]+\/$/)) {
    // Need to figure out how to write 2 files
  } else {
  }
}