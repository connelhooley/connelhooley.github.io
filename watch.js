import { createStaticSiteGenerator } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

const { start, watch, serve, stop } = await createStaticSiteGenerator({ srcDir, distDir });
await start();
watch();
serve();
stop();