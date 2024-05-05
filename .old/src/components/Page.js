import React from "react";
import classNames from "classnames";

const Container = ({ as: Component = "div", className, children, ...props }) => {
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

const Header = ({ as: Component = "header", className, children, ...props }) => {
  return (
    <Component className={classNames("py-12 bg-primary invert-selection", className)} {...props}>
      <Container>
        {children}
      </Container>
    </Component>
  )
};

const Title = ({ as: Component = "h1", className, children, ...props }) => {
  return (
    <Component className={classNames("text-white text-6xl sm:text-8xl truncate", className)} {...props}>
      {children}
    </Component>
  )
};

const Section = ({ as: Component = "section", className, children, ...props }) => {
  return (
    <Component
      className={classNames("mx-auto my-8", className)} {...props}>
      {children}
    </Component>
  );
};

export {
  Container,
  Section,
  Header,
  Title,
};
