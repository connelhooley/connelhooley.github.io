import { glob, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";

import postcss from "postcss";
import postcssNesting from "postcss-nesting";
import postcssImport from "postcss-import";
import postcssCustomMedia from "postcss-custom-media";
import autoprefixer from "autoprefixer";

export function createStyleBuilder({ srcDir, distDir }) {  
  const cssProcessor = postcss([
    postcssImport,
    postcssCustomMedia,
    postcssNesting,
    autoprefixer,
  ]);
  const buildStyle = async (styleFilePath) => {
    const distFilePath = path.join(
      distDir,
      "css",
      path.relative(path.join(srcDir, "styles"), styleFilePath));
    const fileContent = await readFile(styleFilePath);
    const result = await cssProcessor.process(fileContent, { from: styleFilePath, to: distFilePath });
    await mkdir(path.dirname(distFilePath), { recursive: true });
    await writeFile(distFilePath, result.css);
    if (result.map) {
      await writeFile(distFilePath + ".map", result.map);
    }
  };
  return {
    async buildStyles() {
      for await (const fileDirent of glob(`${srcDir}/styles/**/!(_)*.css`, { withFileTypes: true })) {
        if (fileDirent.isFile()) {
          const filePath = path.join(fileDirent.parentPath, fileDirent.name);
          await buildStyle(filePath);
        }
      }
    },
    async styleChanged(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "styles/**/*.css")) {
        await this.buildStyles();
      }
    },
    async styleRemoved(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "styles/**/*.css")) {
        for await (const fileDirent of glob(`${distDir}/css/**/*.css`, { withFileTypes: true })) {
          if (fileDirent.isFile()) {
            const filePath = path.join(fileDirent.parentPath, fileDirent.name);
            await rm(filePath);
          }
        }
        await this.buildStyles();
      }
    },
  }
}
