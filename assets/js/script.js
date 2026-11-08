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
    $('.full-screen').css('height', slideHeight);
    $(window).resize(function () {
        $('.full-screen').css('height', $(window).height());
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

    $('body').scrollspy({
        target: '.navbar'
    })

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

    $("form:first").submit(function() {
    	  var url      = "https://xyzqduxjtg.execute-api.us-east-1.amazonaws.com/Prod/send";
    	  var form_name       = $("input#name").val();
    	  var form_email       = $("input#email").val();
    	  var form_subject  = $("input#subject").val();
    	  var form_message     = 'Name: ' + form_name + '\n';
    	  form_message += 'Email: ' + form_email + '\n';
    	  form_message += 'Message: ' + $("textarea:first").val();

    	  var data = {
    		name	: form_name,
    	    from   : form_email, 
    	    subject : form_subject,
    	    message    : form_message
    	  }

    	  $.ajax({
    	         type: "POST",
    	         url : url,
    	         dataType: "json",
                 crossDomain: true,
    	         contentType: "application/json; charset=utf-8",
    	         data: JSON.stringify(data),

    	         
    	         success: function () {
    	           // clear form and show a success message
    	           alert("Successful");
    	          // document.getElementById("contact-form").reset();
    	           location.reload();
    	         },
    	         error: function () {
    	           // show an error message
    	           alert("Unsuccessful");
    	         }});

    		  return false;
    });    

});