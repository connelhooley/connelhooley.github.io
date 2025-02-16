import { generateSite } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

const { stop, watch } = await generateSite({ srcDir, distDir });
await watch();
stop();