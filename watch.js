import { createStaticSiteGenerator } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

const { start, watch, serve } = await createStaticSiteGenerator({ srcDir, distDir });
await start();
serve();
await watch();