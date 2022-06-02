import React from "react";
import { graphql } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCode, faTag } from "@fortawesome/free-solid-svg-icons";

import { Layout } from "../components/Layout";
import { Header, Title, Container, Section, Copy, Date, Tag } from "../components/Page";

const BlogPost = ({ data }) => {
  const { frontmatter: { title, description, date, languages, technologies }, fields: { readingTime }, html } = data.markdownRemark;
  return (
    <Layout>
      <Header>
        <Title className="text-5xl mb-4">{title}</Title>
        <p className="text-black uppercase text-xl mb-4">{description}</p>
        <p className="text-black uppercase text-md mb-4"><Date date={date} showRelative /></p>
        <p className="text-black uppercase text-md mb-4"><FontAwesomeIcon icon={faClock} />&nbsp;{readingTime.text}</p>
        <p>
          {languages && languages.map((language, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faCode} />&nbsp;{language}</Tag>)}
          {technologies && technologies.map((technology, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faTag} />&nbsp;{technology}</Tag>)}
        </p>
      </Header>
      <Container>
        <Section>
          <Copy dangerouslySetInnerHTML={{ __html: html }} />
        </Section>
      </Container>
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
        description
        date
        languages
        technologies
      }
      fields {
        readingTime {
          text
        }
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
