import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { renderRoute } from "./routeRenderer.js";

const escapeRouteValue = value => encodeURIComponent(value.replace("#", "Sharp"));

export function generatePageNumbers(items, pageSize = 5) {
  return Array.from({ length: Math.ceil(items.length / pageSize) }, (_, index) => index + 1);
}

export function generateStaticRoute({ path }) {
  return { path, params: {} };
}

export function generateBlogPostRoute({ blogFilePath }) {
  const [year, month, day, title] = blogFilePath.split(path.sep);
  return {
    path: `/blog/${year}/${month}/${day}/${escapeRouteValue(title)}/`,
    params: { title, year, month, day },
  };
}

export function generateSlideRoute({ slidesFilePath }) {
  const [title] = slidesFilePath.split(path.sep);
  return {
    path: `/slides/${escapeRouteValue(title)}/`,
    params: { title },
  };
}

export function generateBlogPagedRoute({ pageNumber = 1 }) {
  return {
    path: pageNumber === 1
      ? "/blog/"
      : `/blog/page/${pageNumber}/`,
    params: { pageNumber },
  };
}

export function generateLanguagePagedRoute({ language, pageNumber = 1 }) {
  return {
    path: pageNumber === 1
      ? `/blog/languages/${escapeRouteValue(language)}/`
      : `/blog/languages/${escapeRouteValue(language)}/page/${pageNumber}/`,
    params: { pageNumber, language },
  };
}

export function generateTechnologyPagedRoute({ technology, pageNumber = 1 }) {
  return {
    path: pageNumber === 1
      ? `/blog/technologies/${escapeRouteValue(technology)}/`
      : `/blog/technologies/${escapeRouteValue(technology)}/page/${pageNumber}/`,
    params: { pageNumber, technology },
  };
}

export async function generateRoutes({ contentStore }) {
  const pageSize = 5;

  return [
    generateStaticRoute({ path: "/" }),
    generateStaticRoute({ path: "/feed.xml" }),
    generateStaticRoute({ path: "/experience/" }),
    generateStaticRoute({ path: "/projects/" }),
    ...contentStore["blog"].map(post => post.route),
    ...contentStore["slides"].map(slides => slides.route),
    ...generatePageNumbers(contentStore["blog"]).map(pageNumber => generateBlogPagedRoute({ pageNumber })),
    ...contentStore["languages"].flatMap((language) =>
      generatePageNumbers(contentStore["blog"].filter(post => post.languages?.includes(language) ?? false))
        .map(pageNumber => generateLanguagePagedRoute({ language, pageNumber }))),
    ...contentStore["technologies"].flatMap((technology) =>
      generatePageNumbers(contentStore["blog"].filter(post => post.technologies?.includes(technology) ?? false))
        .map(pageNumber => generateTechnologyPagedRoute({ technology, pageNumber }))),
  ];
}

export async function writeRoute({ route, contentStore, templateRenderer, srcDir, distDir }) {
  const fileContents = await renderRoute({ route, contentStore, templateRenderer, srcDir });
  if (fileContents) {
    const filePath = route.path.endsWith("/")
      ? path.join(distDir, route.path, "index.html")
      : path.join(distDir, route.path);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, fileContents);
    console.info("Route '%s' written to file '%s'", route.path, filePath);
  }
}

export async function writeRoutes({ routes, contentStore, templateRenderer, srcDir, distDir }) {
  await Promise.all(routes.map(route => writeRoute({ route, contentStore, templateRenderer, srcDir, distDir })));
}
