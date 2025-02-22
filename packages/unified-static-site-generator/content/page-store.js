import path from "path";

export function createPageStore({ getContent }) {
  const store = {};

  const escapeRoutePathValue = value => encodeURIComponent(escapeFilePathValue(value));

  // TODO Investigate using https://nodejs.org/api/url.html#urlpathtofileurlpath-options
  const escapeFilePathValue = value => value.replace("#", "Sharp");

  const generatePagedNumbers = (items, pageSize = 5) => {
    return Array.from({ length: Math.ceil((items.length || 1) / pageSize) }, (_, index) => index + 1);
  };

  const getPagedItems = (items, pagedNumber, pageSize = 5) => {
    const start = (pagedNumber - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  };

  const getPagedRoutePath = (baseRoutePath, pagedNumber = 1, pagedCount) => {
    if (pagedNumber < 1) {
      return null;
    } else if (pagedNumber === 1) {
      return path.join(baseRoutePath, "/");
    } else if (pagedNumber <= pagedCount) {
      return path.join(baseRoutePath, "page", pagedNumber.toString(), "/")
    } else {
      return null;
    }
  }

  const mapPost = ({ languages, technologies, ...post }) => {
    const [year, month, day, name] = post.pageId.match(/^post:(\d{4}):(\d{2}):(\d{2}):(.+)$/)?.slice(1);
    return {
      ...post,
      languages: languages?.map(language => ({
        name: language,
        routePath: `/blog/languages/${escapeRoutePathValue(language)}/`
      })),
      technologies: technologies?.map(technology => ({
        name: technology,
        routePath: `/blog/technologies/${escapeRoutePathValue(technology)}/`
      })),
      routePath: `/blog/${year}/${month}/${day}/${name}/`,
    };
  };

  const mapExperience = ({ languages, technologies, ...experience }) => {
    return {
      ...experience,
      languages: languages?.map(language => ({
        name: language,
        routePath: `/blog/languages/${escapeRoutePathValue(language)}/`
      })),
      technologies: technologies?.map(technology => ({
        name: technology,
        routePath: `/blog/technologies/${escapeRoutePathValue(technology)}/`
      })),
    };
  };

  const mapProject = ({ languages, technologies, ...project }) => {
    return {
      ...project,
      languages: languages?.map(language => ({
        name: language,
        routePath: `/blog/languages/${escapeRoutePathValue(language)}/`
      })),
      technologies: technologies?.map(technology => ({
        name: technology,
        routePath: `/blog/technologies/${escapeRoutePathValue(technology)}/`
      })),
    };
  };

  const createHomePage = ({ pageId }) => {
    if (pageId === "home") {
      return {
        routes: [
          {
            type: "home",
            routePath: "/",
            data: {},
          },
        ],
      };
    }
  };

  const createBlogPostPage = ({ pageId, content: { posts } }) => {
    const match = pageId.match(/^post:(\d{4}):(\d{2}):(\d{2}):(.+)$/);
    if (match) {
      const [year, month, day, name] = match?.slice(1);
      const routePath = `/blog/${year}/${month}/${day}/${name}/`;
      return {
        routes: [
          {
            type: "post",
            routePath,
            data: mapPost(posts.find(post => post.pageId === pageId)),
          }
        ],
      };
    }
  };

  const createBlogCollection = ({ pageId, content: { posts } }) => {
    if (pageId === "blog") {
      const pagedNumbers = generatePagedNumbers(posts);
      const pagedCount = pagedNumbers.at(-1);
      const baseRoutePath = "/blog/";
      return {
        routes: [
          ...pagedNumbers.map(pagedNumber => ({
            type: "blog-collection",
            routePath: getPagedRoutePath(baseRoutePath, pagedNumber, pagedCount),
            data: {
              title: "Blog",
              posts: getPagedItems(posts, pagedNumber).map(mapPost),
              prevRoutePath: getPagedRoutePath(baseRoutePath, pagedNumber - 1, pagedCount),
              nextRoutePath: getPagedRoutePath(baseRoutePath, pagedNumber + 1, pagedCount),
            },
          })),
          {
            type: "rss",
            routePath: "/rss.xml",
            data: {
              posts: posts.map(mapPost),
            },
          },
        ],
      };
    }
  };

  const createLanguageCollectionPage = ({ pageId, content: { posts } }) => {
    const match = pageId.match(/^language:(.+)$/);
    if (match) {
      const language = match.at(1);
      const languagePosts = posts.filter(post => post.languages?.includes(language));
      const pagedNumbers = generatePagedNumbers(languagePosts);
      const pagedCount = pagedNumbers.at(-1);
      const baseRoutePath = `/blog/languages/${escapeRoutePathValue(language)}/`;
      return {
        routes: pagedNumbers.map(pagedNumber => ({
          type: "blog-collection",
          routePath: getPagedRoutePath(baseRoutePath, pagedNumber, pagedCount),
          filePath: pagedNumber === 1
            ? `/blog/languages/${escapeFilePathValue(language)}/`
            : `/blog/languages/${escapeFilePathValue(language)}/page/${pagedNumber}/`,
          data: {
            title: language,
            isLanguage: true,
            posts: getPagedItems(languagePosts, pagedNumber).map(mapPost),
            prevRoutePath: getPagedRoutePath(baseRoutePath, pagedNumber - 1, pagedCount),
            nextRoutePath: getPagedRoutePath(baseRoutePath, pagedNumber + 1, pagedCount),
          },
        })),
      };
    }
  };

  const createTechnologyCollectionPage = ({ pageId, content: { posts } }) => {
    const match = pageId.match(/^technology:(.+)$/);
    if (match) {
      const technology = match.at(1);
      const technologyPosts = posts.filter(post => post.technologies?.includes(technology));
      const pagedNumbers = generatePagedNumbers(technologyPosts);
      const pagedCount = pagedNumbers.at(-1);
      const baseRoutePath = `/blog/technologies/${escapeRoutePathValue(technology)}/`;
      return {
        routes: pagedNumbers.map(pagedNumber => ({
          type: "blog-collection",
          routePath: getPagedRoutePath(baseRoutePath, pagedNumber, pagedCount),
          filePath: pagedNumber === 1
            ? `/blog/technologies/${escapeFilePathValue(technology)}/`
            : `/blog/technologies/${escapeFilePathValue(technology)}/page/${pagedNumber}/`,
          data: {
            title: technology,
            isTechnology: true,
            posts: getPagedItems(technologyPosts, pagedNumber).map(mapPost),
            prevRoutePath: getPagedRoutePath(baseRoutePath, pagedNumber - 1, pagedCount),
            nextRoutePath: getPagedRoutePath(baseRoutePath, pagedNumber + 1, pagedCount),
          },
        })),
      };
    }
  };

  const createExperiencesPage = ({ pageId, content: { experiences } }) => {
    if (pageId === "experience") {
      return {
        routes: [
          {
            type: "experience",
            routePath: "/experience/",
            data: {
              experiences: experiences.map(mapExperience),
            },
          },
        ],
      };
    }
  };

  const createProjectsPage = ({ pageId, content: { projects } }) => {
    if (pageId === "projects") {
      return {
        routes: [
          {
            type: "projects",
            routePath: "/projects/",
            data: {
              projects: projects.map(mapProject),
            },
          },
        ],
      };
    }
  };

  const createSlidesPage = ({ pageId, content: { slides } }) => {
    const match = pageId.match(/^slides:(.+)$/);
    if (match) {
      const [name] = match?.slice(1);
      const data = slides.find(post => post.pageId === pageId);
      const routePath = `/slides/${name}/`;
      const mdRoutePath = `/slides/${name}/index.md`;
      return {
        routes: [
          {
            type: "slides",
            routePath,
            data: {
              ...data,
              mdRoutePath,
            },
          },
          {
            type: "slides-markdown",
            routePath: mdRoutePath,
            data: { ...data },
          },
        ],
      };
    }
  };

  return {
    getRoutes({ types = [] }) {
      return {
        routes: Object
          .values(store)
          .flatMap(page => page.routes)
          .filter(route => types.includes(route.type)),
      };
    },
    refreshPageStore({ pagesIdsUpdated, pageIdsRemoved = [] }) {
      const { content } = getContent();
      const routesUpdated = [];
      const routesRemoved = [];
      pageIdsRemoved.forEach(pageId => {
        const existing = store[pageId];
        delete store[pageId];
        existing.routes.forEach(existingRoute => routesRemoved.push(existingRoute));
      });
      pagesIdsUpdated.forEach(pageId => {
        const existing = store[pageId];
        store[pageId] =
          createBlogPostPage({ pageId, content }) ||
          createExperiencesPage({ pageId, content }) ||
          createProjectsPage({ pageId, content }) ||
          createSlidesPage({ pageId, content }) ||
          createBlogCollection({ pageId, content }) ||
          createLanguageCollectionPage({ pageId, content }) ||
          createTechnologyCollectionPage({ pageId, content }) ||
          createHomePage({ pageId, content });
        store[pageId].routes.forEach(route => routesUpdated.push(route));
        if (existing) {
          const newRoutePaths = store[pageId].routes.map(route => route.routePath);
          existing.routes
            .filter(existingRoute => !newRoutePaths.includes(existingRoute))
            .forEach(existingRoute => routesRemoved.push(existingRoute));
        }
      });
      return {
        routesUpdated,
        routesRemoved,
      };
    },
  };
};
