import React from "react";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

const Layout = ({ children }) => {
  return (
    <>
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
