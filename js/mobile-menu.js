"use strict";

document.querySelectorAll("[data-mobile-menu]").forEach(function (parentElement) {
  var buttonContainerId = parentElement.getAttribute("data-mobile-menu-button-container-id");
  var itemsId = parentElement.getAttribute("data-mobile-menu-items-id");
  var itemsExpandedClass = parentElement.getAttribute("data-mobile-menu-items-expanded-class");
  var itemsElement = document.getElementById(itemsId);
  var buttonContainerElement = document.getElementById(buttonContainerId);
  var buttonElement = document.createElement("button");
  var iconElement = document.createElement("i");
  buttonElement.appendChild(iconElement);
  buttonElement.id = "site-nav-mobile-button";
  buttonElement.setAttribute("aria-label", "Open menu");
  buttonElement.setAttribute("aria-controls", itemsId);
  iconElement.classList.add("fa-solid", "fa-fw", "fa-bars");
  buttonElement.addEventListener("click", function () {
    if (buttonElement.getAttribute("aria-expanded") === "true") {
      close();
    } else {
      open();
    }
  });
  buttonContainerElement.appendChild(buttonElement);
  var resizeListener = function resizeListener(event) {
    if (window.getComputedStyle(buttonElement).display == "none") {
      close();
    }
  };
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
    window.addEventListener("resize", resizeListener);
    parentElement.addEventListener("focusout", focusOutListener);
    document.addEventListener("keydown", keydownListener);
    buttonElement.setAttribute("aria-expanded", "true");
    buttonElement.setAttribute("aria-label", "Close menu");
    iconElement.classList.add("fa-xmark");
    iconElement.classList.remove("fa-bars");
    itemsElement.classList.add(itemsExpandedClass);
  };
  var close = function close() {
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