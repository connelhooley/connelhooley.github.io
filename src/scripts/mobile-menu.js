let open = false;
const mobileButton = document.getElementById("siteNavMobileButton");
const mobileButtonLabel = document.getElementById("siteNavMobileButtonLabel");
const mobileButtonIcon = document.getElementById("siteNavMobileButtonIcon");
const navLinksContainer = document.getElementById("siteNavMenuItems");
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