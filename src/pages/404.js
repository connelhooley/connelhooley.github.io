import React from "react";
import { Link } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

import { Layout } from "../components/Layout";
import { Header, Container, Section, Title } from "../components/Page";
import { Button } from "../components/Button";

const NotFoundPage = () => {
  return (
    <Layout>
      <Header className="text-center">
        <h1 className="font-logo font-black text-white tracking-widest sm:tracking-[1.5rem] text-8xl mb-12">{"{"}4.0.4{"}"}</h1>
        <p><Link className="inline-block p-4 text-center bg-black text-white hover:text-primary transition-colors duration-400" to="/"><FontAwesomeIcon icon={faHome} />&nbsp;Home</Link></p>
      </Header>
      <Container>
        <Section>
        </Section>
      </Container>
    </Layout>
  )
};

export default NotFoundPage
