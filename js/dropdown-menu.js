"use strict";

document.querySelectorAll("[data-dropdown]").forEach(function (parentElement) {
  var buttonContentId = parentElement.getAttribute("data-dropdown-menu-button-content-id");
  var buttonId = parentElement.getAttribute("data-dropdown-menu-button-id");
  var buttonClass = parentElement.getAttribute("data-dropdown-menu-button-class");
  var itemsId = parentElement.getAttribute("data-dropdown-menu-items-id");
  var itemsExpandedClass = parentElement.getAttribute("data-dropdown-menu-items-expanded-class");
  var itemsElement = document.getElementById(itemsId);
  var buttonContentElement = document.getElementById(buttonContentId);
  var buttonElement = document.createElement("button");
  var accessibilityElement = document.createElement("span");
  var iconElement = document.createElement("i");
  buttonElement.id = buttonId;
  buttonElement.classList.add(buttonClass);
  buttonElement.append(buttonContentElement);
  buttonElement.append(iconElement);
  buttonElement.append(accessibilityElement);
  buttonElement.setAttribute("aria-controls", itemsId);
  iconElement.classList.add("fa-solid", "fa-fw", "fa-caret-up");
  accessibilityElement.textContent = " (open dropdown menu)";
  accessibilityElement.classList.add("sr-only");
  buttonElement.addEventListener("click", function () {
    if (buttonElement.getAttribute("aria-expanded") === "true") {
      close();
    } else {
      open();
    }
  });
  parentElement.prepend(buttonElement);
  var focusOutListener = function focusOutListener(event) {
    if (!parentElement.contains(event.relatedTarget)) {
      close();
    }
  };
  var keydownListener = function keydownListener(event) {
    if (event.key === "Escape") {
      close();
    }
  };
  var open = function open() {
    parentElement.addEventListener("focusout", focusOutListener);
    document.addEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "true");
    accessibilityElement.textContent = " (close dropdown menu)";
    iconElement.classList.add("fa-caret-down");
    iconElement.classList.remove("fa-caret-up");
    itemsElement.classList.add(itemsExpandedClass);
  };
  var close = function close() {
    parentElement.removeEventListener("focusout", focusOutListener);
    document.removeEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "false");
    accessibilityElement.textContent = " (open dropdown menu)";
    iconElement.classList.add("fa-caret-up");
    iconElement.classList.remove("fa-caret-down");
    itemsElement.classList.remove(itemsExpandedClass);
  };
});