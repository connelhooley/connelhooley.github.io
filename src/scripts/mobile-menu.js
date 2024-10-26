const nav = document.getElementById("site-nav");
const mobileButton = document.getElementById("site-nav-mobile-button");
const navLinksContainer = document.getElementById("site-nav-menu-items");
const open = () => {
  window.addEventListener("resize", resizeListener);
  nav.addEventListener("focusout", focusOutListener);
  document.addEventListener("keydown", keydownListener);
  mobileButton.setAttribute("aria-expanded", "true");
  navLinksContainer.classList.add("mobile-open");
  return false;
};
const close = () => {
  window.removeEventListener("resize", resizeListener);
  nav.removeEventListener("focusout", focusOutListener);
  document.removeEventListener("keydown", keydownListener);
  mobileButton.setAttribute("aria-expanded", "false");
  navLinksContainer.classList.remove("mobile-open");
  return false;
};
const toggle = () => {
  if (mobileButton.getAttribute("aria-expanded") === "true") {
    return close();
  } else {
    return open();
  }
};
const resizeListener = () => {
  if (window.getComputedStyle(mobileButton).display == "none") {
    close();
  }
};
const focusOutListener = event => {
  if (!nav.contains(event.relatedTarget)) {
    close();
  }
};
const keydownListener = event => {
  if (event.key === "Escape") {
    close();
  }
};
mobileButton.addEventListener("click", () => {
  toggle();
});
