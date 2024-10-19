let open = false;
const mobileButton = document.getElementById("mobileButton");
const mobileButtonLabel = document.getElementById("mobileButtonLabel");
const mobileButtonIcon = document.getElementById("mobileButtonIcon");
const navLinksContainer = document.getElementById("navLinksContainer");
mobileButton.addEventListener("click", function() {
  open = !open;
  if (open) {
    mobileButtonLabel.textContent = "Close menu";
    mobileButtonIcon.classList.add("fa-xmark");
    mobileButtonIcon.classList.remove("fa-bars");
    navLinksContainer.classList.add("flex", "w-full");
    navLinksContainer.classList.remove("hidden", "sm:flex");
  } else {
    mobileButtonLabel.textContent = "Open menu";
    mobileButtonIcon.classList.add("fa-bars");
    mobileButtonIcon.classList.remove("fa-xmark");
    navLinksContainer.classList.add("hidden", "sm:flex");
    navLinksContainer.classList.remove("flex", "w-full");
  }
});