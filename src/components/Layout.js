import { Link } from "gatsby";
import React from "react";

const Layout = ({ children }) => {
  return (
    <main>
      <Link className="font-logo font-black tracking-[8px]" to="/">{"{"}C.H{"}"}</Link>
      <h1>Hi</h1>
      <h2 className="text-primary">Ho</h2>
      {children}
    </main>
  );
};

export {
  Layout,
};
