const path = require("path");

const { createFilePath } = require("gatsby-source-filesystem");

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === "MarkdownRemark") {
    const collection = getNode(node.parent).sourceInstanceName;
    createNodeField({
      node,
      name: "collection",
      value: collection,
    });
    if (collection === "blog") {
      const slug = createFilePath({ node, getNode, basePath: collection });
      createNodeField({
        node,
        name: "slug",
        value: `/blog${slug}`,
      });
    }
  }
};

exports.createPages = async function ({ actions, graphql }) {
  await createBlogPages({ actions, graphql });
  await createPolicyPages({ actions, graphql });
};

const createBlogPages = async function ({ actions, graphql }) {
  const { createPage } = actions;
  const { data } = await graphql(`
    query {
      allMarkdownRemark(
        filter: {fields: {collection: {eq: "blog"}}}
        sort: {fields: frontmatter___date}
      ) {
        edges {
          node {
            fields {
              collection
              slug
            }
          }  
          previous {
            fields {
              slug
            }
          }
          next {
            fields {
              slug
            }
          }
        }
      }
    }
  `);
  data.allMarkdownRemark.edges.forEach((edge) => {
    const { slug } = edge.node.fields;
    const prevSlug = edge.previous?.fields?.slug;
    const nextSlug = edge.next?.fields?.slug;
    createPage({
      path: slug,
      component: require.resolve("./src/templates/BlogPost.js"),
      context: { slug, prevSlug, nextSlug },
    });
  });
  const pageSize = 5;
  const itemCount = data.allMarkdownRemark.edges.length;
  const pageCount = Math.ceil(itemCount / pageSize);
  const createBlogListPath = (pageNumber) => {
    if (pageNumber < 1 && pageNumber > pageCount) {
      return null;
    }
    if (pageNumber === 1) {
      return "/blog";
    }
    return `/blog/${pageNumber}`;
  }
  Array.from({ length: pageCount }).forEach((_, i) => {
    const currentPage = i + 1;
    const path = createBlogListPath(currentPage);
    const prevPath = createBlogListPath(currentPage - 1);
    const nextPath = createBlogListPath(currentPage + 1);
    createPage({
      path,
      component: path.resolve("./src/templates/BlogList.js"),
      context: {
        limit: pageSize,
        skip: i * pageSize,
        prevPath,
        nextPath,
      },
    });
  });
};
