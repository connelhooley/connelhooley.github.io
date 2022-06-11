import React from "react";
import { Link } from "gatsby";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

import { Layout } from "../components/Layout";
import { Header } from "../components/Page";

const NotFoundPage = () => {
  return (
    <Layout>
      <NotFoundHeader>
        <NotFoundTitle>{"{"}4.0.4{"}"}</NotFoundTitle>
        <NotFoundButton to="/"><FontAwesomeIcon icon={faHome} />&nbsp;Home</NotFoundButton>
      </NotFoundHeader>
    </Layout>
  )
};

const NotFoundHeader = ({ children }) => {
  return (
    <Header className="text-center">
      {children}
    </Header>
  )
};

const NotFoundTitle = ({ children }) => {
  return (
    <h1 className="font-logo font-black text-white tracking-widest sm:tracking-[1.5rem] text-8xl mb-12">
      {children}
    </h1>
  )
};

const NotFoundButton = ({ className, children, ...props }) => {
  return (
    <Link className={classNames("inline-block p-4 text-center bg-black text-white hover:text-primary transition-colors duration-400", className)} {...props}>
      {children}
    </Link>
  )
};

export default NotFoundPage;
