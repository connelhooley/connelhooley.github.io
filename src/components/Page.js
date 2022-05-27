import React from "react";
import classNames from "classnames";

const Container = ({as: Component = "div", className, children, ...props}) => {
  return (
    <Component
      className={classNames(
        "container mx-auto px-4",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
};

const Section = ({as: Component = "section", className, children, ...props}) => {
  return (
    <Component
      className={classNames(
        " mx-auto py-8",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
};


export {
  Container,
  Section,
};
