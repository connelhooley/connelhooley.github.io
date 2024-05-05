import React from "react";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { SiteSeo } from "./Seo";
import { CookieAlert } from "./CookieAlert";

const Layout = ({ children, ...props }) => {
  return (
    <>
      <SiteSeo />
      <NavBar />
      <CookieAlert />
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
