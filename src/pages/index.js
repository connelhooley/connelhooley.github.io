import React, { useRef, useCallback, useState, useMemo } from "react"
import { Link } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCaretUp, faCopyright, faEnvelope, faFileLines, faFilePdf, faFileWord, faPrint } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";
import classNames from "classnames";

import { useSiteMetadata } from "../hooks/SiteMetadataQuery";
import { Container, Section } from "../components/Page";

const IndexPage = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const cvMenuRef = useRef();
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);
  const onCvMenuBlur = useCallback((e) => {
    if (!cvMenuRef.current.contains(e.relatedTarget)) {
      setCvDropdownOpen(false);
    }
  }, []);
  const { logo, email, social: { twitter, linkedIn }, cvVersion } = useSiteMetadata();
  return (
    <main>
      <div className="bg-primary">
        <Container>
          <Section className="text-center max-w-[700px] py-12">
            <h1 className="font-logo font-black tracking-widest sm:tracking-[1.5rem] text-7xl sm:text-9xl text-white mb-8 sm:mb-12">{logo}</h1>
            <p className="text-2xl sm:text-3xl text-black tracking-wide font-light mb-8 sm:mb-12">
              .NET/Web developer based in Norwich, UK
            </p>
            <div className="max-w-[500px] mx-auto">
              <Link to="/blog" className="block text-center w-full bg-black hover:text-primary hover:bg-gray-700 transition-colors duration-400 text-white p-6 text-xl sm:text-2xl">
                <FontAwesomeIcon icon={faArrowRight} />&nbsp;Go to Blog
              </Link>
            </div>
          </Section>
        </Container>
      </div>
      <div className="bg-gray-700">
        <Container>
          <Section className="max-w-[500px] py-12">
            <a href={`mailto:${email}`} target="_blank" rel="noreferrer" className="block text-center w-full text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-400 p-6 mb-4 text-xl sm:text-2xl">
              <FontAwesomeIcon icon={faEnvelope} />&nbsp;Email
            </a>
            <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noreferrer" className="block text-center w-full text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-400 p-6 mb-4 text-xl sm:text-2xl">
              <FontAwesomeIcon icon={faTwitter} />&nbsp;Twitter
            </a>
            <a href={`https://uk.linkedin.com/in/${linkedIn}`} target="_blank" rel="noreferrer" className="block text-center w-full text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-400 p-6 mb-4 text-xl sm:text-2xl">
              <FontAwesomeIcon icon={faLinkedin} />&nbsp;LinkedIn
            </a>
            <div ref={cvMenuRef} role="menu" className="relative" tabIndex={-1} aria-haspopup="true" aria-expanded={cvDropdownOpen} onBlur={onCvMenuBlur}>
              <button id="cvMenuButton" className="block text-center w-full text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-400 p-6 mb-4 text-xl sm:text-2xl" onClick={() => setCvDropdownOpen(o => !o)}>
                <FontAwesomeIcon icon={faFileLines} />&nbsp;CV&nbsp;<FontAwesomeIcon icon={faCaretUp} />
              </button>
              <div ria-labelledby="cvMenuButton" className={classNames({ "hidden": !cvDropdownOpen, "z-50 border border-gray-900 block absolute bottom-full": cvDropdownOpen })}>
                <a role="menuitem"  href={`/ConnelHooleyCV.pdf?v=${cvVersion}`} target="_blank" rel="noreferrer" className="block w-full bg-white text-black hover:bg-primary-light px-6 py-3 text-xl sm:text-2xl">
                  <FontAwesomeIcon icon={faFilePdf} />&nbsp;PDF
                </a>
                <a role="menuitem" href={`/ConnelHooleyCV.docx?v=${cvVersion}`} target="_blank" rel="noreferrer" className="block w-full bg-white text-black hover:bg-primary-light px-6 py-3 text-xl sm:text-2xl">
                  <FontAwesomeIcon icon={faFileWord} />&nbsp;Word
                </a>
                <a role="menuitem"  href={`/ConnelHooleyCV-Printer-Friendly.docx?v=${cvVersion}`} target="_blank" rel="noreferrer" className="block w-full bg-white text-black hover:bg-primary-light px-6 py-3 text-xl sm:text-2xl">
                  <FontAwesomeIcon icon={faPrint} />&nbsp; Word (Printer friendly)
                </a>
              </div>
            </div>
            {/* Prevents clicks to other elements while menu is open */}
            {cvDropdownOpen && <div className="fixed z-40 inset-0"></div>}
          </Section>
          <footer className="text-sm text-white text-center -mt-6 pb-6">
            Connel Hooley&nbsp;<FontAwesomeIcon icon={faCopyright} />&nbsp;{year}
          </footer>
        </Container>
      </div>
    </main>
  );
};

export default IndexPage;
