import React, { useCallback, useState } from "react";
import classNames from "classnames";

import { Container } from "./Page";

// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#example_3_do_something_only_once

const CookieAlert = () => {
  const [confirmed, setConfirmed] = useState();
  const onClick = useCallback(() => {
    window.document.cookie = "acknowledge-cookies=true; max-age=31536000; SameSite=lax";
    setConfirmed(true);
  }, []);
  if (typeof window === "undefined" || window.document.cookie.split("; ").find(row => row.startsWith("acknowledge-cookies")) || confirmed === true) {
    return null;
  }
  return (
    <CookieAlertWrapper>
      <CookieAlertText>
        This site uses cookies for Google Analytics and Disqus comments.
      </CookieAlertText>
      <CookieAlertButton onClick={onClick}>Confirm</CookieAlertButton>
    </CookieAlertWrapper>
  );
};

const CookieAlertWrapper = ({ children }) => {
  return (
    <div className="bg-primary-dark py-4 text-sm">
      <Container className="flex justify-center items-center">
        {children}
      </Container>
    </div>
  );
};

const CookieAlertText = ({ children }) => {
  return (
    <div className="grow">
      {children}
    </div>
  );
};

const CookieAlertButton = ({ className, children, ...props }) => {
  return (
    <div>
      <button className={classNames("p-2 bg-black text-white hover:text-primary", className)} {...props}>
        {children}
      </button>
    </div>
  );
};

export {
  CookieAlert,
};
