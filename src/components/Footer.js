import React, { useMemo } from "react";
import { Link } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright, faEnvelope, faRss } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faMastodon } from "@fortawesome/free-brands-svg-icons";
import classNames from "classnames";

import { useSiteMetadata } from "../hooks/SiteMetadataQuery";
import { Container } from "../components/Page";

const Footer = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const { title, email, social: { mastodon, linkedIn } } = useSiteMetadata();
  return (
    <footer className="mt-8 mb-4">
      <Container>
        <div className="sm:flex sm:justify-between">
          <div className="flex justify-center mb-4 sm:mb-0">
            <FooterItem>
              {title}&nbsp;<FontAwesomeIcon icon={faCopyright} />&nbsp;{year}
            </FooterItem>
          </div>
          <div className="flex justify-center gap-4">
            <FooterLink href={`mailto:${email}`} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faEnvelope} />&nbsp;Email
            </FooterLink>
            <FooterLink href={mastodon} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faMastodon} />&nbsp;Mastodon
            </FooterLink>
            <FooterLink href={`https://uk.linkedin.com/in/${linkedIn}`} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faLinkedin} />&nbsp;LinkedIn
            </FooterLink>
            <FooterLink as={Link} to="/rss.xml" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faRss} />&nbsp;RSS
            </FooterLink>
          </div>
        </div>
      </Container>
    </footer>
  );
};

const FooterItem = ({ as: Component = "span", className, children, ...props }) => {
  return (
    <Component className={classNames("inline-block text-gray-500 font-thin", className)} {...props}>
      {children}
    </Component>
  );
};

const FooterLink = ({ as = "a", className, children, ...props }) => {
  return (
    <FooterItem as={as} className={classNames("hover:text-gray-700", className)} {...props}>
      {children}
    </FooterItem>
  );
};

export {
  Footer,
};