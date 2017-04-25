function formatDates() {
    $('.date').each(function(i, e) {
        var $e = $(e);
        var date= $e.text();
        var fromNow = moment(date, "DD/MM/YYYY").fromNow();
        $e.append(" (" + fromNow + ")");
    });
}

function addCopyButtonToSnippets() {
    $('div.highlighter-rouge').each(function(i, e) {
        $button = $('<button class="copy-button copy">');
        $button.html('<i class="fa fa-clipboard"></i>')
        $(e).append($button);
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
}

function addAnchorLinksToHeaders() {
    $('.post-content :header').each(function(i, e) {
        $e = $(e);
        var link = $('<a>');
        link.addClass('heading-link');
        link.html('<i class="fa fa-anchor"></i>');
        link.attr('href', '#' + e.id);
        $e.append('&nbsp;');
        $e.append(link);
    });
}

function addScrollUpButton() {
    function isScrolledPassed($element) {
        var scrollTop = $(window).scrollTop();
        var elementOffset = $element.offset().top;
        var distance = (elementOffset - scrollTop);
        var scrolledPast = (distance <= 0);
        return scrolledPast;
    }
    $postContent = $('.post-content');
    if($postContent.length < 1) {
        return;
    }
    $postNav = $('.post-nav');
    $(window).on('scroll', function() {
        if (isScrolledPassed($postContent)) {
            $postNav.slideDown(750);
        } else {
            $postNav.slideUp(750);
        }
    });
    $('#back-to-top').click(function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 700);
    });
}

function cookies() {
    function saveCookie() {
        Cookies.set(cookieName, 'true', { expires: 365 });
    }
    function checkCookie() {
        return !!Cookies.get(cookieName);
    }
    var cookieName = 'acknowledge-cookies';
    if(!checkCookie()) {
        $cookie = $('<div id="cookie">');
        $message = $('<div class="message">');
        $content = $('<div class="content">');
        $textWrapper = $('<div class="text-wrapper">');
        $textWrapper.text('This site uses cookies');
        $buttonWrapper = $('<div class="button-wrapper">');
        $button = $('<button class="cookie-button">');
        $button.text('Ok');
        $button.click(function () {
            saveCookie();
            $cookie.slideUp(750);
        });
        $buttonWrapper.append($button);
        $content.append($textWrapper);
        $content.append($buttonWrapper);
        $message.append($content);
        $cookie.append($message);
        $('.site-content').prepend($cookie);
    }
}

$(function() {
    formatDates();
    addCopyButtonToSnippets();
    addAnchorLinksToHeaders();
    addScrollUpButton();
    cookies();
});
