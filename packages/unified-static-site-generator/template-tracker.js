export function createTemplateTracker() {
  const mapTemplateFilePath = (templateFilePath) => {
    if (templateFilePath === "templates/blog-collection.eta") {
      return ["blog-collection"];
    } else if (templateFilePath === "templates/blog-post.eta") {
      return ["post"];
    } else if (templateFilePath === "templates/experience.eta") {
      return ["experience"];
    } else if (templateFilePath === "templates/home.eta") {
      return ["home"];
    } else if (templateFilePath === "templates/projects.eta") {
      return ["projects"];
    } else if (templateFilePath === "templates/slides.eta") {
      return ["slides"];
    } else if (templateFilePath === "layouts/default.eta") {
      return [
        "blog-collection",
        "post",
        "experience",
        "projects",
      ];
    } else if (templateFilePath === "partials/tags.eta") {
      return [
        "blog-collection",
        "experience",
        "projects",
      ];
    } else if (templateFilePath === "partials/toc.eta") {
      return ["post"];
    } else {
      return [];
    }
  };

  return {
    getImpactedRouteTypes({ templateFilePaths }) {
      return {
        impactedRouteTypes: [...new Set(templateFilePaths.flatMap(mapTemplateFilePath))],
      };
    },
  };
}