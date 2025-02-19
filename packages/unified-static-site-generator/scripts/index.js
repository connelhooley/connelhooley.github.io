import babel from "@babel/core";

export async function createScriptBuilder({ srcDir, distDir }) {
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
  return {
    async buildScripts() {
      for await (const fileDirent of glob(`${srcDir}/scripts/**/*.js`, { withFileTypes: true })) {
        if (fileDirent.isFile()) {
          const filePath = path.join(fileDirent.parentPath, fileDirent.name);
          await buildScript(filePath);
        }
      }
    },
    async scriptChange(filePath) {
      if (minimatch(path.relative(filePath, srcDir), "scripts/**/*.js")) {
        await buildScript(filePath);
        return true;
      }
    },
  }
}