import { glob, watch, readFile, writeFile, rm, mkdir } from "fs/promises";
import path from "path";

import { VFile } from "vfile";
import { matter } from "vfile-matter";

// - Load API in memory
// - Build website
//   - Build the home page
//   - Build the experience page
//   - Build the projects page
//   - Build the blog paged collection
//   - Build the RSS feed
//   - Build a technology paged collection
//   - Build a language paged collection
//   - Build a blog post
//   - Build a slide page
//   - Build the CSS
//   - Build the JS
//   - Copy a content asset
//   - Copy a static asset
// - Watch website
//   - Blog post added
//   - Blog post removed
//   - Blog post updated without date change
//   - Blog post updated with date change
//   - Experience changed
//   - Project changed
//   - Slides added
//   - Slides removed
//   - Slides updated
//   - Content asset added
//   - Content asset removed
//   - Content asset updated
//   - Static asset added
//   - Static asset removed
//   - Static asset updated
//   - Watch CSS
//   - Watch JS







class ContentStore {
  #store = {};
  #onInsert;
  #onUpdate;
  #onDelete;

  constructor({ onInsert, onUpdate, onDelete }) {
    this.#onInsert = onInsert;
    this.#onUpdate = onUpdate;
    this.#onDelete = onDelete;
  }

  async load({ dir }) {
    for await (const dirent of glob(`${dir}/**/*.md`, { withFileTypes: true })) {
      if (dirent.isFile()) {
        const filePath = path.join(dirent.parentPath, dirent.name);
        const fileContent = await readFile(filePath);
        this.#set({ filePath, fileContent });
      }
    }
  }

  async watch({ dir }) {
    for await (const changeEvent of watch(dir, { recursive: true })) {
      if (path.matchesGlob(changeEvent.filename, "**/*.md")) {
        const filePath = changeEvent.filename;
        const fileContent = await readFile(filePath);        
        this.#set({ filePath, fileContent });
      }
    }
  }

  #set({ filePath, fileContent }) {
    const existing = this.#store[filePath];
    const vFile = new VFile(fileContent);
    matter(vFile);
    const meta = vFile.data.matter;
    this.#store[filePath] = meta;
    if (existing && this.#onUpdate) {
      this.#onUpdate({ filePath, new: meta, existing });
    } else if (this.#onInsert) {
      this.#onInsert({ filePath, new: meta });
    }
  }

  #remove({ filePath }) {
    const existing = this.#store[filePath];
    delete this.#store[filePath];
    if (existing) {
      this.#onDelete(filePath, existing);
    }
  }
}

async function createContentStore({ srcContentDir, tempDir, metaExtractor }) {
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir);
  const store = {};
  for await (const srcFileDirent of glob(`${srcContentDir}/**/*.md`, { withFileTypes: true })) {
    if (srcFileDirent.isFile()) {
      const srcFilePath = path.join(srcFileDirent.parentPath, srcFileDirent.name);
      await loadSrcFile({ store, srcContentDir, srcFilePath, metaExtractor });
    }
  }
  await writeFile(path.join(tempDir, "store.json"), JSON.stringify(store));
  return store;
}

async function loadSrcFile({ store, srcContentDir, srcFilePath, metaExtractor }) {
  const srcFileContents = await readFile(srcFilePath);
  const meta = metaExtractor({ srcContentDir, srcFilePath, srcFileContents });
  store[srcFilePath] = { meta };
}

// Create up data store

// Create site map

// Generate site

const metaExtractor = ({ srcContentDir, srcFilePath, srcFileContents }) => {
  const vFile = new VFile(srcFileContents);
  matter(vFile);
  const data = vFile.data.matter;
  const srcContentFilePath = path.relative(srcContentDir, srcFilePath);
  if (path.matchesGlob(srcContentFilePath, "blog/**"))
    return {
      type: "BLOG",
      data,
    };
  if (path.matchesGlob(srcContentFilePath, "experience/**")) {
    return {
      type: "EXPERIENCE",
      data,
    };
  }
  if (path.matchesGlob(srcContentFilePath, "projects/**")) {
    return {
      type: "PROJECT",
      data,
    };
  }
  if (path.matchesGlob(srcContentFilePath, "slides/**")) {
    return {
      type: "SLIDE",
      data,
    };
  }
};

const store = await createContentStore({
  srcContentDir: "./src/content",
  tempDir: "./temp",
  metaExtractor,
});
