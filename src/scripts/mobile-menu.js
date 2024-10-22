let open = false;
const nav = document.getElementById("site-nav");
const mobileButton = document.getElementById("site-nav-mobile-button");
const mobileButtonLabel = document.getElementById("site-nav-mobile-button-label");
const mobileButtonIcon = document.getElementById("site-nav-mobile-button-icon");
const navLinksContainer = document.getElementById("site-nav-menu-items");
const resizeListener = () => {
  if (window.getComputedStyle(mobileButton).display == "none") {
    mobileButton.click();
  }
};
const focusOutListener = event => {
  if (!nav.contains(event.relatedTarget)) {
    mobileButton.click();
  }
};
const keydownListener = event => {
  if (event.key === "Escape") {
    mobileButton.click();
  }
};
mobileButton.addEventListener("click", () => {
  open = !open;
  if (open) {
    window.addEventListener("resize", resizeListener);
    nav.addEventListener("focusout", focusOutListener);
    document.addEventListener("keydown", keydownListener);
    mobileButtonLabel.textContent = "Close menu";
    mobileButtonIcon.classList.add("fa-xmark");
    mobileButtonIcon.classList.remove("fa-bars");
    navLinksContainer.classList.add("mobile-open");
    mobileButton.setAttribute("aria-expanded", "true");
  } else {
    window.removeEventListener("resize", resizeListener);
    nav.removeEventListener("focusout", focusOutListener);
    document.removeEventListener("keydown", keydownListener);
    mobileButtonLabel.textContent = "Open menu";
    mobileButtonIcon.classList.add("fa-bars");
    mobileButtonIcon.classList.remove("fa-xmark");
    navLinksContainer.classList.remove("mobile-open");
    mobileButton.setAttribute("aria-expanded", "true");
  }
});