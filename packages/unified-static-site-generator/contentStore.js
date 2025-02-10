import { readFile, glob } from "fs/promises";
import path from "path";

import { VFile } from "vfile";
import { matter } from "vfile-matter";

import { generateBlogPostRoute, generateSlideRoute } from "./routes.js";

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
