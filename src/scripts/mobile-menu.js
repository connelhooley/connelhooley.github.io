let open = false;
const mobileButton = document.getElementById("site-nav-mobile-button");
const mobileButtonLabel = document.getElementById("site-nav-mobile-button-label");
const mobileButtonIcon = document.getElementById("site-nav-mobile-button-icon");
const navLinksContainer = document.getElementById("site-nav-menu-items");
mobileButton.addEventListener("click", () => {
  open = !open;
  if (open) {
    mobileButtonLabel.textContent = "Close menu";
    mobileButtonIcon.classList.add("fa-xmark");
    mobileButtonIcon.classList.remove("fa-bars");
    navLinksContainer.classList.add("mobile-open");
  } else {
    mobileButtonLabel.textContent = "Open menu";
    mobileButtonIcon.classList.add("fa-bars");
    mobileButtonIcon.classList.remove("fa-xmark");
    navLinksContainer.classList.remove("mobile-open");
  }
});