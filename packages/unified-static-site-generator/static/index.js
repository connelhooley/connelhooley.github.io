import { glob, cp, rm } from "fs/promises";
import path from "path";

export function createStaticBuilder({ srcDir, distDir }) {
  const copyStaticAsset = async (staticFilePath) => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "static"), staticFilePath));
    await cp(staticFilePath, distFilePath);
  };
  const removeStaticAsset = async (staticFilePath) => {
    const distFilePath = path.join(
      distDir,
      path.relative(path.join(srcDir, "static"), staticFilePath));
    await rm(staticFilePath, distFilePath);
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
    async staticAssetChanged(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "static/**/*")) {
        await copyStaticAsset(filePath);
      }
    },
    async staticAssetRemoved(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "static/**/*")) {
        await removeStaticAsset(filePath);
      }
    },
  };
}