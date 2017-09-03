(function($){

	$.fn.suggestDropDown = function(callbackFn, callbackHTMLrow, thiselem){

		//console.log( this);
		var callbackSelect = callbackFn;
		var callbackHTMLgen = callbackHTMLrow;
		var callbackThisElem = thiselem;

		var element = this;
		var dataURL = $(element).attr( "data-url");
		var dataTypeValue = $(element).attr( "data-type");
		var dataTransportType = $(element).attr( "data-transport") || "GET";
		var dataURLParameterize = ($(element).attr( "data-URLParameterize") == "true") ? true : false;
		
		//data-type='jsonp'

		var qSearchField =  $(element).find("input[name='q']"); //$(element).find("#qSearchField"); //
		var aucparent = $(element).find("#aucparent");
		var auc = $(element).find("#auc");
		var srchoptionsparent = $(element).find("#srchoptionsparent");
		var buttonSearchOptions = $(element).find("#buttonSearchOptions");
		var buttonsubmit = $(element).find("#buttonsubmit");



		setDropDownsCSS();


		$(window).bind("resize", function(){
			setDropDownsCSS();
		});


		function setDropDownsCSS(){
			var qSearchFieldWidth = $(qSearchField).outerWidth();

			$(aucparent).width( qSearchFieldWidth );
			$(srchoptionsparent).width( qSearchFieldWidth );

			if (buttonsubmit){
				var buttonsubmitWidth = $(buttonsubmit).outerWidth();
				$(buttonSearchOptions).css('margin-right', buttonsubmitWidth + 1);
			}
		};


        $(buttonSearchOptions).click(function() {
            $(srchoptionsparent).css({"visibility":"visible"});
            $(buttonSearchOptions).css({"visibility":"hidden"});
        });


        $(document).click(function(e) {
          if( $(e.target).hasClass("srchDropDownOption") == false ) {
              $(srchoptionsparent).css({"visibility":"hidden"});
              $(buttonSearchOptions).css({"visibility":"visible"});
          }

          if($(event.target).attr("id") && $(event.target).attr("id").indexOf("qSearchField") > 0){ // $(e.target).attr("id") != "qSearchField" ) {
              $(aucparent).css({"visibility":"hidden"});
          }

        });



		$(qSearchField).focus(function(){
			this.selectionStart = this.selectionEnd = this.value.length;
			$(srchoptionsparent).css({"visibility":"hidden"});
			$(buttonSearchOptions).css({"visibility":"visible"});
		});


		$(qSearchField).on('input', function() {
			var data;
			var url;
			if(dataTransportType.toLowerCase() == "GET" && dataURLParameterize == false){
				data = null;
				url = dataURL + "?q=" + $(qSearchField).val();
			}else if(dataURLParameterize == true){
				data = null;
				url = dataURL + "" + $(qSearchField).val() + "/";				
			}else{
				data = {q: $(qSearchField).val()};
				url = dataURL;
			}

			$.ajax({
				type: dataTransportType, //"GET",
				crossDomain: true,
				dataType: dataTypeValue,
				url: url, //dataURL + "?q=" + $(qSearchField).val(),
				data: data,

				success: function(msg){
					//console.log(msg);

					if (msg && msg[0] && msg[0].options.length > 0){

					  $(auc).attr("totalindex", msg[0].options.length);
					  $('.aucdiv').removeClass( 'searchAUCselected' );
					  $(auc).attr("selectedindex", '-1'); //Now reset current selected index/row to -1

					  for (ac in msg[0].options){
						if (callbackHTMLgen){
							$(auc).find('#auc-' + ac).html( callbackHTMLgen( msg[0].options[ac], msg[0] ) );
						}else{
							$(auc).find('#auc-' + ac).html( msg[0].options[ac].text.substring(0,msg[0].length) + '<b>' + msg[0].options[ac].text.substring(msg[0].length) + '</b>');
						}

						/*
						if (callSrcType=='npi'){
							$(auc).find('#auc-' + ac).html( '<div style=font-size:small><b>' + msg[0].options[ac].text + '</b></div><div style=font-size:smaller>NPI:&nbsp;' + msg[0].options[ac].payload.npi + '</div>');
						}else{
							$(auc).find('#auc-' + ac).html( msg[0].options[ac].text.substring(0,msg[0].length) + '<b>' + msg[0].options[ac].text.substring(msg[0].length) + '</b>');
						}
						*/


						$(auc).find('#auc-' + ac).css({"display":"block"});
						$(auc).find('#auc-' + ac).attr( "altstr", msg[0].options[ac].text);
						$(auc).find('#auc-' + ac).data("payload", msg[0].options[ac].payload || msg[0].options[ac]);
					  }

					  for (i=parseInt(ac)+1; i<5; i++){
						$(auc).find('#auc-' + i).text('');
						$(auc).find('#auc-' + i).css({"display":"none"});
						$(auc).find('#auc-' + i).attr( "altstr", '');
					  }
					  $(aucparent).css({"visibility":"visible"});

					}else{
					  $(aucparent).css({"visibility":"hidden"});
					  $('.aucdiv').removeClass( 'searchAUCselected' );
					  $(auc).attr("selectedindex", '-1'); //Now reset current selected index/row to -1
					  $(auc).attr("totalindex", "0");
					}


				},

				error: function( error) {
					//PageNotifications("Error - " + request.responseText, "error");
					//alert("Unable to connect to server or request timed out." + request.responseText);
				}

			});


		});




        $(auc).find('.aucdiv').mouseover(function(event){
            $(auc).find('.aucdiv').removeClass( 'searchAUCselected' );
            $(event.target).closest('.aucdiv').addClass( 'searchAUCselected' );
        });


        $(auc).find('.aucdiv').mouseout(function(event){
            $(event.target).removeClass( 'searchAUCselected' );
        });

        $(auc).find('.aucdiv').click(function(event) {
            $(qSearchField).val( $(event.target).closest('.aucdiv').attr( "altstr") );
            $(aucparent).css({"visibility":"hidden"});
            $(event.target).removeClass( 'searchAUCselected' );
            callbackSelect($(event.target).closest('.aucdiv').data( "payload"), callbackThisElem);
            $(auc).attr("selectedindex", "-1"); //Now reset selected index
            $(auc).find('.aucdiv').removeClass( 'searchAUCselected' ); //Now reset dropdown rows (selection CSS)
            //alert('submit' + $(event.target).closest('.aucdiv').attr( "altstr"));
            //$( "#pat-search-form" ).submit();
        });


		$( qSearchField ).keydown(function(event) {

		  if($(event.target).attr("id") && $(event.target).attr("id").indexOf("qSearchField") > 0){ // != "qSearchField"){
			return;
		  }

		  if ($(aucparent).css("visibility") == 'visible'){

			var selectedIndex = parseInt($(auc).attr("selectedindex"));
			var totalindex = parseInt($(auc).attr("totalindex"));

			if (event.keyCode==38) { //arrow key up
			  if (selectedIndex == -1){
				selectedIndex = 0;
			  }
			  selectedIndex = (selectedIndex + (totalindex-1)) % totalindex; //modulo of 4 (total of auto complete 5 records)
				$(auc).find('.aucdiv').removeClass( 'searchAUCselected' );
				$(auc).find('#auc-' + selectedIndex).addClass( 'searchAUCselected' );
			  $(auc).attr("selectedindex", selectedIndex); //Now set the updated current selected index/row
			  $(qSearchField).val( $(auc).find('#auc-' + selectedIndex).attr( "altstr") );
			  return false; // this statement will disable cursor from going to position zero
			}

			if (event.keyCode==40) { //arrow key down
			  selectedIndex = (selectedIndex + 1) % totalindex; //modulo of 4 (total of auto complete 5 records)
				$(auc).find('.aucdiv').removeClass( 'searchAUCselected' );
				$(auc).find('#auc-' + selectedIndex).addClass( 'searchAUCselected' );
			  $(auc).attr("selectedindex", selectedIndex); //Now set the updated current selected index/row
			  $(qSearchField).val( $(auc).find('#auc-' + selectedIndex).attr( "altstr") );
			}

			if (event.keyCode==13 && selectedIndex != -1) { //enter key
			  $(qSearchField).val( $(auc).find('#auc-' + selectedIndex).attr( "altstr") );
			  $(aucparent).css({"visibility":"hidden"});
			  $(event.target).removeClass( 'searchAUCselected' );
			  callbackSelect( $(auc).find('#auc-' + selectedIndex).data( "payload"), callbackThisElem );
			  $(auc).attr("selectedindex", "-1"); //Now reset selected index
			  $(auc).find('.aucdiv').removeClass( 'searchAUCselected' ); //Now reset dropdown rows (selection CSS)
			}

			if (event.keyCode==27 || event.keyCode==9) { //27 - escape key || 9 - tab
			  $(aucparent).css({"visibility":"hidden"});
			  $(auc).find('.aucdiv').removeClass( 'searchAUCselected' );
			  $(auc).attr("selectedindex", '-1'); //Now reset current selected index/row to -1
			}

		  }

		});





	};

})(jQuery);