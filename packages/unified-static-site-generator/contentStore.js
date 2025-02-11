import { readFile, glob, access } from "fs/promises";
import path from "path";

import { VFile } from "vfile";
import { matter } from "vfile-matter";

import {
  generateStaticRoute,
  generateBlogPostRoute,
  generateSlideRoute,
  generateBlogPagedRoute,
  generateLanguagePagedRoute,
  generateTechnologyPagedRoute,
  generatePageNumbers } from "./routes.js";

export class ContentStore {
  constructor({ srcDir }) {
    this.#srcDir = srcDir;
  }
  #srcDir;
  #posts = [];
  #slides = [];
  #routes = [];
  #languages = new Set([]);
  #technologies = new Set([]);

  get posts() {
    return this.#posts;
  }

  get languages() {
    return [...this.#languages];
  }

  get technologies() {
    return [...this.#technologies];
  }

  async loadSourceFiles({ srcFilePaths }) {
    const changesDetected = {
      postRoutes: [],
      slidesRoutes: [],
      blogCollection: false,
      languageCollections: new Set([]),
      technologyCollections: new Set([]),
      experience: false,
      projects: false,
    };
    const modifiedRoutes = [];
    const removedRoutes = [];
    await Promise.all(srcFilePaths.map(async filePath => {
      const srcContentFilePath = path.relative(path.join(this.#srcDir, "content"), filePath);
      const contentType = srcContentFilePath.split(path.sep)[0];
      const srcFileContents = await readFile(filePath, { encoding: "utf-8" });
      const vFile = new VFile(srcFileContents);
      matter(vFile);
      const data = vFile.data.matter;
      if (contentType === "blog") {
        const blogFilePath = path.relative(path.join(this.#srcDir, "content", "blog"), filePath);
        data.route = generateBlogPostRoute({ blogFilePath });
        data.date = new Date(`${data.route.params.year}-${data.route.params.month}-${data.route.params.day}T${data.time}Z`)

        const existingIndex = this.#posts.findIndex(post => post.filePath === filePath);
        if (process.env.NODE_ENV !== "development" && data.draft) {
          if (existingIndex !== -1) {
            this.#posts.splice(existingIndex, 1);
            changesDetected.blogCollection = true;
            data.languages?.forEach(language => changesDetected.languageCollections.add(language));
            data.technologies?.forEach(technology => changesDetected.technologyCollections.add(technology));
          }
          return;
        }

        if (existingIndex === -1) {
          this.#posts.push({ ...data, filePath });
          changesDetected.blogCollection = true;
          data.languages?.forEach(language => changesDetected.languageCollections.add(language));
          data.technologies?.forEach(technology => changesDetected.technologyCollections.add(technology));
        } else {
          const existing = this.#posts[existingIndex];
          this.#posts[existingIndex] = { ...data, filePath };
          const changedValuesInPagedCollections = (existing.title != data.title) || (existing.description != data.description);
          const changedLanguages = [...new Set(existing.languages ?? []).difference(existing.languages ?? [])];
          const changedTechnologies = [...new Set(existing.technologies ?? []).difference(existing.technologies ?? [])];

          if (changedValuesInPagedCollections) {
            changesDetected.blogCollection = true;
            data.languages?.forEach(language => changesDetected.languageCollections.add(language));
            data.technologies?.forEach(technology => changesDetected.technologyCollections.add(technology));
          }
          if (changedLanguages.length) {
            changesDetected.blogCollection = true;
            changedLanguages.forEach(language => changesDetected.languageCollections.add(language));;
          }
          if (changedTechnologies.length) {
            changesDetected.blogCollection = true;
            changedTechnologies.forEach(technology => changesDetected.technologyCollections.add(technology));
          }
        }
        changesDetected.postRoutes.push(data.route);
        data.languages?.forEach(language => this.#languages.add(language));
        data.technologies?.forEach(technology => this.#technologies.add(technology));
      }

      if (contentType === "slides") {
        const existingIndex = this.#slides.findIndex(slides => slides.filePath === filePath);
        const slidesFilePath = path.relative(path.join(this.#srcDir, "content", "slides"), filePath);
        data.route = generateSlideRoute({ slidesFilePath });
        if (existingIndex === -1) {
          this.#posts.push({ ...data, filePath });
        } else {
          this.#posts[existingIndex] = { ...data, filePath };
        }
        changesDetected.slidesRoutes.push(data.route);
      }

      if (contentType === "projects") {
        changesDetected.projects = true;
      }

      if (contentType === "experience") {
        changesDetected.experience = true;
      }
    }));

    if (changesDetected.blogCollection) {
      this.#posts.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      });
    }

    changesDetected.postRoutes.forEach(changedPostRoute => modifiedRoutes.push(changedPostRoute));
    changesDetected.slidesRoutes.forEach(changedSlidesRoute => modifiedRoutes.push(changedSlidesRoute));

    if (changesDetected.blogCollection) {
      modifiedRoutes.push(generateStaticRoute({ path: "/feed.xml" }));
      generatePageNumbers(this.#posts)
        .map(pageNumber => generateBlogPagedRoute({ pageNumber }))
        .forEach(blogPageRoute => modifiedRoutes.push(blogPageRoute));
    }

    [...changesDetected.languageCollections].forEach(changedLanguage => {
      const postsWithChangedLanguage = this.#posts.filter(post => post.languages?.includes(changedLanguage) ?? false);
      generatePageNumbers(postsWithChangedLanguage)
        .map(pageNumber => generateLanguagePagedRoute({ language: changedLanguage, pageNumber }))
        .forEach(changedLanguageRoute => modifiedRoutes.push(changedLanguageRoute));
    });

    [...changesDetected.technologyCollections].forEach(changedTechnology => {
      const postsWithChangedTechnology = this.#posts.filter(post => post.technologies?.includes(changedTechnology) ?? false);
      generatePageNumbers(postsWithChangedTechnology)
        .map(pageNumber => generateTechnologyPagedRoute({ technology: changedTechnology, pageNumber }))
        .forEach(changedTechnologyRoute => modifiedRoutes.push(changedTechnologyRoute));
    });

    if (changesDetected.experience) {
      modifiedRoutes.push(generateStaticRoute({ path: "/experience/" }));
    }

    if (changesDetected.projects) {
      modifiedRoutes.push(generateStaticRoute({ path: "/projects/" }));
    }

    return {
      modifiedRoutes,
      removedRoutes,
    };
  }
}



export async function createContentStore({ srcDir }) {
  const contentStore = {
    "blog": [],
    "languages": [],
    "technologies": [],
    "experience": [],
    "projects": [],
    "slides": [],
  };
  for await (const srcFileDirent of glob(`${srcDir}/content/{blog,experience,projects,slides}/**/*.md`, { withFileTypes: true })) {
    if (srcFileDirent.isFile()) {
      const srcFilePath = path.join(srcFileDirent.parentPath, srcFileDirent.name);
      await updateContentStore({ contentStore, srcFilePath, srcDir });
    }
  }
  await finaliseContentStore({ contentStore });
  return contentStore;
}

export async function updateContentStore({ contentStore, srcFilePath, srcDir }) {
  const srcFileContents = await readFile(srcFilePath, { encoding: "utf-8" });
  const vFile = new VFile(srcFileContents);
  matter(vFile);
  const data = vFile.data.matter;
  const srcContentFilePath = path.relative(path.join(srcDir, "content"), srcFilePath);
  const contentType = srcContentFilePath.split(path.sep)[0];
  const srcContentTypeFilePath = path.relative(path.join(srcDir, "content", contentType), srcFilePath);

  if (process.env.NODE_ENV !== "development" && data.draft) return;

  if (contentType === "blog") {
    data.route = generateBlogPostRoute({ blogFilePath: srcContentTypeFilePath });
    data.date = new Date(`${data.route.params.year}-${data.route.params.month}-${data.route.params.day}T${data.time}Z`)
  } else if (contentType === "slides") {
    data.route = generateSlideRoute({ slidesFilePath: srcContentTypeFilePath });
  }
  const existingIndex = contentStore[contentType].findIndex(item => item.srcContentFilePath === srcContentFilePath);
  if (existingIndex === -1) {
    contentStore[contentType].push({ ...data, srcContentFilePath });
  } else {
    contentStore[contentType][existingIndex] = { ...data, srcContentFilePath };
  }
}

export async function finaliseContentStore({ contentStore }) {
  contentStore["blog"].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
  contentStore["experience"].sort((a, b) => {
    if (a.start < b.start) return 1;
    if (a.start > b.start) return -1;
    return 0;
  });
  contentStore["projects"].sort((a, b) => {
    if (a.order < b.order) return -1;
    if (a.order > b.order) return 1;
    return 0;
  });
  contentStore["languages"] = [...new Set(Object.values(contentStore["blog"]).flatMap(data => data.languages ?? []))];
  contentStore["technologies"] = [...new Set(Object.values(contentStore["blog"]).flatMap(data => data.technologies ?? []))];
  return contentStore;
}
