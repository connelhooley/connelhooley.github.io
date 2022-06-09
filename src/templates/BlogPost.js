import React, { useCallback, useEffect, useRef, useState } from "react";
import { graphql } from "gatsby";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faClock, faCode, faComment, faExternalLinkAlt, faShareAlt, faTag } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faReddit, faTwitter } from "@fortawesome/free-brands-svg-icons";

import { Layout } from "../components/Layout";
import { Header, Title, Container, Section } from "../components/Page";
import { Copy } from "../components/Copy";
import { Date } from "../components/Date";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { PageSeo } from "../components/Seo";
import { useSiteMetadata } from "../hooks/SiteMetadataQuery";

const BlogPost = ({ data, pageContext: { slug } }) => {
  const contentRef = useRef();
  const [showScrollButton, setShowScrollButton] = useState();
  const onScroll = useCallback((e) => {
    if (contentRef.current) {
      var { top } = contentRef.current.getBoundingClientRect();
      if (window.scrollY > top) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    }
  }, []);
  const scrollToTop = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [onScroll]);
  const { siteUrl, presentationSiteOrigin } = useSiteMetadata();
  const {
    frontmatter: { title, description, date, toc, showReadingTime, presentation, languages, technologies },
    html,
    tableOfContents,
    timeToRead } = data.markdownRemark;
  return (
    <Layout>
      <PageSeo title={title} tabTitleSegments={["Blog", title]} description={description} />
      <Header>
        <BlogPostTitle>{title}</BlogPostTitle>
        <BlogPostMeta large>{description}</BlogPostMeta>
        <BlogPostMeta><Date value={date} showRelative /></BlogPostMeta>
        {showReadingTime !== false && <BlogPostMeta><FontAwesomeIcon icon={faClock} />&nbsp;{timeToRead} mins to read</BlogPostMeta>}
        <BlogPostMeta>
          {languages && languages.map((language, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faCode} />&nbsp;{language}</Tag>)}
          {technologies && technologies.map((technology, i) =>
            <Tag key={i}><FontAwesomeIcon icon={faTag} />&nbsp;{technology}</Tag>)}
        </BlogPostMeta>
      </Header>
      <BlogPostToolbar>
        <BlogPostToolbarButtonGroup>
          <BlogPostShareLabel>
            <FontAwesomeIcon icon={faShareAlt} />&nbsp;Share
          </BlogPostShareLabel>
          <BlogPostToolbarButton
            as="a"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} by @connel_dev`)}&url=${encodeURIComponent(siteUrl + slug)}`}
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faTwitter} /><BlogPostShareButtonLabel>&nbsp;Twitter</BlogPostShareButtonLabel>
          </BlogPostToolbarButton>
          <BlogPostToolbarButton
            as="a"
            href={`https://www.reddit.com/submit?url=${encodeURIComponent(siteUrl + slug)}`}
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faReddit} /><BlogPostShareButtonLabel>&nbsp;Reddit</BlogPostShareButtonLabel>
          </BlogPostToolbarButton>
          <BlogPostToolbarButton
            as="a"
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(siteUrl + slug)}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} /><BlogPostShareButtonLabel>&nbsp;LinkedIn</BlogPostShareButtonLabel>
          </BlogPostToolbarButton>
        </BlogPostToolbarButtonGroup>
        <BlogPostToolbarButtonGroup>
          {showScrollButton && <BlogPostToolbarButton onClick={scrollToTop}>
            <FontAwesomeIcon icon={faArrowUp} />&nbsp;Back to top
          </BlogPostToolbarButton>}
          <BlogPostToolbarButton>
            <FontAwesomeIcon icon={faComment} />&nbsp;Comments
          </BlogPostToolbarButton>
        </BlogPostToolbarButtonGroup>
      </BlogPostToolbar>
      <Container>
        <Section>
          {toc !== false && <BlogPostTableOfContents dangerouslySetInnerHTML={{ __html: tableOfContents }} />}
          <Copy ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
        </Section>
      </Container>
      {presentation &&
        <BlogPostPresentationButtonSection>
          <Button as="a" href={`${presentationSiteOrigin}${presentation}`} target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faExternalLinkAlt} />&nbsp;Open presentation
          </Button>
        </BlogPostPresentationButtonSection>}
    </Layout>
  );
};

const BlogPostTitle = ({ children }) => {
  return (
    <Title className="text-5xl mb-4">{children}</Title>
  );
};

const BlogPostMeta = ({ large, children }) => {
  const style = {
    "text-black uppercase mb-4 last:mb-0": true,
    "text-md": !large,
    "text-lg": large
  };
  return (
    <div className={classNames(style)}>{children}</div>
  );
};

const BlogPostToolbar = ({ children }) => {
  return (
    <div className="bg-gray-400/95 sticky top-0 z-50">
      <Container className="flex justify-between items-center py-2 gap-1 text-xs">
        {children}
      </Container>
    </div>
  );
};

const BlogPostToolbarButtonGroup = ({ children }) => {
  return (
    <div className="flex justify-start items-center gap-1">
      {children}
    </div>
  );
};



const BlogPostShareLabel = ({ children }) => {
  return (
    <span className="text-white">
      {children}
    </span>
  );
};

const BlogPostToolbarButton = ({ as: Component = "button", className, children, ...props }) => {
  return (
    <Component className={classNames("p-2 text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-400", className)} {...props}>
      {children}
    </Component>
  );
};

const BlogPostShareButtonLabel = ({ children }) => {
  return (
    <span className="hidden sm:inline">
      {children}
    </span>
  );
};

const BlogPostTableOfContents = ({ className, ...props }) => {
  return (
    <div className="sm:w-72 mb-4 sm:ml-4 sm:float-right sm:relative sm:z-10">
      <h1 className=" text-3xl p-2 bg-gray-900 text-white">Contents</h1>
      <div className={classNames(className, "toc")} {...props} />
    </div>
  );
};

const BlogPostPresentationButtonSection = ({ children }) => {
  return (
    <Section>
      <div className="bg-gray-200 text-center p-8">
        {children}
      </div>
    </Section>
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
        showReadingTime
        toc
        presentation
        languages
        technologies
      }
      excerpt: excerpt(format: PLAIN, pruneLength: 160, truncate: true)
      html
      tableOfContents
      timeToRead
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
