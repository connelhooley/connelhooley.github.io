import postcss from "postcss";
import postcssNesting from "postcss-nesting";
import postcssImport from "postcss-import";
import postcssCustomMedia from "postcss-custom-media";
import autoprefixer from "autoprefixer";

export async function createStyleBuilder({ srcDir, distDir }) {  
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
    async styleChange(filePath) {
      if (minimatch(path.relative(filePath, srcDir), "styles/**/!(_)*.css")) {
        await buildStyle(filePath);
        return true;
      }
    },
  }
}