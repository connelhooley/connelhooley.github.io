# connelhooley.github.io

A handwritten static site generator. The `./build.js` file generates the static site into the `./dist` directory. To build the site run:

```bash
npm run build
```

- Files in `./src/static` are copied into `./dist`.
- The JavaScript files in `./src/scripts` are processed using Babel and written into `./dist/js`.
- The `./src/styles/main.css` CSS file is processed using Post CSS and written to `./dist/css/main.css`.
- Files in `./src/content/blog` are processed with Remark & Rehype, then rendered into the `./src/templates/blog-post.eta` template and written into `./dist/blog`.