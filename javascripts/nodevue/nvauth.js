var isActive = false;
var RespErrCount = 0;
var intervalID = '';
var logoutURL = "/login/logout";
var disableScript = false;

document.currentScript = document.currentScript || (function() {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();
document.currentScript.get = function(variable) {
	 if(variable=(new RegExp('[?&]'+encodeURIComponent(variable)+'=([^&]*)')).exec(this.src))
	 return decodeURIComponent(variable[1]);
};
disableScript = document.currentScript.get('disableScript') || false;
logoutURL = document.currentScript.get('logoutURL') || "/login/logout";

if(disableScript==false){
	intervalID = window.setInterval(CheckAuth, 60000);
}

document.onclick = function() {
    isActive = true;
};

document.onmousemove = function() {
    isActive = true;
};

document.onkeypress = function() {
    isActive = true;
};

function CheckAuth() {

    $.ajax({

	type: "GET",
	url: "/login/authsession?tokenActive=" + isActive,

	success: function(msg){
	    RespErrCount=0;
	    if (msg=='401'){
	    	window.location.href = logoutURL; //"/login/logout";
	    }
	},

	error: function(request, status, error) {
	    if (request.status == '401'){
	    	window.location.href = logoutURL; //"/login/logout";
	    };

	    RespErrCount++;
	    if (RespErrCount>=16){

			clearInterval(intervalID);

			var htmlContent = "<div style='z-index: 2000;background-color: rgb(255, 255, 255);position: absolute;top:0;bottom:0;left:0;right:0;overflow:hidden;text-align: center;line-height: 500px;'><img style='width: 32px; height: 32px;' src='/images/logo-symbol-64x64.png'>&emsp;Session timed out. Click <a href='" + logoutURL + "'>here</a> to Login</div>";

	    	//document.cookie = 'nvsid=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	    	//document.cookie="nvsidauth=-1";
	    	$('body').empty();
	    	$('body').html(htmlContent);
	    	document.title = 'Session timed out';

	    };
	}

    });

    isActive = false;

}




function isMSIE() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE") > -1 || ua.indexOf("Edge") > -1 || ua.indexOf("Trident") > -1;
        return msie;

        /*if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){      // If Internet Explorer, return version number
        	return true;
        } else {                 // If another browser, return 0
            return false;
		}
		*/

}


function isSafari() {

        var ua = window.navigator.userAgent;
        var safari = (window.navigator.vendor.indexOf("Apple") > -1 && ua.indexOf("Safari") > -1) || (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") < 0);
        return safari;

}


function setIEPlaceholders() {

		if (isMSIE()){

			$( "input:text, input[type='email'], textarea, input[type='password']" ).each(function( index ) {
				if ( $(this).attr("placeholder") && !$(this).attr("nv-placeholder") ){
					$( "<span class='ie-placeholder-label'><span>" + $(this).attr("placeholder") + "</span></span>" ).insertBefore( $(this) );
					$(this).attr("placeholder", "");
					$(this).attr("nv-placeholder", "true");
					$(this).prev("span").css( "top", $(this).position().top + Number($(this).css("margin-top").replace("px","")) );
					$(this).prev("span").css( "left", $(this).position().left );
					//$(this).prev("span").css( "left", "0" );
					$(this).prev("span").css( "height", $(this).outerHeight() );
					$(this).prev("span").css( "width", $(this).outerWidth() );
					$(this).prev("span").css( "padding-left", (Number($(this).css("padding-left").replace("px","")) + 1) + "px" );
					$(this).prev("span").css( "padding-top", (Number($(this).css("padding-top").replace("px","")) + 0) + "px" );
					$(this).prev("span").css( "padding-right", (Number($(this).css("padding-right").replace("px","")) + 1) + "px" );
					$(this).prev("span").css( "padding-bottom", (Number($(this).css("padding-bottom").replace("px","")) + 1) + "px" );
					$(this).prev("span").css( "font-size", $(this).css("font-size") );
					$(this).prev("span").css( "font-style", $(this).css("font-style") );

					if ($(this).val().length>0){
						$(this).prev("span").css('visibility', 'hidden');
					}

					$(this).keydown(function() {
						if ( $(this).prev("span").css('visibility') != 'hidden' && $(this).val().length==0 ){
							return;
						}
						$(this).prev("span").css('visibility', 'hidden');
					});

					$(this).keyup(function() {
						if ($(this).val().length>0){
							$(this).prev("span").css('visibility', 'hidden');
						}else{
							$(this).prev("span").css('visibility', '');
						}
					});

					$(this).blur(function() {
						if ($(this).val().length>0){
							$(this).prev("span").css('visibility', 'hidden');
						}else{
							$(this).prev("span").css('visibility', '');
						}
					});

					$(this).on('input',function(e){
						if ($(this).val().length>0){
							$(this).prev("span").css('visibility', 'hidden');
						}else{
							$(this).prev("span").css('visibility', '');
						}
					});
				}

			});

		}

}


function formValidationCheck(thisElem, event){

	if (isSafari()){
		thisElem.noValidate = true;
		if (!event.target.checkValidity()) {
			$(event.target).addClass("requiredfield");
			event.preventDefault(); // dismiss the default functionality
			event.stopPropagation();
			event.stopImmediatePropagation();
			return false;
		}
	}

}


$(function () {
	setIEPlaceholders();
	//formValidationCheck();

		/*
		$('body').on('DOMNodeInserted', 'div', function () {
			  //$(this).combobox();
			  alert("new element added");
		});
		*/

		//FOR SAFARI BROWSER - TO-DO
		/*
		$( "form" ).each(function( index ) {
			this.noValidate = true;
			this.addEventListener('submit', function(event) { // listen for form submitting
				if (!event.target.checkValidity()) {
					event.preventDefault(); // dismiss the default functionality
				}
			}, false);
		});
		*/

});




function fieldValidator(dataType, dataValue, defaultValue){
	//
	if (defaultValue === undefined){
		defaultValue = '';
	}
	if (dataValue === undefined){
		return defaultValue;
	}

	var returnValue = '';

	try{
			switch(dataType) {
				case "phone":
					returnValue = dataValue.replace(/\D/g,''); //removes all non-numeric chars
					if (returnValue.length > 0 && returnValue.length == 11 & returnValue.charAt(0) == '1'){
						returnValue = returnValue.substring(1);
					}
					if (returnValue.length > 0 && returnValue.length == 10){
						returnValue = returnValue.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"); //formats it to xxx-xxx-xxxx
					}else if (returnValue.length > 0 && returnValue.length == 7){
						returnValue = returnValue.replace(/(\d{3})(\d{4})/, "$1-$2"); //formats it to xxx-xxxx
					}else{
						returnValue = defaultValue;
					}

					break;

				case "ssn":
					returnValue = dataValue.replace(/\D/g,''); //removes all non-numeric chars
					if (returnValue.length > 0 && returnValue.length == 9){
						returnValue = returnValue.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3"); //formats it to xxx-xx-xxxx
					}else{
						returnValue = defaultValue;
					}

					break;

				case "zip":
					returnValue = dataValue.replace(/\D/g,''); //removes all non-numeric chars
					if (returnValue.length >= 5){
						returnValue = returnValue.substring(0,5);
					}else if (returnValue.length < 5){
						returnValue = defaultValue;
					}

					break;

				case "state":
					returnValue = dataValue.toUpperCase();
					if (returnValue.length > 2){
						if(usStates[returnValue] !== undefined){
							returnValue = usStates[returnValue];
						}else{
							returnValue = defaultValue;
						}
					}else if (returnValue.length < 2){
						returnValue = defaultValue;
					}

					break;

				case "gender":
					returnValue = dataValue.toUpperCase();
					if (returnValue == 'MALE' || returnValue == 'M'){
						returnValue = 'M';
					}else if (returnValue == 'FEMALE' || returnValue == 'F'){
						returnValue = 'F';
					}else{
						returnValue = 'U';
					}

					break;

				case "dateMMDDYYYY":
					returnValue = dataValue.replace(/\D/g,''); //removes all non-numeric chars
					if (returnValue.length == 8){
						if (moment(returnValue, "MMDDYYYY").isValid() == false){
							returnValue = defaultValue;
						}
					}else{
						returnValue = defaultValue;
					}

					break;

				case "dateYYYYMMDD":
					returnValue = dataValue.replace(/\D/g,''); //removes all non-numeric chars
					if (returnValue.length == 8){
						if (moment(returnValue, "YYYYMMDD").isValid() == false){
							returnValue = defaultValue;
						}
					}else{
						returnValue = defaultValue;
					}

					break;

				case "dateMMDDYYYY2MM/DD/YYYY":
					returnValue = dataValue.replace(/\D/g,''); //removes all non-numeric chars
					if (returnValue.length == 8){
						var tempMoment = moment(returnValue, "MMDDYYYY");
						if (tempMoment.isValid() == false){
							returnValue = defaultValue;
						}else{
							returnValue = tempMoment.format('MM/DD/YYYY');
						}
					}else{
						returnValue = defaultValue;
					}

					break;

				case "dateYYYYMMDD2MM/DD/YYYY":
					returnValue = dataValue.replace(/\D/g,''); //removes all non-numeric chars
					if (returnValue.length == 8){
						var tempMoment = moment(returnValue, "YYYYMMDD");
						if (tempMoment.isValid() == false){
							returnValue = defaultValue;
						}else{
							returnValue = tempMoment.format('MM/DD/YYYY');
						}
					}else{
						returnValue = defaultValue;
					}

					break;

				case "email":
					var regexString = /\S+@\S+\.\S+/;
					if(regexString.test(dataValue) == false){ //pattern matching of id@domain.com failed
						returnValue = defaultValue;
					}else{
						returnValue = dataValue;
					}

					break;


				default:
					returnValue = defaultValue;


			}
	}catch(e){
		console.log(e);
		returnValue = defaultValue;
	}

	return returnValue;
}



var usStates = {
				'ALABAMA': 'AL',
				'ALASKA': 'AK',
				'AMERICAN SAMOA': 'AS',
				'ARIZONA': 'AZ',
				'ARKANSAS': 'AR',
				'CALIFORNIA': 'CA',
				'COLORADO': 'CO',
				'CONNECTICUT': 'CT',
				'DELAWARE': 'DE',
				'DISTRICT OF COLUMBIA': 'DC',
				'FEDERATED STATES OF MICRONESIA': 'FM',
				'FLORIDA': 'FL',
				'GEORGIA': 'GA',
				'GUAM': 'GU',
				'HAWAII': 'HI',
				'IDAHO': 'ID',
				'ILLINOIS': 'IL',
				'INDIANA': 'IN',
				'IOWA': 'IA',
				'KANSAS': 'KS',
				'KENTUCKY': 'KY',
				'LOUISIANA': 'LA',
				'MAINE': 'ME',
				'MARSHALL ISLANDS': 'MH',
				'MARYLAND': 'MD',
				'MASSACHUSETTS': 'MA',
				'MICHIGAN': 'MI',
				'MINNESOTA': 'MN',
				'MISSISSIPPI': 'MS',
				'MISSOURI': 'MO',
				'MONTANA': 'MT',
				'NEBRASKA': 'NE',
				'NEVADA': 'NV',
				'NEW HAMPSHIRE': 'NH',
				'NEW JERSEY': 'NJ',
				'NEW MEXICO': 'NM',
				'NEW YORK': 'NY',
				'NORTH CAROLINA': 'NC',
				'NORTH DAKOTA': 'ND',
				'NORTHERN MARIANA ISLANDS': 'MP',
				'OHIO': 'OH',
				'OKLAHOMA': 'OK',
				'OREGON': 'OR',
				'PALAU': 'PW',
				'PENNSYLVANIA': 'PA',
				'PUERTO RICO': 'PR',
				'RHODE ISLAND': 'RI',
				'SOUTH CAROLINA': 'SC',
				'SOUTH DAKOTA': 'SD',
				'TENNESSEE': 'TN',
				'TEXAS': 'TX',
				'UTAH': 'UT',
				'VERMONT': 'VT',
				'VIRGIN ISLANDS': 'VI',
				'VIRGINIA': 'VA',
				'WASHINGTON': 'WA',
				'WEST VIRGINIA': 'WV',
				'WISCONSIN': 'WI',
				'WYOMING': 'WY',
				'AE': 'AE',
				'AP': 'AP',
				'AA': 'AA',
				'APO': 'APO',
				'FPO': 'FPO',
				'ARMED FORCES EUROPE': 'AE',
				'ARMED FORCES PACIFIC': 'AP',
				'ARMED FORCES AMERICAS': 'AA',
				'ARMY POST OFFICE': 'APO',
				'FLEET POST OFFICE': 'FPO',
				};
