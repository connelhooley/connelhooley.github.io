"use strict";

document.querySelectorAll("[data-copy-code]").forEach(function (containerElement) {
  var codeContent = containerElement.querySelector("pre code").textContent || "";
  var iconElement = document.createElement("i");
  iconElement.classList.add("fa-solid", "fw", "fa-copy");
  var labelElement = document.createElement("span");
  labelElement.textContent = "Copy";
  var buttonElement = document.createElement("button");
  buttonElement.classList.add("button", "copy-code-button");
  buttonElement.appendChild(iconElement);
  buttonElement.appendChild(labelElement);
  buttonElement.addEventListener("click", function () {
    navigator.clipboard.writeText(codeContent);
    labelElement.textContent = "Copied";
    buttonElement.disabled = true;
    setTimeout(function () {
      labelElement.textContent = "Copy";
      buttonElement.disabled = false;
    }, 3000);
  });
  containerElement.prepend(buttonElement);
});