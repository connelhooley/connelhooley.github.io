import { glob, readFile, writeFile, rm, mkdir } from "fs/promises";
import { createHash } from "crypto";
import path from "path";

const srcDir = "./src";
const srcDirAbs = path.resolve(srcDir);
const tempDir = "./temp";
const distDir = "./dist";

async function createStore({ fileProcessors }) {  
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir);
  const store = {};
  for await (const srcFileDirent of glob(`${srcDir}/**/*`, { withFileTypes: true })) {
    if (srcFileDirent.isFile()) {
      const srcFilePath = path.join(srcFileDirent.parentPath, srcFileDirent.name);
      await loadSrcFile({ store, srcFilePath, fileProcessors });
    }
  }
  await writeFile(path.join(tempDir, "store.json"), JSON.stringify(store));
}

async function loadSrcFile({ store, srcFilePath, fileProcessors }) {
  const srcFileContents = await readFile(srcFilePath);
  const hash = createHash("sha1");
  hash.setEncoding("hex");
  hash.write(srcFileContents);
  hash.end();
  const sum = hash.read();
  if (store[srcFilePath]?.sum === sum) {
    return;
  }

  const fileProcessor = fileProcessors.find(fp => fp.handles({ srcFilePath }));
  if (fileProcessor === undefined) {
    console.warn(`Source file path '${srcFilePath}' not handled`);
    return;
  }

  const { contents, meta } = fileProcessor.process({ srcFileContents });
  await writeFile(path.join(tempDir, sum), contents);
  if (meta) {
    store[srcFilePath] = { sum, meta };
  } else {
    store[srcFilePath] = { sum };
  }
}

// Create up data store


// Create site map

// Generate site

const blogPostFileProcessor = {
  handles({ srcFilePath }) {
    return path.matchesGlob(srcFilePath, srcDirAbs + "/content/blog/**/*.md");
  },
  process({ srcFileContents }) {
    return {
      contents: srcFileContents,
      meta: { type: "BLOG" }
    };
  },
};

const defaultFileProcessor = {
  handles({ srcFilePath }) {
    return true;
  },
  process({ srcFileContents }) {
    return {
      contents: srcFileContents
    };
  },
};

await createStore({
  fileProcessors: [blogPostFileProcessor, defaultFileProcessor],
});
