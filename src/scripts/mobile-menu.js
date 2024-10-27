document.querySelectorAll("[data-mobile-menu-button]").forEach(buttonElement => {
  const expandedMenuClass = buttonElement.getAttribute("data-mobile-menu-button-expanded-menu-class");
  const focusoutContainerId = buttonElement.getAttribute("data-mobile-menu-button-focusout-container-id");
  const focusoutContainerElement = document.getElementById(focusoutContainerId);
  const menuId = buttonElement.getAttribute("aria-controls");
  const menuElement = document.getElementById(menuId);

  const resizeListener = event => {
    if (window.getComputedStyle(buttonElement).display == "none") {
      close();
    }
  };
  const focusOutListener = event => {
    if (!focusoutContainerElement.contains(event.relatedTarget)) {
      close();
    }
  };
  const keydownListener = event => {
    if (event.key === "Escape") {
      close();
    }
  };

  const open = () => {
    window.addEventListener("resize", resizeListener);
    focusoutContainerElement.addEventListener("focusout", focusOutListener);
    document.addEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "true");
    menuElement.classList.add(expandedMenuClass);
  };
  const close = () => {
    window.removeEventListener("resize", resizeListener);
    focusoutContainerElement.removeEventListener("focusout", focusOutListener);
    document.removeEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "false");
    menuElement.classList.remove(expandedMenuClass);
  };
  buttonElement.addEventListener("click", () => {
    if (buttonElement.getAttribute("aria-expanded") === "true") {
      close();
    } else {
      open();
    }
  });
});