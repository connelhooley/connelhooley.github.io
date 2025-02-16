import path from "path";
import { glob, watch } from "fs/promises";

import { minimatch } from "minimatch";

import { createContentStore } from "./content-store.js";
import { createPager } from "./pager.js";
import { createRenderer } from "./renderer.js";

export async function generateSite({ srcDir, distDir }) {
  console.log("Started building site");
  const { refreshContentStore, getContent } = createContentStore({ srcDir });
  const { getHomePage, getContentPages } = createPager({ getContent });
  const { renderPages, stopRenderer } = await createRenderer({ srcDir, distDir });
  
  const contentFilePaths = [];
  for await (const fileDirent of glob(`${srcDir}/content/{blog,experience,projects,slides}/**/*.md`, { withFileTypes: true })) {
    if (fileDirent.isFile()) {
      const filePath = path.join(fileDirent.parentPath, fileDirent.name);
      contentFilePaths.push(filePath);
      // Handle file deletions
    }
  }

  const { homePage } = getHomePage();
  const { changedPageIds } = await refreshContentStore({ contentFilePaths });
  const { contentPages } = getContentPages({ pageIds: changedPageIds });
  await renderPages({ pages: [homePage, ...contentPages] });

  console.log("Finished building site");

  const ac = new AbortController();

  return {
    async watch() {
      try {
        // const { getImpactedPages } = createTemplateTracker({ getContent, getHomePage, getContentPages });
        const watcher = watch(srcDir, { signal: ac.signal, recursive: true, withFileTypes: true });
        for await (const event of watcher) {
          if (fileDirent.isFile()) {
            const filePath = path.join(fileDirent.parentPath, fileDirent.name);
            const srcFilePath = path.relative(filePath, srcDir);
            if (minimatch(srcFilePath, "content/**/*")) {
              const { changedPageIds } = await refreshContentStore({ contentFilePaths: [filePath] });
              const { contentPages } = getContentPages({ pageIds: changedPageIds });
              await renderPages({ pages: contentPages });
            }
            if (minimatch(srcFilePath, "templates/**/*")) {
              // TODO: Render pages impacted by template changes
              // const { impactedPages } = getImpactedPages({ templateFilePaths: [filePath] });
              // await renderPages({ pages: impactedPages });
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        throw err;
      }
    },
    stop() {
      stopRenderer();
      ac.abort();
    }
  }
}