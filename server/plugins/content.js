export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("content:file:afterParse", file => {
    if (file._extension = "md" && file._path.startsWith("/blog")) {
      if (!file.date) {
        const segments = file._path.split("/");
        if (segments.length > 5) {
          const [year, month, day] =  segments.slice(2,5);
          file.date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
    }
    return file;
  });
});
