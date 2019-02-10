$(document).ready(function () {

    "use strict"; // Start of use strict

    /*=======================================================
			PRELOADER
    ========================================================*/

    $(window).load(function () { // makes sure the whole site is loaded
        $('.page-preloader loader').fadeOut(); // will first fade out the loading animation
        $('.page-preloader').delay(350).fadeOut('slow');
        // will fade out the white DIV that covers the website.
        $('body').delay(350).css({
            'overflow': 'visible'
        });
    })

    /*=======================================================
			FULL SCREEN BANNER
    ========================================================*/

    var slideHeight = $(window).height();
    $('.full-screen').css('height', slideHeight);
    $(window).resize(function () {
        $('.full-screen').css('height', slideHeight);
    });


    /*=======================================================
			TEXT ROTATOR
    ========================================================*/

    $(function () {
        $("#text-rotator").typed({
            strings: ["Cloud Support", "Infrastructure Support", "Platform Support", "DEVOPS", "Integration Experts", "Developers", "Engineers", "Designers"],
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
        $('a.page-scroll').bind('click', function (event) {
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
			PORTFOLIO MIXITUP
    ========================================================*/
    $(window).load(function () {
        $('#Container').mixItUp({
            animation: {
                effects: 'fade'
            }
        });

        // Active Stat
        var $portfolio_selectors = $('.portfolio-filters >li>a');
        $portfolio_selectors.on('click', function () {
            $portfolio_selectors.removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            return false;
        });
    });

    /*=======================================================
			PORTFOLIO MIXITUP
    ========================================================*/

    $("#owl-testimonials").owlCarousel({

        autoPlay: 3000, //Set AutoPlay to 3 seconds

        items: 3,
        itemsDesktop: [1199, 3],
        itemsDesktopSmall: [979, 3]

    });
    
    /*=======================================================
			Contact Form
	========================================================*/

    $("form:first").submit(function() {
    	  console.log('test');
    	  var url      = "https://xyzqduxjtg.execute-api.us-east-1.amazonaws.com/Prod/send";
    	  var form_name       = $("input#name").val();
    	  var form_email       = $("input#email").val();
    	  var form_subject  = $("input#subject").val();
    	  var form_message     = 'Name: ' + form_name + '\n';
    	  form_message .= 'Email: ' + form_email + '\n';
    	  form_message .= 'Message: ' + $("textarea:first").val();

    		name	: form_name,
    	    from   : form_email, 
    	    subject : form_subject,
    	    message    : form_message
    	  }

    	  $.ajax({
    	         type: "POST",
    	         url : url,
    	         dataType: "json",
    	         crossDomain: "true",
    	         contentType: "application/json; charset=utf-8",
    	         data: JSON.stringify(data),

    	         
    	         success: function () {
    	           // clear form and show a success message
    	           alert("Successfull");
    	          // document.getElementById("contact-form").reset();
    	       //location.reload();
    	         },
    	         error: function () {
    	           // show an error message
    	           alert("UnSuccessfull");
    	         }});

    		  return false;
    });    

});