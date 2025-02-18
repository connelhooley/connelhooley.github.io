import path from "path";
import { glob, watch, rm, mkdir } from "fs/promises";

import { minimatch } from "minimatch";

import { createContentStore } from "./content-store.js";
import { createPageStore } from "./page-store.js";
import { createRouteWriter } from "./route-writer.js";
import { createTemplateTracker } from "./template-tracker.js";

export async function generateSite({ srcDir, distDir }) {
  console.log("Started building site");
  const { refreshContentStore, getContent } = createContentStore({ srcDir });
  const { refreshPageStore, getRoutes } = createPageStore({ getContent });
  const { writeRoutes, stopWriter } = await createRouteWriter({ srcDir, distDir });

  console.log("Clearing dist");
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir);
  console.log("Cleared dist");

  const contentFilePaths = [];
  for await (const fileDirent of glob(`${srcDir}/content/{blog,experience,projects,slides}/**/*.md`, { withFileTypes: true })) {
    if (fileDirent.isFile()) {
      const filePath = path.join(fileDirent.parentPath, fileDirent.name);
      contentFilePaths.push(filePath);
    }
  }

  const { pagesIdsUpdated, pagesIdsRemoved } = await refreshContentStore({ contentFilePaths });
  const { routesUpdated, routesRemoved } = refreshPageStore({ pagesIdsUpdated: ["home", ...pagesIdsUpdated], pagesIdsRemoved });
  await writeRoutes({ routesUpdated, routesRemoved });

  console.log("Finished building site");

  const ac = new AbortController();

  return {
    async watch() {
      try {
        console.log("Watching site");
        const { getImpactedRouteTypes } = createTemplateTracker();
        const watcher = watch(srcDir, { signal: ac.signal, recursive: true, withFileTypes: true });
        for await (const event of watcher) {
          if (fileDirent.isFile()) {
            const filePath = path.join(fileDirent.parentPath, fileDirent.name);
            const srcFilePath = path.relative(filePath, srcDir);
            if (minimatch(srcFilePath, "content/**/*")) {
              const { pagesIdsUpdated, pagesIdsRemoved } = await refreshContentStore({ contentFilePaths: [filePath] });
              const { routesUpdated, routesRemoved } = refreshPageStore({ pagesIdsUpdated, pagesIdsRemoved });
              await writeRoutes({ routesUpdated, routesRemoved });
            } else if (minimatch(srcFilePath, "templates/**/*")) {
              const { impactedRouteTypes } = getImpactedRouteTypes({ templateFilePaths: [filePath] });
              const { routes } = getRoutes({types: impactedRouteTypes});
              await writeRoutes({ routesUpdated: routes });
            }
          }
          // Handle file deletions
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        throw err;
      }
    },
    stop() {
      console.log("Stopping...");
      stopWriter();
      ac.abort();
    }
  }
}