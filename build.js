import { createStaticSiteGenerator } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

const { start, stop } = await createStaticSiteGenerator({ srcDir, distDir });
await start();
stop();