document.querySelectorAll("article pre").forEach(function(pre) {
  const wrapper = document.createElement("div");
  pre.replaceWith(wrapper);
  const button = document.createElement("button");
  button.classList.add("button-copy");
  button.textContent = "Copy";
  wrapper.classList.add("code-wrapper");
  wrapper.appendChild(button);
  wrapper.appendChild(pre);
  button.addEventListener("click", function(e) {
    navigator.clipboard.writeText(pre.textContent || "");
    button.textContent = "Copied";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = "Copy";
      button.disabled = false;
    }, 3_000);
  });
});