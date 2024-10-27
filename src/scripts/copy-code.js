document.querySelectorAll("[data-copy-code]").forEach(containerElement => {
  const codeContent = containerElement.querySelector("pre code").textContent || "";
  const iconElement = document.createElement("i");
  iconElement.classList.add("fa-solid", "fw", "fa-copy");
  const labelElement = document.createElement("span");
  labelElement.textContent = "Copy";
  const buttonElement = document.createElement("button");
  buttonElement.classList.add("button", "copy-code-button");  
  buttonElement.appendChild(iconElement);
  buttonElement.appendChild(labelElement);
  buttonElement.addEventListener("click", () => {
    navigator.clipboard.writeText(codeContent);
    labelElement.textContent = "Copied";
    buttonElement.disabled = true;
    setTimeout(() => {
      labelElement.textContent = "Copy";
      buttonElement.disabled = false;
    }, 3000);
  });
  containerElement.prepend(buttonElement);  
});