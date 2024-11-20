document.querySelectorAll("[data-mobile-menu]").forEach(parentElement => {
  const buttonContainerId = parentElement.getAttribute("data-mobile-menu-button-container-id");
  const itemsId = parentElement.getAttribute("data-mobile-menu-items-id");
  const itemsExpandedClass = parentElement.getAttribute("data-mobile-menu-items-expanded-class");
  const itemsElement = document.getElementById(itemsId);
  const buttonContainerElement = document.getElementById(buttonContainerId);
  const buttonElement = document.createElement("button");
  const iconElement = document.createElement("i");
  buttonElement.appendChild(iconElement);
  buttonElement.id = "site-nav-mobile-button";
  buttonElement.setAttribute("aria-label", "Open menu");
  buttonElement.setAttribute("aria-controls", itemsId);
  iconElement.classList.add("fa-solid", "fa-fw", "fa-bars");
  buttonElement.addEventListener("click", () => {
    if (buttonElement.getAttribute("aria-expanded") === "true") {
      close();
    } else {
      open();
    }
  });  
  buttonContainerElement.appendChild(buttonElement); 
  
  const resizeListener = event => {
    if (window.getComputedStyle(buttonElement).display == "none") {
      close();
    }
  };
  const focusOutListener = event => {
    if (!parentElement.contains(event.relatedTarget)) {
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
    parentElement.addEventListener("focusout", focusOutListener);
    document.addEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "true");
    buttonElement.setAttribute("aria-label", "Close menu");
    iconElement.classList.add("fa-xmark");
    iconElement.classList.remove("fa-bars");
    itemsElement.classList.add(itemsExpandedClass);
  };
  const close = () => {
    window.removeEventListener("resize", resizeListener);
    parentElement.removeEventListener("focusout", focusOutListener);
    document.removeEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "false");
    buttonElement.setAttribute("aria-label", "Open menu");
    iconElement.classList.add("fa-bars");
    iconElement.classList.remove("fa-xmark");
    itemsElement.classList.remove(itemsExpandedClass);
  };
});
