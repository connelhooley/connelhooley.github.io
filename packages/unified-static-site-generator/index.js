import { rm, mkdir } from "fs/promises";
import { createContentStore } from "./contentStore.js";
import { generateRoutes, writeRoutes } from "./routes.js";
import { createTemplateRenderer } from "./templateRenderer.js";

export async function buildSite({ srcDir, distDir }) {
  console.log("Started building site");
  
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir);
  
  const contentStore = await createContentStore({ srcDir });
  const routes = await generateRoutes({ contentStore });
  const templateRenderer = createTemplateRenderer({ srcDir });
  await writeRoutes({ routes, contentStore, templateRenderer, srcDir, distDir });
  
  console.log("Finished building site");
}
