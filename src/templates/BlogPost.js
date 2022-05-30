import React from "react";
import { graphql } from "gatsby";

import { Layout } from "../components/Layout";

const BlogPost = ({data}) => {
  const { frontmatter: { title } } = data.markdownRemark;
  return (
    <Layout>
      <h1 className="text-4xl mb-6">{title}</h1>
    </Layout>
  );
};

export default BlogPost;

export const query = graphql`
  query($slug: String!, $prevSlug: String, $nextSlug: String) {
    markdownRemark(
      fields: {slug: {eq: $slug}, collection: {eq: "blog"}}
    ) {
      frontmatter {
        title
      }
      excerpt: excerpt(format: PLAIN, pruneLength: 160, truncate: true)
      html
    }
    prev: markdownRemark(
      fields: {slug: {eq: $prevSlug}, collection: {eq: "blog"}}
    ) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(
      fields: {slug: {eq: $nextSlug}, collection: {eq: "blog"}}
    ) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
