import { createStaticSiteGenerator } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

const { start, dev } = await createStaticSiteGenerator({ srcDir, distDir });
await start();
dev();
