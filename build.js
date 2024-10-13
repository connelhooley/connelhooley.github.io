import { rm, cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { glob } from "glob";
import { unified } from "unified";
import { matter } from "vfile-matter";
import { Eta } from "eta";

import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from 'remark-gfm'
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
      // TODO: Heading anchor tags, mermaid diagrams, code highlighting
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(await readFile(srcFilePath));
    const data = parsedFile.data.matter;
    const date = new Date(data.date);
    if (data.draft) {
      return;
    }
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
      srcFilePathParsed.name.toLocaleLowerCase() === "index" ? "" : srcFilePathParsed.name);
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
  blog(),
  experience(),
  projects()
]);

const renderBlog = async () => {
  console.log("Rendering blog posts");
  await Promise.all(store.blog.map(async post => {
    const content = await readFile(post.meta.tempFilePath);
    const renderedTemplate = await eta.renderAsync("blog", { content, ...post });
    const parsedFile = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeDocument, {
        title: `Connel Hooley - ${post.data.title}`,
        language: "en-GB",
      })
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(renderedTemplate);
    await mkdir(path.dirname(post.meta.distFilePath), { recursive: true });
    await writeFile(post.meta.distFilePath, parsedFile.toString("utf-8"));
  }));
  console.log("Rendered blog posts");
};

await Promise.all([
  renderBlog(),
]);

// TODO render blog post pages
// TODO render experience page
// TODO render projects page
// TODO render home page
// TODO render blog home page
// TODO render tag pages

// TODO Tailwind?

const distApiPath = path.join(distDir, "api.json");
await mkdir(path.dirname(distApiPath), { recursive: true });
await writeFile(distApiPath, JSON.stringify(store, null, 2));
