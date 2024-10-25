dayjs.extend(window.dayjs_plugin_relativeTime);
document.querySelectorAll("[data-relative-date]").forEach(dateElement => {
  const dateIso = dateElement.getAttribute("data-relative-date");
  const dateText = dateElement.textContent;
  const fromNow = dayjs(dateIso).fromNow();
  dateElement.textContent = `${dateText} (${fromNow})`;
});