import { glob, cp, rm } from "fs/promises";
import path from "path";

import { createContentStore } from "./content-store.js";
import { createPageStore } from "./page-store.js";
import { createRouteWriter } from "./route-writer.js";
import { createTemplateTracker } from "./template-tracker.js";

export async function createContentBuilder({ srcDir, distDir }) {
  const { refreshContentStore, getContent } = createContentStore({ srcDir });
  const { refreshPageStore, getRoutes } = createPageStore({ getContent });
  const { writeRoutes, stopWriter } = await createRouteWriter({ srcDir, distDir });
  const { getImpactedRouteTypes } = createTemplateTracker();

  const buildHomePage = async () => {
    const { routesUpdated } = refreshPageStore({ pagesIdsUpdated: ["home"] });
    await writeRoutes({ routesUpdated });
  };
  const buildContentPages = async (contentFilePathsUpdated, contentFilePathsRemoved = []) => {
    const { pagesIdsUpdated, pagesIdsRemoved } = await refreshContentStore({ contentFilePathsUpdated, contentFilePathsRemoved });
    const { routesUpdated, routesRemoved } = refreshPageStore({ pagesIdsUpdated, pagesIdsRemoved });
    await writeRoutes({ routesUpdated, routesRemoved });
  };
  const buildTemplate = async (templateFilePath) => {
    const { impactedRouteTypes } = getImpactedRouteTypes({ templateFilePaths: [templateFilePath] });
    const { routes } = getRoutes({ types: impactedRouteTypes });
    await writeRoutes({ routesUpdated: routes });
  };
  const copyContentAsset = async (contentAssetFilePath) => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "content"), contentAssetFilePath));
    await cp(contentAssetFilePath, distFilePath);
  };
  const removeContentAsset = async (contentAssetFilePath) => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "content"), contentAssetFilePath));
    await rm(distFilePath);
  };
  return {
    async buildContent() {
      await buildHomePage();
      const contentFilePaths = [];
      for await (const fileDirent of glob(`${srcDir}/content/{blog,experience,projects,slides}/**/*.md`, { withFileTypes: true })) {
        if (fileDirent.isFile()) {
          const filePath = path.join(fileDirent.parentPath, fileDirent.name);
          contentFilePaths.push(filePath);
        }
      }
      await buildContentPages(contentFilePaths);
    },
    async copyContentAssets() {
      for await (const fileDirent of glob(`${srcDir}/content/**/*.!(md)`, { withFileTypes: true })) {
        if (fileDirent.isFile()) {
          const filePath = path.join(fileDirent.parentPath, fileDirent.name);
          await copyContentAsset(filePath);
        }
      }
    },
    async contentChanged(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "content/**/*.md")) {
        await buildContentPages([filePath]);
      }
    },
    async contentRemoved(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "content/**/*.md")) {
        await buildContentPages([], [filePath]);
      }
    },
    async templateChanged(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "templates/**/*")) {
        await buildTemplate(filePath);
      }
    },
    async contentAssetChanged(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "content/**/*.!(md)")) {
        await copyContentAsset(filePath);
      }
    },
    async contentAssetRemoved(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "content/**/*.!(md)")) {
        await removeContentAsset(filePath);
      }
    },
    stopContentBuilder() {
      stopWriter();
    },
  };
}