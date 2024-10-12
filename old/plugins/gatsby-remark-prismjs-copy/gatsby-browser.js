exports.onClientEntry = () => {
  window._codeToClipboard = (event) => {
    const button = event.currentTarget;
    const codeContainer = button.parentElement.querySelector(".gatsby-highlight");
    navigator.clipboard.writeText(codeContainer.textContent || "");
    button.textContent = "Copied";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = "Copy";
      button.disabled = false;
    }, 3_000);
  };  
};
