import React, { forwardRef } from "react";
import classNames from "classnames";

const Copy = forwardRef(({ as: Component = "div", className, children, ...props }, ref) => {
  return (
    <Component
      ref={ref}
      className={classNames(
        "max-w-none",
        "prose prose-primary",
        "prose-headings:mb-3 prose-headings:mt-0",
        "prose-pre:bg-black prose-pre:text-xs prose-pre:rounded-none",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-li:m-0",
        className
      )} {...props}>
      {children}
    </Component>
  );
});

export {
  Copy,
};
