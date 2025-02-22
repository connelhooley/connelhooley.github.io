import { glob, mkdir, writeFile, rm } from "fs/promises";
import path from "path";

import babel from "@babel/core";

export function createScriptBuilder({ srcDir, distDir }) {
  const buildScript = async (scriptFilePath) => {
    const result = await babel.transformFileAsync(scriptFilePath, {
      presets: ["@babel/preset-env"],
    });
    const distFilePath = path.join(
      distDir,
      "js",
      path.relative(path.join(srcDir, "scripts"), scriptFilePath));
    await mkdir(path.dirname(distFilePath), { recursive: true });
    await writeFile(distFilePath, result.code);
    if (result.map) {
      await writeFile(distFilePath + ".map", result.map);
    }
  };
  const removeScript = async (scriptFilePath) => {
    const distFilePath = path.join(
      distDir,
      "js",
      path.relative(path.join(srcDir, "scripts"), scriptFilePath));
    await rm(distFilePath);
    await rm(distFilePath + ".map", { force: true });
  };
  return {
    async buildScripts() {
      for await (const fileDirent of glob(`${srcDir}/scripts/**/*.js`, { withFileTypes: true })) {
        if (fileDirent.isFile()) {
          const filePath = path.join(fileDirent.parentPath, fileDirent.name);
          await buildScript(filePath);
        }
      }
    },
    async scriptChanged(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "scripts/**/*.js")) {
        await buildScript(filePath);
      }
    },
    async scriptRemoved(filePath) {
      const srcFilePath = path.relative(srcDir, filePath);
      if (path.matchesGlob(srcFilePath, "scripts/**/*.js")) {
        await removeScript(filePath);
      }
    },
  };
}