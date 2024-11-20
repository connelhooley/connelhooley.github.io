document.querySelectorAll("[data-dropdown]").forEach(parentElement => {
  const buttonContentId = parentElement.getAttribute("data-dropdown-menu-button-content-id");
  const buttonId = parentElement.getAttribute("data-dropdown-menu-button-id");
  const buttonClass = parentElement.getAttribute("data-dropdown-menu-button-class");
  const itemsId = parentElement.getAttribute("data-dropdown-menu-items-id");
  const itemsExpandedClass = parentElement.getAttribute("data-dropdown-menu-items-expanded-class");
  const itemsElement = document.getElementById(itemsId);
  const buttonContentElement = document.getElementById(buttonContentId);
  const buttonElement = document.createElement("button");
  const accessibilityElement = document.createElement("span");
  const iconElement = document.createElement("i");
  
  buttonElement.id = buttonId;
  buttonElement.classList.add(buttonClass);
  buttonElement.append(buttonContentElement);
  buttonElement.append(iconElement);
  buttonElement.append(accessibilityElement);
  buttonElement.setAttribute("aria-controls", itemsId);
  iconElement.classList.add("fa-solid", "fa-fw", "fa-caret-up");
  accessibilityElement.textContent = " (open dropdown menu)";
  accessibilityElement.classList.add("sr-only");
  buttonElement.addEventListener("click", () => {
    if (buttonElement.getAttribute("aria-expanded") === "true") {
      close();
    } else {
      open();
    }
  });  
  parentElement.prepend(buttonElement);
  
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
    parentElement.addEventListener("focusout", focusOutListener);
    document.addEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "true");
    accessibilityElement.textContent = " (close dropdown menu)";
    iconElement.classList.add("fa-caret-down");
    iconElement.classList.remove("fa-caret-up");
    itemsElement.classList.add(itemsExpandedClass);
  };
  const close = () => {
    parentElement.removeEventListener("focusout", focusOutListener);
    document.removeEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "false");
    accessibilityElement.textContent = " (open dropdown menu)";
    iconElement.classList.add("fa-caret-up");
    iconElement.classList.remove("fa-caret-down");
    itemsElement.classList.remove(itemsExpandedClass);
  };
});
