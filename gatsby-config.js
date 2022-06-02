module.exports = {
  siteMetadata: {
    logo: "{C.H}",
    title: "Connel Hooley",
    description: ".NET/Web developer based in Norwich",
    siteUrl: "https://connelhooley.uk/",
    siteOrigin: "https://connelhooley.uk",
    email: "me@connelhooley.uk",
    social: {
      twitter: "connel_dev",
      linkedIn: "connelhooley",
    },
    cvVersion: 1,
  },
  plugins: [
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
        name: "Connel Hooley",
        short_name: "{C.H}",
        start_url: "/",
        background_color: "#f8bb15",
        theme_color: "#ffffff",
        display: "standalone",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "blog",
        path: `${__dirname}/src/blog`,
      },
    },
    // {
    //   resolve: "gatsby-plugin-google-analytics",
    //   options: {
    //     "trackingId": ""
    //   },
    // },
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "noreferrer",
            },
          },
          "gatsby-remark-reading-time",
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              noInlineHighlight: true,
            },
          },
          "gatsby-remark-ch-code-copy",
          {
            resolve: "gatsby-remark-autolink-headers",
            options: {
              isIconAfterHeader: true,
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 1200,
              linkImagesToOriginal: false,
            },
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            title: "Connel Hooley Blog RSS Feed",
            output: "rss.xml",
            query: `
              {
                allMarkdownRemark(
                  filter: {fields: {collection: {eq: "blog"}}, frontmatter: {draft: {ne: true}}}
                  sort: {fields: frontmatter___date, order: ASC}
                ) {
                  nodes {
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      date
                      description
                    }
                    html
                  }
                }
              }
            `,
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map(node => {
                return {
                  title: node.frontmatter.title,
                  description: node.frontmatter.description,
                  date: node.frontmatter.date,
                  url: `${site.siteMetadata.siteUrl}${node.fields.slug}`,
                  guid: `${site.siteMetadata.siteUrl}${node.fields.slug}`,
                  custom_elements: [{ "content:encoded": node.html }],
                };
              })
            },
          },
        ],
      },
    },
  ],
};