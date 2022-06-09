import { useStaticQuery, graphql } from "gatsby";

const useSiteMetadata = () => {
  const {site: {siteMetadata}} = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          logo
          title
          description
          siteUrl
          siteOrigin
          presentationSiteOrigin
          email
          social {
            twitter
            linkedIn
          }
          cvVersion
        }
      }
    }
  `);
  return siteMetadata;
}

export {
  useSiteMetadata,
};