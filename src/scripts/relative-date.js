dayjs.extend(window.dayjs_plugin_relativeTime);
document.querySelectorAll("[data-relative-date]").forEach(dateElement => {
  const dateIso = dateElement.getAttribute("data-relative-date");
  const dateInnerHtml = dateElement.innerHTML;
  const fromNow = dayjs(dateIso).fromNow();
  dateElement.innerHTML = `${dateInnerHtml} (${fromNow})`;
});