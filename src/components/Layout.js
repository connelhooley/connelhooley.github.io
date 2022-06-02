import React from "react";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { SiteSeo } from "./Seo";

const Layout = ({ children }) => {
  return (
    <>
      <SiteSeo />
      <NavBar />
      <main id="content">
        {children}
      </main>
      <Footer />
    </>
  );
};

export {
  Layout,
};
