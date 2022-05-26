import { useStaticQuery, graphql } from "gatsby";

const useSiteMetadata = () => {
  const {site: {siteMetadata}} = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          siteUrl
          social {
            twitter
          }
        }
      }
    }
  `);
  return siteMetadata;
}

export {
  useSiteMetadata,
};