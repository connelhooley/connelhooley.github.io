import React from "react";
import classNames from "classnames";

const Button = ({ as: Component = "button", className, children, ...props }) => {
  return (
    <Component
      className={classNames(
        "inline-block p-4 text-center bg-primary text-white hover:bg-primary-dark transition-colors duration-400",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export {
  Button,
};
