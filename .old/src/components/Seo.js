import React from "react";
import { useLocation } from "@reach/router";
import Helmet from "react-helmet";

import { useSiteMetadata } from "../hooks/SiteMetadataQuery";

import Logo from "../images/logo.png"

const SiteSeo = () => {
  const { siteOrigin, title, description } = useSiteMetadata();
  const { pathname } = useLocation();
  const url = siteOrigin + pathname;
  const imageUrl = siteOrigin + Logo;
  return (
    <Helmet>
      <html lang="en" />
      
      <title>{title}</title>

      <meta property="og:url" content={url} />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:domain" content={siteOrigin} />

      <meta property="og:type" content="website" />

      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />

      <meta property="og:description" content={description} />
      <meta name="twitter:description" content={description} />

      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:image" content={imageUrl} />      
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};

const PageSeo = ({ tabTitleSegments = [], title, description, imageUrl }) => {
  const { siteOrigin, title: siteTitle } = useSiteMetadata();
  const tabTitle = [siteTitle, ...tabTitleSegments].join(" - ");
  return (
    <Helmet>
      <title>{tabTitle}</title>

      <meta property="og:title" content={title || tabTitle} />
      <meta name="twitter:title" content={title || tabTitle} />

      {description && <meta property="og:description" content={description} />}
      {description && <meta name="twitter:description" content={description} />}

      {imageUrl && <meta property="og:image" content={siteOrigin + imageUrl} />}
      {imageUrl && <meta name="twitter:image" content={siteOrigin + imageUrl} />}
    </Helmet>
  );
};

export {
  SiteSeo,
  PageSeo,
};
