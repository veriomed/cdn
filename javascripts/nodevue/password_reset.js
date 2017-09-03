$(document).ready(function(){

	var CSRF_HEADER = 'X-CSRF-Token';

	var setCSRFToken = function(securityToken) {
			jQuery.ajaxPrefilter(function(options, _, xhr) {
					if ( !xhr.crossDomain )
							xhr.setRequestHeader(CSRF_HEADER, securityToken);
					});
	};

	setCSRFToken($('meta[name="csrf-token"]').attr('content'));

    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
        return pattern.test(emailAddress);
    };


    $("#password-reset-form").submit(function(e) {

        // Get the Login Name value and trim it
        var email = $.trim($('#email').val());

        // Check if empty of not
        if (!isValidEmailAddress(email)) {
            $('#bootalert-email').show();
            return false;
        }else{
            $('#bootalert-email').hide();
        }

        e.preventDefault();
        $.ajax({
            type : "POST",
            url : "/login/password_reset",
            dataType: 'text',
            data : $("#password-reset-form").serialize(),

            success : function(response) {
                if (response=='verified'){
                    $("#password-reset-form").hide(); //.css("visibility", "hidden");
                    $("#password-reset-complete").show()// .css("visibility", "visible");
                }  else {
                    $("#error-recaptcha").alert({txt:"test warning message",type:"error"});
                    Recaptcha.reload();
                }
                $("#return_update_msg").html(response);
                $(".post_submitting").fadeOut(1000);
            },
            error : function(response) {
                alert("Error");
            }

        });
        e.preventDefault();
    });


});
