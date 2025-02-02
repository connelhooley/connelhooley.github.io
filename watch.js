import { watch } from "fs/promises";
import { minimatch } from "minimatch";
import browserSync from "browser-sync";

import {
  buildCss,
  buildJs,
  copyStaticAssets,
  copyBlogAssets,
  copySlidesAssets,
  renderHome,
  renderExperience,
  renderProjects,
  renderBlog,
  renderSlides,
} from "./build.js";

const watchCss = async () => {
  for await (const change of watch("./src/styles", { recursive: true })) {
    await buildCss().catch(console.error);
  }
};

const watchJs = async () => {
  for await (const change of watch("./src/scripts", { recursive: true })) {
    await buildJs().catch(console.error);
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
      ]).catch(console.error);
    } else if (minimatch(change.filename, "partials/toc.eta")) {
      await renderBlog().catch(console.error);
    } else if (minimatch(change.filename, "blog-post.eta")) {
      await renderBlog().catch(console.error);
    } else if (minimatch(change.filename, "paged-collection.eta")) {
      await renderBlog().catch(console.error);
    } else if (minimatch(change.filename, "home.eta")) {
      await renderHome().catch(console.error);
    } else if (minimatch(change.filename, "experience.eta")) {
      await renderExperience().catch(console.error);
    } else if (minimatch(change.filename, "projects.eta")) {
      await renderProjects().catch(console.error);
    } else if (minimatch(change.filename, "slides.eta")) {
      await renderSlides().catch(console.error);
    }
  }
};

const watchBlogContent = async () => {
  for await (const change of watch("./src/content/blog", { recursive: true })) {
    if (minimatch(change.filename, "*/*/*/*/index.md")) {
      await renderBlog().catch(console.error);
    } else if (minimatch(change.filename, "**/*.{png,svg}")) {
      await copyBlogAssets();
    }
  }
};

const watchExperienceContent = async () => {
  for await (const change of watch("./src/content/experience", { recursive: true })) {
    await renderExperience().catch(console.error);
  }
};

const watchProjectsContent = async () => {
  for await (const change of watch("./src/content/projects", { recursive: true })) {
    await renderProjects().catch(console.error);
  }
};

const watchSlidesContent = async () => {
  for await (const change of watch("./src/content/slides", { recursive: true })) {
    if (minimatch(change.filename, "**/index.md")) {
      await renderSlides().catch(console.error);
    } else if (minimatch(change.filename, "**/*.{png,gif}")) {
      await copySlidesAssets().catch(console.error);
    }
  }
};

watchCss();
watchJs();
watchStatic();
watchTemplates();
watchBlogContent();
watchExperienceContent();
watchProjectsContent();
watchSlidesContent();
browserSync({
  server: "dist",
  files: "./dist/**/*",
  port: 3000,
  open: "local",
  notify: false,
});
