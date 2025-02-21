import process from "process";
import { rm, mkdir } from "fs/promises";

import chokidar from "chokidar";
import browserSync from "browser-sync";

import { createContentBuilder } from "./content/index.js";
import { createScriptBuilder } from "./scripts/index.js";
import { createStaticBuilder } from "./static/index.js";
import { createStyleBuilder } from "./styles/index.js";

export async function createStaticSiteGenerator({ srcDir, distDir }) {
  const {
    buildContent,
    copyContentAssets,
    contentChange,
    contentAssetChange,
    templateChange,
    stopContentBuilder } = await createContentBuilder({ srcDir, distDir });
  const { buildScripts, scriptChange } = await createScriptBuilder({ srcDir, distDir });
  const { copyStaticAssets, staticAssetChange } = await createStaticBuilder({ srcDir, distDir });
  const { buildStyles, styleChange } = await createStyleBuilder({ srcDir, distDir });
  let browser;
  let watcher;
  return {
    async start() {
      console.log("Clearing dist");
      await rm(distDir, { recursive: true, force: true });
      await mkdir(distDir);
      console.log("Cleared dist");

      console.log("Building site");
      await Promise.all([
        buildContent(),
        copyContentAssets(),
        copyStaticAssets(),
        buildScripts(),
        buildStyles(),
      ]);
      console.log("Built site");
    },
    serve() {
      browser = browserSync.create();
      browser.init({
        server: "dist",
        files: `${distDir}/**/*`,
        port: 3000,
        open: "local",
        notify: false,
      });
    },
    watch() {
      console.log("Watching site");
      process.on("SIGINT", () => {
        console.log("CTRL+C pressed");
        this.stop();
      });
      watcher = chokidar.watch(srcDir, { awaitWriteFinish: true, ignoreInitial: true, persistent: true });
      const onChange = async filePath => {
        console.log("File change detected '%s'", filePath);
        await contentChange(filePath) ||
          await contentAssetChange(filePath) ||
          await templateChange(filePath) ||
          await staticAssetChange(filePath) ||
          await styleChange(filePath) ||
          await scriptChange(filePath);
      };
      const onDelete = async filePath => {
        console.log("File deletion detected '%s'", filePath);
        // TODO
      };
      watcher.on("add", filePath => onChange(filePath).catch(console.error));
      watcher.on("change", filePath => onChange(filePath).catch(console.error));
      watcher.on("unlink", filePath => onDelete(filePath).catch(console.error));
    },
    async stop() {
      console.log("Stopping...");
      stopContentBuilder();
      if (watcher) {
        await watcher.close();
      }
      if (browser) {
        browser.exit();
      }
      console.log("Stopped...");
      process.exit();
    }
  }
}
