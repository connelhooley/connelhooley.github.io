module.exports = {
  siteMetadata: {
    title: "connelhooley",
    description: ".NET/Web developer based in Norwich",
    siteUrl: "https://connelhooley.uk/",
    social: {
      twitter: `connel_dev`,
    },
  },
  plugins: [
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.jpg",
        name: "Connel Hooley",
        short_name: "{C.H}",
        start_url: "/",
        background_color: "#f8bb15",
        theme_color: "#ffffff",
        display: "standalone",
      },
    },
    // {
    //   resolve: "gatsby-plugin-google-analytics",
    //   options: {
    //     "trackingId": ""
    //   },
    // },
    "gatsby-plugin-postcss",
  ]
};