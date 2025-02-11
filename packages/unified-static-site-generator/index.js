import path from "path";
import { rm, mkdir, glob } from "fs/promises";
import { ContentStore, createContentStore } from "./contentStore.js";
import { generateRoutes, writeRoutes } from "./routes.js";
import { createTemplateRenderer } from "./templateRenderer.js";

export async function buildSite({ srcDir, distDir }) {
  console.log("Started building site");
  
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir);

  const srcFilePaths = [];
  for await (const srcFileDirent of glob(`${srcDir}/content/{blog,experience,projects,slides}/**/*.md`, { withFileTypes: true })) {
    if (srcFileDirent.isFile()) {
      const srcFilePath = path.join(srcFileDirent.parentPath, srcFileDirent.name);
      srcFilePaths.push(srcFilePath);
    }
  }
  const contentStore = new ContentStore({ srcDir });
  const routes = await contentStore.loadSourceFiles({ srcFilePaths });
  
  // const contentStore = await createContentStore({ srcDir });
  // const routes = await generateRoutes({ contentStore });
  // const templateRenderer = createTemplateRenderer({ srcDir });
  // await writeRoutes({ routes, contentStore, templateRenderer, srcDir, distDir });
  
  console.log("Finished building site");
}
