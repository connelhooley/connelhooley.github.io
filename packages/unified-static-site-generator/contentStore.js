import { readFile, glob } from "fs/promises";
import path from "path";

import { VFile } from "vfile";
import { matter } from "vfile-matter";

export async function updateContentStore({ store, srcFilePath, srcDir }) {
  const srcFileContents = await readFile(srcFilePath, { encoding: "utf-8" });
  const vFile = new VFile(srcFileContents);
  matter(vFile);
  const data = vFile.data.matter;
  const srcContentFilePath = path.relative(path.join(srcDir, "content"), srcFilePath);
  const type = srcContentFilePath.split(path.sep)[0];
  const srcContentTypeFilePath = path.relative(path.join(srcDir, "content", type), srcFilePath);
  store[type][srcContentTypeFilePath] = data;
}

export async function createContentStore({ srcDir }) {
  const store = {
    "blog": {},
    "experience": {},
    "projects": {},
    "slides": {},
  };
  for await (const srcFileDirent of glob(`${srcDir}/content/{blog,experience,projects,slides}/**/*.md`, { withFileTypes: true })) {
    if (srcFileDirent.isFile()) {
      const srcFilePath = path.join(srcFileDirent.parentPath, srcFileDirent.name);
      await updateContentStore({ store, srcFilePath, srcDir });
    }
  }

  return store;
}
