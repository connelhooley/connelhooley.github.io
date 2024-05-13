export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook("content:file:afterParse", file => {
    if (file._extension = "md" && file._path.startsWith("/blog") && file.date) {
        const year = file.date.getFullYear().toString().padStart(4, "0");
        const month = (file.date.getMonth() + 1).toString().padStart(2, "0");
        const date = file.date.getDate().toString().padStart(2, "0");
        file._path = file._path.replace(/^\/blog/, `/blog/${year}/${month}/${date}`);
    }
    return file;
  });
});
