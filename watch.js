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
  for await (const change of watch("./src/styles", { recursive: true })) {
    await buildCss();
  }
};

const watchJs = async () => {
  for await (const change of watch("./src/scripts", { recursive: true })) {
    await buildJs();
  }
};

const watchStatic = async () => {
  for await (const change of watch("./src/static", { recursive: true })) {
    await copyStaticAssets();
  }
};

const watchTemplates = async () => {
  for await (const change of watch("./src/templates", { recursive: true })) {
    if (minimatch(change.filename, "layouts/default.eta")) {
      await Promise.all([
        renderBlog(),
        renderExperience(),
        renderProjects(),
      ]);
    } else if (minimatch(change.filename, "{blog-post|paged-collection}.eta")) {
      await renderBlog();
    } else if (minimatch(change.filename, "home.eta")) {
      await renderHome();
    } else if (minimatch(change.filename, "experience.eta")) {
      await renderExperience();
    } else if (minimatch(change.filename, "projects.eta")) {
      await renderProjects();
    }
  }
};

const watchBlogContent = async () => {
  for await (const change of watch("./src/content/blog", { recursive: true })) {
    if (minimatch(change.filename, "*/*/*/*/index.md")) {
      await renderBlog();
    } else if (minimatch(change.filename, "**/*.png")) {
      await copyBlogAssets();
    }
  }
};

const watchExperienceContent = async () => {
  for await (const change of watch("./src/content/experience", { recursive: true })) {
    await renderExperience();
  }
};

const watchProjectsContent = async () => {
  for await (const change of watch("./src/content/projects", { recursive: true })) {
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
