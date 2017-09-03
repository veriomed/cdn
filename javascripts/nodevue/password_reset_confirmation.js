$(document).ready(function(){

    $("#password-reset-confirmation-form").submit(function(e) {

        // Get the Login Name value and trim it
        var password = $.trim($('#password').val());
        var confirmpassword = $.trim($('#confirmpassword').val());

        // Check if empty of not
        if (password != confirmpassword) {
            $('#bootalert-password').html("Confirm password does not match!");
            $('#bootalert-password').show();
            return false;
        }else{
            $('#bootalert-password').hide();
        }

		if (validatePassword(password, pwStrength) == false){
			$('#bootalert-password').html("Password strength is insufficient!");
			$('#bootalert-password').show();
			return false;
		}


        e.preventDefault();
        $.ajax({
            type : "POST",
            url : $(location).attr('href'), // "/login/password_reset_confirmation",
            dataType: 'text',
            data : $("#password-reset-confirmation-form").serialize(),

            success : function(response) {
                if (response=='verified'){
                    $("#password-reset-confirmation-form").hide();
                    $("#password-reset-confirmation-complete").show();
                }  else {
					$('#bootalert-password').html("Password is not valid, request failed!");
					$('#bootalert-password').show();
                }

                $("#return_update_msg").html(response);
                $(".post_submitting").fadeOut(1000);
            },
            error : function(response) {
                //alert(response);
            }

        });
        e.preventDefault();
    });




});


function validatePassword (password, options) {

		var defaultOptions = {
				minlen:   8,
				lower:    1,
				upper:    1,
				numeric:  1,
				special:  1,
		}

		var	re = {
				lower:   /[a-z]/g,
				upper:   /[A-Z]/g,
				alpha:   /[A-Z]/gi,
				numeric: /[0-9]/g,
				special: /[\W_]/g
		},
		rule, i;

		for (var property in options){
				defaultOptions[property] = options[property];
		}

		// enforce min/max length
		if (password.length < defaultOptions.minlen){
				return false;
		}

		// enforce lower/upper/alpha/numeric/special rules
		for (rule in re) {
				if ((password.match(re[rule]) || []).length < defaultOptions[rule])
				return false;
		}

		return true;

}

