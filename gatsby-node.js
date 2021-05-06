const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.createPages = async ({
  graphql,
  actions: { createPage },
  reporter,
}) => {
  // Define a templates
  const blogPostTemplate = path.resolve(`./src/templates/blog-post.js`);
  const blogListTemplate = path.resolve(`./src/templates/blog-list.js`);

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { draft: { ne: true } } }
        sort: { fields: [frontmatter___date], order: ASC }
        limit: 1000
      ) {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            year: date(formatString: "YYYY")
            month: date(formatString: "MM")
            day: date(formatString: "DD")
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    );
    return;
  }

  const posts = result.data.allMarkdownRemark.nodes;

  // Create blog post pages
  // `context` is available in the template as a prop and as a variable in GraphQL
  posts.forEach((post, index) => {
    const previousPostId = index === 0 ? null : posts[index - 1].id;
    const nextPostId =
      index === posts.length - 1 ? null : posts[index + 1].id;
    createPage({
      path: post.fields.slug,
      component: blogPostTemplate,
      context: {
        id: post.id,
        previousPostId,
        nextPostId,
      },
    });
  });

  // Create blog list pages
  // `context` is available in the template as a prop and as a variable in GraphQL
  const postsPerPage = 2;
  const numPages = Math.ceil(posts.length / postsPerPage);
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? `/` : `/page/${i + 1}`,
      component: blogListTemplate,
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1,
      },
    });
  });
};

exports.onCreateNode = ({ node, actions: {createNodeField}, getNode }) => {
  if (node.internal.type === `MarkdownRemark`) {
    const filePath = createFilePath({ node, getNode, trailingSlash: false  });
    const postDate = new Date(node.frontmatter.date);
    const postYear = postDate.getFullYear().toString().padStart(4, `0`);
    const postMonth = (postDate.getMonth() + 1).toString().padStart(2, `0`);
    const postDay = postDate.getDate().toString().padStart(2, `0`);
    const prefix = `/blog/${postYear}/${postMonth}/${postDay}`;
    createNodeField({
      node,
      name: `slug`,
      value: prefix + filePath,
    });
  }
};

exports.createSchemaCustomization = ({ actions: {createTypes} }) => {
  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
    }

    type Fields {
      slug: String
    }
  `);
};
