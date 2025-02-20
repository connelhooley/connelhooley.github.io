import { glob, cp } from "fs/promises";
import path from "path";

import { minimatch } from "minimatch";

export async function createStaticBuilder({ srcDir, distDir }) {  
  const copyStaticAsset = async (staticFilePath) => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "static"), staticFilePath));
    await cp(staticFilePath, distFilePath);
  };
  return {
    async copyStaticAssets() {
      for await (const fileDirent of glob(`${srcDir}/static/**/.*`, { withFileTypes: true })) {
        if (fileDirent.isFile()) {
          const filePath = path.join(fileDirent.parentPath, fileDirent.name);
          await copyStaticAsset(filePath);
        }
      }
    },
    async staticAssetChange(filePath) {
      if (minimatch(path.relative(filePath, srcDir), "static/**/*")) {
        await copyStaticAsset(filePath);
        return true;
      }
    },
  }
}