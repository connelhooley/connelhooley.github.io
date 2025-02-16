import { generateSite } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

const { stop } = await generateSite({ srcDir, distDir });
stop();
