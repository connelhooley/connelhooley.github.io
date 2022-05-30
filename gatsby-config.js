module.exports = {
  siteMetadata: {
    logo: "{C.H}",
    title: "Connel Hooley",
    description: ".NET/Web developer based in Norwich",
    siteUrl: "https://connelhooley.uk/",
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
              target: "_self",
              rel: "nofollow",
            },
          },
        ],
      },
    },
  ],
};