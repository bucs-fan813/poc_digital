$(document).ready(function () {

    "use strict"; // Start of use strict

    /*=======================================================
			PRELOADER
    ========================================================*/

    function finishLoading() { // makes sure the whole site is loaded
        $('.page-preloader .loader').fadeOut(); // will first fade out the loading animation
        $('.page-preloader').delay(350).fadeOut('slow');
        // will fade out the white DIV that covers the website.
        $('body').delay(350).css({
            'overflow': 'visible'
        });
    }
    if (document.readyState === 'complete') {
        finishLoading();
    } else {
        $(window).one('load', finishLoading);
    }

    /*=======================================================
            FULL SCREEN BANNER
    ========================================================*/

    var slideHeight = $(window).height();
    $('.full-screen').css('height', slideHeight + 'px');
    $(window).on('resize', function () {
        $('.full-screen').css('height', $(window).height() + 'px');
    });


    /*=======================================================
			TEXT ROTATOR
    ========================================================*/

    $(function () {
        new Typed("#text-rotator", {
            strings: ["Cloud Specialists", "Developers", "DEVOPS", "Staff Augmentation Experts", "Migration Experts", "Security Specialists"],
            typeSpeed: 100,
            loop: true,
            startDelay: 100
        });
    });

    /*=======================================================
			PAGE SCROLL
    ========================================================*/

    new bootstrap.ScrollSpy(document.body, {
        target: '.navbar',
        rootMargin: '0px 0px -25%'
    });

    $(function () {
        $('a.page-scroll').on('click', function (event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        });
    });

    /*=======================================================
			FIXED NAVBAR
    ========================================================*/

    $(function () {
        $(window).on("scroll", function () {
            var scrollTop = $(window).scrollTop();
            if (scrollTop > 34) {
                $(".navbar").addClass("navbar-light");
            } else {
                $(".navbar").removeClass("navbar-light");
            }
        });
    });

    /*=======================================================
            PARTNER FILTERS
    ========================================================*/

    var $partnerItems = $('#Container .mix');
    var $partnerFilters = $('#partners .portfolio-filtres .filter');
    $partnerItems.css('display', 'inline-block');
    $partnerFilters.on('click', function (event) {
        event.preventDefault();
        var filter = $(this).attr('data-filter');
        $partnerFilters.removeClass('active');
        $(this).addClass('active');
        $partnerItems.stop(true, true).hide().filter(function () {
            return filter === 'all' || $(this).is(filter);
        }).css('display', 'inline-block').hide().fadeIn(300);
    });

    /*=======================================================
			Contact Form
	========================================================*/

    $("#contact-form").on("submit", async function(event) {
        event.preventDefault();
        const form = this;
        const button = form.querySelector('button[type="submit"]');
        const status = document.getElementById("contact-status");
        if (button.disabled || !form.reportValidity()) return;
        const token = new FormData(form).get("cf-turnstile-response");
        if (!token) {
            status.textContent = "Please complete the security check before submitting.";
            return;
        }
        button.disabled = true;
        status.textContent = "Sending your message…";
        try {
            const response = await fetch(form.action, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.elements.name.value, email: form.elements.email.value,
                    subject: form.elements.subject.value, message: form.elements.message.value,
                    "cf-turnstile-response": token
                }),
                signal: AbortSignal.timeout(20000)
            });
            const result = await response.json();
            if (!response.ok || result.success !== true) throw new Error(result.message || "Unable to send your message.");
            form.reset();
            status.textContent = result.message;
        } catch (error) {
            status.textContent = error.name === "TimeoutError"
                ? "The request timed out. Delivery is uncertain; please email us before resending."
                : (error.message || "Unable to send your message. Please try again.");
        } finally {
            button.disabled = false;
            if (window.turnstile) window.turnstile.reset();
        }
    });
});
