import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

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

const Title = ({as: Component = "header", className, children, ...props}) => {
  return (
    <Component
      className={classNames(
        "py-12 bg-primary",
        className,
      )}
      {...props}
    >
      <Container>
        <h1 className="text-white text-8xl">{children}</h1>
      </Container>
    </Component>
  )
};

const Date = ({date, showRelative, ...props}) => {
  const parsed = moment(date);
  return (
    <span {...props}>
      <FontAwesomeIcon icon={faCalendarAlt} />&nbsp;{parsed.format("DD/MM/YYYY")}
      {showRelative && <span>&nbsp;({parsed.fromNow()})</span>}
      </span>
  );
};

const Button = ({as: Component = "button", className, children, ...props}) => {
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

const Section = ({as: Component = "section", className, children, ...props}) => {
  return (
    <Component
      className={classNames(
        "mx-auto py-8",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
};

const Tag = ({children}) => {
  return (
    <span className="inline-block p-1 text-xs bg-black text-white mr-1 last:mr-0">
      {children}
    </span>
  );
};

export {
  Container,
  Title,
  Section,
  Date,
  Button,
  Tag,
};
