import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faGlobe, faTag } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import { Layout } from "../components/Layout";
import { Header, Title, Container, Section } from "../components/Page";
import { Copy } from "../components/Copy";
import { Tag } from "../components/Tag";

const ProjectsPage = () => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: {fields: {collection: {eq: "projects"}}}
        sort: {fields: frontmatter___order, order: ASC}
      ) {
        edges {
          node {
            id
            frontmatter {
              title
              website
              languages
              technologies
              github
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
        <Title>Projects</Title>
      </Header>
      <Container>
        <Section>
          <ProjectsItems>
            {allMarkdownRemark.edges.map(({ node }) =>
              <ProjectItem
                key={node.id}
                html={node.html}
                title={node.frontmatter.title}
                github={node.frontmatter.github}
                website={node.frontmatter.website}
                languages={node.frontmatter.languages}
                technologies={node.frontmatter.technologies} />)}
          </ProjectsItems>
        </Section>
      </Container>
    </Layout>
  );
};

const ProjectsItems = ({ children }) => {
  return (
    <div className="max-w-[700px] grid-cols-1 divide-y">
      {children}
    </div>
  )
};

const ProjectItem = ({ html, title, website, github, languages, technologies }) => {
  return (
    <div className="py-8">
      <Copy className="mb-4">
        <h1>{title}</h1>
        {website && <p className="truncate"><FontAwesomeIcon icon={github ? faGithub : faGlobe} />&nbsp;<a href={website} target="_blank" rel="noreferrer">{website}</a></p>}
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

export default ProjectsPage;
