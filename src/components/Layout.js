import React from "react";

import { NavBar } from "./NavBar";

const Layout = ({ children }) => {
  return (
    <>
      <NavBar />
      <main id="content">
        <h1>Hi</h1>
        <h2 className="text-primary">Ho</h2>
        {children}
      </main>
    </>
  );
};

export {
  Layout,
};
