import React from "react";
import classNames from "classnames";

const Tag = ({ as: Component = "span", className, children, ...props }) => {
  return (
    <Component
      className={classNames("inline-block normal-case p-1 text-xs bg-black font-light text-white mr-1 last:mr-0", className)} {...props}>
      {children}
    </Component>
  );
};

export {
  Tag,
};
