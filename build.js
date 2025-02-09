import { buildSite } from "@connelhooley/unified-static-site-generator"

const srcDir = "./src";
const distDir = "./dist";

await buildSite({ srcDir, distDir });

// async function buildSite() {
//   async function copyAssets() {
//     // Copy assets into dist
//   }

//   async function compileJs() {
//     // Compile JS into dist
//   }

//   async function compileCss() {
//     // Compile CSS into dist
//   }

//   await Promise.all(
//     copyStaticAssets(),
//     compileJs(),
//     compileCss(),
//     writeRoutes(routes)
//   );
// }

// async function watchSite(routes) {
//   async function watchAssets() {
//     // Watch all assets and copy changes into dist
//   }

//   async function watchScripts() {
//     // Watch JS and compile changes into dist
//   }

//   async function watchStyles() {
//     // Watch CSS and compile changes into dist
//   }

//   async function watchTemplates(routes) {
//     // Watch templates and write routes impacted
//   }

//   async function watchContent(routes) {
//     // Watch content, update routes impacted and write routes impacted
//   }

//   watchAssets(),
//     watchScripts(),
//     watchStyles(),
//     watchTemplates(),
//     watchContent(),
//     browserSync({
//       server: "dist",
//       files: "./dist/**/*",
//       port: 3000,
//       open: "local",
//       notify: false,
//     });
// }



// await buildSite(routes);
// watchSite(routes);

// // Create up data store

// // Create site map

// // Generate site

// const metaExtractor = ({ srcContentDir, srcFilePath, srcFileContents }) => {
//   const vFile = new VFile(srcFileContents);
//   matter(vFile);
//   const data = vFile.data.matter;
//   const srcContentFilePath = path.relative(srcContentDir, srcFilePath);
//   if (path.matchesGlob(srcContentFilePath, "blog/**"))
//     return {
//       type: "BLOG",
//       data,
//     };
//   if (path.matchesGlob(srcContentFilePath, "experience/**")) {
//     return {
//       type: "EXPERIENCE",
//       data,
//     };
//   }
//   if (path.matchesGlob(srcContentFilePath, "projects/**")) {
//     return {
//       type: "PROJECT",
//       data,
//     };
//   }
//   if (path.matchesGlob(srcContentFilePath, "slides/**")) {
//     return {
//       type: "SLIDE",
//       data,
//     };
//   }
// };

// const store = await createContentStore({
//   srcContentDir: "./src/content",
//   tempDir: "./temp",
//   metaExtractor,
// });
