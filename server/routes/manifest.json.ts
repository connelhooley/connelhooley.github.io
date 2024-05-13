export default defineEventHandler(async (event) => {
  const { name, url } = useSiteConfig(event);
  const { logo } = useAppConfig(event);
  event.node.res.setHeader("content-type", "application/json");
  event.node.res.end(JSON.stringify({
    "name": name,
    "short_name": logo,
    "start_url": url,
    "display": "standalone",
    "background_color": "#F8BB15",
    "theme_color": "#FFFFFF",
    "icons": [
      {
        "purpose": "maskable",
        "sizes": "512x512",
        "src": "icon512_maskable.png",
        "type": "image/png"
      },
      {
        "purpose": "any",
        "sizes": "512x512",
        "src": "icon512_rounded.png",
        "type": "image/png"
      }
    ]
  }));
});
