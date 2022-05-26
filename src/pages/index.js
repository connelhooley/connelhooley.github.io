import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { useSiteMetadata } from "../hooks/SiteMetadataQuery";
import { Container } from "../components/Page";
import { Link } from "gatsby";

const IndexPage = () => {
  const {title} = useSiteMetadata();
  return (
    <main>
      <div className="bg-primary">
        <Container>
          <div className="text-center p-12 max-w-[800px] mx-auto">
            <h1 className="font-logo font-black tracking-widest sm:tracking-[1.5rem] text-9xl text-white mb-12">{title}</h1>
            <p className="text-3xl text-black tracking-wide font-light">
              My name is Connel Hooley and I am a .NET/Web developer based in Norwich.
            </p>
          </div>
          <div className="pb-12 max-w-[500px] mx-auto">
            <Link to="/blog" className="block text-center w-full mx-auto bg-black hover:text-primary hover:bg-gray-800 transition-colors duration-400 text-white p-6 text-3xl">
              <FontAwesomeIcon icon={faArrowRight} />&nbsp;Go to Blog
            </Link>
          </div>
        </Container>
      </div>
    </main>
  );
};

export default IndexPage;
