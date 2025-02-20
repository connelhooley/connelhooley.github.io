export function createPageStore({ getContent }) {
  const store = {};

  // TODO rename to escapeRoutePathValue
  const escapeRouteValue = value => encodeURIComponent(value.replace("#", "Sharp"));
  
  // TODO Use this method
  const escapeFilePathValue = value => value.replace("#", "Sharp");
  
  const generatePagedNumbers = (items, pageSize = 5) => {
    return Array.from({ length: Math.ceil((items.length || 1) / pageSize) }, (_, index) => index + 1);
  };

  const getPagedItems = (items, pagedNumber, pageSize = 5) => {
    const start = ((pagedNumber - 1) * pageSize) + 1;
    const end = start + pageSize;
    return items.slice(start, end);
  };

  const mapPostCollectionItem = (post) => {
    const [year, month, day, name] = post.pageId.match(/^post:(\d{4}):(\d{2}):(\d{2}):(.+)$/)?.slice(1);
    return {
      ...post,
      routePath: `/blog/${year}/${month}/${day}/${name}/`,
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
            data: posts.find(post => post.pageId === pageId),
          }
        ],
      };
    }
  };

  const createBlogCollection = ({ pageId, content: { posts } }) => {
    if (pageId === "blog") {
      const pagedNumbers = generatePagedNumbers(posts);
      const pagedCount = pagedNumbers.at(-1);
      return {
        routes: [
          ...pagedNumbers.map(pagedNumber => ({
            type: "blog-collection",
            routePath: pagedNumber === 1
              ? "/blog/"
              : `/blog/page/${pagedNumber}/`,
            data: {
              title: "Blog",
              pagedNumber,
              pagedCount,
              posts: getPagedItems(posts, pagedNumber).map(mapPostCollectionItem),
            },
          })),
          {
            type: "rss",
            routePath: "/feed.xml",
            data: {
              posts: posts.map(mapPostCollectionItem),
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
      return {
        routes: pagedNumbers.map(pagedNumber => ({
          type: "blog-collection",
          routePath: pagedNumber === 1
            ? `/blog/languages/${escapeRouteValue(language)}/`
            : `/blog/languages/${escapeRouteValue(language)}/page/${pagedNumber}/`,
          data: {
            title: language,
            isLanguage: true,
            pagedNumber,
            pagedCount,
            posts: getPagedItems(languagePosts, pagedNumber).map(mapPostCollectionItem),
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
      return {
        routes: pagedNumbers.map(pagedNumber => ({
          type: "blog-collection",
          routePath: pagedNumber === 1
            ? `/blog/technologies/${escapeRouteValue(technology)}/`
            : `/blog/technologies/${escapeRouteValue(technology)}/page/${pagedNumber}/`,
          data: {
            title: technology,
            isTechnology: true,
            pagedNumber,
            pagedCount,
            technology,
            posts: getPagedItems(technologyPosts, pagedNumber).map(mapPostCollectionItem),
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
            data: { experiences },
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
            data: { projects },
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
