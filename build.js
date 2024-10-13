import { rm, cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { glob } from "glob";
import { unified } from "unified";
import { matter } from "vfile-matter";
import { Eta } from "eta";

import autoprefixer from "autoprefixer";
import postcss from "postcss";
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
import rehypeDocument from "rehype-document";
import rehypeSanitize from "rehype-sanitize";
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

const assets = async () => {
  console.log("Loading static");
  const srcFilePaths = await glob(srcDir + "/static/**/*", { nodir: true });
  await Promise.all(srcFilePaths.map(async srcFilePath => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "static"), srcFilePath));
    await cp(srcFilePath, distFilePath);
  }));
  console.log("Loaded static");
};

const blog = async () => {
  console.log("Loading blog");
  const srcMdFilePaths = await glob(srcDir + "/blog/**/*.md");
  await Promise.all(srcMdFilePaths.map(async srcFilePath => {
    const srcFilePathParsed = path.parse(srcFilePath);
    const parsedFile = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      // TODO: TOCs, heading anchor tags, mermaid diagrams, code highlighting
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(await readFile(srcFilePath));
    const data = parsedFile.data.matter;
    const date = new Date(data.date);

    if (data.draft) return;

    const tempFilePath = path.join(
      tempDir,
      "blog",
      date.getFullYear().toString().padStart(4, "0"),
      (date.getMonth() + 1).toString().padStart(2, "0"),
      date.getDate().toString().padStart(2, "0"),
      path.relative(path.join(srcDir, "blog"), srcFilePathParsed.dir),
      srcFilePathParsed.name + ".html");
    const distFilePath = path.join(
      distDir,
      path.relative(tempDir, tempFilePath));
    const route = path.join(
      "/",
      path.dirname(path.relative(tempDir, tempFilePath)),
      srcFilePathParsed.name.toLocaleLowerCase() === "index" ? "/" : srcFilePathParsed.name + ".html");
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
    const srcImgFilePaths = await glob(srcFilePathParsed.dir + "/**/*.png");
    await Promise.all(srcImgFilePaths.map(async srcImgFilePath => {
      const distImgFilePath = path.join(
        distDir,
        path.relative(tempDir, path.dirname(tempFilePath)),
        path.basename(srcImgFilePath));
      await cp(srcImgFilePath, distImgFilePath);
    }));
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
  console.log("Loaded blog");
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
      .use(rehypeSanitize)
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
      .use(rehypeSanitize)
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

await Promise.all([
  assets(),
  blog(),
  experience(),
  projects()
]);

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
  });
  const srcFilePath = path.join(
    srcDir,
    "css/main.css");
  const distFilePath = path.join(
    distDir,
    path.relative(srcDir, srcFilePath));
  const content = await readFile(srcFilePath);
  const plugins = [
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

await Promise.all([
  renderBlogPosts(),
  buildCss(),
]);

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
