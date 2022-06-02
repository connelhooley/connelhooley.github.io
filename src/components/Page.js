import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

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
    <Component className={classNames("py-12 bg-primary", className)} {...props}>
      <Container>
        {children}
      </Container>
    </Component>
  )
};

const Title = ({ as: Component = "h1", className, children, ...props }) => {
  return (
    <Component className={classNames("text-white text-8xl mb-6 last:mb-0", className)} {...props}>
      {children}
    </Component>
  )
};

const Date = ({ date, showRelative, ...props }) => {
  const parsed = moment(date);
  return (
    <span {...props}>
      <FontAwesomeIcon icon={faCalendarAlt} />&nbsp;{parsed.format("DD/MM/YYYY")}
      {showRelative && <span>&nbsp;({parsed.fromNow()})</span>}
    </span>
  );
};

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

const Section = ({ as: Component = "section", className, children, ...props }) => {
  return (
    <Component
      className={classNames("mx-auto py-8", className)} {...props}>
      {children}
    </Component>
  );
};

const Tag = ({ children }) => {
  return (
    <span className="inline-block p-1 text-xs bg-black text-white mr-1 last:mr-0">
      {children}
    </span>
  );
};

const Copy = ({ as: Component = "div", className, children, ...props }) => {
  return (
    <Component
      className={classNames(
        "max-w-none",
        "prose prose-primary",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-li:m-0",
        className
      )} {...props}>
      {children}
    </Component>
  );
};

export {
  Container,
  Header,
  Title,
  Section,
  Date,
  Button,
  Tag,
  Copy,
};
