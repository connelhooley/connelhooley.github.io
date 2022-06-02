import React from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const Date = ({as: Component = "span", className, value, showRelative, ...props }) => {
  const parsed = moment(value);
  return (
    <Component className={className} {...props}>
      <FontAwesomeIcon icon={faCalendarAlt} />&nbsp;{parsed.format("DD/MM/YYYY")}
      {showRelative && <span>&nbsp;({parsed.fromNow()})</span>}
    </Component>
  );
};

export {
  Date,
};
