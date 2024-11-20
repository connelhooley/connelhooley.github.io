"use strict";

dayjs.extend(window.dayjs_plugin_relativeTime);
document.querySelectorAll("[data-relative-date]").forEach(function (dateElement) {
  var dateIso = dateElement.getAttribute("data-relative-date");
  var dateInnerHtml = dateElement.innerHTML;
  var fromNow = dayjs(dateIso).fromNow();
  dateElement.innerHTML = "".concat(dateInnerHtml, " (").concat(fromNow, ")");
});