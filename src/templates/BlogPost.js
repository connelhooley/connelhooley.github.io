import React from "react";
import { graphql } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCode, faShareAlt, faTag } from "@fortawesome/free-solid-svg-icons";

import { Layout } from "../components/Layout";
import { Header, Title, Container, Section } from "../components/Page";
import { Copy } from "../components/Copy";
import { Date } from "../components/Date";
import { Tag } from "../components/Tag";
import { PageSeo } from "../components/Seo";
import { faLinkedin, faReddit, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { useSiteMetadata } from "../hooks/SiteMetadataQuery";

const BlogPost = ({ data, pageContext: {slug} }) => {
  const {siteUrl} = useSiteMetadata();
  const {
    frontmatter: { title, description, date, languages, technologies },
    fields: { readingTime },
    html,
    tableOfContents } = data.markdownRemark;
  console.info(tableOfContents);
  return (
    <Layout>
      <PageSeo title={title} tabTitleSegments={["Blog", title]} description={description} />
      <Header>
        <Title className="text-5xl mb-4">{title}</Title>
        <p className="text-black uppercase text-xl mb-4">{description}</p>
        <p className="text-black uppercase text-md mb-4"><Date value={date} showRelative /></p>
        <p className="text-black uppercase text-md mb-4"><FontAwesomeIcon icon={faClock} />&nbsp;{readingTime.text}</p>
        <p>
          {languages && languages.map((language, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faCode} />&nbsp;{language}</Tag>)}
          {technologies && technologies.map((technology, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faTag} />&nbsp;{technology}</Tag>)}
        </p>
      </Header>
      <div className="bg-gray-400/95 sticky top-0 z-50">
        <Container className="flex justify-start items-center py-2 gap-1 text-xs">
          <span className="text-white"><FontAwesomeIcon icon={faShareAlt} />&nbsp;Share</span>
          <a className="p-2 text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-400" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} by @connel_dev`)}&url=${encodeURIComponent(siteUrl + slug)}`} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faTwitter} />&nbsp;Twitter</a>
          <a className="p-2 text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-400" href={`https://www.reddit.com/submit?url=${encodeURIComponent(siteUrl + slug)}`} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faReddit} />&nbsp;Reddit</a>
          <a className="p-2 text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-400" href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(siteUrl + slug)}&title=${encodeURIComponent(title)}`} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faLinkedin} />&nbsp;LinkedIn</a>
        </Container>
      </div>
      <Container>
        <Section>
          <div className="w-72 mb-4 ml-4 float-right relative z-10">
            <h1 className="text-4xl p-2 bg-gray-900 text-white">Contents</h1>
            <div className="toc" dangerouslySetInnerHTML={{ __html: tableOfContents }} />
          </div>
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
      tableOfContents
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
