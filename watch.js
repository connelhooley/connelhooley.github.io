import { watch } from "fs/promises";
import { minimatch } from "minimatch";
import browserSync from "browser-sync";

import {
  buildCss,
  buildJs,
  copyStaticAssets,
  copyBlogAssets,
  renderHome,
  renderExperience,
  renderProjects,
  renderBlog,
} from "./build.js";

const watchCss = async () => {
  for await (const change of watch("./src/styles")) {
    await buildCss();
  }
};

const watchJs = async () => {
  for await (const change of watch("./src/scripts")) {
    await buildJs();
  }
};

const watchStatic = async () => {
  for await (const change of watch("./src/static")) {
    await copyStaticAssets();
  }
};

const watchTemplates = async () => {
  for await (const change of watch("./src/templates")) {
    if (minimatch(change.filename, "./src/templates/layout/default.eta")) {
      await Promise.all([
        renderBlog(),
        renderExperience(),
        renderProjects(),
      ]);
    } else if (minimatch(change.filename, "./src/templates/{blog-post|paged-collection}.eta")) {
      await renderBlog();
    } else if (minimatch(change.filename, "./src/templates/home.eta")) {
      await renderHome();
    } else if (minimatch(change.filename, "./src/template/experience.eta")) {
      await renderExperience();
    } else if (minimatch(change.filename, "./src/templates/projects.eta")) {
      await renderProjects();
    }
  }
};

const watchBlogContent = async () => {
  for await (const change of watch("./src/content/blog")) {
    if (minimatch(change.filename, "./src/content/blog/*/*/*/*/index.md")) {
      await renderBlog();
    } else if (minimatch(change.filename, "./src/content/blog/**/*.png")) {
      await copyBlogAssets();
    }
  }
};

const watchExperienceContent = async () => {
  for await (const change of watch("./src/content/experience")) {
    await renderExperience();
  }
};

const watchProjectsContent = async () => {
  for await (const change of watch("./src/content/projects")) {
    await renderProjects();
  }
};

watchCss();
watchJs();
watchStatic();
watchTemplates();
watchBlogContent();
watchExperienceContent();
watchProjectsContent();
browserSync({
  server: "dist",
  files: "./dist/**/*",
  port: 3000,
  open: "local",
});
