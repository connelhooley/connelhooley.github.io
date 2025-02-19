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
  const buildContentPages = async (contentFilePaths) => {
    const { pagesIdsUpdated, pagesIdsRemoved } = await refreshContentStore({ contentFilePaths });
    const { routesUpdated, routesRemoved } = refreshPageStore({ pagesIdsUpdated: ["home", ...pagesIdsUpdated], pagesIdsRemoved });
    await writeRoutes({ routesUpdated, routesRemoved });
  };
  const buildTemplates = async (templateFilePaths) => {
    const { impactedRouteTypes } = getImpactedRouteTypes({ templateFilePaths });
    const { routes } = getRoutes({ types: impactedRouteTypes });
    await writeRoutes({ routesUpdated: routes });
  };
  const copyContentAsset = async (contentAssetFilePath) => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "content"), contentAssetFilePath));
    await cp(contentAssetFilePath, distFilePath);
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
    async contentChange(filePath) {
      if (minimatch(path.relative(filePath, srcDir), "content/**/*.md")) {
        await buildContentPages([filePath]);
        return true;
      }
    },
    async templateChange(filePath) {
      if (minimatch(path.relative(filePath, srcDir), "templates/**/*")) {
        await buildTemplates([filePath]);
        return true;
      }
    },
    async contentAssetChange(filePath) {
      if (minimatch(path.relative(filePath, srcDir), "content/**/*.!(md)")) {
        await copyContentAsset(filePath);
        return true;
      }
    },
    stopContentBuilder() {
      stopWriter();
    }
  }
}