import { glob, cp } from "fs/promises";
import path from "path";

export async function createStaticBuilder({ srcDir, distDir }) {  
  const copyStaticAsset = async (staticFilePath) => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "static"), staticFilePath));
    await cp(staticFilePath, distFilePath);
  };
  return {
    async copyStaticAssets() {
      for await (const fileDirent of glob(`${srcDir}/static/**/*`, { withFileTypes: true })) {
        if (fileDirent.isFile()) {
          const filePath = path.join(fileDirent.parentPath, fileDirent.name);
          await copyStaticAsset(filePath);
        }
      }
    },
    async staticAssetChange(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "static/**/*")) {
        await copyStaticAsset(filePath);
      }
    },
  };
}