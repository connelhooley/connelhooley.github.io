import RSS from "rss";
import { serverQueryContent } from "#content/server"


export default defineEventHandler(async (event) => {
  const { name, url } = useSiteConfig(event);
  const { description } = useAppConfig(event);
  const resolvePath = createSitePathResolver(event, { absolute: true });
  const docs = await serverQueryContent(event).sort({ date: -1 }).where({ _partial: false }).find();
  const blogPosts = docs.filter(doc => doc?._path?.includes("/blog"));

  const feed = new RSS({
    title: name,
    site_url: url,
    feed_url: resolvePath("/rss.xml"),
    description,
  });

  for (const doc of blogPosts) {
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