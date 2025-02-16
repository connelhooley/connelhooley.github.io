export function createPager({ getContent }) {
  const escapeRouteValue = value => encodeURIComponent(value.replace("#", "Sharp"));

  const generatePagedNumbers = (items, pageSize = 5) => {
    return Array.from({ length: Math.ceil(items.length / pageSize) }, (_, index) => index + 1);
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
  }

  const createHomePage = ({ pageId }) => {
    if (pageId === "home") {
      const page = {
        pageId,
        routes: [
          {
            type: "home",
            routePath: "/",
            data: {},
          },
        ],
        clearPaths: [],
      };
      return page;
    }
  };

  const createBlogPostPage = ({ pageId, change, content: { posts } }) => {
    const match = pageId.match(/^post:(\d{4}):(\d{2}):(\d{2}):(.+)$/);
    if (match) {
      const [year, month, day, name] = match?.slice(1);
      const routePath = `/blog/${year}/${month}/${day}/${name}/`;
      const page = {
        pageId,
        routes: [],
        clearPaths: [],
      };
      if (change === "updated") {
        page.routes.push({
          type: "post",
          routePath,
          data: posts.find(post => post.pageId === pageId),
        });
      } else if (change === "deleted") {
        page.clearPaths.push(routePath);
      }
      return page;
    }
  };

  const createBlogCollection = ({ pageId, content: { posts } }) => {
    if (pageId === "blog") {
      const pagedNumbers = generatePagedNumbers(posts);
      const pagedCount = pagedNumbers.at(-1);
      const page = {
        pageId,
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
        clearPaths: ["/blog/", "/feed.xml"],
      };
      return page;
    }
  };

  const createLanguageCollectionPage = ({ pageId, change, content: { posts } }) => {
    const match = pageId.match(/^language:(.+)$/);
    if (match) {
      const language = match.at(1);
      const page = {
        pageId,
        routes: [],
        clearPaths: [`/blog/languages/${escapeRouteValue(language)}/`],
      };
      if (change === "updated") {
        const languagePosts = posts.filter(post => post.languages?.includes(language));
        const pagedNumbers = generatePagedNumbers(languagePosts);
        const pagedCount = pagedNumbers.at(-1);
        page.routes = pagedNumbers.map(pagedNumber => {
          return {
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
          };
        });
      }
      return page;
    }
  };

  const createTechnologyCollectionPage = ({ pageId, change, content: { posts } }) => {
    const match = pageId.match(/^technology:(.+)$/);
    if (match) {
      const technology = match.at(1);
      const page = {
        pageId,
        routes: [],
        clearPaths: [`/blog/technologies/${escapeRouteValue(technology)}/`],
      };
      if (change === "updated") {
        const technologyPosts = posts.filter(post => post.technologies?.includes(technology));
        const pagedNumbers = generatePagedNumbers(technologyPosts);
        const pagedCount = pagedNumbers.at(-1);
        page.routes = pagedNumbers.map(pagedNumber => {
          return {
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
          };
        });
      }
      return page;
    }
  };

  const createExperiencesPage = ({ pageId, content: { experiences } }) => {
    if (pageId === "experience") {
      const page = {
        pageId,
        routes: [
          {
            type: "experience",
            routePath: "/experience/",
            data: { experiences },
          },
        ],
        clearPaths: [],
      };
      return page;
    }
  };

  const createProjectsPage = ({ pageId, content: { projects } }) => {
    if (pageId === "projects") {
      const page = {
        pageId,
        routes: [
          {
            type: "projects",
            routePath: "/projects/",
            data: { projects },
          },
        ],
        clearPaths: [],
      };
      return page;
    }
  };

  const createSlidesPage = ({ pageId, change, content: { slides } }) => {
    const match = pageId.match(/^slides:(.+)$/);
    if (match) {
      const [name] = match?.slice(1);
      const page = {
        pageId,
        routes: [],
        clearPaths: [],
      };
      if (change === "updated") {
        const data = slides.find(post => post.pageId === pageId);
        const routePath = `/slides/${name}/`;
        const mdRoutePath = `/slides/${name}/index.md`;
        page.routes.push({
          type: "slides",
          routePath,
          data: {
            ...data,
            mdRoutePath,
          },
        });
        page.routes.push({
          type: "slides-markdown",
          routePath: mdRoutePath,
          data,
        });
      } else if (change === "deleted") {
        page.clearPaths.push(`/slides/${name}/`);
      }
      return page;
    }
  };

  return {
    getHomePage() {
      return {
        homePage: createHomePage({ pageId: "home" }),
      };
    },
    getContentPages({ pageIds }) {
      const { content } = getContent();
      return {
        contentPages: pageIds.map(({ pageId, change }) => {
          return (
            createBlogPostPage({ pageId, change, content }) ||
            createExperiencesPage({ pageId, change, content }) ||
            createProjectsPage({ pageId, change, content }) ||
            createSlidesPage({ pageId, change, content }) ||
            createBlogCollection({ pageId, change, content }) ||
            createLanguageCollectionPage({ pageId, change, content }) ||
            createTechnologyCollectionPage({ pageId, change, content })
          );
        }),
      };
    },
  };
};
