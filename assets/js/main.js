$(function() {
    $('.date').each(function(i, e) {
        var $e = $(e);
        var date= $e.text();
        var fromNow = moment(date, "DD/MM/YYYY").fromNow();
        $e.append(" (" + fromNow + ")");
    });
    $('.highlight').each(function(i, e) {
        $e = $(e);
        $button = $('<button class="copy-button copy">');
        $button.html('<i class="fa fa-clipboard"></i>')
        $e.append($button);
    });
    var clipboard = new Clipboard('.copy', {
        target: function(trigger) {
            return trigger.previousElementSibling;
        }
    });
    clipboard.on('success', function(e) {
        e.clearSelection();
        $notification = $('<div class="notification">Copied</div>');
        $('body').append($notification);
        $notification.slideDown(500).delay(2000).slideUp(500);
    });
    $('.post-content :header').each(function(i, e) {
        $e = $(e);
        var link = $('<a>');
        link.addClass('heading-link');
        link.html('<i class="fa fa-anchor"></i>');
        link.attr('href', '#' + e.id);
        $e.append('&nbsp;');
        $e.append(link);
    });
});
