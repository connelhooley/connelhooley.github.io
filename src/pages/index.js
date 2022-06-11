import React, { useRef, useCallback, useState, useMemo, forwardRef } from "react"
import { Link } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCaretUp, faCopyright, faEnvelope, faFileLines, faFilePdf, faFileWord, faPrint } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";
import classNames from "classnames";

import { useSiteMetadata } from "../hooks/SiteMetadataQuery";
import { Container } from "../components/Page";
import { SiteSeo } from "../components/Seo";

const IndexPage = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const cvMenuRef = useRef();
  const [cvMenuOpen, setCvMenuOpen] = useState(false);
  const onCvMenuBlur = useCallback((e) => {
    if (!cvMenuRef?.current?.contains(e.relatedTarget)) {
      setCvMenuOpen(false);
    }
  }, []);
  const { title, logo, email, social: { twitter, linkedIn }, cvVersion } = useSiteMetadata();
  return (
    <>
      <SiteSeo />
      <main>
        <HomeSection mode="primary">
          <HomePrimaryTitle>{logo}</HomePrimaryTitle>
          <HomePrimaryTagLine>
            .NET/Web developer based in Norwich, UK
          </HomePrimaryTagLine>
          <HomeButtons>
            <HomeButton mode="primary" as={Link} to="/blog/">
              <FontAwesomeIcon icon={faArrowRight} />&nbsp;Go to Blog
            </HomeButton>
          </HomeButtons>
        </HomeSection>
        <HomeSection mode="secondary">
          <HomeButtons>
            <HomeButton mode="secondary" href={`mailto:${email}`} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faEnvelope} />&nbsp;Email
            </HomeButton>
            <HomeButton mode="secondary" href={`https://twitter.com/${twitter}`} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTwitter} />&nbsp;Twitter
            </HomeButton>
            <HomeButton mode="secondary" href={`https://uk.linkedin.com/in/${linkedIn}`} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faLinkedin} />&nbsp;LinkedIn
            </HomeButton>
            <HomeMenuContainer ref={cvMenuRef} role="menu" tabIndex={-1} aria-haspopup="true" aria-expanded={cvMenuOpen} onBlur={onCvMenuBlur}>
              <HomeButton as="button" mode="secondary" id="cvDropdownOpen" onClick={() => setCvMenuOpen(o => !o)}>
                <FontAwesomeIcon icon={faFileLines} />&nbsp;CV&nbsp;<FontAwesomeIcon icon={faCaretUp} />
              </HomeButton>
              <HomeMenuItems ria-labelledby="cvDropdownOpen" menuOpen={cvMenuOpen}>
                <HomeMenuItem href={`/ConnelHooleyCV.pdf?v=${cvVersion}`} target="_blank" rel="noreferrer">
                  <FontAwesomeIcon icon={faFilePdf} />&nbsp;PDF
                </HomeMenuItem>
                <HomeMenuItem href={`/ConnelHooleyCV.docx?v=${cvVersion}`} target="_blank" rel="noreferrer">
                  <FontAwesomeIcon icon={faFileWord} />&nbsp;Word
                </HomeMenuItem>
                <HomeMenuItem href={`/ConnelHooleyCV-Printer-Friendly.docx?v=${cvVersion}`} target="_blank" rel="noreferrer">
                  <FontAwesomeIcon icon={faPrint} />&nbsp; Word (Printer friendly)
                </HomeMenuItem>
              </HomeMenuItems>
            </HomeMenuContainer>
            {cvMenuOpen && <HomeMenuBackdrop />}
          </HomeButtons>
          <HomeFooter>
            {title}&nbsp;<FontAwesomeIcon icon={faCopyright} />&nbsp;{year}
          </HomeFooter>
        </HomeSection>
      </main>
    </>
  );
};

const HomePrimaryTitle = ({ className, children, ...props }) => {
  return (
    <h1 className={classNames("invert-selection font-logo font-black tracking-widest sm:tracking-[1.5rem] text-7xl sm:text-9xl text-white mb-8 sm:mb-12", className)} {...props}>
      {children}
    </h1>
  );
};

const HomePrimaryTagLine = ({ className, children, ...props }) => {
  return (
    <p className={classNames("invert-selection text-2xl sm:text-3xl text-black tracking-wide font-light mb-8 sm:mb-12", className)} {...props}>
      {children}
    </p>
  );
};

const HomeSection = ({ as: Component = "div", mode, className, children, ...props }) => {
  const style = {
    "bg-primary": mode === "primary",
    "bg-gray-700": mode === "secondary"
  };
  return (
    <Component className={classNames(style, className)} {...props}>
      <Container>
        <div className="mx-auto text-center max-w-[700px] py-12">
          {children}
        </div>
      </Container>
    </Component>
  );
};

const HomeButtons = ({ className, children, ...props }) => {
  return (
    <div className={classNames("mx-auto max-w-[500px]", className)} {...props}>
      {children}
    </div>
  );
};

const HomeMenuItems = ({ menuOpen, className, children, ...props }) => {
  const style = {
    "hidden": !menuOpen,
    "z-50 border border-gray-900 block absolute bottom-full": menuOpen
  };
  return (
    <div className={classNames(style, className)} {...props}>
      {children}
    </div>
  );
};

const HomeMenuItem = ({ as: Component = "a", className, children, ...props }) => {
  return (
    <Component role="menuitem" className={classNames("text-left block w-full bg-white text-black hover:bg-primary-light px-6 py-3 text-lg", className)} {...props}>
      {children}
    </Component>
  );
};

const HomeButton = ({ as: Component = "a", mode, className, children, ...props }) => {
  const style = {
    "block text-center w-full transition-colors duration-400 p-6 text-xl mb-4 last:mb-0": true,
    "bg-black text-white hover:text-primary": mode === "primary",
    "bg-gray-700 text-primary border border-primary hover:bg-primary hover:text-white": mode === "secondary",
  };
  return (
    <Component className={classNames(style, className)} {...props}>
      {children}
    </Component>
  );
};

const HomeMenuContainer = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={classNames("relative 4 mb-4 last:mb-0", className)} {...props}>
      {children}
    </div>
  );
});

const HomeMenuBackdrop = () => {
  return (
    <div className="fixed z-40 inset-0"></div>
  );
};

const HomeFooter = ({ className, children, ...props }) => {
  return (
    <footer className={classNames("text-sm text-white text-center mt-12 -mb-4", className)} {...props}>
      {children}
    </footer>
  );
};

export default IndexPage;
