import React, { useState } from "react";
import { Link } from "gatsby";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useSiteMetadata } from "../hooks/SiteMetadataQuery";

const NavBar = () => {
  const {logo} = useSiteMetadata();
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-black text-white">
      <div className="container mx-auto flex flex-wrap sm:flex-nowrap">
        <BrandLink to="/">
          {logo}
        </BrandLink>
        <div className="flex sm:hidden flex-grow justify-end items-center p-6">
          <button className="border border-gray-700 text-white transition-colors duration-400 hover:text-primary p-3" onClick={() => setOpen(o => !o)}>
            <FontAwesomeIcon fixedWidth icon={open ? faXmark : faBars} />
            <span className="sr-only">{open ? "Close" : "Open"} menu</span>
          </button>
        </div>
        <div className={classNames(
          "flex-grow justify-end items-stretch",
          {
            "hidden sm:flex": !open,
            "flex flex-col sm:flex-row w-full": open,
          },
        )}>
          <PageLink to="/blog/">
            Blog
          </PageLink>
          <PageLink to="/projects/">
            Projects
          </PageLink>
          <PageLink to="/experience/">
            Experience
          </PageLink>
        </div>
      </div>
    </nav>
  );
};

const BrandLink = ({ children, ...props }) => {
  return (
    <Link
      className="p-6 flex items-center justify-center transition-colors duration-400 hover:text-primary text-3xl font-logo font-black tracking-[8px]"
      {...props}
    >
      {children}
    </Link>
  );
};


const PageLink = ({ children, ...props }) => {
  return (
    <Link
      className="px-6 py-3 sm:p-6 text-right sm:text-center sm:flex items-center justify-center transition-colors duration-400 hover:text-primary text-md"
      activeClassName="text-primary font-bold sm:shadow-primary-b"
      partiallyActive
      {...props}
    >
      {children}
    </Link>
  );
};

export {
  NavBar,
};
