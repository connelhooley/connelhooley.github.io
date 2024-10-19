import { rm, cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { glob } from "glob";
import { unified } from "unified";
import { h } from "hastscript";
import { toString } from "hast-util-to-string";
import { matter } from "vfile-matter";
import { Eta } from "eta";

import babel from "@babel/core";

import postcss from "postcss";
import postcssNesting from "postcss-nesting";
import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";

import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype";

import rehypeParse from "rehype-parse";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeToc from "@connelhooley/rehype-toc";
import rehypeMermaid, { mermaidStart, mermaidStop } from "@connelhooley/rehype-mermaid";
import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";

const srcDir = "./src";
const tempDir = "./temp";
const distDir = "./dist";

const eta = new Eta({ views: path.join(srcDir, "templates") });

console.log("Clearing temp");
await rm(tempDir, { recursive: true, force: true });
await mkdir(tempDir);
console.log("Cleared temp");

console.log("Clearing dist");
await rm(distDir, { recursive: true, force: true });
await mkdir(distDir);
console.log("Cleared dist");

const store = {
  blog: [],
  experience: [],
  projects: [],
};

const blogPosts = async () => {
  console.log("Loading blog posts");
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
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        behavior: "append",
        headingProperties: { "class": "heading" },
        properties: { "class": "link" },
        content(node) {
          return [
            h("span", [
              h("i.fa-solid fa-link", { "aria-hidden": "true" }),
              h("span", `Go to ${toString(node)} section`),
            ]),
          ];
        },
        test(node) {
          return node.properties.id !== "__contents";
        },
      })
      .use(rehypeToc)
      .use(rehypeHighlight, {
        plainText: ["mermaid"],
      })
      .use(rehypeMermaid)
      .use(rehypeStringify)
      .process(await readFile(srcFilePath));
    const data = parsedFile.data.matter;
    const relativePath = path.relative(path.join(srcDir, "content"), srcFilePathParsed.dir);
    const [year, month, day] = relativePath.split(path.sep).slice(1, 4);
    data.date = new Date(`${year}-${month}-${day}T${data.time}Z`);
    if (data.draft) return;
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
    store.blog.push({
      route,
      meta: {
        srcFilePath,
        tempFilePath,
        distFilePath,
      },
      data,
    });
  }));
  mermaidStop();
  store.blog.sort((a, b) => {
    const dateA = new Date(a.data.date);
    const dateB = new Date(b.data.date);
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    return 0;
  });
  store.blog.forEach((post, index) => {
    if (index > 0) {
      const { prev, next, ...nextPost } = store.blog[index - 1]
      post.next = nextPost;
    }
    if (index + 1 <= store.blog.length - 1) {
      const { prev, next, ...prevPost } = store.blog[index + 1]
      post.prev = prevPost;
    }
  });
  console.log("Loaded blog posts");
};

const experience = async () => {
  console.log("Loading experience");
  const srcMdFilePaths = await glob(srcDir + "/content/experience/**/*.md");
  await Promise.all(srcMdFilePaths.map(async srcFilePath => {
    const parsedFile = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await readFile(srcFilePath));
    store.experience.push({
      content: parsedFile.toString("utf-8"),
      data: parsedFile.data.matter,
    });
  }));
  store.experience.sort((a, b) => {
    const startA = a.data.start;
    const startB = b.data.start;
    if (startA < startB) return 1;
    if (startA > startB) return -1;
    return 0;
  });
  console.log("Loaded experience");
};

const projects = async () => {
  console.log("Loading projects");
  const srcMdFilePaths = await glob(srcDir + "/content/projects/**/*.md");
  await Promise.all(srcMdFilePaths.map(async srcFilePath => {
    const parsedFile = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(await readFile(srcFilePath));
    store.projects.push({
      content: parsedFile.toString("utf-8"),
      data: parsedFile.data.matter,
    });
  }));
  store.projects.sort((a, b) => {
    const orderA = new Date(a.data.order);
    const orderB = new Date(b.data.order);
    if (orderA < orderB) return -1;
    if (orderA > orderB) return 1;
    return 0;
  });
  console.log("Loaded projects");
};

// Populate store and temp
await Promise.all([
  blogPosts(),
  experience(),
  projects()
]);

const buildCss = async () => {
  console.log("Building CSS");
  const srcFilePath = path.join(
    srcDir,
    "styles/main.css");
  const distFilePath = path.join(
    distDir,
    "css/main.css");
  const content = await readFile(srcFilePath);
  const plugins = [
    postcssImport,
    postcssNesting,
    autoprefixer,
  ];
  const result = await postcss(plugins).process(content, { from: srcFilePath, to: distFilePath });
  await mkdir(path.dirname(distFilePath), { recursive: true });
  await writeFile(distFilePath, result.css);
  if (result.map) {
    await writeFile(distFilePath + ".map", result.map);
  }
  console.log("Built CSS");
};

const buildJs = async () => {
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
  console.log("Building JS");
};

const copyStaticAssets = async () => {
  console.log("Loading static assets");
  const srcFilePaths = await glob(srcDir + "/static/**/*", { nodir: true });
  await Promise.all(srcFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "static"), srcFilePath));
    await cp(srcFilePath, distFilePath);
  }));
  console.log("Loaded static assets");
};

const copyBlogAssets = async () => {
  console.log("Loading blog assets");
  const srcImgFilePaths = await glob(srcDir + "/content/blog/**/*.png");
  await Promise.all(srcImgFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "content"), srcFilePath));
    await cp(srcFilePath, distFilePath);
  }));
  console.log("Loaded blog assets");
};

const renderBlogPosts = async () => {
  console.log("Rendering blog posts");
  await Promise.all(store.blog.map(async post => {
    const content = await readFile(post.meta.tempFilePath);
    const renderedTemplate = await eta.renderAsync("blog-post", { content, ...post });
    const parsedFile = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, {
        title: `Connel Hooley - ${post.data.title}`,
        language: "en-GB",
        css: [
          "/css/main.css",
          "/vendor/highlight.js/css/ir-black.min.css",
          "/vendor/font-awesome/css/fontawesome.css",
          "/vendor/font-awesome/css/brands.css",
          "/vendor/font-awesome/css/solid.css",
        ],
        js: [
          "/js/copy-code.js",
          "/js/mobile-menu.js"
        ]
      })
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    await mkdir(path.dirname(post.meta.distFilePath), { recursive: true });
    await writeFile(post.meta.distFilePath, parsedFile.toString("utf-8"));
  }));
  console.log("Rendered blog posts");
};

// Populate dist
await Promise.all([
  buildCss(),
  buildJs(),
  copyStaticAssets(),
  copyBlogAssets(),
  renderBlogPosts(),
]);

// Mermaid JS
// Copy code button
// TODO render blog post pages
// TODO render experience page
// TODO render projects page
// TODO render home page
// TODO render blog home page
// TODO render tag pages

// TODO RSS
// TODO Slides

const distApiPath = path.join(distDir, "api.json");
await mkdir(path.dirname(distApiPath), { recursive: true });
await writeFile(distApiPath, JSON.stringify(store, null, 2));