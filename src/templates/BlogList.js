import React from "react";
import { graphql, Link } from "gatsby";

import { Layout } from "../components/Layout";
import { Button, Container, Date, Title } from "../components/Page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

const BlogList = ({ data, pageContext }) => {
  return (
    <Layout>
      <Title>
        Blog
      </Title>
      <Container>
        <BlogItems>
          {data.allMarkdownRemark.edges.map(({ node }) =>
            <BlogItem
              key={node.id}
              title={node.frontmatter.title}
              date={node.frontmatter.date}
              description={node.frontmatter.description}
              slug={node.fields.slug} />)}
          <PaginationContainer>
            <PaginationButton as={Link} to={pageContext.prevPath}>
              <FontAwesomeIcon fixedWidth icon={faAnglesLeft} />&nbsp;Prev
            </PaginationButton>
            <PaginationButton as={Link} to={pageContext.nextPath}>
              Next&nbsp;<FontAwesomeIcon fixedWidth icon={faAnglesRight} />
            </PaginationButton>
          </PaginationContainer>
        </BlogItems>
      </Container>
    </Layout>
  );
};

const BlogItems = ({ children }) => {
  return (
    <div className="grid grid-cols-1 divide-y max-w-[700px]">
      {children}
    </div>
  );
};

const BlogItem = ({ title, date, description, slug }) => {
  return (
    <div className="py-8">
      <Link className="inline-block mb-4" to={slug}><h2 className="text-4xl text-primary hover:underline">{title}&nbsp;<FontAwesomeIcon icon={faAnglesRight} /></h2></Link>
      <p className="mb-4">{description}</p>
      <div className="text-gray-500 font-light">
        <Date date={date} showRelative />
      </div>
    </div>
  );
};

const PaginationContainer = ({children}) => {
  return (
    <div className="py-8 text-center">
      {children}
    </div>
  );
};  

const PaginationButton = ({to, children, className, ...props}) => {
  if (!to) return null;
  return (
    <Button as={Link} className={classNames("first:mr-4 last:ml-4", className)} to={to} {...props}>
      {children}
    </Button>
  );
};  

export default BlogList;

export const query = graphql`
  query($limit: Int!, $skip: Int!) {
    allMarkdownRemark(
      filter: {fields: {collection: {eq: "blog"}}, frontmatter: {draft: {ne: true}}}
      sort: {fields: frontmatter___date, order: DESC}
      skip: $skip
      limit: $limit
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            description
            date
          }
        }
      }
    }
  }
`;