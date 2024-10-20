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
const defaultRehypeDocumentOptions = {
  title: "Connel Hooley",
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

const paginate = (array, pageSize) => {
  const result = [];
  for (let i = 0; i < array.length; i += pageSize) {
    const page = array.slice(i, i + pageSize);
    result.push(page);
  }
  return result;
};

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
  console.log("Built JS");
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

const renderHome = async () => {
  console.log("Rendering home");
  // TODO Supply data?
  const renderedTemplate = await eta.renderAsync("home", {});
  const parsedFile = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeDocument, defaultRehypeDocumentOptions)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(renderedTemplate);
  await writeFile(path.join(distDir, "index.html"), parsedFile.toString("utf-8"));
  console.log("Rendered home");
};

const renderExperience = async () => {
  const experiences = await loadExperienceContent();
  console.log("Rendering experience page");
  const renderedTemplate = await eta.renderAsync("experience", {
    route: "/experience/",
    items: experiences,
  });
  const parsedFile = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeDocument, defaultRehypeDocumentOptions)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(renderedTemplate);
  const distFilePath = path.join(distDir, "experience", "index.html");
  await mkdir(path.dirname(distFilePath), { recursive: true });
  await writeFile(distFilePath, parsedFile.toString("utf-8"));
  console.log("Rendered experience page");
};

const renderProjects = async () => {
  const projects = await loadProjectsContent();
  console.log("Rendering projects page");
  const renderedTemplate = await eta.renderAsync("projects", {
    route: "/projects/",
    items: projects,
  });
  const parsedFile = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeDocument, defaultRehypeDocumentOptions)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(renderedTemplate);
  const distFilePath = path.join(distDir, "projects", "index.html");
  await mkdir(path.dirname(distFilePath), { recursive: true });
  await writeFile(distFilePath, parsedFile.toString("utf-8"));
  console.log("Rendered projects page");
};

const renderBlog = async () => {
  const renderBlogPosts = async ({ posts }) => {
    console.log("Rendering blog posts");
    await Promise.all(posts.map(async post => {
      const content = await readFile(post.meta.tempFilePath);
      const renderedTemplate = await eta.renderAsync("blog-post", { content, ...post });
      const parsedFile = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeDocument, {
          ...defaultRehypeDocumentOptions,
          title: `${defaultRehypeDocumentOptions.title} - ${post.data.title}`,
        })
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(renderedTemplate);
      await mkdir(path.dirname(post.meta.distFilePath), { recursive: true });
      await writeFile(post.meta.distFilePath, parsedFile.toString("utf-8"));
    }));
    console.log("Rendered blog posts");
  };  
  const renderPagedCollection = async ({ items, basePath, baseRoute, pageSize = 5, title, isTechnologies = false, isLanguage = false }) => {
    console.log(`Rendering '${title}' paged collection`);
    const pages = paginate(items, pageSize);
    const pageCount = pages.length;
    await Promise.all(pages.map(async (page, i) => {
      const currentPage = i + 1;
      const prevPage = currentPage === 1 ? null : currentPage - 1;
      const nextPage = currentPage === pageCount ? null : currentPage + 1;
      const renderedTemplate = await eta.renderAsync("paged-collection", {
        route: currentPage === 1 ? baseRoute : baseRoute + "page/" + currentPage,
        title,
        baseRoute,
        isTechnologies,
        isLanguage,
        page,
        currentPage,
        pageCount,
        nextPage,
        prevPage,
      });
      const parsedFile = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeDocument, defaultRehypeDocumentOptions)
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(renderedTemplate);
      const distFilePath = currentPage === 1
        ? path.join(distDir, basePath, "index.html")
        : path.join(distDir, basePath, "page", currentPage.toString(), "index.html");
      await mkdir(path.dirname(distFilePath), { recursive: true });
      await writeFile(distFilePath, parsedFile.toString("utf-8"));
    }));
    console.log(`Rendered '${title}' paged collection`);
  };
  const renderApi = async ({ posts }) => {
    const api = {
      posts: posts.map(({route, data}) => ({route, data})),
    };
    const distApiPath = path.join(distDir, "api.json");
    await writeFile(distApiPath, JSON.stringify(api, null, 2));
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
        basePath: path.join("blog", "languages", language),
        baseRoute: `/blog/languages/${encodeURIComponent(language)}/`,
        title: language,
        isLanguage: true,
        pageSize: 5,
      });
    }),
    ...Array.from(technologies).map(technology => {
      return renderPagedCollection({
        items: posts.filter(post => post.data?.technologies?.includes(technology)),
        basePath: path.join("blog", "technologies", technology),
        baseRoute: `/blog/technologies/${encodeURIComponent(technology)}/`,
        title: technology,
        isTechnologies: true,
        pageSize: 5,
      });
    }),
    renderApi({ posts }),
  ]);
};

// Populate dist
await Promise.all([
  buildCss(),
  buildJs(),
  copyStaticAssets(),
  copyBlogAssets(),
  renderHome(),
  renderExperience(),
  renderProjects(),
  renderBlog(),
]);

// TODO finish blog post pages
// TODO finish experience page
// TODO finish projects page
// TODO finish home page
// TODO finish blog page
// TODO finish language page
// TODO finish technology page

// TODO RSS
// TODO SEO tags (rehype-meta)
// TODO Slides
