import death from "death";

import { createStaticSiteGenerator } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

let generator;

death(() => {
  // Death module only works before first await
  generator?.stop();
});

generator = await createStaticSiteGenerator({ srcDir, distDir });
await generator.start();
generator.dev();
