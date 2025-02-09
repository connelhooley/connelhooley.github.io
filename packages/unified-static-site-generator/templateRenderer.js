import path from "path";

import { Eta } from "eta";

export function createTemplateRenderer({ srcDir }) {
  const globals = {
    name: "Connel Hooley",
    year: new Date().getFullYear(),
    email: "me@connelhooley.uk",
    mastodon: "https://mastodon.social/@connel",
    linkedIn: "https://uk.linkedin.com/in/connelhooley",
  };
  const eta = new Eta({
    views: path.join(srcDir, "templates"),
    functionHeader: `const _globals = ${JSON.stringify(globals)};`,
  });

  return (templateName, data) => eta.renderAsync(templateName, data);
}
