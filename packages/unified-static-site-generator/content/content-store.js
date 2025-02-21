import { readFile } from "fs/promises";
import path from "path";

import { VFile } from "vfile";
import { matter } from "vfile-matter";

export function createContentStore({ srcDir }) {
  const store = {
    "blog": {},
    "experience": {},
    "projects": {},
    "slides": {},
  };

  const getPosts = () => {
    return Object
      .values(store["blog"])
      .toSorted((a, b) => b.date - a.date);
  };

  const getSlides = () => {
    return Object.values(store["slides"]);
  };

  const getExperiences = () => {
    return Object
      .values(store["experience"])
      .toSorted((a, b) => b.start - a.start);
  };

  const getProjects = () => {
    return Object
      .values(store["projects"])
      .toSorted((a, b) => a.order - b.order);
  };

  const getLanguages = () => {
    const posts = Object.values(store["blog"]);
    const experiences = Object.values(store["experience"]);
    const projects = Object.values(store["projects"]);
    const languages = [...posts, ...experiences, ...projects].flatMap(item => item.languages);
    return [...new Set(languages)];
  };

  const getTechnologies = () => {
    const posts = Object.values(store["blog"]);
    const experiences = Object.values(store["experience"]);
    const projects = Object.values(store["projects"]);
    const technologies = [...posts, ...experiences, ...projects].flatMap(item => item.technologies);
    return [...new Set(technologies)];
  };

  return {
    async refreshContentStore({ contentFilePaths }) {
      const existingLanguages = getLanguages();
      const existingTechnologies = getTechnologies();
      const pagesUpdated = new Set([]);
      const pagesRemoved = new Set([]);
      await Promise.all(contentFilePaths.map(async filePath => {
        const fileContents = await readFile(filePath, { encoding: "utf-8" });
        const vFile = new VFile(fileContents);
        matter(vFile);
        const data = vFile.data.matter;
        const contentType = path
          .relative(path.join(srcDir, "content"), filePath)
          .split(path.sep)[0];
        const contentFilePath = path.relative(path.join(srcDir, "content", contentType), filePath);
        data.filePath = filePath;
        if (contentType === "blog") {
          const [year, month, day, name] = contentFilePath.split(path.sep);
          const date = new Date(`${year}-${month}-${day}T${data.time}Z`);
          data.date = date;
          data.pageId = `post:${year}:${month}:${day}:${name}`;
        } else if (contentType == "experience" || contentType == "projects") {
          data.pageId = contentType;
        } else {
          const [name] = contentFilePath.split(path.sep);
          data.pageId = `${contentType}:${name}`;
        }

        if (process.env.NODE_ENV !== "development" && data.draft) {
          if (store[contentType][filePath]) {
            delete store[contentType][filePath];
            pagesRemoved.add(data.pageId);
          }
        } else {
          const existing = store[contentType][filePath];
          store[contentType][filePath] = data;
          pagesUpdated.add(data.pageId);
          const newFile = !existing;
          const changedPostSummary = existing && contentType === "blog" && (data.title != existing.title || data.description != existing.description);
          if (newFile || changedPostSummary) {
            pagesUpdated.add("blog");
            data?.languages?.forEach(language => pagesUpdated.add(`language:${language}`));
            data?.technologies?.forEach(technology => pagesUpdated.add(`technology:${technology}`));
          } else {
            const existingLanguages = existing?.languages ?? [];
            const existingTechnologies = existing?.technologies ?? [];
            const newLanguages = (data.languages ?? []);
            const newTechnologies = (data.technologies ?? []);
            const changedLanguages = newLanguages.filter(modifiedLanguage => !existingLanguages.includes(modifiedLanguage));
            const changedTechnologies = newTechnologies.filter(modifiedTechnology => !existingTechnologies.includes(modifiedTechnology));
            changedLanguages.forEach(language => pagesUpdated.add(`language:${language}`));
            changedTechnologies.forEach(technology => pagesUpdated.add(`technology:${technology}`));
          }
        }
      }));
      const newLanguages = getLanguages();
      const newTechnologies = getTechnologies();
      const removedLanguages = existingLanguages.filter(existingLanguage => !newLanguages.includes(existingLanguage));
      const removedTechnologies = existingTechnologies.filter(existingTechnology => !newTechnologies.includes(existingTechnology));
      removedLanguages.forEach(removedLanguage => {
        pagesUpdated.delete(removedLanguage);
        pagesRemoved.add(removedLanguage);
      });
      removedTechnologies.forEach(removedTechnology => {
        pagesUpdated.delete(removedTechnology);
        pagesRemoved.add(removedTechnology);
      });
      return {
        pagesIdsUpdated: [...pagesUpdated],
        pagesIdsRemoved: [...pagesRemoved],
      };
    },
    getContent() {
      return {
        content: {
          posts: getPosts(),
          experiences: getExperiences(),
          projects: getProjects(),
          slides: getSlides(),
          languages: getLanguages(),
          technologies: getTechnologies(),
        },
      };
    },
  };
};
