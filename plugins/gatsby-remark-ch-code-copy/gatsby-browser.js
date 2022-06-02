exports.onClientEntry = () => {
  window._codeToClipboard = (event) => {
    const button = event.currentTarget;
    const codeContainer = button.nextSibling;
    console.info(button);
    console.info(codeContainer);
    console.info(codeContainer.textContent);

    navigator.clipboard.writeText(codeContainer.textContent || "");
    button.textContent = "Copied";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = "Copy";
      button.disabled = false;
    }, 3000);
  };  
};
