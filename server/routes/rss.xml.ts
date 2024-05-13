import RSS from "rss";
import { serverQueryContent } from "#content/server";

export default defineEventHandler(async (event) => {
  const { name, url } = useSiteConfig(event);
  const { description } = useAppConfig(event);
  const resolvePath = createSitePathResolver(event, { absolute: true });
  const docs = await serverQueryContent(event)
    .where({ _path: { $regex: "^/blog/.*" } })
    .sort({ date: -1 })
    .find();

  const feed = new RSS({
    title: name,
    site_url: url,
    feed_url: resolvePath("/rss.xml"),
    description,
  });

  for (const doc of docs) {
    feed.item({
      title: doc.title ?? "-",
      url: resolvePath(doc._path ?? ""),
      date: doc.date,
      description: doc.description,
    })
  }
  
  const feedString = feed.xml({ indent: true });

  event.node.res.setHeader("content-type", "text/xml");
  event.node.res.end(feedString);
});
