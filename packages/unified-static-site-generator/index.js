import process from "process";
import path from "path";
import { rm, mkdir } from "fs/promises";

import chokidar from "chokidar";
import browserSync from "browser-sync";

import { createContentBuilder } from "./content/index.js";
import { createScriptBuilder } from "./scripts/index.js";
import { createStaticBuilder } from "./static/index.js";
import { createStyleBuilder } from "./styles/index.js";

export async function createStaticSiteGenerator({ srcDir, distDir }) {
  const contentBuilder = await createContentBuilder({ srcDir, distDir });
  const scriptBuilder = createScriptBuilder({ srcDir, distDir });
  const staticBuilder = createStaticBuilder({ srcDir, distDir });
  const styleBuilder = createStyleBuilder({ srcDir, distDir });
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
        contentBuilder.buildContent(),
        contentBuilder.copyContentAssets(),
        staticBuilder.copyStaticAssets(),
        scriptBuilder.buildScripts(),
        styleBuilder.buildStyles(),
      ]);
      console.log("Built site");
    },
    dev() {
      console.log("Watching site");
      process.on("SIGINT", () => {
        console.log("CTRL+C pressed");
        // TODO Fix
        this.stop();
      });
      browser = browserSync.create();      
      browser.init({
        server: distDir,
        port: 3000,
        open: "local",
        notify: false,
      });
      watcher = chokidar.watch(srcDir, { awaitWriteFinish: true, ignoreInitial: true, persistent: true });
      const onChange = async relativeFilePath => {
        const filePath = path.resolve(relativeFilePath);
        console.log("File change detected '%s'", filePath);
        await Promise.all([
          contentBuilder.contentChanged(filePath),
          contentBuilder.contentAssetChanged(filePath),
          contentBuilder.templateChanged(filePath),
          staticBuilder.staticAssetChanged(filePath),
          styleBuilder.styleChanged(filePath),
          scriptBuilder.scriptChanged(filePath),
        ]);
        browser.reload();
      };
      const onRemove = async filePath => {
        console.log("File deletion detected '%s'", filePath);
        await Promise.all([
          contentBuilder.contentRemoved(filePath),
          contentBuilder.contentAssetRemoved(filePath),
          staticBuilder.staticAssetRemoved(filePath),
          scriptBuilder.scriptRemoved(filePath),
          styleBuilder.styleRemoved(filePath),
        ]);
        browser.reload();
      };
      watcher.on("add", filePath => onChange(filePath).catch(console.error));
      watcher.on("change", filePath => onChange(filePath).catch(console.error));
      watcher.on("unlink", filePath => onRemove(filePath).catch(console.error));
    },
    async stop() {
      console.log("Stopping...");
      contentBuilder.stopContentBuilder();
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
