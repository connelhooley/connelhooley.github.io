function formatDates() {
    $('.date').each(function(i, e) {
        var $e = $(e);
        var datetime = $e.attr('datetime');
        var fromNow = moment(datetime, 'YYYY-MM-DD HH:mm:ss Z').fromNow();
        $e.append('&nbsp;(' + fromNow + ')');
    });
}

function addCopyButtonToSnippets() {
    $('div.highlighter-rouge').each(function(i, e) {
        var $button = $('<button class="copy-button copy">');
        $button.html('<i class="far fa-copy"></i>')
        $(e).append($button);
    });
    var clipboard = new Clipboard('.copy', {
        target: function(trigger) {
            return trigger.previousElementSibling;
        }
    });
    clipboard.on('success', function(e) {
        e.clearSelection();
        var $notification = $('<div class="site-notification">');
        $notification.text("Copied")
        $('body').append($notification);
        $notification
            .slideDown(500)
            .delay(2000)
            .slideUp(500, function() { 
                $notification.remove(); 
            });
    });
}

function addAnchorLinksToHeaders() {
    $('#post-content :header').each(function(i, e) {
        var $e = $(e);
        var link = $('<a>');
        link.addClass('heading-link');
        link.html('<i class="fas fa-anchor"></i>');
        link.attr('href', '#' + e.id);
        $e.append('&nbsp;');
        $e.append(link);
    });
}

function stickyPanels() {
    $('.sticky').Stickyfill();
}

function scrollUpButton() {
    var $backToTop = $('#post-toolbar-button-back-to-top');
    $backToTop.click(function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 700, function() {
            if(location.hash) location.hash = '';
        });
    });
}

function postToolbar() {
    function isScrolledPassed($element) {
        var scrollTop = $(window).scrollTop();
        var elementOffset = $element.offset().top;
        var distance = (elementOffset - scrollTop);
        var scrolledPast = (distance <= 0);
        return scrolledPast;
    }
    function toggleScrolledPassed() {
        if (isScrolledPassed($content)) {
            $toolbar.addClass('post-toolbar-scrolled-passed');
        } else {
            $toolbar.removeClass('post-toolbar-scrolled-passed');
        }
    }
    var $content = $('#post-content');
    var $toolbar = $('#post-toolbar');
    if($toolbar.length < 1) {
        return;
    }
    $(window).on('scroll', toggleScrolledPassed);
    toggleScrolledPassed();
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
        var $cookie = $('<div id="site-cookie">');
        var $inner = $('<div id="site-cookie-inner">');
        var $text = $('<div id="site-cookie-text">');
        $text.text('This site uses cookies');
        var $button = $('<button id="site-cookie-button">');
        $button.text('Ok');
        $button.click(function () {
            saveCookie();
            $cookie.slideUp(500);
        });
        $inner.append($text);
        $inner.append($button);
        $cookie.append($inner);
        $('#site-main').prepend($cookie);
    }
}

function dropdowns() {
    $('.dropdown .menu-toggler').click(function() {
        var $this = $(this);
        var $parent = $this.parent();
        var $items = $parent.find(".dropdown-items");
        var $backdrop = $("<div class='dropdown-backdrop'>");
        $backdrop.click(function() {
            $parent.attr("aria-expanded", "false");
            $items.removeClass("show");
            $backdrop.remove();
        });
        $parent.attr("aria-expanded", "true");
        $parent.prepend($backdrop);
        $items.addClass("show");
    });
}

function menuToggle() {
    var $toggler = $("#site-nav-mobile-toggler");
    var $links = $("#site-nav-links");
    $toggler.click(function() {
        $links.slideToggle(300);
    });
    $(window).on('resize', function(){
        $links.removeAttr("style")
    });
}

$(function() {
    cookies();
    formatDates();
    stickyPanels();
    addCopyButtonToSnippets();
    addAnchorLinksToHeaders();
    scrollUpButton();
    postToolbar();
    dropdowns();
    menuToggle();
});