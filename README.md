# connelhooley.github.io

A handwritten static site generator. The `./build.js` file generates the static site into the `./dist` directory. To build the site run:

```bash
npm run build
```

- Files in `./src/static` are copied into `./dist`.
- The JS files in `./src/scripts` are processed using Babel and written into `./dist/js`.
- The `./src/styles/main.css` CSS file is processed using Post CSS and written to `./dist/css/main.css`.
- The `./src/templates/home.eta` Eta template is rendered to `./dist/index.html`.
- The `./src/templates/experience.eta` Eta template is rendered to `./dist/experience/index.html`. Its data is sourced from Markdown content files in the `./src/content/experience` directory. These content files are processed with Remark & Rehype.
- The `./src/templates/projects.eta` Eta template is rendered to `./dist/projects/index.html`. Its data is sourced from Markdown content files in the `./src/content/projects` directory. These content files are processed with Remark & Rehype.
- The `./src/templates/blog-post.eta` Eta template is used to render blog post pages. The blog posts are sourced from the Markdown content files in the `./src/content/blog/` directory. These content files are processed with Remark & Rehype. The pages are rendered to the `./dist/blog` directory. Files in the `./src/content/blog/` have to be placed in a folder structure that denotes the blog post's created date followed by the blog posts slug: `./src/content/blog/YYYY/MM/DD/SLUG/index.md`.
- The `./src/templates/paged-collection.eta` Eta template is used to render paged collections. Paged collections are pages that list a number of blog posts paginated. The blog posts are sourced from the Markdown content files in the `./src/content/blog/` directory. These content files are processed with Remark & Rehype. A paged collection is rendered into a directory, the first page of a paged collection is rendered to `./index.html` and subsequent pages are rendered to `./page/{pageNumber}/index.html`.
  - A paged collection is rendered into the `./dist/blog/` directory that lists all blog posts on the site.  
  - For every language given in all of the blog post's front matter, a paged collection is rendered into the `./dist/blog/{language}/` directory that lists all blog posts that have the given language in its front matter.
  - For every technology given in all of the blog post's front matter, a paged collection is rendered into the `./dist/blog/{technology}/` directory that lists all blog posts that have the given technology in its front matter.
- Image files in `./src/content/blog` are copied into `./dist/blog`.