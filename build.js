import { rm, cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { glob } from "glob";
import { unified } from "unified";
import { h } from "hastscript";
import { toString } from "hast-util-to-string";
import { matter } from "vfile-matter";
import { Eta } from "eta";

import autoprefixer from "autoprefixer";
import postcss from "postcss";
import postcssNesting from "postcss-nesting";
import createTailwindCss from "tailwindcss";
import tailwindCssTypography from "@tailwindcss/typography";
import defaultTheme from "tailwindcss/defaultTheme.js";
import colors from "tailwindcss/colors.js";
import color from "color";

import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype";

import rehypeParse from "rehype-parse";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeToc from "@jsdevtools/rehype-toc";
import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";

const srcDir = "./src";
const tempDir = "./temp";
const distDir = "./dist";

const eta = new Eta({ views: path.join(srcDir, "templates") });

console.log("Clearing temp");
await rm(tempDir, { recursive: true, force: true });
console.log("Cleared temp");

console.log("Clearing dist");
await rm(distDir, { recursive: true, force: true });
console.log("Cleared dist");

const store = {
  blog: [],
  experience: [],
  projects: [],
};

const blogPosts = async () => {
  console.log("Loading blog posts");
  const srcMdFilePaths = await glob(srcDir + "/blog/*/*/*/*/index.md");
  await Promise.all(srcMdFilePaths.map(async srcFilePath => {
    const srcFilePathParsed = path.parse(srcFilePath);
    const parsedFile = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      // TODO: mermaid diagrams, code highlighting
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeToc, {
        customizeTOC(toc) {
          const heading = h("h1", { "id": "__contents" }, "Contents");
          toc.children.unshift(heading);
          return toc;
        },
      })
      .use(rehypeAutolinkHeadings, {
        behavior: "append",
        headingProperties: { "class": "group" },
        properties: { "class": "group-hover:inline-block" },
        content(node) {
          return [
            h("i.fa-solid fa-link", { "aria-hidden": "true" }),
            h("span", `Go to ${toString(node)} section`),
          ];
        },
        test(node) {
          return node.properties.id !== "__contents";
        },
      })
      .use(rehypeStringify)
      .process(await readFile(srcFilePath));
    const data = parsedFile.data.matter;
    const relativePath = path.relative(srcDir, srcFilePathParsed.dir);
    const [year, month, day] = relativePath.split(path.sep).slice(1, 4);
    data.date = new Date(`${year}-${month}-${day} ${data.time}`);
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
  const srcMdFilePaths = await glob(srcDir + "/experience/**/*.md");
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
  const srcMdFilePaths = await glob(srcDir + "/projects/**/*.md");
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
  const primaryColor = "#f8bb15";
  const lighten = (clr, val) => color(clr).lighten(val).rgb().string();
  const darken = (clr, val) => color(clr).darken(val).rgb().string();
  const tailwindCss = createTailwindCss({
    content: [
      path.join(srcDir, "/templates/**/*.eta")
    ],
    theme: {
      extend: {
        screens: {
          "xl": "1380px",
        },
        typography: {
          primary: {
            css: {
              "--tw-prose-links": darken(primaryColor, .2),
            },
          },
        },
        colors: {
          gray: colors.neutral,
          primary: {
            "light": lighten(primaryColor, .2),
            "DEFAULT": primaryColor,
            "dark": darken(primaryColor, .2),
          },
        },
        fontFamily: {
          "logo": ["Slabo\\ 27px", ...defaultTheme.fontFamily.serif],
          "sans": ["Open\\ Sans", ...defaultTheme.fontFamily.sans],
          "serif": ["Bree\\ Serif", ...defaultTheme.fontFamily.serif],
          "mono": ["Source\\ Code\\ Pro", ...defaultTheme.fontFamily.mono],
        },
        boxShadow: {
          "primary-b": `rgb(248, 187, 21) 0px -6px 0px 0px inset`
        },
      },
    },
    plugins: [
      tailwindCssTypography,
    ],
    safelist: [
      "group",
      "group-hover:inline-block",
    ],
  });
  const srcFilePath = path.join(
    srcDir,
    "css/main.css");
  const distFilePath = path.join(
    distDir,
    path.relative(srcDir, srcFilePath));
  const content = await readFile(srcFilePath);
  const plugins = [
    postcssNesting,
    tailwindCss,
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
  const srcImgFilePaths = await glob(srcDir + "/blog/**/*.png");
  await Promise.all(srcImgFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      path.relative(srcDir, srcFilePath));
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
          "/vendor/font-awesome/css/fontawesome.css",
          "/vendor/font-awesome/css/brands.css",
          "/vendor/font-awesome/css/solid.css",
        ],
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
  copyStaticAssets(),
  copyBlogAssets(),
  renderBlogPosts(),
]);

// Mermaid JS
// Syntax highlighting
// Finish heading links (hide on hover)
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
