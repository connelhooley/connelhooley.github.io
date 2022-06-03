import React from "react";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { SiteSeo } from "./Seo";

const Layout = ({ children, ...props }) => {
  return (
    <>
      <SiteSeo />
      <NavBar />
      <main id="content" {...props}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export {
  Layout,
};
