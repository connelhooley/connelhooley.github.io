import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faGlobe, faTag } from "@fortawesome/free-solid-svg-icons";

import { Layout } from "../components/Layout";
import { Header, Title, Container, Section } from "../components/Page";
import { Copy } from "../components/Copy";
import { Tag } from "../components/Tag";

const ExperiencePage = () => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: {fields: {collection: {eq: "experiences"}}}
        sort: {fields: frontmatter___start, order: DESC}
      ) {
        edges {
          node {
            id
            frontmatter {
              title
              start
              end
              website
              languages
              technologies
            }
            html
          }
        }
      }
    }
`);

  return (
    <Layout>
      <Header>
        <Title>Experience</Title>
      </Header>
      <Container>
        <Section>
          <ExperienceItems>
            {allMarkdownRemark.edges.map(({ node }) =>
              <ExperienceItem
                key={node.id}
                html={node.html}
                title={node.frontmatter.title}
                start={node.frontmatter.start}
                end={node.frontmatter.end}
                website={node.frontmatter.website}
                languages={node.frontmatter.languages}
                technologies={node.frontmatter.technologies} />)}
          </ExperienceItems>
        </Section>
      </Container>
    </Layout>
  );
};

const ExperienceItems = ({ children }) => {
  return (
    <div className="max-w-[700px] grid-cols-1 divide-y">
      {children}
    </div>
  )
};

const ExperienceItem = ({ html, title, start, end, website, languages, technologies }) => {
  return (
    <div className="py-8">
      <Copy className="mb-4">
        <h1>{title}&nbsp;<small>&nbsp;{start} - {end ?? "Now"}</small></h1>
        {website && <p><FontAwesomeIcon icon={faGlobe} />&nbsp;<a href={website} target="_blank" rel="noreferrer">{website}</a></p>}
      </Copy>
      <Copy className="mb-4" dangerouslySetInnerHTML={{ __html: html }} />
      <div>
          {languages && languages.map((language, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faCode} />&nbsp;{language}</Tag>)}
          {technologies && technologies.map((technology, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faTag} />&nbsp;{technology}</Tag>)}
        </div>
    </div>
  );
};

export default ExperiencePage;
