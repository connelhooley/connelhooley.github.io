import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const escapeRouteValue = value => encodeURIComponent(value.replace("#", "Sharp"));

export function generateStaticRoute({ path }) {
  return {
    path,
    params: {}
  };
}

export function generateBlogPostRoute({ blogFilePath }) {
  const [year, month, day, title] = blogFilePath.split(path.sep);
  return {
    path: `/blog/${year}/${month}/${day}/${escapeRouteValue(title)}/`,
    params: {
      title,
      year,
      month,
      day,
    }
  };
}

export function generateSlideRoute({ slidesFilePath }) {
  const [title] = slidesFilePath.split(path.sep);
  return {
    path: `/slides/${escapeRouteValue(title)}/`,
    params: {
      title,
    }
  };
}

export function generateBlogPagedRoute({ pageNumber = 1 }) {
  return {
    path: pageNumber === 1
      ? "/blog/"
      : `/blog/page/${pageNumber}`,
    params: {
      pageNumber,
    }
  };
}

export function generateLanguagePagedRoute({ language, pageNumber = 1 }) {
  return {
    path: pageNumber === 1
      ? `/blog/languages/${escapeRouteValue(experience)}/`
      : `/blog/languages/${escapeRouteValue(experience)}/page/${pageNumber}`,
    params: {
      pageNumber,
      language,
    }
  }
}

export function generateTechnologyPagedRoute({ technology, pageNumber = 1 }) {
  return {
    path: pageNumber === 1
      ? `/blog/technologies/${escapeRouteValue(technology)}/`
      : `/blog/technologies/${escapeRouteValue(technology)}/page/${pageNumber}`,
    params: {
      pageNumber,
      technology,
    }
  }
}

export async function generateRoutes({ contentStore }) {
  const pageSize = 5;

  const languages = [...new Set(Object.values(contentStore["blog"]).flatMap(data => data.languages ?? []))];
  const technologies = [...new Set(Object.values(contentStore["blog"]).flatMap(data => data.technologies ?? []))];

  const generatePageNumbers = items => Array.from({ length: Math.ceil(items.length / pageSize) }, (_, index) => index + 1);

  return [
    generateStaticRoute({ path: "/" }),
    generateStaticRoute({ path: "/feed.xml" }),
    generateStaticRoute({ path: "/experience/" }),
    generateStaticRoute({ path: "/projects/" }),
    ...Object.keys(contentStore["blog"]).map(blogFilePath => generateBlogPostRoute({ blogFilePath })),
    ...Object.keys(contentStore["slides"]).map(slidesFilePath => generateSlideRoute({ slidesFilePath })),
    ...generatePageNumbers(Object.keys(contentStore["blog"]))
      .map(pageNumber => generateBlogPagedRoute({ pageNumber })),
    ...languages.flatMap((language) =>
      generatePageNumbers(Object.values(contentStore["blog"]).filter(post => post.languages?.includes(language) ?? false))
        .map(pageNumber => generateLanguagePagedRoute({ language, pageNumber }))),
    ...technologies.flatMap((technology) =>
      generatePageNumbers(Object.values(contentStore["blog"]).filter(post => post.technologies?.includes(technology) ?? false))
        .map(pageNumber => generateTechnologyPagedRoute({ technology, pageNumber }))),
  ];
}

export async function writeRoute({ route, contentStore, templateRenderer, srcDir, distDir }) {
  const fileContents = await renderRoute({ route, contentStore, templateRenderer, srcDir });
  if (fileContents) {
    const filePath = route.endsWith("/")
      ? path.join(distDir, route, "index.html")
      : path.join(distDir, route);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, fileContents);
    console.info("Route '%s' written to file '%s'", route, filePath);
  }
}

export async function writeRoutes({ routes, contentStore, templateRenderer, srcDir, distDir }) {
  await Promise.all(routes.map(route => writeRoute({ route, contentStore, templateRenderer, srcDir, distDir })));
}
