import { rm, cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { glob } from "glob";
import { unified } from "unified";
import { matter } from "vfile-matter";

import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from 'remark-gfm'
import remarkRehype from "remark-rehype";

import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const srcDir = "./src";
const distDir = "./dist";

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
    const srcFileContents = await readFile(srcFilePath);
    const srcFilePathParsed = path.parse(srcFilePath);
    const parsed = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      // TODO: Heading anchor tags, mermaid diagrams, code highlighting
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(srcFileContents);      
    const date = new Date(parsed.data.matter.date);    
    if (parsed.data.matter.draft) {
      return;
    }
    const distFilePath = path.join(
      distDir,
      "/",
      "blog",
      date.getFullYear().toString().padStart(4, "0"),
      (date.getMonth() + 1).toString().padStart(2, "0"),
      date.getDate().toString().padStart(2, "0"),
      path.relative(path.join(srcDir, "blog"), srcFilePathParsed.dir),
      srcFilePathParsed.name + ".html");
    const route = path.join(
      "/",
      "blog",
      date.getFullYear().toString().padStart(4, "0"),
      (date.getMonth() + 1).toString().padStart(2, "0"),
      date.getDate().toString().padStart(2, "0"),
      path.relative(path.join(srcDir, "blog"), srcFilePathParsed.dir),
      srcFilePathParsed.name.toLocaleLowerCase() === "index" ? "" : srcFilePathParsed.name);      
    await mkdir(path.dirname(distFilePath), { recursive: true });
    await writeFile(distFilePath, parsed.toString("utf-8"));
    store.blog.push({
      route,
      distFilePath,
      matter: parsed.data.matter,
    });
    const srcImgFilePaths = await glob(srcFilePathParsed.dir + "/**/*.png");
    await Promise.all(srcImgFilePaths.map(async srcImgFilePath => {
      const srcImgFilePathParsed = path.parse(srcImgFilePath);
      const distImgFilePath = path.join(
        path.dirname(distFilePath),
        srcImgFilePathParsed.name + srcImgFilePathParsed.ext);
      await cp(srcImgFilePath, distImgFilePath);
    }));
  }));
  store.blog.sort((a, b) => {
    const dateA = new Date(a.matter.date);
    const dateB = new Date(b.matter.date);
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    return 0;
  });
  store.blog.forEach((post, index) => {
    if (index > 0) {
      const {prev, next, ...nextPost} = store.blog[index - 1]
      post.next = nextPost;
    }
    if (index + 1 <= store.blog.length - 1) {
      const {prev, next, ...prevPost} = store.blog[index + 1]
      post.prev = prevPost;
    }
  });
  // TODO render into pages using template engine
  console.log("Loaded blog");
};

const experience = async () => {
  console.log("Loading experience");
  const srcMdFilePaths = await glob(srcDir + "/experience/**/*.md");
  await Promise.all(srcMdFilePaths.map(async srcFilePath => {
    const srcFileContents = await readFile(srcFilePath);
    const parsed = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(srcFileContents);
    store.experience.push({
      matter: parsed.data.matter,
      parsed: parsed.toString("utf-8"),
    });
  }));
  store.experience.sort((a, b) => {
    const startA = a.matter.start;
    const startB = b.matter.start;
    if (startA < startB) return 1;
    if (startA > startB) return -1;
    return 0;
  });  
  // TODO render into projects page using a template engine
  console.log("Loaded experience");
};

const projects = async () => {
  console.log("Loading projects");
  const srcMdFilePaths = await glob(srcDir + "/projects/**/*.md");
  await Promise.all(srcMdFilePaths.map(async srcFilePath => {
    const srcFileContents = await readFile(srcFilePath);
    const parsed = await unified()
      .use(() => (_, file) => matter(file))
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(srcFileContents);
    store.projects.push({
      matter: parsed.data.matter,
      parsed: parsed.toString("utf-8"),
    });
  }));
  store.projects.sort((a, b) => {
    const orderA = new Date(a.matter.order);
    const orderB = new Date(b.matter.order);
    if (orderA < orderB) return -1;
    if (orderA > orderB) return 1;
    return 0;
  });
  
  // TODO render into projects page using a template engine
  console.log("Loaded projects");
};

// TODO home page

await Promise.all([
  blog(),
  experience(),
  projects()
]);

const distApiPath = path.join(distDir, "api.json");
await mkdir(path.dirname(distApiPath), { recursive: true });
await writeFile(distApiPath, JSON.stringify(store, null, 2));