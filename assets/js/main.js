$(function() {
    $('.date').each(function(i, e) {
        var $e = $(e);
        var currentText = $e.text();
        var fromNow = moment(currentText, "DD/MM/YYYY").fromNow();
        var newText = currentText + " (" + fromNow + ")"
        $e.text(newText);
    });
});