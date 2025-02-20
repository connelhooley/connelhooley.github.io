import path from "path";
import process from "process";
import { watch, rm, mkdir } from "fs/promises";

import browserSync from "browser-sync";

import { createContentBuilder } from "./content";
import { createScriptBuilder } from "./scripts";
import { createStaticBuilder } from "./static";
import { createStyleBuilder } from "./styles";

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
    const ac = new AbortController();
    let browser;
  return {
    async start() {    
      console.log("Clearing dist");
      await rm(distDir, { recursive: true, force: true });
      await mkdir(distDir);
      console.log("Cleared dist");
      
      console.log("Building site");
      await Promise.all(
        buildContent(),
        copyContentAssets(),
        copyStaticAssets(),
        buildScripts(),
        buildStyles(),
      );
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
    async watch() {
      try {
        console.log("Watching site");
        process.on("SIGINT", () => {
          this.stop();
        });
        const watcher = watch(srcDir, { signal: ac.signal, recursive: true, withFileTypes: true });  
        for await (const event of watcher) {
          try {
            if (fileDirent.isFile()) {
              const filePath = path.join(fileDirent.parentPath, fileDirent.name);
              await contentChange(filePath) ||
              await contentAssetChange(filePath) ||
              await templateChange(filePath) ||
              await staticAssetChange(filePath) ||
              await styleChange(filePath) ||
              await scriptChange(filePath);
            }
            // TODO Handle file deletions with Chokidar or browser sync
          } catch (err) {
            console.error(err);
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        } else {
          throw err;
        }
      }
    },
    stop() {
      console.log("Stopping...");
      stopContentBuilder();
      ac.abort();
      browser?.exit();
      console.log("Stopped...");
      process.exit();
    }
  }
}
