var verioChartObj = {};
var tabIDslicedlast5;
var gTabShares;
var gTabSharesUsersList = {};
var gOnLoadComplete = false;
var gChartStats = {};
var gColors = [
					"#1f77b4",
					"#ff7f0e",
					"#2ca02c",
					"#d62728",
					"#9467bd",
					"#7f7f7f",
					"#bcbd22",
					"#17becf",
					"#D8181C",
					"#50AF28",
					"#cc1c8c",
					"#793094",
					"#e86000",
					"#49606a",
					"#41c572",
					//-----
					"#8c6d31",
					"#bd9e39",
					"#e7ba52",
					"#e7cb94",
					"#843c39",
					"#ad494a",
					"#d6616b",
					"#e7969c",
					"#7b4173",
					"#a55194",
					"#ce6dbd",
					"#de9ed6"
				];
var gShapes = ["circle", "cross", "diamond", "square", "triangle-down", "triangle-up"];
var gHeatGradients = [
						['#feedde','#fdbe85','#fd8d3c','#d94701'], //VerioMed Default Orange
						['#eff3ff','#bdd7e7','#6baed6','#2171b5'], //Blue
						['#edf8e9','#bae4b3','#74c476','#238b45'], //Green
						['#f2f0f7','#cbc9e2','#9e9ac8','#6a51a3'], //Purple
						['#fee5d9','#fcae91','#fb6a4a','#cb181d'], //Red
						['#ffffcc','#a1dab4','#41b6c4','#225ea8'], //Carto GreenBlue - 4-class YlGnBu
						['#fef0d9','#fdcc8a','#fc8d59','#d7301f'], //Carto 4 class orange red
						['#f1eef6','#d7b5d8','#df65b0','#ce1256'], //Carto 4 class purple red
						['#ffffb2','#fecc5c','#fd8d3c','#e31a1c'], //Carto 4 class yellow orange

				];

/*
					{0.25: 'rgb(0,0,255)', 0.55: 'rgb(0,255,0)', 0.85: 'yellow', 1.0: 'rgb(255,0,0)'},
					{0.25: '#eff3ff', 0.55: '#bdd7e7', 0.85: '#6baed6', 1.0: '#2171b5'},
					{0.25: '#edf8e9', 0.55: '#bae4b3', 0.85: '#74c476', 1.0: '#238b45'},
					{0.25: '#feedde', 0.55: '#fdbe85', 0.85: '#fd8d3c', 1.0: '#d94701'},
					{0.25: '#f2f0f7', 0.55: '#cbc9e2', 0.85: '#9e9ac8', 1.0: '#6a51a3'},
					{0.25: '#fee5d9', 0.55: '#fcae91', 0.85: '#fb6a4a', 1.0: '#cb181d'},

*/




/*
					//{0.25: '#', 0.55: '#', 0.85: '#', 1.0: '#'},

*/
var gDeviceSize = "lg";
var gTabMasterData = null;
var gColorsOutOfBounds = "#fff000";
var gRowsArray = [];
var gItemRowReference = {};
var gContainerDimensions = {height: 0, width: 0};
var gDroppableHoverRegion = "full";
var gDroppableHoverRegion_CDR_ElemID = null;
var gFilters = {};
var gDrillDownFlyFilters = {filters:{}, chartInitiator: null};
var gCurrentSearchPointer_template = 0;
var gFavorites = {};
var gTemp_MapDataValues = null;
var gTemp_CTRL_Pressed = false;

//On Page Load Complete...
$(function() {

	//gTabs = '#{tabs}'; //JSON.stringify
	filtersJSON = JSON.parse(filtersJSON);

	//AP change 7/4/2016
	var toolbarwidth = $("#dashboard-toolsmenu").is(":visible") ? 50 : 0;
	$("#dashboard-chartarea").css("width", ($(window).width() - $('#dashboard-olapmenu').width() - toolbarwidth - 7) );


	//If viewonly share mode from invite link
	if(gMode == "View only" || gMode == "View and Copy"){
		$("#container-dashboard .row").removeClass("hidden");
		$("#tabnav").addClass("hidden");
		$("#dashboard-toolsmenu").remove();
		$("#dashboard-graphboard").css("margin-left", "0px");
		$("#dashboard-olapmenu").remove();
		$("#dashboard-chartarea").css("width", "100%");
		$("#dashboard-chartarea").css("margin-right", "5px");
		if(gMode == "View and Copy"){
			$("#tabnav-createcopy").css("display", "initial");
		}
	}

	gContainerDimensions.height = $("#dashboard-chartarea").height();
	gContainerDimensions.width = $("#dashboard-chartarea").width();

	function isDivVisible(inputTestSize) {
		return $('.device-' + inputTestSize).is(':visible');
	}

	if (isDivVisible("xs")) {gDeviceSize = "xs";}
	if (isDivVisible("sm")) {gDeviceSize = "sm";}
	if (isDivVisible("md")) {gDeviceSize = "md";}
	if (isDivVisible("lg")) {gDeviceSize = "lg";}

	$("[data-toggle='tooltip']").tooltip({ container: 'body' });
	$("[rel='tooltip']").tooltip({ container: 'body' });

	$('#dashoptions').popover({
		html: true,
		trigger: 'manual',
		container: '#dashboard-graphboard',
	});

	$('#dashoptions').click(function(e) {
		$(this).popover('toggle');
		//e.stopPropagation();
		$(document).bind( "keyup mousedown", function(e) {
			if (e.keyCode == 27 || e.type=="mousedown") {
				$('#dashoptions').popover('hide');
				$(document).unbind( "keyup mousedown" );
			}
		});
		return false;
	});

	$(document).on({
		mouseenter: function(){
			$(this).tooltip({ container: 'body' });
			$(this).tooltip({ "padding": 20 });
			$(this).tooltip('show');
			var id = $(this).attr("aria-describedby");
			var left = $("#" + id).position().left;
			$("#" + id).css("left", left + Number($(this).attr("width"))/2);
			$("#" + id).css("z-index", 100000);
		},
		mouseleave: function(){
			$(this).tooltip('hide');
		}
	}, '.dhheattile');


/*
	$("[data-toggle='tooltip']").mouseenter(function(){
		var that = $(this);
		that.tooltip({ container: 'body' });
		that.tooltip('show');
		setTimeout(function(){
			that.tooltip('hide');
		}, 2000);
	});
*/


	//PRODUCTION - this sets the scroll for filter panel
	//$( '#dashboard-olapmenu' ).height($(window).height()-70);
	$( '#olap-panel' ).height($(window).height()-70);
	$( '#olap-panel' ).width($( '#dashboard-olapmenu' ).width()-3);


	gConfigs = JSON.parse(gConfigs);
	var psclist = [];
	var psclistJSON = JSON.parse(perfLocList);
	if(psclistJSON && psclistJSON.found==true){
		psclist = psclistJSON.hits;
	}

	var requestedTabIndex = 0;

	if(gTabs == null || gTabs == "null" || gTabs == ""){
		requestedTabIndex = -1;
	}else{
		var tempParsed_gTabs = JSON.parse(gTabs);
		gFavorites = tempParsed_gTabs.favs || {}; //users favorites templates
		var local_gTabs = tempParsed_gTabs.tabs;
		if(!local_gTabs || local_gTabs.length == 0){
			requestedTabIndex = -1;
		}else{
			requestedTabIndex = 0;
			gTabsCount = local_gTabs.length;
			for(var tabIndex in local_gTabs){
				if (gTabID == local_gTabs[tabIndex]._id) {
					requestedTabIndex = tabIndex;
				}
			}
			gTabID = local_gTabs[requestedTabIndex]._id;
			tabIDslicedlast5 = gTabID.slice(-5);
		}
	}


	if(requestedTabIndex >= 0){

		gTabMasterData = local_gTabs[requestedTabIndex];
		gTabData = local_gTabs[requestedTabIndex].content;
		//gTabData = JSON.stringify(local_gTabs[requestedTabIndex].content).replace(/obr\_/g, "obr.");
		//gTabData = JSON.parse(gTabData);
		//console.log(gTabData);

		gTabShares = local_gTabs[requestedTabIndex].sharedwith || [];

		//IMPORTANT!!! Do this array position manipulation after getting original array index data...
		if (requestedTabIndex > 3) {
			var removedElements = local_gTabs.splice ( requestedTabIndex, 1 );
			var removedElementsNew = local_gTabs.splice ( 3, 0, removedElements[0]);
		}

		for(var tabIndex in local_gTabs){

			$("#ulsorttabs").append($('<li />', {'id': 'sortdashtabs-' + local_gTabs[tabIndex]._id, 'data-id': local_gTabs[tabIndex]._id, 'html': local_gTabs[tabIndex].title}));

			var nav_liElem = $('<li />', {id: 'navbar-li-active-' + local_gTabs[tabIndex]._id});
			var nav_aElem = $('<a />', {html: local_gTabs[tabIndex].title , class: 'navbar-li-text-active-' + local_gTabs[tabIndex]._id, href: '/analytics/?tabID=' + local_gTabs[tabIndex]._id});
			nav_liElem.append(nav_aElem);
			if(tabIndex < 4){
				if(tabIndex > 1 && tabIndex < 4){
					nav_liElem.addClass("visible-md visible-lg");
				}
				nav_liElem.insertBefore("#tabnav .dropdown:first");
			}else{
				$("#tabnav .dropdown-sm").removeClass("hidden").attr("display","");
				$("#tabnav .dropdown-sm .dropdown-menu").append(nav_liElem.clone());
				$("#tabnav .dropdown-md").removeClass("hidden").attr("display","");
				$("#tabnav .dropdown-md .dropdown-menu").append(nav_liElem.clone());
				$(".more-dashboardtab").removeClass("hidden");
				$(".dropdown-toggle").removeClass("hidden");
			}

		}


		$("#navbar-li-active-" + gTabID).addClass("navbar-li-active"); //.className += " navbar-li-active";
		$(".navbar-li-text-active-" + gTabID).attr("id", "navbar-li-text-active"); //[0].setAttribute("id", "navbar-li-text-active");

		if( $('#navbar-li-active-' + gTabID + '-md').length ){
				$("#navbar-li-active-" + gTabID + "-md").addClass("navbar-li-active"); //.className += " navbar-li-active";
				$(".navbar-li-text-active-" + gTabID + "-md").attr("id", "navbar-li-text-active"); //[0].setAttribute("id", "navbar-li-text-active");
				$("#navbar-li-dropdown-more-link").addClass("navbar-li-active"); //.className += " navbar-li-active";
		}

		if( $('#navbar-li-active-' + gTabID + '-xs').length ){
				$("#navbar-li-active-" + gTabID + "-xs").addClass("navbar-li-active"); //.className += " navbar-li-active";
				$(".navbar-li-text-active-" + gTabID + "-xs").attr("id", "navbar-li-text-active"); //[0].setAttribute("id", "navbar-li-text-active");
				$("#navbar-li-dropdown-more-link").addClass("navbar-li-active"); //.className += " navbar-li-active";
		}

	}else{
		gTabData = {};
		$("#side-panel-toolbox").addClass("disabled-toolbar");
	}

	$("#plus-newdashboardtab").removeClass("hidden");
	$("#ulsorttabs").sortable({containment: "#ulsorttabs", tolerance: "pointer"});

	$( "#datatableconnect1, #datatableconnect2" ).sortable({
		connectWith: ".connectedSortable",
		receive: function( event, ui ) {
			if(event.type == "sortreceive"){
				//console.log(ui.sender.attr("id"));
				if(ui.sender.attr("id") == "datatableconnect2"){
					ui.item.find(".fa").removeClass("fa-trash-o");
					ui.item.find(".fa").addClass("fa-chevron-circle-right");
				}else if(ui.sender.attr("id") == "datatableconnect1"){
					ui.item.find(".fa").removeClass("fa-chevron-circle-right");
					ui.item.find(".fa").addClass("fa-trash-o");
				}
			}
		}
	}).disableSelection();

	$("#modal-vizsettings #vizsettings-dimensionlist").sortable({
		placeholder: 'dhs-dummy',
		
		start: function(event, ui) {
			ui.placeholder.html('<li class="dzzz" style="padding-top: 5px; padding-bottom: 5px; background-color: #ffff6c; height:30px; opacity: 1;">' + '</li>');			
		},
		stop: function(event, ui) {
			console.log("asdasd")
			var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
			
			var temp_li_Obj = {};
			$("#modal-vizsettings #vizsettings-dimensionlist li").each(function( index ) {
				var temp_id = $(this).attr("id");
				if(temp_id != null && temp_id != "") temp_li_Obj[temp_id] = verioChartObj[invoked_chartID].properties.yseries[temp_id];
			});
			
			verioChartObj[invoked_chartID].properties.yseries = temp_li_Obj;
			//console.log(verioChartObj[invoked_chartID].pluginclass.data);
			updateAllCharts(invoked_chartID);
			//$("#dashboard-chartarea #" + invoked_chartID).updateVCChartData(verioChartObj[invoked_chartID].pluginclass.data, verioChartObj[invoked_chartID].properties.charttype, verioChartObj[invoked_chartID].pluginclass);

			//for(var yseriesIndex in verioChartObj[invoked_chartID].properties.yseries){
				//console.log(yseriesIndex);
			//}
		},
		items: "li:not(.addnewdimension)"
	});

	
	
	var restoreFilterData = gTabData.filterData;
	//Initialize and render elements
	function renderFilters(filtersJSON, restoreFilterData){

		for (var i in filtersJSON.filters){

			var filter = filtersJSON.filters[i];

			gFilters[filter.serializename] = filter;

			if(filter.listvalues != null){
				gFilters[filter.serializename]["xreflistvalues"] = {};
				gFilters[filter.serializename]["xreffiltercodes"] = {};
				for(var lvIndex in filter.listvalues){
					gFilters[filter.serializename]["xreflistvalues"][filter.listvalues[lvIndex].code] = filter.listvalues[lvIndex].item;
					gFilters[filter.serializename]["xreffiltercodes"][filter.listvalues[lvIndex].item] = filter.listvalues[lvIndex].code;
				}
			}

			if(filter.serializename == "loc"){

				gFilters[filter.serializename]["xreflistvalues"] = {};
				gFilters[filter.serializename]["xreffiltercodes"] = {};

				for(var pscIndex in psclist){
					filter.listvalues.unshift(
						{
						  "item": psclist[pscIndex]._source.name,
						  "code": psclist[pscIndex]._id
						}
					);

					gFilters[filter.serializename]["xreflistvalues"][psclist[pscIndex]._id] = psclist[pscIndex]._source.name;
					gFilters[filter.serializename]["xreffiltercodes"][psclist[pscIndex]._source.name] = psclist[pscIndex]._id;

				}
			}else if(filter.serializename == "coll"){
				filter.slidermax = moment().endOf('day').valueOf();
			}else if(filter.serializename == "sch"){
				filter.slidermax = moment().add(1, 'years').endOf('day').valueOf();
			}else if(filter.serializename == "res"){
				filter.slidermax = moment().endOf('day').valueOf();
			}


			var dimension_liElem = $('<li />', {html: filter.caption, class: 'd'});
			dimension_liElem.data("property", filter);
			var dimension_optionElem = $('<option />', {html: filter.caption});
			dimension_optionElem.data("property", filter);

			if(filter.settings.y == true){
				$("#addvizfield_popover ul.d").append(dimension_liElem.clone().data("property", filter)); //To-do fix this add class d to append...not working!
			}
			if(filter.settings.x == true){
				$("#vizbaseseries_popover ul.d").append(dimension_liElem.clone().data("property", filter));
				$("#modal-vizsettings li.addnewdimension #adddimen").append(dimension_optionElem);
				$("#tableFilterExpressions .templaterow .filexpdimen").append(dimension_optionElem.clone().data("property", filter).attr("value", filter.serializename));
			}



			if(filter.settings.filter == true){
				if (filter.type == 'slider'){

					var clone_template_slidercontainer = $("#template_slidercontainer").find(".filterparentDOM").clone();
					clone_template_slidercontainer.find(".filtercontainer").data("filterinfo", filter);
					clone_template_slidercontainer.find(".filtercontainer").attr("id", "filter_" + filter.name);
					clone_template_slidercontainer.find(".filtercontainer").attr("name", filter.name);
					clone_template_slidercontainer.find(".filtercontainer").attr("title", filter.title);
					clone_template_slidercontainer.find(".filtercaption").html(filter.title);
					clone_template_slidercontainer.find(".filtersettings").attr("id", "filter_" + filter.name + "_settings");

					clone_template_slidercontainer.find(".lowertext").addClass("class_filter_" + filter.name + "_lower");
					clone_template_slidercontainer.find(".lowertext").attr("id", "filter_" + filter.name + "_lower");
					clone_template_slidercontainer.find(".lowerinput").addClass("class_filter_" + filter.name + "_lower-val");
					clone_template_slidercontainer.find(".lowerinput").attr("name", filter.serializename + "_lower");

					clone_template_slidercontainer.find(".uppertext").addClass("class_filter_" + filter.name + "_upper");
					clone_template_slidercontainer.find(".uppertext").attr("id", "filter_" + filter.name + "_upper");
					clone_template_slidercontainer.find(".upperinput").addClass("class_filter_" + filter.name + "_upper-val");
					clone_template_slidercontainer.find(".upperinput").attr("name", filter.serializename + "_upper");

					clone_template_slidercontainer.find(".slidercontainer").attr("id", "filter_" + filter.name + "_slider");
					clone_template_slidercontainer.find(".slidercontainer").addClass("class_filter_slider");


					if (filter.datatype == 'date'){

						var temp_restoreVal = (restoreFilterData) ? restoreFilterData[filter.serializename.replace(/\./g, "^")] : null;
						var forceSliderValues = {};
						forceSliderValues.forcedSliderMin = (temp_restoreVal && temp_restoreVal.forcedSliderMin) ? temp_restoreVal.forcedSliderMin : null;
						forceSliderValues.forcedSliderMax = (temp_restoreVal && temp_restoreVal.forcedSliderMax) ? temp_restoreVal.forcedSliderMax : null;
			

						if(temp_restoreVal && (temp_restoreVal.lower != filter.slidermin || temp_restoreVal.upper != filter.slidermax)){
							clone_template_slidercontainer.find("input").addClass("filterserialize");
						}

						//var temp_FilterRangeValues = [((temp_restoreVal) ? temp_restoreVal.lower : filter.slidermin), ((temp_restoreVal) ? temp_restoreVal.upper : filter.slidermax)];
						//console.log(temp_FilterRangeValues);
						clone_template_slidercontainer.find(".filtercontainer").data("currentSliderValues", {min: (forceSliderValues.forcedSliderMin || filter.slidermin), max: (forceSliderValues.forcedSliderMax || filter.slidermax)});
						

						clone_template_slidercontainer.find(".slidercontainer").noUiSlider({
							start: [((temp_restoreVal) ? temp_restoreVal.lower : filter.slidermin), ((temp_restoreVal) ? temp_restoreVal.upper : filter.slidermax)],
							connect: true,
							step: 1, //7 * 24 * 60 * 60 * 1000, //1,
							behaviour: 'tap-extend',
							range: {
											'min': (forceSliderValues.forcedSliderMin || filter.slidermin),
											'max': (forceSliderValues.forcedSliderMax || filter.slidermax)
							},

							serialization: {
									lower: [
											$.Link({
													target: clone_template_slidercontainer.find(".class_filter_" + filter.name + "_lower-val"),
													method: setDateValue
													}),
											$.Link({
													target: clone_template_slidercontainer.find("#filter_" + filter.name + "_lower"),
													method: setDate
													})
									],

									upper: [
											$.Link({
													target: clone_template_slidercontainer.find(".class_filter_" + filter.name + "_upper-val"),
													method: setDateValue
													}),
											$.Link({
													target: clone_template_slidercontainer.find("#filter_" + filter.name + "_upper"),
													method: setDate
													})
									],

									format: {
											decimals: 0
									}

							}

						});

						clone_template_slidercontainer.find(".filtercontainer").data("forcedSliderMin", forceSliderValues.forcedSliderMin);
						if(forceSliderValues.forcedSliderMin != null){
							clone_template_slidercontainer.find(".span-resetfilterdates").removeClass("hidden");
							clone_template_slidercontainer.find(".noUi-connect").addClass("noUi-connect-subrange-override");
						}
						clone_template_slidercontainer.find(".filtercontainer").data("forcedSliderMax", forceSliderValues.forcedSliderMax);
						if(forceSliderValues.forcedSliderMax != null){
							clone_template_slidercontainer.find(".span-resetfilterdates").removeClass("hidden");
							clone_template_slidercontainer.find(".noUi-connect").addClass("noUi-connect-subrange-override");
						}
						
						/*
						clone_template_slidercontainer.find(".lowertext").css("cursor","pointer");
						clone_template_slidercontainer.find(".lowertext").datepicker({ autoclose: true, todayHighlight: false, orientation: "auto right", startDate: moment(filter.slidermin).format('MM/DD/YYYY'), endDate: moment(filter.slidermax).format('MM/DD/YYYY') })
							.on("show", function(e) {
								var parentFilterContainer = $(this).closest(".filtercontainer");
								$(this).datepicker('setEndDate', moment(Number(parentFilterContainer.find(".upperinput").val())).format('MM/DD/YYYY') );
								$(this).datepicker('setDate', moment(Number(parentFilterContainer.find(".lowerinput").val())).format('MM/DD/YYYY') );
							})
							.on("hide", function(e) {
								var parentFilterContainer = $(this).closest(".filtercontainer");
								parentFilterContainer.find(".slidercontainer").val([ moment(moment(e.date).format("MM/DD/YYYY")).startOf("day").valueOf(), moment(Number(parentFilterContainer.find(".upperinput").val())).valueOf() ], {set: false, update: false});
								parentFilterContainer.find(".lowertext").html( moment(e.date).format("MM/DD/YYYY") ); //its a hack for nouislider not working on date steps
								parentFilterContainer.find(".lowerinput").val( moment(e.date).valueOf() ); //its a hack for nouislider not working on date steps
								updateAllCharts();
							});


						clone_template_slidercontainer.find(".uppertext").css("cursor","pointer");
						clone_template_slidercontainer.find(".uppertext").datepicker({ autoclose: true, todayHighlight: false, orientation: "auto right", startDate: moment(filter.slidermin).format('MM/DD/YYYY'), endDate: moment(filter.slidermax).format('MM/DD/YYYY') })
							.on("show", function(e) {
								var parentFilterContainer = $(this).closest(".filtercontainer");
								$(this).datepicker('setStartDate', moment(Number(parentFilterContainer.find(".lowerinput").val())).format('MM/DD/YYYY') );
								$(this).datepicker('setDate', moment(Number(parentFilterContainer.find(".upperinput").val())).format('MM/DD/YYYY') );
							})
							.on("changeDate", function(e) {
								var parentFilterContainer = $(this).closest(".filtercontainer");
								parentFilterContainer.find(".slidercontainer").val([moment(Number(parentFilterContainer.find(".lowerinput").val())).valueOf(), moment(moment(e.date).format("MM/DD/YYYY")).startOf("day").valueOf() ], {set: false, update: false});
								parentFilterContainer.find(".uppertext").html( moment(e.date).format("MM/DD/YYYY") ); //its a hack for nouislider not working on date steps
								parentFilterContainer.find(".upperinput").val( moment(e.date).valueOf() ); //its a hack for nouislider not working on date steps
								updateAllCharts();
							});
						*/


					}else{

						var temp_restoreVal = (restoreFilterData) ? restoreFilterData[filter.serializename.replace(/\./g, "^")] : null;

						if(temp_restoreVal && (temp_restoreVal.lower != filter.slidermin || temp_restoreVal.upper != filter.slidermax)){
							clone_template_slidercontainer.find("input").addClass("filterserialize");
						}

						clone_template_slidercontainer.find(".slidercontainer").noUiSlider({
							start: [Number((temp_restoreVal) ? temp_restoreVal.lower : filter.slidermin), Number((temp_restoreVal) ? temp_restoreVal.upper : filter.slidermax)],
							connect: true,
							step: 1,
							behaviour: 'tap-extend',
							range: {
											'min': Number(filter.slidermin),
											'max': Number(filter.slidermax)
							},

							serialization: {
									lower: [
											$.Link({
													target: clone_template_slidercontainer.find(".class_filter_" + filter.name + "_lower-val"),
													}),
											$.Link({
													target: clone_template_slidercontainer.find("#filter_" + filter.name + "_lower"),
													})
									],

									upper: [
											$.Link({
													target: clone_template_slidercontainer.find(".class_filter_" + filter.name + "_upper-val"),
													}),
											$.Link({
													target: clone_template_slidercontainer.find("#filter_" + filter.name + "_upper"),
													})
									],



									format: {
											decimals: 0
									}

							}

						});

					}


					$("#filters-container").append(clone_template_slidercontainer);




				}else if (filter.type == 'checkbox' || filter.type == 'radio'){ //old type was 'listview'

					var temp_restoreValObj = (restoreFilterData) ? (restoreFilterData[filter.serializename.replace(/\./g, "^")] || {}) : {};
					if(temp_restoreValObj.filtertype != 'checkbox' && temp_restoreValObj.filtertype != 'radio'){
						temp_restoreValObj.filtertype = 'checkbox';
					}
					temp_restoreVal = temp_restoreValObj.values || [];

					var clone_template_listviewcontainer = $("#template_listviewcontainer").find(".filterparentDOM").clone();
					clone_template_listviewcontainer.find(".filtercontainer").attr("id", "filter_" + filter.name);
					clone_template_listviewcontainer.find(".filtercontainer").attr("name", filter.name);
					clone_template_listviewcontainer.find(".filtercontainer").attr("serializename", filter.serializename);
					clone_template_listviewcontainer.find(".filtercontainer").attr("default-filtertype", filter.type);
					clone_template_listviewcontainer.find(".filtercontainer").attr("filtertype", temp_restoreValObj.filtertype || "checkbox");
					clone_template_listviewcontainer.find(".filtercontainer").attr("title", filter.title);
					clone_template_listviewcontainer.find(".filtercaption").html(filter.title);
					clone_template_listviewcontainer.find(".filtersettings").attr("id", "filter_" + filter.name + "_settings");

					clone_template_listviewcontainer.find(".multiselect .filternonealldiv input").attr("name", filter.serializename);
					clone_template_listviewcontainer.find(".multiselect .filternonealldiv input").addClass("cb" + filter.name + "noneselected");

					clone_template_listviewcontainer.find(".fvalsearch").remove();
					clone_template_listviewcontainer.find(".searchcheckall").remove();
					clone_template_listviewcontainer.find(".removefitems").remove();

					filter.listKeys = {};
					for (var j in filter.listvalues){
						var filteritem = filter.listvalues[j];

						filter.listKeys[filteritem.code] = filteritem.item;
						var clone_template_listviewitem_container = $("#template_listviewitem_container").find(".filterlistitem").clone();

						clone_template_listviewitem_container.find("input").attr("name", filter.serializename);

						if(temp_restoreVal.length > 0){
							var itemOptExist = (temp_restoreVal.indexOf(filteritem.code) > -1);
							if(itemOptExist){
								//clone_template_listviewitem_container.find("input").attr("checked", true);
							}else{
								clone_template_listviewitem_container.find("input").attr("checked", false);
							}
						}

						clone_template_listviewitem_container.find("input").attr("value", filteritem.code);
						clone_template_listviewitem_container.find("input").attr("type", temp_restoreValObj.filtertype || "checkbox");
						clone_template_listviewitem_container.find("input").addClass("cb" + filter.name);
						clone_template_listviewitem_container.find("input").next().html(filteritem.item);

						clone_template_listviewcontainer.find(".multiselect").append(clone_template_listviewitem_container);
					}

					if(temp_restoreValObj.filtertype == 'checkbox'){

						var filtercontainerelem = clone_template_listviewcontainer.find(".filtercontainer");

						if(temp_restoreVal.length > 0){
							if(temp_restoreVal.length == 1 && temp_restoreVal[0] != ""){
								filtercontainerelem.find( "input.cb" + filter.name + ":checkbox:checked" ).toggleClass( 'filterserialize', true);
								filtercontainerelem.find( "input.cb" + filter.name + ":checkbox:not(:checked)" ).toggleClass( 'filterserialize', false );
							}else if(temp_restoreVal.length == 1 && temp_restoreVal[0] == ""){
								filtercontainerelem.find( ".cb" + filter.name + "noneselected" ).toggleClass( 'filterserialize', true);
							}
						}

					}else if(temp_restoreValObj.filtertype == 'radio'){

						var filtercontainerelem = clone_template_listviewcontainer.find(".filtercontainer");

						var hiddendivelem = filtercontainerelem.find(".filternonealldiv");

						filtercontainerelem.attr('filtertype','radio');
						filtercontainerelem.find(":input").attr('type', 'radio');
						filtercontainerelem.find(":input").prop('checked',false);
						filtercontainerelem.find('label').css('padding-left','0px');
						hiddendivelem.toggleClass('hidden', false);
						hiddendivelem.find(":input").prop('checked',false);

						if(temp_restoreVal.length > 0){
							if(temp_restoreVal.length == 1 && temp_restoreVal[0] != ""){
								filtercontainerelem.find("[value='" + temp_restoreVal[0] + "']").prop('checked',true);
								filtercontainerelem.find("[value='" + temp_restoreVal[0] + "']").addClass('filterserialize');
							}else{
								hiddendivelem.find(":input").prop('checked',true);
							}
						}else{
							hiddendivelem.find(":input").prop('checked',true);
						}

					}



					clone_template_listviewcontainer.find(".cb" + filter.name).change(function(event) {
							var tempfiltertype = $(this).closest('.filtercontainer').attr('filtertype');
							var tempfiltername = $(this).closest('.filtercontainer').attr('name');

							if( tempfiltertype == 'checkbox' ) {

									$(this).closest('.filtercontainer').find( ".cb" + tempfiltername + "noneselected" ).toggleClass( 'filterserialize', false);

									if ( ($(this).closest('.filtercontainer').find("input.cb" + tempfiltername + ":checkbox:not(:checked)").length) == 0) { //number of unchecked boxes
												$(this).closest('.filtercontainer').find( ".cb" + tempfiltername ).toggleClass( 'filterserialize', false ); //Dont set filterserialize when all boxes checked
									}else{
												if ($(this).closest('.filtercontainer').find("input.cb" + tempfiltername).length == $(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":checkbox:not(:checked)" ).length ){
															$(this).closest('.filtercontainer').find( ".cb" + tempfiltername + "noneselected" ).toggleClass( 'filterserialize', true);
															$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername ).toggleClass( 'filterserialize', false);
												}else{
															$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":checkbox:checked" ).toggleClass( 'filterserialize', true);
															$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":checkbox:not(:checked)" ).toggleClass( 'filterserialize', false );
												}
									}

							} else if( tempfiltertype == 'radio' ) {
									$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername ).toggleClass( 'filterserialize', false);
									$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":radio:checked" ).toggleClass( 'filterserialize', true);
							}

							updateAllCharts();
					});



					clone_template_listviewcontainer.find(".cb" + filter.name + "noneselected").change(function(event) {
							var tempfiltername = $(this).closest('.filtercontainer').attr('name');
							$(this).closest('.filtercontainer').find("input.cb" + tempfiltername).toggleClass( 'filterserialize', false);
							updateAllCharts();
					});


					$("#filters-container").append(clone_template_listviewcontainer);



				}else if (filter.type == 'searchlist'){ //---------------------------------------------

					var temp_restoreValObj = (restoreFilterData) ? (restoreFilterData[filter.serializename.replace(/\./g, "^")] || {}) : {};
					if(temp_restoreValObj.filtertype != 'checkbox'){
						temp_restoreValObj.filtertype = 'checkbox';
					}
					temp_restoreVal = temp_restoreValObj.values || [];


					var clone_template_listviewcontainer = $("#template_listviewcontainer").find(".filterparentDOM").clone();
					clone_template_listviewcontainer.find(".filtercontainer").attr("id", "filter_" + filter.name);
					clone_template_listviewcontainer.find(".filtercontainer").attr("name", filter.name);
					clone_template_listviewcontainer.find(".filtercontainer").attr("serializename", filter.serializename);
					clone_template_listviewcontainer.find(".filtercontainer").attr("default-filtertype", filter.type);
					clone_template_listviewcontainer.find(".filtercontainer").attr("filtertype", "checkbox");
					clone_template_listviewcontainer.find(".filtercontainer").attr("title", filter.title);
					clone_template_listviewcontainer.find(".filtercaption").html(filter.title);
					clone_template_listviewcontainer.find(".filtersettings").attr("id", "filter_" + filter.name + "_settings");

					clone_template_listviewcontainer.find(".multiselect .filternonealldiv input").attr("name", filter.serializename);
					clone_template_listviewcontainer.find(".multiselect .filternonealldiv input").addClass("cb" + filter.name + "noneselected");

					clone_template_listviewcontainer.find(".fvalsearch").removeClass("hidden");
					clone_template_listviewcontainer.find(".searchcheckall").removeClass("hidden");
					clone_template_listviewcontainer.find(".suggest-dropdown-search").attr("data-url", filter.lookup);
					clone_template_listviewcontainer.find(".suggest-dropdown-search").attr("data-transport", filter.lookup_data_transport || "GET");


					clone_template_listviewcontainer.find(".suggest-dropdown-search").suggestDropDown(
						function (iStr, callback_filter){
							//console.log(iStr);

							$("#filter_" + callback_filter.name).find(".fvalsearch input").val("");
							var filteritem = {code: iStr.npi || iStr.name || iStr.tc, item: (iStr.name || iStr.tn).replace("^"," ")}; //changed code from iStr.npi to iStr.name

							if( $("#filter_" + callback_filter.name).find(":input[value='" + filteritem.code + "']").length > 0 ) return;

							var clone_template_listviewitem_container = $("#template_listviewitem_container").find(".filterlistitem").clone();

							clone_template_listviewitem_container.find("input").attr("name", callback_filter.serialize);
							clone_template_listviewitem_container.find("input").attr("checked", true);
							clone_template_listviewitem_container.find("input").attr("data-list-type", "search");

							clone_template_listviewitem_container.find("input").attr("value", filteritem.code);
							clone_template_listviewitem_container.find("input").attr("type", "checkbox");
							clone_template_listviewitem_container.find("input").addClass("cb" + callback_filter.name);
							clone_template_listviewitem_container.find("input").addClass("filterserialize");
							clone_template_listviewitem_container.find("input").next().html(filteritem.item);


							$("#filter_" + callback_filter.name + " .multiselect").find(".searchcheckall").addClass("hidden");
							$("#filter_" + callback_filter.name + " .multiselect").append(clone_template_listviewitem_container);

							clone_template_listviewitem_container.find(".cb" + callback_filter.name).change(function(event) {
									var tempfiltertype = $(this).closest('.filtercontainer').attr('filtertype');
									var tempfiltername = $(this).closest('.filtercontainer').attr('name');

									$(this).toggleClass( 'filterserialize', $(this).is(':checked') );
									updateAllCharts();
							});

							updateAllCharts();

						},
						function (option, searchText){
							var html = option.text.substring(0, searchText.length) + '<b>' + option.text.substring(searchText.length) + '</b>';
							return(html);
						},
						{name: filter.name, serialize: filter.serializename}  //$("#filter_" + filter.name)
					);


					$("#filters-container").append(clone_template_listviewcontainer);

					for(var itemIndex in temp_restoreVal){

							iStr = {npi: temp_restoreVal[itemIndex].val, name: temp_restoreVal[itemIndex].title};
							callback_filter = {name: filter.name, serialize: filter.serializename};

							$("#filter_" + callback_filter.name).find(".fvalsearch input").val("");
							var filteritem = {code: iStr.name || iStr.tc, item: (iStr.name || iStr.tn).replace("^"," ")}; //changed code from iStr.npi to iStr.name

							if( $("#filter_" + callback_filter.name).find(":input[value='" + filteritem.code + "']").length > 0 ) return;

							var clone_template_listviewitem_container = $("#template_listviewitem_container").find(".filterlistitem").clone();

							clone_template_listviewitem_container.find("input").attr("name", callback_filter.serialize);
							clone_template_listviewitem_container.find("input").attr("checked", true);
							clone_template_listviewitem_container.find("input").attr("data-list-type", "search");

							clone_template_listviewitem_container.find("input").attr("value", filteritem.code);
							clone_template_listviewitem_container.find("input").attr("type", "checkbox");
							clone_template_listviewitem_container.find("input").addClass("cb" + callback_filter.name);
							clone_template_listviewitem_container.find("input").addClass("filterserialize");
							clone_template_listviewitem_container.find("input").next().html(filteritem.item);


							$("#filter_" + callback_filter.name + " .multiselect").find(".searchcheckall").addClass("hidden");
							$("#filter_" + callback_filter.name + " .multiselect").append(clone_template_listviewitem_container);

							clone_template_listviewitem_container.find(".cb" + callback_filter.name).change(function(event) {
									var tempfiltertype = $(this).closest('.filtercontainer').attr('filtertype');
									var tempfiltername = $(this).closest('.filtercontainer').attr('name');

									$(this).toggleClass( 'filterserialize', $(this).is(':checked') );
									updateAllCharts();
							});

					}

					var qSearchFieldWidth = clone_template_listviewcontainer.find("input[name='q']").outerWidth();
					clone_template_listviewcontainer.find("#aucparent").width( qSearchFieldWidth );
					clone_template_listviewcontainer.find("#srchoptionsparent").width( qSearchFieldWidth );

				}

			}
			
		} //End Initialize and render Filter OLAP elements


		//PROD
		$('.class_filter_slider').on({
				set: function(){
					var temp_filtercontainer = $(this).closest(".filtercontainer");
					var filterinfo = temp_filtercontainer.data("filterinfo");
					if(temp_filtercontainer.find(".lowerinput").val() == filterinfo.slidermin && temp_filtercontainer.find(".upperinput").val() == filterinfo.slidermax){
						temp_filtercontainer.find("input").removeClass("filterserialize");
					}else{
						temp_filtercontainer.find("input").addClass("filterserialize");
					}
					
					//var tempFilterValArray = temp_filtercontainer.find(".slidercontainer").val();
					//temp_filtercontainer.data("currentSliderValues", {min: tempFilterValArray[0], max: tempFilterValArray[1]});	

					updateAllCharts();
				}
		});


	}

	renderFilters(filtersJSON, restoreFilterData);


	//gTabData = JSON.parse(gTabData_string);


	if(gTabData.vizData && gTabData.vizData.length > 0){

		for(var vizItemIndex in gTabData.vizData){

			var tempYSeriesJSON = {};
			for (var yseriesIndex in gTabData.vizData[vizItemIndex].val.yseries){
				tempYSeriesJSON[gTabData.vizData[vizItemIndex].val.yseries[yseriesIndex].id] = gTabData.vizData[vizItemIndex].val.yseries[yseriesIndex];
			}
			gTabData.vizData[vizItemIndex].val.yseries = tempYSeriesJSON;

			addVizChartExisting(gTabData.vizData[vizItemIndex]);
		}

		$("#message-emptyDashboardTab").addClass("hidden");
		$("#message-zeroDashboardTab").remove();
		$("#footer").remove();

		if(gDeviceSize != "xs") {
			calculateChartBoxes();
		}else{
			$("#dashboard-chartarea").removeClass("class-dashboardchartarea");
			$("body").css("overflow-y","auto");
		}
		updateAllCharts();
	}else{
		if(requestedTabIndex == -1){
			$("#message-zeroDashboardTab").removeClass("hidden");
		}else{
			$("#message-emptyDashboardTab").removeClass("hidden");
		}

	}



	$("#btnsharecreatecopy").click(function() {
			$.ajax({
				type: "POST",
				url: "/analytics/share/dashview/createcopy/",
				data: {tabID: gTabID},

				success: function(msg){

					if(msg.result=="SUCCESS"){
						window.location.href = '/analytics/?tabID=' + msg.id;
					}else{

					}

				},

				error: function(){
					alert("Unable to connect to server or request timed out.");
				}

			});
	});


	$("#btnshareusers").click(function() {
		var usersArray = [];
		var usersEmailList = "";
		var accessType = "View only";

		if($("#share-chk-access").is(':checked') == true) accessType = "View and Copy";

		$(".userlist ul li").each(function( index ) {
			$(this).data("data-share").status = accessType;
			usersArray.push($(this).data("data-share"));
			usersEmailList = usersEmailList + $(this).data("data-share").email + ",";
		});

		if(usersArray.length > 0){
			$.ajax({
				type: "POST",
				url: "/analytics/share/invite",
				data: {tabID: gTabID, dashName: gTabMasterData.title, users: usersArray, usersEmailList: usersEmailList, accesstype: $("#share-chk-access").is(':checked'), email: $("#share-chk-email").is(':checked')},

				success: function(msg){

					if(msg=="SUCCESS"){
						inviteMessage("Sent sharing invite");

						for(userIndex in usersArray){
							shareItem = usersArray[userIndex];
							var shareTR = $('<tr />', {html: '<div class="col-md-8" style="padding: 10px;">' + shareItem.fname + " " + shareItem.lname + '</div>' + '<div class="col-md-4" style="padding: 10px;"><span class="shareaccess">' + shareItem.status + '</span><span style="float:right;cursor:pointer;padding:3px 10px 0px 10px" class="filtersettings dropdown"><a href="javascript:void(0);" data-toggle="dropdown" class="dropdown-toggle"><i class="fa fa-ellipsis-v fa-fw"></i></a><ul role="menu" style="right: 0; left: auto;" class="dropdown-menu scrollable-dropdownmenu"><li role="presentation" class="dropdown-header">Access</li><li><a data-opt="View only" href="javascript:void(0);" class="shareopt"> <i class="fa fa-eye"></i> &nbsp; View only</a></li><li> <a data-opt="View and Copy" href="javascript:void(0);" class="shareopt"> <i class="fa fa-clipboard"></i> &nbsp; View and Copy</a></li><li> <a data-opt="Stop Sharing" href="javascript:void(0);" class="shareopt"> <i class="fa fa-ban"></i> &nbsp; Stop Sharing</a></li></ul></span>' + '</div>', style: 'border-bottom: 1px solid gray;'});
							shareTR.data("data-share", shareItem);
							$("#tableSharedWithUsers tbody").append(shareTR);
						}
					}else{
						inviteMessage("Error sending invite");
					}

				},

				error: function(){
					alert("Unable to connect to server or request timed out.");
				}

			});
		}

		$(".userlist ul").empty();
	});


	$("#suggest-dropdown-searchuser").suggestDropDown(callbackSelectUser, callbackHTMLgenUser);

	function callbackHTMLgenUser(option, searchText){

		//STUPID GOT TO FIX in OUTER LOOP!!!!
		var qSearchFieldWidth = $("#suggest-dropdown-searchuser").find("input[name='q']").outerWidth();
		$("#suggest-dropdown-searchuser").find("#aucparent").width( qSearchFieldWidth );
		$("#suggest-dropdown-searchuser").find("#srchoptionsparent").width( qSearchFieldWidth );

		option.payload = option.local;
		var html = option.local.fname + " " + option.local.lname + " (" + option.local.email + ")";
		return(html);
	}

	function inviteMessage(msg){
		$("#invitemessage").removeClass("hidden");
		$("#invitemessage").html(msg);
		setTimeout(function(){
			$("#invitemessage").addClass("hidden");
		}, 2000);
	}


	function callbackSelectUser(iStr){
		if(gTabSharesUsersList[iStr.uid] == true){
			inviteMessage("User already added or shared");
		}else{
			var userpill = $('<li />', {html: '<a href="#" class="shareuserpill-a"><span>' + iStr.fname + " " + iStr.lname + '</span><span class="badge delete">X</span></a>' , class: "active"});
			userpill.data("data-share", iStr);
			$("#invite .userlist ul").append(userpill);
			gTabSharesUsersList[iStr.uid] = true;
		}
	}

	for(var shareIndex in gTabShares){
		shareItem = gTabShares[shareIndex];
		gTabSharesUsersList[shareItem.uid] = true;
		var shareTR = $('<tr />', {html: '<div class="col-md-8" style="padding: 10px;">' + shareItem.fname + " " + shareItem.lname + '</div>' + '<div class="col-md-4" style="padding: 10px;"><span class="shareaccess">' + shareItem.status + '</span><span style="float:right;cursor:pointer;padding:3px 10px 0px 10px" class="filtersettings dropdown"><a href="javascript:void(0);" data-toggle="dropdown" class="dropdown-toggle"><i class="fa fa-ellipsis-v fa-fw"></i></a><ul role="menu" style="right: 0; left: auto;" class="dropdown-menu scrollable-dropdownmenu"><li role="presentation" class="dropdown-header">Access</li><li><a data-opt="View only" href="javascript:void(0);" class="shareopt"> <i class="fa fa-eye"></i> &nbsp; View only</a></li><li> <a data-opt="View and Copy" href="javascript:void(0);" class="shareopt"> <i class="fa fa-clipboard"></i> &nbsp; View and Copy</a></li><li> <a data-opt="Stop Sharing" href="javascript:void(0);" class="shareopt"> <i class="fa fa-ban"></i> &nbsp; Stop Sharing</a></li></ul></span>' + '</div>', style: 'border-bottom: 1px solid gray;'});
		shareTR.data("data-share", shareItem);
		$("#tableSharedWithUsers tbody").append(shareTR);
	}

	$(".userlist").on( "click", "ul li .delete", function() {
		delete gTabSharesUsersList[$(this).closest("li").data("data-share").uid];
		$(this).closest("li").remove();
	});

	$("#tableSharedWithUsers").on( "click", "tr .shareopt", function() {

		var myThis = this;
		$(myThis).closest("tr").data("data-share").status = $(myThis).data("opt");

			var usersArray = [];
			$("#tableSharedWithUsers tr").each(function( index ) {
				if($(this).data("data-share").status != "Stop Sharing"){
					usersArray.push($(this).data("data-share"));
				}
			});

			$.ajax({
				type: "POST",
				url: "/analytics/share/updateaccess",
				data: {tabID: gTabID, users: usersArray},

				success: function(msg){

					if(msg=="SUCCESS"){
						inviteMessage("Access Updated");
						$(myThis).closest("tr").find(".shareaccess").html($(myThis).data("opt"));
					}else{
						inviteMessage("Error updating");
					}

				},

				error: function(){
					alert("Unable to connect to server or request timed out.");
				}

			});

	});


	//remove all searched/listed filter items from the filter dimension box.
	$(".filterparentDOM").on( "click", ".removefitems", function() {
		$(this).closest('.filterparentDOM').find('.multiselect .filterlistitem').remove();
		$(this).closest('.filterparentDOM').find('.searchcheckall').removeClass("hidden");
		updateAllCharts();
	});


	$( "body" ).on( "mouseenter", ".daregion", function() {
		  $(".daregion").removeClass("dropzone");
		  $(".daregion").css("background-color","");
		  $(this).addClass("dropzone");
		  $(this).css("background-color","darkgray");
		  var dropzone = $(this).attr("data-region");
		  gDroppableHoverRegion = dropzone;
		  gDroppableHoverRegion_CDR_ElemID = $(this).closest(".chartbox").attr("id");
	});

	$( "body" ).on( "mousemove", ".daregion", function() {
		  $(this).addClass("dropzone");
		  $(this).css("background-color","gray");
		  var dropzone = $(this).attr("data-region");
		  gDroppableHoverRegion = dropzone;
	});

	$( "body" ).on( "mouseleave", ".daregion", function() {
		  //$(this).removeClass("dropzone");
		  $(this).css("background-color","");
	});



	//PROD
	//$(".chartbox").resizable({ containment: "#dashboard-chartarea"});
	$( "#dashboard-chartareazzzap" ).sortable({
		distance: 3,
		containment: "parent", //"#dashboard-chartarea",
		items: ".chartbox",
		helper: 'clone',
		tolerance: "pointer" ,
		start: function(event, ui) {
			ui.item.show().addClass('original-placeholder');
			ui.item.css("opacity", "0.4");
			ui.item.children(".chartboxpanel").css('border-color', '');
			ui.item.children(".chartboxpanel").toggleClass("panel-on-drag");
		},
		stop: function(event, ui) {

			ui.item.show();
			ui.item.css("opacity", "1");
			ui.item.children(".chartboxpanel").animate({
						borderLeftColor: "#ddd",
						borderTopColor: "#ddd",
						borderRightColor: "#ddd",
						borderBottomColor: "#ddd",
			}, 500);

			ui.item.children(".chartboxpanel").toggleClass("panel-on-drag");

		}
	});

	//$( "#dashboard-chartarea" ).disableSelection();


	$( "#filters-container" ).sortable({
		containment: "parent",
		distance: 3,
		tolerance: "pointer" ,
		handle: ".h6",
		//cancel: ".filtersettings,.1multiselect,.1slidercontainer,input",

						start: function(event, ui) {
							ui.item.children(".filtercontainer").css('border-color', '');
							ui.item.children(".filtercontainer").toggleClass("filter-on-drag");
						},
						stop: function(event, ui) {

							ui.item.children(".filtercontainer").animate({
										borderLeftColor: "#ddd",
										borderTopColor: "#ddd",
										borderRightColor: "#ddd",
										borderBottomColor: "#ddd",
							}, 500);

							ui.item.children(".filtercontainer").toggleClass("filter-on-drag");

						}
	});


	$(".resetfilters").on('click', function(event) {
		$('#filters-search-text').val("");
		$('.class_filter_slider').off();
		$('#filters-container').empty();
		renderFilters(filtersJSON, null);
		$('.filterparentDOM').show();
		updateAllCharts();
	});


	$(".sortfilters").on('click', function(event) {
		var mylist = $('#filters-container');
		var listitems = mylist.children('.filterparentDOM').get();
		listitems.sort(function(a, b) {
		   var compA = $(a).find(".filtercontainer").attr("title").toUpperCase();
		   var compB = $(b).find(".filtercontainer").attr("title").toUpperCase();
		   return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
		})
		$.each(listitems, function(idx, itm) { mylist.append(itm); });
	});

	$('#filters-search-text').bind('input',function(){
		var searchparam = $(this).val().toLowerCase();

		$( ".filtercontainer" ).map(function() {
						if( $(this).attr('title').toLowerCase().indexOf(searchparam) >=0){
								$(this).parent().show(); //.css({"display":"initial"});
						}else{
								$(this).parent().hide(); //.css({"display":"none"});
						}
		});
	});


	$('#vizfield-dimension-search-text').bind('input',function(){
		var searchparam = $(this).val().toLowerCase();

		$("#addvizfield_popover li.d").map(function() {
				var dimension_properties = $(this).data("property");

				if( dimension_properties.title.toLowerCase().indexOf(searchparam) >=0){
						$(this).show();
				}else{
						$(this).hide();
				}
		});
	});	

	$('#base-dimension-search-text').bind('input',function(){
		var searchparam = $(this).val().toLowerCase();

		$("#vizbaseseries_popover li.d").map(function() {
				var dimension_properties = $(this).data("property");

				if( dimension_properties.title.toLowerCase().indexOf(searchparam) >=0){
						$(this).show();
				}else{
						$(this).hide();
				}
		});
	});	


	$("#dashboard-chartarea").on("mouseover", ".mapinfobtn", function (event) {
		var invoked_chartID = $(this).closest(".chartbox").attr("id");
		$("#mapinfohover" + invoked_chartID).removeClass("hidden");
	});

	$("#dashboard-chartarea").on("mouseleave", ".mapinfohover", function (event) {
		var invoked_chartID = $(this).closest(".chartbox").attr("id");
		$("#mapinfohover" + invoked_chartID).addClass("hidden");
	});


	//PROD - This will remove the chart-box from the dashboard

	$("#dashboard-chartarea").on('click', '.chartboxclose', function () {
		var id_deletedElem = $(this).closest(".chartbox").attr("id");
		var delElem = $(this).closest(".chartbox"); //$("#" + id_deletedElem);
		var hasBottomElem = (delElem.data("bottom") || delElem.data("top"));
		var delElem_pairElem_ID = delElem.data("bottom") || delElem.data("top");
		var height_deletedElem = $(this).closest(".chartbox").outerHeight();
		var width_deletedElem = $(this).closest(".chartbox").outerWidth();
		var top_deletedElem = $(this).closest(".chartbox").position().top;

		var invoked_chartID = $(this).closest(".chartbox").attr("id");
		delete verioChartObj[invoked_chartID];
		$($(this)).closest(".chartbox").remove();
		if($("#dashboard-chartarea .chartbox").length == 0){
			$("#message-emptyDashboardTab").removeClass("hidden");
		}

 		var rowRef_deletedElem = gItemRowReference[id_deletedElem];

		if(hasBottomElem){
			$("#" + delElem_pairElem_ID).css("top", Math.min(top_deletedElem, $("#" + delElem_pairElem_ID).position().top));
			$("#" + delElem_pairElem_ID).css("height", $("#" + delElem_pairElem_ID).outerHeight() + height_deletedElem);
		}else{

			if(Object.keys(gRowsArray[rowRef_deletedElem]).length > 1){ //there were more than one element in this row so expand elems in this row to fit width

				$.each(gRowsArray[rowRef_deletedElem], function(chartID_Index, item){
					if(chartID_Index == id_deletedElem){
						var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
						var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
						if(item.n == null && item.p != null){
							$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

							if($("#" + item.p).data("bottom")){
								var bottomID = $("#" + item.p).data("bottom");
								$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
							}
						}else if(item.p == null && item.n != null){
							$("#" + item.n).css("left", leftBound);
							$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

							if($("#" + item.n).data("bottom")){
								var bottomID = $("#" + item.n).data("bottom");
								$("#" + bottomID).css("left", leftBound);
								$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
							}
						}else  if(item.p != null && item.n != null){
							$("#" + item.n).css("left", leftBound);
							$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

							if($("#" + item.n).data("bottom")){
								var bottomID = $("#" + item.n).data("bottom");
								$("#" + bottomID).css("left", leftBound);
								$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
							}
						}
					}
				});

			}else{ //there are no more element in this row (after delete) so expand elems in other row to fit height
				if(rowRef_deletedElem == 0){
					if(gRowsArray.length >= 2){
						$.each(gRowsArray[1], function(chartID_Index, item){
							$("#" + chartID_Index).css("top", 0);
							$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_deletedElem);

							if($("#" + chartID_Index).data("bottom")){
								var bottomElemID = $("#" + chartID_Index).data("bottom");
								$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
								$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
								$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
								$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
							}
						});
					}
				}else{
					$.each(gRowsArray[rowRef_deletedElem-1], function(chartID_Index, item){
						//$("#" + chartID_Index).css("top", top_deletedElem);
						$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_deletedElem);

						if($("#" + chartID_Index).data("bottom")){
							var bottomElemID = $("#" + chartID_Index).data("bottom");
							$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
							$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
							$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
							$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
						}
					});
				}
			}

		}


		$("body").redrawAllVCCharts();
		calculateChartBoxes();
		$( "#dashboard-chartarea .chartbox" ).each(function( index ) {
			chartboxResize( $(this) );
		});

	});

	$("#dashboard-chartarea").on('click', '.chartboxcopy', function (e) {

		var invoked_chartID = $(this).closest(".chartbox").attr("id");

		if(verioChartObj[invoked_chartID].properties.charttype == "map"){
				
				
		}else{
				$("#" + invoked_chartID + " svg").attr("style", "font-family: sans-serif;font-size: 12px;"); //hack 1
				$("#" + invoked_chartID + " svg .nv-group").css("fill-opacity", "1"); //hack 2
				
				//saveSvgAsPng(document.getElementById("svg-" + invoked_chartID), "diagram.png");
				svgAsPngUri(document.getElementById(invoked_chartID).getElementsByTagName("svg")[0], {backgroundColor:"white", scale: 1, encoderOptions: 1}, function(pngData) {
								$("#exportimagepng").attr("src", pngData);
								$("#exportimagepng").attr("download", "testtt");
								var modalWidth = $("#" + invoked_chartID + " svg").outerWidth();
								$('#modal-exportimage .modal-dialog').width(Math.max(modalWidth + 40, 400));
								$('#modal-exportimage').modal('show');
				});			
		}
		
	});		


	/*
	$("#dashboard-chartarea").on('click', '.chartboxcopy_not_in_use', function (e) {

		var invoked_chartID = $(this).closest(".chartbox").attr("id");

		
		$("#" + invoked_chartID + " svg").attr("style", "font-family: sans-serif;font-size: 12px;"); //hack 1
		$("#" + invoked_chartID + " svg .nv-group").css("fill-opacity", "1"); //hack 2
		
		var svg = document.querySelector("#" + invoked_chartID + " svg");
		var svgData = new XMLSerializer().serializeToString( svg );

		var canvas = document.createElement( "canvas" );
		var svgSize = svg.getBoundingClientRect();
		canvas.width = svgSize.width;
		canvas.height = svgSize.height;							
		var ctx = canvas.getContext( "2d" );

		var img = document.createElement( "img" );

		img.setAttribute( "src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) );
		$("#" + invoked_chartID + " svg").attr("style", ""); //unhack 1
		$("#" + invoked_chartID + " svg .nv-group").css("fill-opacity", "0.75"); //unhack 2

		img.onload = function() {
				ctx.drawImage( img, 0, 0 );
				var pngData = canvas.toDataURL("image/png");
				//console.log(pngData);

				//var invoked_chartID = $(this).closest(".chartbox").attr("id");
				//$("#exportimagepng").data("id", invoked_chartID);
				$("#exportimagepng").attr("src", pngData);
				var modalWidth = $("#exportimagepng").outerWidth();
				$('#modal-exportimage .modal-dialog').width(Math.max(canvas.width + 40, 400));
				$('#modal-exportimage').modal('show');

				//event.clipboardData.setData("image/png", canvas.toDataURL( "image/png" ));
				//event.preventDefault();		
				img = null;
				delete canvas;
		};
		
	});
*/

	$("#dashboard-chartarea").on('click', '.chartboxfullscreen', function () {

		var invoked_chartID = $(this).closest(".chartbox").attr("id");

		$('#' + invoked_chartID).draggable( "option", "handle", "zzz" ); //('disable');

		$(this).closest(".chartbox").find(".mychart").addClass("charttofullscreen");
		$("#dashboard-chartarea").css("position","absolute");
		$(this).closest(".chartbox").find(".mychart .minfullscreen").removeClass("hidden");

		$(this).updateVCChartRender(verioChartObj[invoked_chartID].properties.charttype, verioChartObj[invoked_chartID].pluginclass);

		$(document).bind( "keyup", function(e) {
			if (e.keyCode == 27) {
				var container = $('#' + invoked_chartID);
				container.find(".minfullscreen").click();
				//$('#' + invoked_chartID).draggable('enable');
				$('#' + invoked_chartID).draggable( "option", "handle", "" );
				$(document).unbind( "keyup" );
			}
		});

	});

	$("#dashboard-chartarea").on('click', '.minfullscreen', function () {

		$(document).unbind( "keyup" );
		var invoked_chartID = $(this).closest(".chartbox").attr("id");

		//$('#' + invoked_chartID).draggable('enable');
		$('#' + invoked_chartID).draggable( "option", "handle", "" );
		$("#" + invoked_chartID).find(".mychart").removeClass("charttofullscreen");
		$("#dashboard-chartarea").css("position","fixed");
		$("#" + invoked_chartID).find(".mychart .minfullscreen").addClass("hidden");

		$(this).updateVCChartRender(verioChartObj[invoked_chartID].properties.charttype, verioChartObj[invoked_chartID].pluginclass);

	});

		$("#dashboard-chartarea").on('click', '.chartboxedittextarea', function () {

		var invoked_chartID = $(this).closest(".chartbox").attr("id");

		$("#" + invoked_chartID + " .mce-tinymce").remove();
		verioChartObj[invoked_chartID].pluginclass = $("#dashboard-chartarea #" + invoked_chartID).createVCChart({ charttype: "textarea", reinit: true });

		//tinymce
		$("#" + invoked_chartID).find(".nv-template-header").addClass("hidden");
		$("#" + invoked_chartID).find("div.mce-toolbar-grp").show();
		$("#" + invoked_chartID).find(".nv-panel-body").removeClass("hidden");
		
		$("#" + invoked_chartID).find(".mce-tinymce").show();

		//var tinymce_id = $("#" + invoked_chartID + " .mce-tinymce").attr("id");

		//tinymce.EditorManager.execCommand('mceRemoveEditor',true, tinymce_id);
		//tinymce.EditorManager.execCommand('mceAddEditor',true, tinymce_id);

		//decodedHTMLData = decodeURIComponent(verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults.htmldata);
		//tinyMCE.get(tinymce_id).setContent($("#" + invoked_chartID + " .htmleditorbody").html()); //(decodedHTMLData); //

		$(this).updateVCChartRender(verioChartObj[invoked_chartID].properties.charttype, verioChartObj[invoked_chartID].pluginclass);

	});
	
	
	$("#dashboard-chartarea").on('click', '.chartboxoptions', function () {

		var invoked_chartID = $(this).closest(".chartbox").attr("id");

		d3.selectAll("#dashboard-chartarea #" + invoked_chartID + " .vmed-label-values").remove(); //removes all the values on the bar elements
		d3.selectAll("#dashboard-chartarea #" + invoked_chartID + " .vmed-label-markers").remove();
		
		verioChartObj[invoked_chartID].properties.chartoptions.xaxis = !(verioChartObj[invoked_chartID].properties.chartoptions.xaxis);
		verioChartObj[invoked_chartID].properties.chartoptions.yaxis = !(verioChartObj[invoked_chartID].properties.chartoptions.yaxis);
		verioChartObj[invoked_chartID].properties.chartoptions.legend = !(verioChartObj[invoked_chartID].properties.chartoptions.legend);

		$($(this)).closest(".chartbox").find(".baseseries").toggleClass("hidden", !verioChartObj[invoked_chartID].properties.chartoptions.xaxis); //true value means visible
		$($(this)).closest(".chartbox").find(".dimensionseries").toggleClass("hidden", !verioChartObj[invoked_chartID].properties.chartoptions.yaxis); //true value means visible
		$($(this)).closest(".chartbox").find(".nv-legend").css("visibility", (verioChartObj[invoked_chartID].properties.chartoptions.legend) ? "visible" : "hidden");
		$($(this)).closest(".chartbox").find(".mychart").toggleClass("nvd3-nolegend", !verioChartObj[invoked_chartID].properties.chartoptions.yaxis); //true value means visible

		$(this).updateVCChartRender(verioChartObj[invoked_chartID].properties.charttype, verioChartObj[invoked_chartID].pluginclass);
		//verioChartObj[invoked_chartID].pluginclass.update();

	});


	$("#dashboard-chartarea").on('click', '.dimensionseries .btnset1', function () {
		$(this).closest(".chartbox").find(".chartboxsettings").click();
		var seriesindex = $(this).attr("seriesindex");
		$('#modal-vizsettings').find("#" + seriesindex).trigger("click");
	});


	
	$("#btnExportHIPAAExportData").click(function (e) {
		var invoked_chartID = $(this).data("id");

		var tsvData = "";
		var chartData = verioChartObj[invoked_chartID].pluginclass.data;
		var chartFields = verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults.tablefields || [];

		for(fieldIndex in chartFields){
			var getFieldName = gFilters[chartFields[fieldIndex].id].title;
			tsvData += getFieldName + "\t";
		}
		tsvData += "\n";

		for(dataIndex in chartData.hits){
			var rowData = chartData.hits[dataIndex]._source;
			for(fieldIndex in chartFields){
				var fieldValue = rowData[chartFields[fieldIndex].id];
				if(gFilters[chartFields[fieldIndex].id].datatype == "list"){
					fieldValue = (xRefFilterCode2ListValue(chartFields[fieldIndex].id, fieldValue) || fieldValue);
				}else if(fieldValue && gFilters[chartFields[fieldIndex].id].datatype == "date"){
					fieldValue = moment(fieldValue).format('MM/DD/YYYY  hh:mm A');
				}else if(gFilters[chartFields[fieldIndex].id].datatype == "numeric"){
					fieldValue = fieldValue ? fieldValue.toFixed(gFilters[chartFields[fieldIndex].id].decimals) : "";
				}
				var td = $("<td>").addClass("condensed").append($("<div>").html(fieldValue));
				tsvData += fieldValue + "\t";
			}
			tsvData += "\n";
		}
		
    this.href = "data:text/plain;charset=utf-8," + encodeURIComponent(tsvData);
    this.download = 'exportdata.txt';
		$('#modal-hippa-exportdata').modal('hide');
	});

	
	$("#dashboard-chartarea").on('click', '.chartboxexportdata', function (e) {
		var invoked_chartID = $(this).closest(".chartbox").attr("id");
		$("#btnExportHIPAAExportData").data("id", invoked_chartID);
		$('#modal-hippa-exportdata').modal('show');
	});

	
	$('#modal-vizsettings-datatable').on('hidden.bs.modal', function (e) {
		var invoked_chartID = $('#modal-vizsettings-datatable').data('invokedchart');

		$("#" + invoked_chartID).find(".chartboxpanel").animate({
					borderLeftColor: "#ddd",
					borderTopColor: "#ddd",
					borderRightColor: "#ddd",
					borderBottomColor: "#ddd",
		}, 500);
	});
	
	$('#modal-vizsettings-datatable').on('click', '#btnApplyVizOpt-datatable', function (e) {
		var invoked_chartID = $('#modal-vizsettings-datatable').data('invokedchart');
		
		var currentFieldsObj = [];
		$('#modal-vizsettings-datatable ul#datatableconnect2 li').each(function(index) {
			var fieldObj = ($(this).data("property"));
			currentFieldsObj.push({id: fieldObj.serializename, width: null});
		});
		
		verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults.tablefields = currentFieldsObj;
		verioChartObj[invoked_chartID].pluginclass.tableobj.updateGridFields(currentFieldsObj);
		$("#dashboard-chartarea #" + invoked_chartID).updateVCChartData(verioChartObj[invoked_chartID].pluginclass.data, verioChartObj[invoked_chartID].properties.charttype, verioChartObj[invoked_chartID].pluginclass);
		
	});
	
	
	$("#modal-vizsettings-datatable").on('click', 'li .liconnect', function (event) {
		var liElem = $(this).closest("li");

		if(liElem.closest("ul").attr("id") == "datatableconnect2"){
			liElem.find(".fa").removeClass("fa-trash-o");
			liElem.find(".fa").addClass("fa-chevron-circle-right");
			liElem.detach().appendTo('#modal-vizsettings-datatable ul#datatableconnect1');
		}else if(liElem.closest("ul").attr("id") == "datatableconnect1"){
			liElem.find(".fa").removeClass("fa-chevron-circle-right");
			liElem.find(".fa").addClass("fa-trash-o");
			liElem.detach().appendTo('#modal-vizsettings-datatable ul#datatableconnect2');
		}		
	});
	
	
	$("#dashboard-chartarea").on('click', '.chartboxsettings', function () {

		$(this).closest(".chartbox").children(".chartboxpanel").animate({
					borderLeftColor: "red",
					borderTopColor: "red",
					borderRightColor: "red",
					borderBottomColor: "red",
		}, 500);

		var old_previous_invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var invoked_chartID = $(this).closest(".chartbox").attr("id");

		if(verioChartObj[invoked_chartID].properties.charttype=="datatable"){
			$('#modal-vizsettings-datatable').modal('show');
			$('#modal-vizsettings-datatable').data('invokedchart', invoked_chartID);
			
			$('#modal-vizsettings-datatable ul#datatableconnect1').empty();
			$('#modal-vizsettings-datatable ul#datatableconnect2').empty();
			//zzzzzzzzz

			var currentFieldsArray = verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults.tablefields || [];
			var currentFieldsObj = {};

			for(currentFieldsIndex in currentFieldsArray){
				currentFieldsObj[currentFieldsArray[currentFieldsIndex].id] = currentFieldsArray[currentFieldsIndex];
				var dimension_liElem = $('<li />', {html: '<div class="liconnect" style="float: right;padding-left: 10px;padding-right: 10px;border-left: 1px solid white;"><i class="fa fa-chevron-circle-right"></i></div><div style="white-space:nowrap; overflow-x: hidden;">' + gFilters[currentFieldsArray[currentFieldsIndex].id].title + '</div>', class: 'd', style: 'padding-top: 5px; padding-bottom: 5px;'});
				dimension_liElem.data("property", gFilters[currentFieldsArray[currentFieldsIndex].id]);
				dimension_liElem.find(".fa").removeClass("fa-chevron-circle-right");
				dimension_liElem.find(".fa").addClass("fa-trash-o");
				$('#modal-vizsettings-datatable ul#datatableconnect2').append(dimension_liElem);
			}
			for (var filterKey in gFilters){
				
				if(gFilters[filterKey].settings.x == true){
					var dimension_liElem = $('<li />', {html: '<div class="liconnect" style="float: right;padding-left: 10px;padding-right: 10px;border-left: 1px solid white;"><i class="fa fa-chevron-circle-right"></i></div><div style="white-space:nowrap; overflow-x: hidden;">' + gFilters[filterKey].title + '</div>', class: 'd', style: 'padding-top: 5px; padding-bottom: 5px;'});
					dimension_liElem.data("property", gFilters[filterKey]);

					if(currentFieldsObj[gFilters[filterKey].serializename]){
						//dimension_liElem.find(".fa").removeClass("fa-chevron-circle-right");
						//dimension_liElem.find(".fa").addClass("fa-trash-o");
						//$('#modal-vizsettings-datatable ul#datatableconnect2').append(dimension_liElem);
					}else{
						$('#modal-vizsettings-datatable ul#datatableconnect1').append(dimension_liElem);
					}
				}
				
			}
			

		}else{					
			$('#modal-vizsettings ul').find("li.d").remove();

			$('#modal-vizsettings').data('invokedchart', invoked_chartID);

			if(old_previous_invoked_chartID != invoked_chartID){
				$('#modal-vizsettings .modal-dialog').css("left","").css("top","");
			}

			if(verioChartObj[invoked_chartID].properties.charttype=="pie" || verioChartObj[invoked_chartID].properties.charttype=="donut"){
				$('#modal-vizsettings').find(".inp-color").attr("disabled", true);
			}else{
				$('#modal-vizsettings').find(".inp-color").attr("disabled", false);
			}

			for(var yseriesIndex in verioChartObj[invoked_chartID].properties.yseries){

				var dimension_object = verioChartObj[invoked_chartID].properties.yseries[yseriesIndex];
				var dimension_liElem = $('<li />', {html: '<div class="lidelete" style="float: right;padding-left: 10px;padding-right: 10px;border-left: 1px solid white;"><i class="fa fa-trash-o"></i></div><div style="white-space:nowrap; overflow-x: hidden;">' + formatAggregationCaption(dimension_object.aggregation) + ' (' + dimension_object.caption + ')</div>', class: 'd', style: 'padding-top: 5px; padding-bottom: 5px;'});
				dimension_liElem.attr("id", yseriesIndex);
				dimension_liElem.data("dimension_index", yseriesIndex);
				dimension_liElem.data("dimension_property", dimension_object);
				dimension_liElem.css("border-left-color", dimension_object.color + " !important");

				//$('#modal-vizsettings').find("ul").append(dimension_liElem);
				$('#modal-vizsettings ul').find(".addnewdimension").before(dimension_liElem);

			}

			//var addNew_dimension_liElem = $('<li />', {html: '<div style="float: right;padding-left: 10px;padding-right: 10px;border-left: 1px solid white;" class="liaddnew"><i class="fa fa-plus"></i></div><div>Add New Dimension</div>', class: 'addnew', style: 'padding-top: 5px; padding-bottom: 5px;'});
			//$('#modal-vizsettings').find("ul").append(addNew_dimension_liElem);

			$('#modal-vizsettings').modal('show');

			$('#modal-vizsettings').find("li:first").trigger("click");
		}

	});

	$("#modal-dimensioncolors .modal-dialog").draggable({
		handle: ".modal-header",
	});
	
	$("#modal-filterexpressions .modal-dialog").draggable({
		handle: ".modal-header",
	});

	$("#modal-vizsettings .modal-dialog").draggable({
		handle: ".modal-header",
	});

	$("#modal-vizsettings-datatable .modal-dialog").draggable({
		handle: ".modal-header",
	});
	
	$("#modal-searchtemplates .modal-dialog").draggable({
		handle: ".modal-header",
	});

	$("#optionsbasefield_popover").draggable({
		handle: ".popover-title",
		containment: "body"
	});

	$('#modal-vizsettings').on('hidden.bs.modal', function (e) {
		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');

		$("#" + invoked_chartID).find(".chartboxpanel").animate({
					borderLeftColor: "#ddd",
					borderTopColor: "#ddd",
					borderRightColor: "#ddd",
					borderBottomColor: "#ddd",
		}, 500);

	})

//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz

	$("#modal-vizsettings").on('click', 'li.d', function () {
		$('#modal-vizsettings').find("li").removeClass("mvliselect");
		$(this).addClass("mvliselect");
		$('#modal-vizsettings form')[0].reset();
		$('#modal-vizsettings .inp-aggregation option.num').removeClass("li-disabled");
		$('#modal-vizsettings .inp-aggregation option.num').prop('disabled', false);

		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var dimension_index = $(this).data("dimension_index");
		var dimension_property = $(this).data("dimension_property");


		if(verioChartObj[invoked_chartID].properties.charttype == "multichart"){
			$('#modal-vizsettings .multicharttype').removeClass("hidden");
		}else{
			$('#modal-vizsettings .multicharttype').addClass("hidden");
		}

		$('#modal-vizsettings').find(".multicharttype option").filter(function() {
			return $(this).attr("data-multicharttype") == dimension_property.multicharttype;
		}).prop('selected', true);


		if(verioChartObj[invoked_chartID].properties.charttype == "scatter"){
			$('#modal-vizsettings').find(".inp-shape").removeClass("hidden");
			$('#modal-vizsettings').find(".caption-inp-shape").removeClass("hidden");
			$('#modal-vizsettings').find(".inp-shape option").filter(function() {
				return $(this).attr("data-shape") == dimension_property.shape;
			}).prop('selected', true);
		}else{
			$('#modal-vizsettings').find(".inp-shape").addClass("hidden");
			$('#modal-vizsettings').find(".caption-inp-shape").addClass("hidden");
		}


		if(dimension_property.datatype == "numeric"){
			$('#modal-vizsettings .inp-aggregation option.num').removeClass("li-disabled");
			$('#modal-vizsettings .inp-aggregation option.num').prop('disabled', false);
		}else{
			$('#modal-vizsettings .inp-aggregation option.num').addClass("li-disabled");
			$('#modal-vizsettings .inp-aggregation option.num').prop('disabled', true);
		}

		$('#modal-vizsettings').find(".inp-aggregation option").filter(function() {
			return $(this).attr("data-agg") == dimension_property.aggregation;
		}).prop('selected', true);


		$('#modal-vizsettings').find(".inp-label").val(dimension_property.label);
		$('#modal-vizsettings').find(".inp-expression").val(dimension_property.expression);
		if(dimension_property.expression && dimension_property.expression.length > 0){
			$('#modal-vizsettings').find("a.open-filter-expressions").html(dimension_property.expression.length + " filter(s) applied");
		}else{
			$('#modal-vizsettings').find("a.open-filter-expressions").html("Click here to add filters");
		}

		//var temp_seriesColor = (dimension_property.color == "" ? gColors[dimension_index] : dimension_property.color).toUpperCase();
		$('#modal-vizsettings').find(".inp-color").val(dimension_property.color);
		$('#modal-vizsettings').find(".inp-color").css("background-color", dimension_property.color);
		$('#modal-vizsettings').find(".inp-color").css("color", isColorDark($('#modal-vizsettings').find(".inp-color").css("background-color")) ? 'white' : 'black');

		$("#modal-vizsettings li.d.mvliselect").css("border-left-color", dimension_property.color + "!important");

	});

	//delete dimension
	$("#modal-vizsettings").on('click', 'li.d .lidelete', function (event) {

		event.stopPropagation();
		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var dimension_index = $(this).closest("li").data("dimension_index");

		$('#modal-vizsettings form')[0].reset();
		$('#modal-vizsettings .inp-aggregation option.num').removeClass("li-disabled");
		$('#modal-vizsettings .inp-aggregation option.num').prop('disabled', false);

		delete verioChartObj[invoked_chartID].properties.yseries[dimension_index];
		$(".series-" + dimension_index).remove();

		/*
		$('#modal-vizsettings').find("ul").empty();

		for(var yseriesIndex in verioChartObj[invoked_chartID].properties.yseries){

			var dimension_object = verioChartObj[invoked_chartID].properties.yseries[yseriesIndex];
			var dimension_liElem = $('<li />', {html: '<div class="lidelete" style="float: right;padding-left: 10px;padding-right: 10px;border-left: 1px solid white;"><i class="fa fa-trash-o"></i></div><div>' + formatAggregationCaption(dimension_object.aggregation) + ' (' + dimension_object.caption + ')</div>', class: 'd'});
			dimension_liElem.data("dimension_index", yseriesIndex);
			dimension_liElem.data("dimension_property", dimension_object);

			$('#modal-vizsettings').find("ul").append(dimension_liElem);

		}

		$('#modal-vizsettings').find("li:first").trigger("click");
		updateAllCharts(invoked_chartID);
		return;
		*/


		var liprev = $(this).closest("li").prev();
		if(liprev.length == 0) liprev = $(this).closest("li").next();
		$(this).closest("li").remove();
		if(liprev.length == 1) liprev.trigger("click");

		updateAllCharts(invoked_chartID);

	});


	$("#modal-vizsettings").on('change', 'input, select', function () {

		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var dimension_index = $('#modal-vizsettings li.mvliselect').data("dimension_index");
		var dimension_object = verioChartObj[invoked_chartID].properties.yseries[dimension_index];
		var updatingPropertyField = $(this).attr("data-property");

		if(updatingPropertyField == "aggregation"){
			dimension_object[updatingPropertyField] = $(this).find("option:selected").attr("data-agg");
		}else if(updatingPropertyField == "multicharttype"){
			/*
			$("#" + invoked_chartID + " .lines1Wrap .nv-groups").empty();
			$("#" + invoked_chartID + " .bars1Wrap .nv-groups").empty();
			$("#" + invoked_chartID + " .stack1Wrap .nv-areaWrap").empty();
			$("#" + invoked_chartID + " .lines2Wrap .nv-groups").empty();
			$("#" + invoked_chartID + " .bars2Wrap .nv-groups").empty();
			$("#" + invoked_chartID + " .stack2Wrap .nv-areaWrap").empty();
			*/
			dimension_object[updatingPropertyField] = $(this).find("option:selected").attr("data-multicharttype");

			$("#" + invoked_chartID + " svg").remove();
			verioChartObj[invoked_chartID].pluginclass = $("#dashboard-chartarea #" + invoked_chartID).find('.mychart').createVCChart(verioChartObj[invoked_chartID].properties);

		}else if(updatingPropertyField == "shape"){
			dimension_object[updatingPropertyField] = $(this).find("option:selected").attr("data-shape");
		}else{
			if(updatingPropertyField == "color"){
				$("#" + invoked_chartID).find(".btnset1" + ".series-" + dimension_index).find(".color").css("background-color", ($(this).val()) );
				$("#modal-vizsettings li.d.mvliselect").css("border-left-color", $(this).val() + " !important");
			}
			dimension_object[updatingPropertyField] = $(this).val();
		}

		updateAllCharts(invoked_chartID);

		$(this).updateVCChartRender(verioChartObj[invoked_chartID].properties.charttype, verioChartObj[invoked_chartID].pluginclass);
		//verioChartObj[invoked_chartID].pluginclass.update();
	});




	$("#dashboard-chartarea").on('click', '.btnset2', function (event) {

			var x = $(this).offset();

			var chartID = $(this).closest(".chartbox").attr("id");
			var dimensionIndex = $(this).attr("seriesIndex");
			$('#optionsvizfield_popover').data('invokedchart', chartID);
			$('#optionsvizfield_popover').data('invokedDimensionIndex', dimensionIndex);

			if(verioChartObj[chartID].properties.yseries[dimensionIndex].datatype == "numeric"){
				$('#optionsvizfield_popover li.num').removeClass("li-disabled");
			}else{
				$('#optionsvizfield_popover li.num').addClass("li-disabled");
			}

			$('#optionsvizfield_popover li').removeClass("mvliselect");
			$('#optionsvizfield_popover li[data-agg="' + verioChartObj[chartID].properties.yseries[dimensionIndex].aggregation + '"]').addClass("mvliselect");


			$('#optionsvizfield_popover').find(".arrow").css({'top': '50%'}) ;

			$('#optionsvizfield_popover').css({
				'left': x.left + $(this).outerWidth(),
				'top': x.top + ($(this).height()/2) - ($('#optionsvizfield_popover').outerHeight()/2),
				'display': 'inline',
				"position": "absolute"
			}).show();


			var win = $(window);
			var el = $('#optionsvizfield_popover');
			var winPos = win.scrollTop() + win.height();
			var elPos = el.offset().top + el.height();

			if(winPos < elPos){
				$('#optionsvizfield_popover').css({'top': $('#optionsvizfield_popover').position().top - (elPos - winPos) - 20 });
				$('#optionsvizfield_popover').find(".arrow").css({'top': ($('#optionsvizfield_popover').height()/2) + (elPos - winPos) + 20 }) ;
			}

			$(document).bind( "mousedown", function(e) {

				var container = $('#optionsvizfield_popover');

				if (!container.is(e.target) // if the target of the click isn't the container...
					&& (container.has(e.target).length === 0 || e.target.id == 'vizoptions-close') //nor a descendant of the container
					)
				{
					$('#optionsvizfield_popover').data('invokedchart', '');
					container.hide();
					$(document).unbind( "mousedown" );
					$(".btnset2").blur();
				}
			});
	});


	$("#dashboard-chartarea").on('click', '.btndimensions-overflow', function (event) {

		var chartID = $(this).closest(".chartbox").attr("id");

		$("#" + chartID + " .chartboxsettings").trigger("click");

	});


	$("#dashboard-chartarea").on('click', '.vizaddfield', function (event) {

			var x = $(this).offset();

			var chartID = $(this).closest(".chartbox").attr("id");

			var chartType = verioChartObj[chartID].properties.charttype;
			if(["map","donut","pie","dhheat","datatable","boxplot"].indexOf(chartType) > -1){
				if(Object.keys(verioChartObj[chartID].properties.yseries).length >= 1){
					alert("This visualization currently plots only one Y-Series dimension.");
					return;
				}
			}

			if(chartID != $('#addvizfield_popover').data('last_invokedchart')){ //last_invokedchart no different from invokedchart...just that last_invokedchart is persistent and invokedchart gets wiped on mousedown....
				$("#addvizfield_popover li.d").show();
				$('#vizfield-dimension-search-text').val("");				
			}

			$('#addvizfield_popover').data('last_invokedchart', chartID);			
			$('#addvizfield_popover').data('invokedchart', chartID);

			$('#addvizfield_popover').find(".arrow").css({'top': '50%'}) ;

			$('#addvizfield_popover').css({
				'left': x.left + $(this).outerWidth(),
				'top': x.top + ($(this).height()/2) - ($('#addvizfield_popover').outerHeight()/2),
				'display': 'inline',
				"position": "absolute"
			}).show();


			var win = $(window);
			var el = $('#addvizfield_popover');
			var winPos = win.scrollTop() + win.height();
			var elPos = el.offset().top + el.height();

			if(winPos < elPos){
				$('#addvizfield_popover').css({'top': $('#addvizfield_popover').position().top - (elPos - winPos) - 20 });
				$('#addvizfield_popover').find(".arrow").css({'top': ($('#addvizfield_popover').height()/2) + (elPos - winPos) + 20 }) ;
			}

			$(document).bind( "mousedown", function(e) {

				var container = $('#addvizfield_popover');

				if (!container.is(e.target) // if the target of the click isn't the container...
					&& (container.has(e.target).length === 0 || e.target.id == 'vizdimension-close') //nor a descendant of the container
					)
				{
					$('#addvizfield_popover').data('invokedchart', '');
					container.hide();
					$(document).unbind( "mousedown" );
				}
			});
	});



	$("#dashboard-chartarea").on('click', '.baseseries_btn', function (event) {

			var x = $(this).offset();

			var chartID = $(this).closest(".chartbox").attr("id");

			if(chartID != $('#vizbaseseries_popover').data('last_invokedchart')){
				$("#vizbaseseries_popover li.d").show();
				$('#base-dimension-search-text').val("");
			}

			$('#vizbaseseries_popover').data('last_invokedchart', chartID);			
			$('#vizbaseseries_popover').data('invokedchart', chartID);

			$('#vizbaseseries_popover').css({
				'left': x.left - ( ($('#vizbaseseries_popover').outerWidth()/2) - ($(this).outerWidth()/2) ), // - $(this).outerWidth(),
				'top': x.top - $('#vizbaseseries_popover').outerHeight() - 2,
				'display': 'inline',
				"position": "absolute"
			}).show();
			
			$(document).bind( "mousedown", function(e) {

				var container = $('#vizbaseseries_popover');

				if (!container.is(e.target) // if the target of the click isn't the container...
					&& (container.has(e.target).length === 0 || e.target.id == 'vizbaseseries-close') //nor a descendant of the container
					)
				{
					$('#addvizfield_popover').data('invokedchart', '');
					container.hide();
					$(document).unbind( "mousedown" );
				}
			});

	});



	$("#dashboard-chartarea").on('click', '.baseseries_btn_chart_options', function (event) {
			var chartID = $(this).closest(".chartbox").attr("id");

			var chart_object = verioChartObj[chartID];

			if(chart_object.properties.charttype == "bar" || chart_object.properties.charttype == "horizontal-bar"){
				if(chart_object.properties.barstacked != null){
					if(chart_object.properties.barstacked == true){
						chart_object.properties.barstacked = false;
					}else{
						chart_object.properties.barstacked = true;
					}
				}else{
					chart_object.properties.barstacked = true;
				}
			}

			var chart = verioChartObj[chartID].pluginclass;
			chart.stacked(chart_object.properties.barstacked);
			$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);

			$(this).blur();
	});


	$("#dashboard-chartarea").on('click', '.baseseries_btn_options', function (event) {

			var x = $(this).offset();

			var chartID = $(this).closest(".chartbox").attr("id");

			$('#optionsbasefield_popover').data('invokedchart', chartID);

			$('#optionsbasefield_popover form')[0].reset();
			$('#optionsbasefield_popover').find(".inpdivs").addClass("hidden");
			var xSeries_dimension_object = verioChartObj[chartID].properties.xseries[0];
			if(xSeries_dimension_object.datatype == "numeric"){
				$('#optionsbasefield_popover').find(".numeric_dimension").removeClass("hidden");

				if(xSeries_dimension_object.vizdefaults){
					$('#optionsbasefield_popover').find(".inp-interval").val(xSeries_dimension_object.vizdefaults.interval);
					$('#optionsbasefield_popover').find(".inp-intervaldoccount").val(xSeries_dimension_object.vizdefaults.interval_mincount);
					$('#optionsbasefield_popover').find(".inp-boundary").val(xSeries_dimension_object.vizdefaults.boundary);
					$('#optionsbasefield_popover').find('.inp-showlabel option').filter(function() {
					    return ($(this).attr("data-select-index") == xSeries_dimension_object.vizdefaults.showlabel);
					}).prop('selected', true);
				}

			}else if(xSeries_dimension_object.datatype == "funnel"){
				$('#optionsbasefield_popover').find(".funnel_dimension").removeClass("hidden");
				if(xSeries_dimension_object.vizdefaults){
					$('#optionsbasefield_popover').find(".inp-stem").val(xSeries_dimension_object.vizdefaults.chart.bottomPinch);

					$('#optionsbasefield_popover').find('.inp-blockheight option').filter(function() {
					    return ($(this).attr("data-select-index") == (xSeries_dimension_object.vizdefaults.block.dynamicHeight == true) ? 0 : 1);
					}).prop('selected', true);
					$('#optionsbasefield_popover').find('.inp-blockwidth option').filter(function() {
					    return ($(this).attr("data-select-index") == (xSeries_dimension_object.vizdefaults.block.dynamicSlope == true) ? 0 : 1);
					}).prop('selected', true);
					
				}
			}else if(xSeries_dimension_object.datatype == "zip"){
				$('#optionsbasefield_popover').find(".map_dimension").removeClass("hidden");

				//console.log(xSeries_dimension_object.vizdefaults);
				if(xSeries_dimension_object.vizdefaults){
					$('#optionsbasefield_popover').find(".inp-intensity").val(xSeries_dimension_object.vizdefaults.intensity);
					//DOES NOT WORK $('#optionsbasefield_popover').find(".inp-gradient option[data-select-index='" + xSeries_dimension_object.vizdefaults.gradient + "']").attr("selected","selected");

					$('#optionsbasefield_popover').find('.inp-gradient option').filter(function() {
					    return ($(this).attr("data-select-index") == xSeries_dimension_object.vizdefaults.gradient);
					}).prop('selected', true);
				}

			}else if(xSeries_dimension_object.datatype == "date"){
				$('#optionsbasefield_popover').find(".date_dimension").removeClass("hidden");
				if(verioChartObj[chartID].properties.charttype == "bar"){
					$('#optionsbasefield_popover').find(".date_dimension .forecasting").removeClass("hidden");
				}else{
					$('#optionsbasefield_popover').find(".date_dimension .forecasting").addClass("hidden");
				}

				if(xSeries_dimension_object.vizdefaults){
					$('#optionsbasefield_popover').find('.inp-querydatehistogram option').filter(function() {
					    return ($(this).attr("data-select-index") == xSeries_dimension_object.vizdefaults.datehistogram);
					}).prop('selected', true);
					$('#optionsbasefield_popover').find('.inp-showlabel option').filter(function() {
					    return ($(this).attr("data-select-index") == xSeries_dimension_object.vizdefaults.showlabel);
					}).prop('selected', true);
					$('#optionsbasefield_popover').find('.inp-forecast option').filter(function() {
					    return ($(this).attr("data-select-index") == xSeries_dimension_object.vizdefaults.forecast);
					}).prop('selected', true);
					$('#optionsbasefield_popover').find(".inp-forecastfitparam").val(xSeries_dimension_object.vizdefaults.forecastfitparam || 10);
				}

			}else{
				$('#optionsbasefield_popover').find(".string_dimension").removeClass("hidden");

				if(xSeries_dimension_object.vizdefaults){
					$('#optionsbasefield_popover').find(".inp-querysize").val(xSeries_dimension_object.vizdefaults.size);

					$('#optionsbasefield_popover').find('.inp-queryorder option').filter(function() {
					    return ($(this).attr("data-select-index") == xSeries_dimension_object.vizdefaults.order);
					}).prop('selected', true);
					$('#optionsbasefield_popover').find('.inp-showlabel option').filter(function() {
					    return ($(this).attr("data-select-index") == xSeries_dimension_object.vizdefaults.showlabel);
					}).prop('selected', true);
				}
			}

			//calculate and show after manipulating DOM since height is calculated...
			$('#optionsbasefield_popover').css({
				'left': x.left - ( ($('#optionsbasefield_popover').outerWidth()/2) - ($(this).outerWidth()/2) ),
				'top': x.top - $('#optionsbasefield_popover').outerHeight() - 2,
				'display': 'inline',
				"position": "absolute"
			}).show();

			$(document).bind( "mousedown", function(e) {

				var container = $('#optionsbasefield_popover');

				if (!container.is(e.target) // if the target of the click isn't the container...
					&& (container.has(e.target).length === 0 || e.target.id == 'baseoptions-close') //nor a descendant of the container
					)
				{
					$('#addvizfield_popover').data('invokedchart', '');
					container.hide();
					$(document).unbind( "mousedown" );
				}
			});

			$(this).blur();

	});


	$("#optionsbasefield_popover").on('change', 'input, select', function () {

		var invoked_chartID = $('#optionsbasefield_popover').data('invokedchart');
		//alert(invoked_chartID);
		var xSeries_dimension_object = verioChartObj[invoked_chartID].properties.xseries[0];
		var updatingPropertyField = $(this).attr("data-property");
		var updatingPropertyFieldType = $(this).attr("data-type");

		if(xSeries_dimension_object.vizdefaults){
			if(updatingPropertyFieldType == "array"){
				xSeries_dimension_object.vizdefaults[updatingPropertyField] = $(this).val().split(",");
			}else if(updatingPropertyFieldType == "selectinteger"){
				xSeries_dimension_object.vizdefaults[updatingPropertyField] = Number($(this).find("option:selected").attr("data-select-index"));
			}else if(updatingPropertyFieldType == "nested-numeric"){
				if(xSeries_dimension_object.datatype == "funnel" && updatingPropertyField=="stem"){
						xSeries_dimension_object.vizdefaults.chart.bottomPinch = Number($(this).val());
				}
			}else if(updatingPropertyFieldType == "nested-selectinteger"){
				if(xSeries_dimension_object.datatype == "funnel" && updatingPropertyField=="blockheight"){
						xSeries_dimension_object.vizdefaults.block.dynamicHeight = ($(this).find("option:selected").attr("data-select-index") == 0) ? true : false;
				}
				if(xSeries_dimension_object.datatype == "funnel" && updatingPropertyField=="blockwidth"){
						xSeries_dimension_object.vizdefaults.block.dynamicSlope = ($(this).find("option:selected").attr("data-select-index") == 0) ? true : false;
				}
			}else{
				xSeries_dimension_object.vizdefaults[updatingPropertyField] = $(this).val();
			}			
			
			
			
			if(verioChartObj[invoked_chartID].properties.charttype == "map"){

				if(updatingPropertyField == "intensity"){
					verioChartObj[invoked_chartID].pluginclass.cfg[updatingPropertyField] = $(this).val();
				}

				if(updatingPropertyField == "gradient"){
					var selectedGradIndex = $(this).find("option:selected").attr("data-select-index");
					if(selectedGradIndex < gHeatGradients.length){
						verioChartObj[invoked_chartID].pluginclass.cfg[updatingPropertyField] = gHeatGradients[selectedGradIndex];
					}else{
						verioChartObj[invoked_chartID].pluginclass.cfg[updatingPropertyField] = gHeatGradients[0];
					}
				}

				//Redraw the chart
				var chart = verioChartObj[invoked_chartID].pluginclass;
				var cfg = verioChartObj[invoked_chartID].pluginclass.cfg;

				$("#dashboard-chartarea #" + invoked_chartID).updateVCChartData(chart.data, verioChartObj[invoked_chartID].properties.charttype, chart);

			}else if(updatingPropertyField == "showlabel"){
				chartShowLabel(invoked_chartID);
			}else{
				updateAllCharts(invoked_chartID);
			}

		}



	});


	$("#dashboard-chartarea").on('click', '.vizcaption', function (e) {
		var vizcaptionElem = $(this);
		var spanElem = $(this).find("span");
		var inputElem = $(this).find("input");

		inputElem.val(spanElem.text());
		inputElem.removeClass("hidden");
		spanElem.addClass("hidden");
		inputElem.focus();
		inputElem.select();

		$(document).bind( "mousedown", function(e) {

			if (!vizcaptionElem.is(e.target) // if the target of the click isn't the container...
				&& vizcaptionElem.has(e.target).length === 0) //nor a descendant of the container
			{

				var spanElem = vizcaptionElem.find("span");
				var inputElem = vizcaptionElem.find("input");

				if(inputElem.val() != "") {
					spanElem.text(inputElem.val());
					var chartID = vizcaptionElem.closest(".chartbox").attr('id');
					verioChartObj[chartID].properties.chartcaption = inputElem.val();
				}

				spanElem.removeClass("hidden");
				inputElem.addClass("hidden");

				$(document).unbind( "mousedown" );
			}
		});

	});


	$("#dashboard-chartarea").on('click', '.vizcaption input', function (event) {
		event.stopPropagation();
	});

	$("#dashboard-chartarea").on('keyup focusout', '.vizcaption input', function (event) {

		if( (event.type == 'keyup' && event.keyCode == 13) || event.type == 'focusout'){
			var vizcaptionElem = $(this).closest(".vizcaption");
			var spanElem = vizcaptionElem.find("span");
			var inputElem = vizcaptionElem.find("input");

			if(inputElem.val() != "") {
				spanElem.text(inputElem.val());
				var chartID = vizcaptionElem.closest(".chartbox").attr('id');
				verioChartObj[chartID].properties.chartcaption = inputElem.val();
			}

			spanElem.removeClass("hidden");
			inputElem.addClass("hidden");

		}
	});

	$(".addvizprimitive").on('click', function () {
		var viztype = $(this).attr('data-viz-type');
		addVizChart(viztype, null);
	});




	$("#SubmitDeleteTab").click(function(e) {
		window.location.href = '/analytics/delete/' + gTabID;
	});

	$("#form-CreateNewTab").submit(function(e) {

		e.preventDefault();

		document.getElementById("SubmitCreateNewTab").className += " disabled";
		document.getElementById("SubmitCreateNewTab-value-span").className += " fa fa-spin fa-spinner";

		//set the first character to uppercase
		$("#newtabtitle").val( $("#newtabtitle").val().charAt(0).toUpperCase() + $("#newtabtitle").val().slice(1) );

		$.ajax({
			type: "POST",
			url: "/analytics/create-new-tab",
			data: $('#form-CreateNewTab').serialize(),

			success: function(msg){
				window.location.href = '/analytics/?tabID=' + msg;
			},

			error: function(){
				alert("Unable to connect to server or request timed out.");
			}

		});
	});



	$("#form-RenameTab").submit(function(e) {

		e.preventDefault();

		$("#RenameTab").addClass("disabled");
		$("#RenameTab-value-span").addClass("fa fa-spin fa-spinner");

		//set the first character to uppercase
		$("#renametabtitle").val( $("#renametabtitle").val().charAt(0).toUpperCase() + $("#renametabtitle").val().slice(1) );

		$.ajax({
			type: "POST",
			url: "/analytics/rename-tab",
			data: {tabID: gTabID, renametabtitle: $("#renametabtitle").val()},

			success: function(msg){
				if(msg.result==true){
					$(".navbar-li-text-active-" + gTabID).html(msg.newtitle);
				}else{
					alert("Error: Failed to update dashboard title!");
				}
				$("#modal-RenameTab").modal("hide");
				$("#RenameTab").removeClass("disabled");
				$("#RenameTab-value-span").removeClass("fa fa-spin fa-spinner");
			},

			error: function(){
				alert("Unable to connect to server or request timed out.");
			}

		});
	});


	$("#SortTabs").click(function(e) {

		e.preventDefault();

		$("#SortTabs").addClass("disabled");
		$("#SortTabs-value-span").addClass("fa fa-spin fa-spinner");

		var tabOrder = {};
		$("#ulsorttabs li").each(function(index) {
			tabOrder[$(this).attr("data-id")] = index;
		});

		$.ajax({
			type: "POST",
			url: "/analytics/sort-tabs",
			data: {taborder: tabOrder},

			success: function(msg){
				if(msg.result==true){

				}else{
					alert("Error: Failed to update dashboard order!");
				}
				$("#modal-SortTabs").modal("hide");
				$("#SortTabs").removeClass("disabled");
				$("#SortTabs-value-span").removeClass("fa fa-spin fa-spinner");
			},

			error: function(){
				alert("Unable to connect to server or request timed out.");
			}

		});
	});


	$("#form-CopyTab").submit(function(e) {

		e.preventDefault();

		$("#CopyTab").addClass("disabled");
		$("#CopyTab-value-span").addClass("fa fa-spin fa-spinner");

		//set the first character to uppercase
		$("#copytabtitle").val( $("#copytabtitle").val().charAt(0).toUpperCase() + $("#copytabtitle").val().slice(1) );

		var dashboardData = {};
		$.extend( true, dashboardData, gTabMasterData ); //deep copy.
		delete dashboardData._id;
		delete dashboardData.sharedwith;
		delete dashboardData.created;

		var vizPropertyData = [];
		var serializeFilterObj = $('#olap-panel .filterserialize').verioFilterDataSerializeObject();

		$( "#dashboard-chartarea .chartbox" ).each(function( index ) {
			var chartID = $( this ).attr("chartid");
			var chartProperties = {}; // = verioChartObj[chartID].properties;
			$.extend( true, chartProperties, verioChartObj[chartID].properties ); //deep copy.
			chartProperties.chartposition.pos = index;

			var tempYSeriesArray = [];
			for (var yseriesObjKey in chartProperties.yseries){
				tempYSeriesArray.push(chartProperties.yseries[yseriesObjKey]);
			}
			chartProperties.yseries = tempYSeriesArray;

			vizPropertyData.push({id: chartID, val: chartProperties});
		});

		dashboardData.content = JSON.stringify({vizData: vizPropertyData, filterData: serializeFilterObj});
		dashboardData.title = $("#copytabtitle").val();

		$.ajax({
			type: "POST",
			url: "/analytics/copy-of-tab",
			data: {tabID: gTabID, dashboarddata: dashboardData},

			success: function(msg){
				if(msg.result==true){
					window.location.href = '/analytics/?tabID=' + msg.newTabID;
				}else{
					alert("Error: Failed to save a copy of this dashboard!");
				}
				$("#modal-CopyTab").modal("hide");
				$("#CopyTab").removeClass("disabled");
				$("#CopyTab-value-span").removeClass("fa fa-spin fa-spinner");
			},

			error: function(){
				alert("Unable to connect to server or request timed out.");
			}

		});
	});

/*
	setInterval(function(){ 
		var rev_delta = jsondiffpatch.diff({vizData: vizPropertyData, filterData: serializeFilterObj}, {vizData: vizPropertyData, filterData: serializeFilterObj});
		if(rev_delta.length > 0){
			$(".saveDashboard").click();
		}
	}, 5000);
*/	
function DocKeyPress(e) {
	if (e.ctrlKey) {
		gTemp_CTRL_Pressed = true;
	}

	var evtobj = window.event? event : e;

	if (gMode != "View only" && gMode != "View and Copy" && evtobj.keyCode == 83 && evtobj.ctrlKey){
		//alert("Ctrl+C");

		if(confirm("Confirm save dashboard?")){
			//$(".saveDashboard").click();
			saveDashboard();
			evtobj.stopPropagation();
			evtobj.preventDefault();
			gTemp_CTRL_Pressed = false;
			return false;
		}
		gTemp_CTRL_Pressed = false;
	}
}
document.onkeydown = DocKeyPress;

$(document).keyup(function(e) {
	gTemp_CTRL_Pressed = false;
});


	$(".saveDashboard").on('click', function(event) {
		$(this).blur();
		saveDashboard();
	});

	function saveDashboard(){

		var vizPropertyData = [];
		var serializeFilterObj = $('#olap-panel .filterserialize').verioFilterDataSerializeObject();

		$( "#dashboard-chartarea .chartbox" ).each(function( index ) {
			var chartID = $( this ).attr("chartid");
			var chartProperties = {}; // = verioChartObj[chartID].properties;
			$.extend( true, chartProperties, verioChartObj[chartID].properties ); //deep copy.
			chartProperties.chartposition.pos = index;

			var tempYSeriesArray = [];
			for (var yseriesObjKey in chartProperties.yseries){
				tempYSeriesArray.push(chartProperties.yseries[yseriesObjKey]);
			}
			chartProperties.yseries = tempYSeriesArray;

			//chartProperties.yseries = JSON.parse(JSON.stringify(chartProperties.yseries).replace(/obr\./g, "obr_")); //mongodb does not allow key names with period or dollar! hell mongo

			vizPropertyData.push({id: chartID, val: chartProperties});
		});

		var dashboardData = JSON.stringify({vizData: vizPropertyData, filterData: serializeFilterObj});
		//var dashboardData = {vizData: vizPropertyData, filterData: serializeFilterObj};

		//dashboardData = dashboardData.replace(/obr\./g, "obr_");

		$.ajax({
			type: "POST",
			//traditional: true,
			url: "/analytics/setDashboardTab",
			data: {tabID: gTabID, "dashboardData": dashboardData},

			success: function(msg){
				if(msg && msg.result == true){
					$(".saveDashboard i").css("color", "");
					//$('#GrowlNotify-Span').css("background-color", "red");
					$('#GrowlNotify-Span').text("Dashboard saved");
				}else{
					$('#GrowlNotify-Span').text("Error saving dashboard. Try again!");
					$('#GrowlNotify-Span').css("background-color", "#DC1313");
				}

				$('#GrowlNotify-Div').removeClass("hidden");
				setTimeout(function(){
					$('#GrowlNotify-Div').addClass("hidden");
					$('#GrowlNotify-Span').css("background-color", "");
				}, 3000);

			},

			error: function(request, status, error) {
				alert("Error connecting to server");
			}

		});
		
	}
	

	//PROD
	$( window ).resize(function() {
		$( '#olap-panel' ).height($(window).height()-70);
		$( '#olap-panel' ).width($( '#dashboard-olapmenu' ).width()-5);

		//AP change 7/4/2016
		var toolbarwidth = $("#dashboard-toolsmenu").is(":visible") ? 50 : 0;
		$("#dashboard-chartarea").css("width", ($(window).width() - $('#dashboard-olapmenu').width() - toolbarwidth - 5) );

		gContainerDimensions.height = $("#dashboard-chartarea").height();
		gContainerDimensions.width = $("#dashboard-chartarea").width();

		if(gDeviceSize == "xs") return; //if device is xs like mobile, resize chartboxes or re-calculateboxes - EXIT!!!

		for(var chartID in verioChartObj){
			var chartposition = verioChartObj[chartID].properties.chartposition;
			$("#" + chartID).css("top", chartposition.top * gContainerDimensions.height);
			$("#" + chartID).css("left", chartposition.left * gContainerDimensions.width);
			$("#" + chartID).css("height", chartposition.height * gContainerDimensions.height);
			$("#" + chartID).css("width", chartposition.width * gContainerDimensions.width);

			chartboxResize( $("#" + chartID) );

			$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
		}

		calculateChartBoxes();

	});

	$( "body" ).on( "mouseover", ".filtercontainer", function() {
	//$('.filtercontainer').mouseover(function(event){
					//$('.in,.open').removeClass('in open');
					if ($('.filtercontainer span').hasClass('open') == false){
									$('.filtersettings').css({"visibility":"hidden"});
									$('#filter_' + $(event.target).closest('.filtercontainer').attr('name') + '_settings').css({"visibility":"visible"});
					}
	});


	$( "body" ).on( "mouseout", ".filtercontainer", function() {
	//$('.filtercontainer').mouseout(function(event){

					if ($('.filtercontainer span').hasClass('open') == false){
									$('#filter_' + $(event.target).closest('.filtercontainer').attr('name') + '_settings').css({"visibility":"hidden"});
					}
	});


	//PROD
	function timestamp(str){
		return new Date(str).getTime();
	}

	//PROD
	function setDate( value ){
					//$(this).html(moment(new Date(+value)).format('MM/DD/YYYY'));
		$(this).html(moment(Number(value)).format('MM/DD/YYYY'));
	}

	//PROD
	function setDateLower( value ){
		$(this).html(moment(Number(value)).format('MM/DD/YYYY'));
	}

	//PROD
	function setDateUpper( value ){
		$(this).html(moment(Number(value)).format('MM/DD/YYYY'));
	}



	//PROD
	function setDateValue( value ){
		$(this).val(value);
	}

	//PROD
	function setDateValueLower( value ){
		$(this).val(moment(Number(value)).startOf("day").valueOf());
	}

	//PROD
	function setDateValueUpper( value ){
		$(this).val(moment(Number(value)).endOf("day").valueOf());
	}

	//PROD
	function getDateValue( value ){
		return moment(new Date(+value)).format('YYYYMMDD');
	}



	$("#optionsvizfield_popover ul li.a").on('click', function (event) {

		var invoked_chartID = $('#optionsvizfield_popover').data('invokedchart');
		var invoked_DimensionIndex = $('#optionsvizfield_popover').data('invokedDimensionIndex');
		var agg_type = $(this).attr("data-agg");

		if(verioChartObj[invoked_chartID].properties.yseries[invoked_DimensionIndex].aggregation != agg_type){
			verioChartObj[invoked_chartID].properties.yseries[invoked_DimensionIndex].aggregation = agg_type;
		}

		$(document).trigger("mousedown");
		updateAllCharts(invoked_chartID);
	});


	$("#optionsvizfield_popover ul li.remove").on('click', function (event) {

		var invoked_chartID = $('#optionsvizfield_popover').data('invokedchart');
		var invoked_DimensionIndex = $('#optionsvizfield_popover').data('invokedDimensionIndex');

		//verioChartObj[invoked_chartID].properties.yseries.splice(invoked_DimensionIndex,1);
		delete verioChartObj[invoked_chartID].properties.yseries[invoked_DimensionIndex];

		$(".series-" + invoked_DimensionIndex).remove();

		$(document).trigger("mousedown");
		updateAllCharts(invoked_chartID);
	});



	$("#addvizfield_popover ul li.d").on('click', function (event) {
		var dimension_properties = $(this).data("property");
		var invoked_chartID = $('#addvizfield_popover').data('invokedchart');
		var viztype = verioChartObj[invoked_chartID].properties.charttype;

		//var yseriesArrayCount = Object.keys(verioChartObj[invoked_chartID].properties.yseries).length; //verioChartObj[invoked_chartID].properties.yseries.length;
		var new_ySeriesIndex = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now(); //yseriesArrayCount + (new Date()).getMilliseconds();

		var colorAssigned = assignNewColor(verioChartObj[invoked_chartID].properties.yseries);
		//verioChartObj[invoked_chartID].properties.yseries.push({id: new_ySeriesIndex, field: dimension_properties.serializename, datatype: dimension_properties.datatype, caption: dimension_properties.caption, aggregation: "value_count" , label:"", color: "", charttype: viztype});
		verioChartObj[invoked_chartID].properties.yseries[new_ySeriesIndex] = {id: new_ySeriesIndex, field: dimension_properties.serializename, datatype: dimension_properties.datatype, caption: dimension_properties.caption, aggregation: "value_count" , label:"", color: colorAssigned, charttype: viztype, expression: []};
		if(viztype=="scatter"){
			var shapeAssigned = assignNewShape(verioChartObj[invoked_chartID].properties.yseries);
			//console.log(shapeAssigned);
			verioChartObj[invoked_chartID].properties.yseries[new_ySeriesIndex].shape = shapeAssigned;
		}


		var clone_template_dimension_series_btn = $("#template_dimension_series_btn").clone();
		clone_template_dimension_series_btn.find("button").attr("seriesIndex", new_ySeriesIndex);
		clone_template_dimension_series_btn.find("button").addClass("series-" + new_ySeriesIndex);

		clone_template_dimension_series_btn.find(".btnset1 .color").css("background-color", colorAssigned);
		clone_template_dimension_series_btn.find(".btnset1 .caption").html(dimension_properties.caption);

		$("#" + invoked_chartID).find(".dimensionseries .group-btns .btn-group").append(clone_template_dimension_series_btn.children());

		$(document).trigger("mousedown");

		chartboxResize( $("#" + invoked_chartID) );

		updateAllCharts(invoked_chartID);
	});


	$("#modal-vizsettings li.addnewdimension #adddimen").on('change', function (event) {
		var dimension_properties = $("#adddimen option:selected").data("property");
		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var viztype = verioChartObj[invoked_chartID].properties.charttype;

		if(["map","donut","pie","dhheat","datatable"].indexOf(viztype) > -1){
			if(Object.keys(verioChartObj[invoked_chartID].properties.yseries).length >= 1){
				$('#modal-vizsettings li.addnewdimension #adddimen').prop('selectedIndex',0);
				alert("This visualization currently plots only one Y-Series dimension.\n\nTo replace, delete the current dimension and add a new one.");
				return;
			}
		}

		var new_ySeriesIndex = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now(); //yseriesArrayCount + (new Date()).getMilliseconds();

		var colorAssigned = assignNewColor(verioChartObj[invoked_chartID].properties.yseries);
		verioChartObj[invoked_chartID].properties.yseries[new_ySeriesIndex] = {id: new_ySeriesIndex, field: dimension_properties.serializename, datatype: dimension_properties.datatype, caption: dimension_properties.caption, aggregation: "value_count" , label:"", color: colorAssigned, charttype: viztype, expression: []};

		if(viztype=="scatter"){
			var shapeAssigned = assignNewShape(verioChartObj[invoked_chartID].properties.yseries);
			//console.log(shapeAssigned);
			verioChartObj[invoked_chartID].properties.yseries[new_ySeriesIndex].shape = shapeAssigned;
		}

		var clone_template_dimension_series_btn = $("#template_dimension_series_btn").clone();
		clone_template_dimension_series_btn.find("button").attr("seriesIndex", new_ySeriesIndex);
		clone_template_dimension_series_btn.find("button").addClass("series-" + new_ySeriesIndex);

		clone_template_dimension_series_btn.find(".btnset1 .color").css("background-color", colorAssigned);
		clone_template_dimension_series_btn.find(".btnset1 .caption").html(dimension_properties.caption);

		$("#" + invoked_chartID).find(".dimensionseries .group-btns .btn-group").append(clone_template_dimension_series_btn.children());

		$('#modal-vizsettings li.addnewdimension #adddimen').prop('selectedIndex',0);


		var dimension_object = verioChartObj[invoked_chartID].properties.yseries[new_ySeriesIndex];
		var dimension_liElem = $('<li />', {html: '<div class="lidelete" style="float: right;padding-left: 10px;padding-right: 10px;border-left: 1px solid white;"><i class="fa fa-trash-o"></i></div><div style="white-space:nowrap; overflow-x: hidden;">' + formatAggregationCaption(dimension_object.aggregation) + ' (' + dimension_object.caption + ')</div>', class: 'd', style: 'padding-top: 5px; padding-bottom: 5px;'});
		dimension_liElem.data("dimension_index", new_ySeriesIndex);
		dimension_liElem.data("dimension_property", dimension_object);
		dimension_liElem.css("border-left-color", colorAssigned + " !important");

		$('#modal-vizsettings ul').find(".addnewdimension").before(dimension_liElem);
		$('#modal-vizsettings').find("li.d:last").trigger("click");

		chartboxResize( $("#" + invoked_chartID) );
		updateAllCharts(invoked_chartID);
	});



	$("#addvizfield_popover ul li.a").on('click', function (event) {
		return;

		var invoked_chartID = $('#addvizfield_popover').data('invokedchart');
		var viztype = verioChartObj[invoked_chartID].properties.charttype;

		$(document).trigger("mousedown");
		updateAllCharts(invoked_chartID);
	});



	$("#vizbaseseries_popover ul li.d").on('click', function (event) {
		var dimension_properties = $(this).data("property");
		var invoked_chartID = $('#vizbaseseries_popover').data('invokedchart');

		verioChartObj[invoked_chartID].properties.xseries[0] = {field: dimension_properties.serializename, datatype: dimension_properties.datatype, caption: dimension_properties.caption};

		if(dimension_properties.vizdefaults){
			//verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults = dimension_properties.vizdefaults;

			verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults = {};
			$.extend( true, verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults, dimension_properties.vizdefaults ); //first arg 'true' not required. We dont want append deep copy.
		}

		$("#" + invoked_chartID + " .baseseries_btn span.caption").html(dimension_properties.caption);
		$(document).trigger("mousedown");
		updateAllCharts(invoked_chartID);
	});



	$("#filters-container").on('click', ".filteroptionradio", function(event) { //filterboxsettingszzz

		var filtercontainerelem = $(event.target).closest(".filtercontainer");

		if (filtercontainerelem.find(".multiselect :input").attr('type') != 'radio'){

			var hiddendivelem = filtercontainerelem.find(".filternonealldiv");

			filtercontainerelem.attr('filtertype','radio');
			filtercontainerelem.find(".multiselect :input").attr('type', 'radio');
			filtercontainerelem.find('label').css('padding-left','0px');
			//if(filtercontainerelem.attr("default-filtertype") != "searchlist"){
				hiddendivelem.toggleClass('hidden', false);
				hiddendivelem.find(".multiselect :input").prop('checked',true);
			//}
			updateAllCharts();

		}

	});

	$("#filters-container").on('click', '.filteroptioncheckbox', function(event) { //filterboxsettingszzz

		var filtercontainerelem = $(event.target).closest(".filtercontainer");

		if (filtercontainerelem.find(".multiselect :input").attr('type') != 'checkbox'){

			var hiddendivelem = filtercontainerelem.find(".filternonealldiv");

			filtercontainerelem.attr('filtertype','checkbox');
			filtercontainerelem.find(".multiselect :input").attr('type', 'checkbox');
			filtercontainerelem.find('label').css('padding-left','20px');
			hiddendivelem.toggleClass('hidden', true);
			filtercontainerelem.find(".multiselect :input").toggleClass('filterserialize', false);
			filtercontainerelem.find(".multiselect :input").prop('checked',true);
			updateAllCharts();

		}
	});



	$("#filters-container").on('click', '.filteroptionhidefilter', function(event) {

				$(event.target).closest(".filterparentDOM").toggleClass('hidden', true);

				$("#hiddenfilterstext a").html('Show hidden filters (' + $(".filterparentDOM.hidden").length + ')');
				$("#hiddenfilterstext").toggleClass('hidden', false);

	});


	$("#hiddenfilterstext a").click(function(event) {

				// NOT WORKING - THIS IS FOR COLOR FADEOUT
				//alert ($(".filterparentDOM.hidden").find('.filtercontainer').length);
				//$(".filterparentDOM.hidden").find('.filtercontainer').animate({ borderTopColor: "#b5df17" }, 2000, "linear", function(){
				//    alert('asdasd'); //$(".filtercontainer").css('background-color', '');
				///});

				$(".filterparentDOM.hidden").toggleClass('hidden', false);

				$("#hiddenfilterstext").toggleClass('hidden', true);

	});


	function searchTemplates(){
		$("#div-loadmore-searchtemplate").addClass("hidden");
		$.ajax({
			type: "POST",
			url: "/analytics/template/search",
			data: $('#analytics-template-search-form').serialize(),

			success: function(msg){


					if (msg.hits.total > 0){
						$.each(msg.hits.hits, function(index, data) {
							var clone_template_result = $(".template-result").first().clone();
							clone_template_result.removeClass("hidden");
							clone_template_result.find(".stres-cap .c").html(data._source.c);
							clone_template_result.find(".stres-desc").html(data._source.d);
							clone_template_result.data("id", data._id);
							clone_template_result.data("templatedata", data._source);
							clone_template_result.find(".vtcharticon").attr("src", clone_template_result.find(".vtcharticon").attr("data-src") + data._source.t + ".png");
							if(gFavorites[data._id] != null){
								clone_template_result.find(".stres-cap").removeClass("stres-cap");
							}

							$("#template-container").append(clone_template_result);
						});

						gCurrentSearchPointer_template = msg.hits.hits.length;

						if (gCurrentSearchPointer_template < msg.hits.total){
							$("#div-loadmore-searchtemplate").removeClass("hidden");
							$("#div-loadmore-searchtemplate").attr("data-counter", 1);
						}
					}else{
						$("#template-container").append( "<div>No templates found for search criteria.</div>");
					}

			},

			error: function(err){
			}

		});
	}


	//Get favorites and display
	$("#modal-searchtemplates").on('click', '#myfavorites', function () {
		var favoriteIDs = Object.keys(gFavorites);
		$("#favorites-template-container").empty();

		$.ajax({
			type: "POST",
			url: "/analytics/template/getbyids",
			data: {favs: favoriteIDs},

			success: function(msg){

				if(msg && msg.docs && msg.docs.length > 0){
					$.each(msg.docs, function(index, data) {
							if(data.found == true){
								var clone_template_result = $(".template-result").first().clone();
								clone_template_result.removeClass("hidden");
								clone_template_result.find(".stres-cap .c").html(data._source.c);
								clone_template_result.find(".stres-desc").html(data._source.d);
								clone_template_result.find(".vtcharticon").attr("src", clone_template_result.find(".vtcharticon").attr("data-src") + data._source.t + ".png");

								//clone_template_result.find(".fa-star").removeClass("fa-star");
								//clone_template_result.find(".fa-star-o").removeClass("fa-star-o");
								//clone_template_result.find(".stres-cap").removeClass("stres-cap");
								clone_template_result.data("id", data._id);
								clone_template_result.data("templatedata", data._source);
								$("#favorites-template-container").append(clone_template_result);
							}
					});
				}
			},

			error: function(err){
			}
		});

	});

	//save favorites
	$("#modal-searchtemplates").on('click', '.template-result .fa-star-o', function () {
		$(this).closest(".stres-cap").removeClass("stres-cap");
		//$(this).removeClass("fa-star-o").addClass("fa-star");
		gFavorites[ $(this).closest(".template-result").data("id") ] = "";

		$.ajax({
			type: "POST",
			url: "/analytics/favorites/save",
			data: {favs: gFavorites},

			success: function(msg){
			},

			error: function(err){
			}
		});

	});

	//remove favorite item
	$("#modal-searchtemplates").on('click', '#favorites-template-container .fa-star', function () {
		//$(this).closest(".stres-cap").removeClass("stres-cap");
		//$(this).removeClass("fa-star-o").addClass("fa-star");
		delete gFavorites[ $(this).closest(".template-result").data("id") ];
		var tempResultElem = $(this).closest(".template-result");

		$.ajax({
			type: "POST",
			url: "/analytics/favorites/save",
			data: {favs: gFavorites},

			success: function(msg){
				if(msg=="SUCCESS"){
					tempResultElem.remove();
				}
			},

			error: function(err){
			}
		});

	});


	$("#analytics-template-search-form").submit(function(e) {
		e.preventDefault();
		$("#template-container").empty();
		searchTemplates();
	});

	$("#btnLoadMoreRecords-searchtemplate").on('click', function () {

		$("#div-loadmore-searchtemplate").addClass("hidden");
		var searchCounter = $("#div-loadmore-searchtemplate").attr("data-counter");
		if (searchCounter > 10){
				return;
		}

		$.ajax({
			type: "POST",
			url: "/analytics/template/search",
			data: $('#analytics-template-search-form').serialize() + "&from=" + searchCounter,

			success: function(msg){

				gCurrentSearchPointer_template = gCurrentSearchPointer_template + msg.hits.hits.length;

				if (msg.hits.total > 0){
					$.each(msg.hits.hits, function(index, data) {
							var clone_template_result = $(".template-result").first().clone();
							clone_template_result.removeClass("hidden");
							clone_template_result.find(".stres-cap .c").html(data._source.c);
							clone_template_result.find(".stres-desc").html(data._source.d);
							clone_template_result.find(".vtcharticon").attr("src", clone_template_result.find(".vtcharticon").attr("data-src") + data._source.t + ".png");
							if(gFavorites[data._id] != null){
								clone_template_result.find(".stres-cap").removeClass("stres-cap");
							}
							clone_template_result.data("id", data._id);
							clone_template_result.data("templatedata", data._source);
							$("#template-container").append(clone_template_result);
					});

					if (gCurrentSearchPointer_template < msg.hits.total){
							$("#div-loadmore-searchtemplate").removeClass("hidden");
							$("#div-loadmore-searchtemplate").attr("data-counter", parseInt($("#div-loadmore-searchtemplate").attr("data-counter"))+1);
					}
				}
			},

			error: function(err){
			}
		});

	});


	$("#search-templates").on('click', function () {
		$(this).blur();
		$('#modal-searchtemplates').modal('show');
	});


	$(".open-dimension-colors").on('click', function () {
		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var dimension_index = $('#modal-vizsettings li.mvliselect').data("dimension_index");
		var dimension_object = verioChartObj[invoked_chartID].properties.yseries[dimension_index];
		
		$(this).blur();
		$("#tableDimensionColorsLevels tbody .filexprow").remove();
		$("#ul-dimensionmarkers input[type=checkbox]").prop('checked',false);
		$("#ul-dimensionmarkers input[type=text]").slice(2).val("#30B322").css("background-color", "#30B322").css("color","black");//exclude first 2...color max and color min because bgcolor is set...
		
		

		if(dimension_object.colorlevels != null){
				for(var levelsIndex in dimension_object.colorlevels){

					$("#add-dimension-colors-levels").trigger("click");
					var CL = dimension_object.colorlevels[levelsIndex];
					var trElem = $("#tableDimensionColorsLevels tbody tr").last();
										
					trElem.find(".dimcoloroperator").val(CL.Operator);
					trElem.find(".dimcolormetric").val(CL.Metric);
					trElem.find(".dimcolormetricvalue").val(CL.Value);
					trElem.find(".dimcolorvalue").val(CL.Color);
					trElem.find(".dimcolorvalue").css("background-color", CL.Color);
					trElem.find(".dimcolorvalue").css("color", isColorDark(trElem.find(".dimcolorvalue").css("background-color")) ? 'white' : 'black');

					if(CL.Metric == "value" || CL.Metric == "percent"){
						trElem.find(".dimcolormetricvalue").removeClass("hidden");
					}else{
						trElem.find(".dimcolormetricvalue").addClass("hidden");
					}
				}
		}

		if(dimension_object.markers != null){
			for(var markerIndex in dimension_object.markers){
				$("#ul-dimensionmarkers #" + markerIndex).prop('checked', dimension_object.markers[markerIndex].status=="visible" ? true : false);
				var tempinpcolorelem = $("#ul-dimensionmarkers #" + markerIndex).closest("li").find(".inp-color");
				tempinpcolorelem.val(dimension_object.markers[markerIndex].color).css("background-color", dimension_object.markers[markerIndex].color);
				tempinpcolorelem.css("color", tempinpcolorelem.css("background-color") ? 'white' : 'black');
			}
		}
		
		jscolor.init();
		//$("#add-dimension-colors-levels").trigger("click");
		$('#modal-dimensioncolors').modal('show');
	});


	
	$("#tableDimensionColorsLevels").on('click', ".dimcolorvalue", function () {
		//$(this).color.showPicker();
	});
	
	$("#tableDimensionColorsLevels").on('click', ".dimcolorleveldelete", function () {
		var trElem = $(this).closest("tr");
		trElem.remove();
	});


	$("#add-dimension-colors-levels").on('click', function () {
		var cloneTR = $("#tableDimensionColorsLevels tbody .templaterow").clone(true);
		cloneTR.removeClass("templaterow");
		cloneTR.removeClass("hidden");
		cloneTR.addClass("filexprow");
		$("#tableDimensionColorsLevels tbody").append(cloneTR);
		jscolor.init();
	});

	$("#tableDimensionColorsLevels").on('change', ".dimcolormetric", function () {
		var trElem = $(this).closest("tr");
		if($(this).val() == "value" || $(this).val() == "percent"){
			trElem.find(".dimcolormetricvalue").removeClass("hidden");
		}else{
			trElem.find(".dimcolormetricvalue").addClass("hidden");
		}
	});
	
	$("#save-dimension-colors").on('click', function () {
		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var dimension_index = $('#modal-vizsettings li.mvliselect').data("dimension_index");
		var dimension_object = verioChartObj[invoked_chartID].properties.yseries[dimension_index];

		var colorLevelsData = [];

		$("#tableDimensionColorsLevels tbody .filexprow").each(function( index ) {
			if($(this).find(".dimcoloroperator").val() != "" || $(this).find(".dimcolormetric").val() != ""){
				if($(this).find(".filexpdimen").find("option:selected").val() != "none"){
					colorLevelsData.push({
						Operator: $(this).find(".dimcoloroperator").val(), 
						Metric: $(this).find(".dimcolormetric").val(),
						Value: $(this).find(".dimcolormetricvalue").val(),
						Color: $(this).find(".dimcolorvalue").val()
					});
				}
			}
		});

		if(colorLevelsData.length > 0){
			dimension_object["colorlevels"] = colorLevelsData;
		}else{
			dimension_object["colorlevels"] = [];
		}
		
		var markersData = {};
		$("#ul-dimensionmarkers input").each(function( index ) {
			markersData[$(this).attr("id")] = {color: $(this).closest("li").find(".inp-color").val(), status : ($(this).is(':checked') ? "visible" : "hidden")};
		});

		dimension_object["markers"] = markersData;

		updateAllCharts(invoked_chartID);

		$('#modal-dimensioncolors').modal('hide');		
	});




	$(".open-filter-expressions").on('click', function () {
		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var dimension_index = $('#modal-vizsettings li.mvliselect').data("dimension_index");
		var dimension_object = verioChartObj[invoked_chartID].properties.yseries[dimension_index];

		var numeric = { 'eq': 'Equal to', 'neq': 'Not equal', 'gt': 'Greater than', 'lt': 'Lesser than', 'gte': 'Greater or equal', 'lte': 'Lesser or equal' };
		var date = { 'eq': 'Equal to', 'neq': 'Not equal', 'gt': 'Greater than', 'lt': 'Lesser than', 'gte': 'Greater or equal', 'lte': 'Lesser or equal' };
		var string = { 'eq': 'Equal to', 'neq': 'Not equal' };

		$(this).blur();
		$("#tableFilterExpressions tbody .filexprow").remove();

		for(var filexpIndex in dimension_object.expression){
			$("#add-filter-expressions").trigger("click");
			var fe = dimension_object.expression[filexpIndex];
			var trElem = $("#tableFilterExpressions tbody tr").last();

			trElem.find(".filexpdimen").val(fe.Dimension);

			trElem.find(".filexpvalue").addClass("hidden");
			trElem.find(".filexpvalueselect").addClass("hidden");

			var selSerializename = trElem.find(".filexpdimen option:selected").data("property").serializename;
			var selDataType = trElem.find(".filexpdimen option:selected").data("property").datatype;
			var selType = trElem.find(".filexpdimen option:selected").data("property").type;

			if(selDataType == "numeric"){
				trElem.find(".filexpvalue").removeClass("hidden");
				trElem.find(".filexpvalue").attr("oninput", "this.value = this.value.replace(/[^0-9.]/g, '');");
				for(var keyname in numeric){
					var optElem = $('<option />', {value: keyname , html: numeric[keyname]});
					trElem.find(".filexpoperator").append(optElem);
				}
				trElem.find(".filexpoperator").val(fe.Operator);
				trElem.find(".filexpvalue").val(fe.Value);
			}else if(selDataType=="date"){
				trElem.find(".filexpvalue").removeClass("hidden");
				trElem.find(".filexpvalue").attr("type", "date");
				for(var keyname in date){
					var optElem = $('<option />', {value: keyname , html: date[keyname]});
					trElem.find(".filexpoperator").append(optElem);
				}
				trElem.find(".filexpoperator").val(fe.Operator);
				trElem.find(".filexpvalue").val(fe.Value);
			}else{
				for(var keyname in string){
					var optElem = $('<option />', {value: keyname , html: string[keyname]});
					trElem.find(".filexpoperator").append(optElem);
				}
				trElem.find(".filexpoperator").val(fe.Operator);

				if(selType == "searchlist"){
					trElem.find(".filexpvalue").removeClass("hidden");
					trElem.find(".filexpvalue").val(fe.Value);
				}else{
					trElem.find(".filexpvalueselect").removeClass("hidden");
					var optFirstElem = $('<option />', {disabled: true , selected: true, value: '', html: 'Select value'});
					trElem.find(".filexpvalueselect").append(optFirstElem);
					for(var listIndex in gFilters[selSerializename].listvalues){
						var listItem = gFilters[selSerializename].listvalues[listIndex];
						var optElem = $('<option />', {value: listItem.code , html: listItem.item});
						trElem.find(".filexpvalueselect").append(optElem);
					}
					trElem.find(".filexpvalueselect").val(fe.Value);
				}
			}


		}

		$("#add-filter-expressions").trigger("click");

		var ctrlOptions = {'optselect': 'Select'};
		for(var filterKey in gFilters){
			ctrlOptions[filterKey] = gFilters[filterKey].title;
		}

		$('#modal-filterexpressions').modal('show');
	});


    var previous_filexpdimen;
    $("#tableFilterExpressions").on("focus", ".filexpdimen", function () {
        previous_filexpdimen = this.value;
    });

    $("#tableFilterExpressions").on("change", ".filexpdimen", function () {
        if(previous_filexpdimen == "none"){
			var lastTRVal = $("#tableFilterExpressions tbody tr").last().find(".filexpdimen").val();
			if(lastTRVal && lastTRVal != "none"){
				$("#add-filter-expressions").trigger("click");
			}
		}
        previous_filexpdimen = this.value;
    });

    $("#tableFilterExpressions").on("blur", ".filexpdimen", function () {
		previous_filexpdimen = "";
	});



	$("#tableFilterExpressions").on('change', ".filexpdimen", function () {
		var numeric = { 'eq': 'Equal to', 'neq': 'Not equal', 'gt': 'Greater than', 'lt': 'Lesser than', 'gte': 'Greater or equal', 'lte': 'Lesser or equal' };
		var date = { 'eq': 'Equal to', 'neq': 'Not equal', 'gt': 'Greater than', 'lt': 'Lesser than', 'gte': 'Greater or equal', 'lte': 'Lesser or equal' };
		var string = { 'eq': 'Equal to', 'neq': 'Not equal' };

		var trElem = $(this).closest("tr");
		var selSerializename = $(this).find("option:selected").data("property").serializename;
		var selDataType = $(this).find("option:selected").data("property").datatype;
		var selType = $(this).find("option:selected").data("property").type;

		trElem.find(".filexpvalue").val("");
		trElem.find(".filexpvalue").removeAttr("oninput");
		trElem.find(".filexpvalue").attr("type", "text");
		trElem.find(".filexpvalueselect").empty();
		trElem.find(".filexpvalue").addClass("hidden");
		trElem.find(".filexpvalueselect").addClass("hidden");

		trElem.find(".filexpoperator").empty();
		if(selDataType == "numeric"){
			trElem.find(".filexpvalue").removeClass("hidden");
			trElem.find(".filexpvalue").attr("oninput", "this.value = this.value.replace(/[^0-9.]/g, '');");
			for(var keyname in numeric){
				var optElem = $('<option />', {value: keyname , html: numeric[keyname]});
				trElem.find(".filexpoperator").append(optElem);
			}
		}else if(selDataType=="date"){
			trElem.find(".filexpvalue").removeClass("hidden");
			trElem.find(".filexpvalue").attr("type", "date");
			for(var keyname in date){
				var optElem = $('<option />', {value: keyname , html: date[keyname]});
				trElem.find(".filexpoperator").append(optElem);
			}
		}else{
			for(var keyname in string){
				var optElem = $('<option />', {value: keyname , html: string[keyname]});
				trElem.find(".filexpoperator").append(optElem);
			}
			if(selType == "searchlist"){
				trElem.find(".filexpvalue").removeClass("hidden");
			}else{
				trElem.find(".filexpvalueselect").removeClass("hidden");
				var optFirstElem = $('<option />', {disabled: true , selected: true, value: '', html: 'Select value'});
				trElem.find(".filexpvalueselect").append(optFirstElem);
				for(var listIndex in gFilters[selSerializename].listvalues){
					var listItem = gFilters[selSerializename].listvalues[listIndex];
					var optElem = $('<option />', {value: listItem.code , html: listItem.item});
					trElem.find(".filexpvalueselect").append(optElem);
				}
			}
		}
	});


	$("#tableFilterExpressions").on('click', ".filexpdelete", function () {
		var trElem = $(this).closest("tr");
		trElem.remove();
	});


	$("#add-filter-expressions").on('click', function () {
		var cloneTR = $("#tableFilterExpressions tbody .templaterow").clone(true);
		cloneTR.removeClass("templaterow");
		cloneTR.removeClass("hidden");
		cloneTR.addClass("filexprow");
		$("#tableFilterExpressions tbody").append(cloneTR);
	});


	$("#save-filter-expressions").on('click', function () {
		var invoked_chartID = $('#modal-vizsettings').data('invokedchart');
		var dimension_index = $('#modal-vizsettings li.mvliselect').data("dimension_index");
		var dimension_object = verioChartObj[invoked_chartID].properties.yseries[dimension_index];

		var filterData = [];

		$("#tableFilterExpressions tbody .filexprow").each(function( index ) {
			if($(this).find(".filexpvalue").val() != "" || $(this).find(".filexpvalueselect").val() != ""){
				//alert($(this).find(".filexpvalueselect").val());
				if($(this).find(".filexpdimen").find("option:selected").val() != "none"){
					filterData.push({Dimension: $(this).find(".filexpdimen").val(), Datatype: $(this).find(".filexpdimen").find("option:selected").data("property").datatype, Operator: $(this).find(".filexpoperator").val(), Value: $(this).find(".filexpvalue").val() || $(this).find(".filexpvalueselect").val() })
				}
			}
		});


/*
		var nested = { obr: [] };

		var andArray = [];
		for(var filterIndex in filterData){
			var filter = filterData[filterIndex];
			if(filter.Operator == "eq"){ //Dimension Operator Value
				var jsonFilterExpression = {"term": {}};
				jsonFilterExpression["term"][filter.Dimension] = filter.Value;
				if(gFilters[filter.Dimension].datatype == "date"){
					jsonFilterExpression["term"][filter.Dimension] = moment(filter.Value, "YYYY-MM-DD").valueOf();
				}
				if(gFilters[filter.Dimension].settings.nested){
					nested.obr.push(jsonFilterExpression);
				}else{
					andArray.push(jsonFilterExpression);
				}
			}else if(["gt", "lt", "gte", "lte"].indexOf(filter.Operator) > -1){
				var jsonFilterExpression = {"range": {}};
				jsonFilterExpression["range"][filter.Dimension] = {};
				jsonFilterExpression["range"][filter.Dimension][filter.Operator] = filter.Value;
				if(gFilters[filter.Dimension].datatype == "date"){
					jsonFilterExpression["range"][filter.Dimension][filter.Operator] = moment(filter.Value, "YYYY-MM-DD").valueOf();
				}
				if(gFilters[filter.Dimension].settings.nested){
					nested.obr.push(jsonFilterExpression);
				}else{
					andArray.push(jsonFilterExpression);
				}
			}else if(filter.Operator == "neq"){
				var jsonFilterExpression = {"term": {}};
				jsonFilterExpression["term"][filter.Dimension] = filter.Value;
				if(gFilters[filter.Dimension].datatype == "date"){
					jsonFilterExpression["term"][filter.Dimension] = moment(filter.Value, "YYYY-MM-DD").valueOf();
				}

				if(gFilters[filter.Dimension].settings.nested){
					nested.obr.push({ "not" : { "filter" : jsonFilterExpression } });
				}else{
					andArray.push({ "not" : { "filter" : jsonFilterExpression } });
				}
			}
		}


		if(nested.obr.length > 0){
			andArray.push({
						"nested" : {
							"path" : "obr",
							"filter" : {
								"bool" : {
									"must" : nested.obr
								}
							},
							"_cache" : true
						}
				});
		}

*/

		if(filterData.length > 0){
			dimension_object["expression"] = filterData;
			//dimension_object["expression_optimized"] = {"and" : andArray};
		}else{
			dimension_object["expression"] = [];
			//dimension_object["expression_optimized"] = null;
		}

		if(dimension_object.expression && dimension_object.expression.length > 0){
			$('#modal-vizsettings').find("a.open-filter-expressions").html(dimension_object.expression.length + " filter(s) applied");
		}else{
			$('#modal-vizsettings').find("a.open-filter-expressions").html("Click here to add filters");
		}

		updateAllCharts(invoked_chartID);

		$('#modal-filterexpressions').modal('hide');
	});



	$("#dashboard-chartarea").on('click', '.chartboxreleasedrilldown', function () {
		gDrillDownFlyFilters.filters = {};
		$(".chartboxreleasedrilldown").addClass("hidden");
		$(".chartbox").css("background-color", "");
		$(".chartbox").removeClass("nv-elems-opaque");
		$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
		d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
		updateAllCharts();
	});



	$("#modal-searchtemplates").on('click', '.addtemplatedashboard', function () {
		$(this).blur();
		var viztype = $(this).closest('.template-result').data("templatedata").t;
		var templateSetupProperty = $(this).closest('.template-result').data("templatedata").p.chart; //JSON Obj
		var ySeriesArray = $(this).closest('.template-result').data("templatedata").p.yseries; //Array

		/*
		templateSetupProperty = 				{	charttype: "bar",
											chartcaption: "New Super chart",
											chartposition: {pos: 0, width: 100, height: 100},
											chartoptions: {xaxis: true, yaxis: true, legend: true},
											xseries: [
												{
													"caption" : "Order Date",
													"datatype" : "date",
													"field" : "coll"
												}
											],
										};

		ySeriesArray = [
				{
					"charttype" : "bar",
					"color" : gColors[0],
					"label" : "",
					"aggregation" : "value_count",
					"caption" : "Order Date",
					"datatype" : "date",
					"field" : "coll",
					"expression" : null,
				}
			],
		*/


		templateSetupProperty.yseries = {};
		for (var yIndex in ySeriesArray){
			var new_ySeriesIndex = "yr" + Math.random().toString(36).substr(2);
			templateSetupProperty.yseries[new_ySeriesIndex] = ySeriesArray[yIndex];
			templateSetupProperty.yseries[new_ySeriesIndex].id = new_ySeriesIndex;
		}

		addVizChart(viztype, templateSetupProperty);
	});


/*

//Load Analytics templates

	$.each(gTemplatesAnal, function( index, value ) {

		$.ajax({
			type: "POST",
			url: "/analytics/addTemplate",
			data: {template: value, version: "1"},

			success: function(msg){
				if(msg=="SUCCESS"){
					//alert("success");
				}else{
					//alert("failure");
				}
			},

			error: function(){
				alert("Unable to connect to server or request timed out.");
			}

		});

	});

*/

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};



	$("#jstring").remove();


}); //END PAGE LOAD FUNCTION



String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


$.fn.hasScrollBar = function() {
		return this.get(0) ? this.get(0).scrollHeight > this.innerHeight() : false;
}



$.fn.verioSpecialSerializeObject = function()
{
				var o = {};
				var disabled = this.find(':input:disabled').removeAttr('disabled'); //remove disabled
				var a = this.serializeArray();
				disabled.attr('disabled','true'); //set disabled again
				$.each(a, function() {

							if(this.name.endsWith("_lower") == true){
								var parsedname = this.name.replace("_lower","");
								if (!o[parsedname]) {
									o[parsedname] = {};
								}
								o[parsedname].lower = this.value;
							}else if(this.name.endsWith("_upper") == true){
								var parsedname = this.name.replace("_upper","");
								if (!o[parsedname]) {
									o[parsedname] = {};
								}
								o[parsedname].upper = this.value;
							}else{
								if (!o[this.name]) {
									o[this.name] = [];
								}

								o[this.name].push(this.value || '');
							}

				});

				return o;
};



$.fn.verioFilterDataSerializeObject = function()
{
		var o = {};

		$( ".filtercontainer" ).each(function( index ) {
			var dft = $(this).attr("default-filtertype");
			var ft = $(this).attr("filtertype");
			if(dft == "checkbox" || dft == "radio"){
				if(dft != ft){
					o[$(this).attr("serializename")] = {filtertype: $(this).attr("filtertype")};
				}
			}
		});

		var disabled = this.find(':input:disabled').removeAttr('disabled'); //remove disabled
		var a = this.serializeArray();
		disabled.attr('disabled','true'); //set disabled again
		$.each(a, function() {
				this_name_dot_replaced = this.name.replace(/\./g, "^"); //mongodb does not allow key names with period or dollar! hell mongo

				if(this.name.endsWith("_lower") == true){
					var parsedname = this.name.replace("_lower","");			
					if (!o[parsedname]) {
						o[parsedname] = {};
					}
					o[parsedname].lower = this.value;

					var forcedSliderMin = $("#filter_" + gFilters[parsedname].name).data("forcedSliderMin");
					if(forcedSliderMin != null){
						o[parsedname].forcedSliderMin = forcedSliderMin;
					}
				}else if(this.name.endsWith("_upper") == true){
					var parsedname = this.name.replace("_upper","");
					if (!o[parsedname]) {
						o[parsedname] = {};
					}
					o[parsedname].upper = this.value;

					var forcedSliderMax = $("#filter_" + gFilters[parsedname].name).data("forcedSliderMax");
					if(forcedSliderMax != null){
						o[parsedname].forcedSliderMax = forcedSliderMax;
					}					
				}else{
					if (!o[this_name_dot_replaced] || o[this_name_dot_replaced].hasOwnProperty('values') == false) {
						o[this_name_dot_replaced] = {values: [], filtertype: $("[name='" + this.name + "']").attr("type") , filtercaption: ""};
					}

					var datalisttype = ($("[serializename='" + this.name + "']").find("[value='" + this.value + "']").attr("data-list-type"));
					if(datalisttype == "search"){
						o[this_name_dot_replaced].values.push({val: this.value || '', title: $("[serializename='" + this.name + "']").find("[value='" + this.value + "']").next().html()});
					}else{
						o[this_name_dot_replaced].values.push(this.value || '');
					}
				}

		});

		return o;
};



	//PROD
	function showChartDescription_NOT_IN_USE(){
		if($("#chart-description").hasClass("hidden")){
			$("#dashboard-chartarea").css("margin-top", 80); //original is 20px, increase to 80px
			$("#chart-description").css("width", gContainerDimensions.width);
			$("#chart-description").removeClass("hidden");
			gContainerDimensions.height = gContainerDimensions.height - 60;
			$(window).trigger('resize');
		}else{
			$("#dashboard-chartarea").css("margin-top", 20); //original is 20px, so descrease to 20px
			$("#chart-description").addClass("hidden");
			gContainerDimensions.height = gContainerDimensions.height + 60;
			$(window).trigger('resize');
		}
	}


	//PROD
	function maximizeAllCharts(){
		var maxCharts = gTabMasterData.maxCharts || false;
		maxCharts = !maxCharts; //flip the boolean
		gTabMasterData.maxCharts = maxCharts;
		$("#dashboard-chartarea .chartbox .mychart").toggleClass("maximize-chartbox", maxCharts);
		$("#dashboard-chartarea .chartbox .mychart").toggleClass("nvd3-nolegend", maxCharts);
		$("#dashboard-chartarea .chartbox .nv-template-header").toggleClass("hidden", maxCharts);
		$("#dashboard-chartarea .chartbox .nv-template-header").next("hr").toggleClass("hidden", maxCharts);
		$("#dashboard-chartarea .chartbox .baseseries").toggleClass("hidden", maxCharts); //true value means visible
		$("#dashboard-chartarea .chartbox .dimensionseries").toggleClass("hidden", maxCharts); //true value means visible
		$("body").redrawAllVCCharts();
	}


	//PROD
	function filterExpressionsGenerator(filterData, field_serializename){

		var nested = { obr: [] };

		var andArray = [];

		//special cases to deal with null values in coll and res date fields when order is not collected or resulted....
		if(field_serializename == "coll" || field_serializename == "res"){
			//andArray.push({ "exists" : { "field" : field_serializename } });
		}

		//
		for(var filterIndex in filterData){
			var filter = filterData[filterIndex];
			if(filter.Operator == "eq"){ //Dimension Operator Value
				var jsonFilterExpression = {"term": {}};
				jsonFilterExpression["term"][(gFilters[filter.Dimension].settings.nested ? "" : "") + filter.Dimension] = filter.Value;
				if(gFilters[filter.Dimension].datatype == "date"){
					jsonFilterExpression["term"][(gFilters[filter.Dimension].settings.nested ? "" : "") + filter.Dimension] = moment(filter.Value, "YYYY-MM-DD").valueOf();
				}

				andArray.push(jsonFilterExpression);

				/*if(gFilters[filter.Dimension].settings.nested){
					nested.obr.push(jsonFilterExpression);
				}else{
					andArray.push(jsonFilterExpression);
				}*/
			}else if(["gt", "lt", "gte", "lte"].indexOf(filter.Operator) > -1){
				var jsonFilterExpression = {"range": {}};
				jsonFilterExpression["range"][(gFilters[filter.Dimension].settings.nested ? "" : "") + filter.Dimension] = {};
				jsonFilterExpression["range"][(gFilters[filter.Dimension].settings.nested ? "" : "") + filter.Dimension][filter.Operator] = filter.Value;
				if(gFilters[filter.Dimension].datatype == "date"){
					jsonFilterExpression["range"][(gFilters[filter.Dimension].settings.nested ? "" : "") + filter.Dimension][filter.Operator] = moment(filter.Value, "YYYY-MM-DD").valueOf();
				}

				andArray.push(jsonFilterExpression);

				/*
				if(gFilters[filter.Dimension].settings.nested){
					nested.obr.push(jsonFilterExpression);
				}else{
					andArray.push(jsonFilterExpression);
				}*/
			}else if(filter.Operator == "neq"){
				var jsonFilterExpression = {"term": {}};
				jsonFilterExpression["term"][(gFilters[filter.Dimension].settings.nested ? "" : "") + filter.Dimension] = filter.Value;
				if(gFilters[filter.Dimension].datatype == "date"){
					jsonFilterExpression["term"][(gFilters[filter.Dimension].settings.nested ? "" : "") + filter.Dimension] = moment(filter.Value, "YYYY-MM-DD").valueOf();
				}

				andArray.push({ "not" : { "filter" : jsonFilterExpression } });

				/*if(gFilters[filter.Dimension].settings.nested){
					nested.obr.push({ "not" : { "filter" : jsonFilterExpression } });
				}else{
					andArray.push({ "not" : { "filter" : jsonFilterExpression } });
				}*/
			}
		}


		if(nested.obr.length > 0){
			andArray.push({
						"nested" : {
							"path" : "obr",
							"filter" : {
								"bool" : {
									"must" : nested.obr
								}
							},
							//-apcheck "_cache" : true
						}
				});
		}


		if(andArray.length > 0){
			//dimension_object["expression"] = filterData;
			//dimension_object["expression_optimized"] = {"and" : andArray};
			return {"and" : andArray};
		}else{
			//dimension_object["expression"] = null;
			//dimension_object["expression_optimized"] = null;
			return null;
		}

		return null;
	}


	//PROD
	function xRefFilterCode2ListValue(serializename, code){
		if(gFilters[serializename]["xreflistvalues"]){
			return gFilters[serializename]["xreflistvalues"][code];
		}else{
			return null;
		}
	}

	function xRefListValue2FilterCode(serializename, listvalue){
		if(gFilters[serializename]["xreffiltercodes"]){
			return gFilters[serializename]["xreffiltercodes"][listvalue] || listvalue;
		}else{
			return listvalue;
		}
	}


	//PROD
	function updateAllCharts(chartIDToUpdate){
			
			if(gOnLoadComplete == true){
				$(".saveDashboard i").css("color", "red");
			}

			var serializeFilterObj = $('#olap-panel .filterserialize').verioSpecialSerializeObject();

			if(gMode == "View only" || gMode == "View and Copy"){
				serializeFilterObj = gTabData.filterData;
			}

			var totalFiltersApplied = Object.keys(serializeFilterObj).length;
			if(totalFiltersApplied > 0){
				$("#filtermenu-header").css("color", "#EA2626");
				$("#filtermenu-header #lfc").html(" Filter Menu (" + totalFiltersApplied + ")");
			}else{
				$("#filtermenu-header").css("color", "");
				$("#filtermenu-header #lfc").html(" Filter Menu");
			}

			//console.log(serializeFilterObj);

			var filterObj = {};
			filterObj.datatable = [];
			filterObj.filters = [];
			filterObj.visualizations = [];
			

			var nested = { obr: [] };

			$(".filtercaption").css("color", "");

			//var gDrillDownFlyFilters = {filters:{}, chartInitiator: null};

			if(gDrillDownFlyFilters.filters != null && Object.keys(gDrillDownFlyFilters.filters).length>0){
				$.extend( true, serializeFilterObj, gDrillDownFlyFilters.filters )
			}

			//console.log(JSON.stringify(serializeFilterObj));


			for (var itemKey in serializeFilterObj){
				var filteritem = serializeFilterObj[itemKey];
				$("#filter_" + gFilters[itemKey].name).find(".filtercaption").css("color", "#EA2626");

				if($.isArray(filteritem) == true) {
					//radio or checkbox
					var terms = {"_cache":"true", "execution":"or"};
					if(typeof filteritem[0] == 'object'){ // from drilldown filter
						var boolQuery = { "bool": {"should": []}};

						for(var filterIndex in filteritem){
							var rangequery = {"_cache": true};
							rangequery[itemKey] = {
										"gte": filteritem[filterIndex].lower,
										"lt": filteritem[filterIndex].upper,
									};
							boolQuery.bool.should.push({range: rangequery});
						}

						if(gFilters[itemKey].settings.nested){
							//nested.obr.push({range: rangequery});
							//console.log("todo");
						}else{
							filterObj.filters.push(boolQuery);
						}

					}else{
						terms[itemKey] = filteritem;

						if(gFilters[itemKey].settings.nested){
							nested.obr.push({"terms":terms});
						}else{
							filterObj.filters.push({"terms":terms});
						}
					}
				}else if(typeof filteritem =='object'){
					//range slider
					var rangequery = {"_cache": true};
					rangequery[itemKey] = {
								"gte": filteritem.lower,
								"lte": filteritem.upper,
							};
					if(gFilters[itemKey].settings.nested){
						nested.obr.push({range: rangequery});
					}else{
						filterObj.filters.push({range: rangequery});
					}
				}else{
					//plain string
					var termquery = {"_cache": true, term : {}};
					termquery.term[itemKey] = filteritem;
					if(gFilters[itemKey].settings.nested){
						nested.obr.push(termquery);
					}else{
						filterObj.filters.push(termquery);
					}
				}
			}

			if(nested.obr.length > 0){
				filterObj.filters.push({
							"nested" : {
								"path" : "obr",
								"filter" : {
									"bool" : {
										"must" : nested.obr
									}
								},
								//-apcheck "_cache" : true
							}
					});
			}



			if(chartIDToUpdate){
				chartElemToUpdate = $( "#dashboard-chartarea #" + chartIDToUpdate + ".chartbox");
			}else{
				if(gDrillDownFlyFilters.filters != null && Object.keys(gDrillDownFlyFilters.filters).length>0){
					//update all except the initiator
					chartElemToUpdate = $( "#dashboard-chartarea .chartbox:not(#" + gDrillDownFlyFilters.chartInitiator + ")");
				}else{
					chartElemToUpdate = $( "#dashboard-chartarea .chartbox" );
				}
			}


			//start of each chart visualization
			chartElemToUpdate.each(function( index ) {
				var chartID = $( this ).attr("chartid");
				var chartProperties = verioChartObj[chartID].properties;
				if (chartProperties.xseries.length == 0 || Object.keys(chartProperties.yseries).length == 0){
					$("#dashboard-chartarea #" + chartID).updateVCChartData([], verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
					return true;
				}

				var yseries_aggs = {aggs: {}};
				var yseries_secondary_aggs = {}; //when more than 1 yseries, then 2nd to last series will be children of 1st series nestedout
				var firstYseriesOBJ = null;

				var iterationCount = 0;
				var sortPath = null;

				for (var yseriesIndex in verioChartObj[chartID].properties.yseries){
					var yseriesItem = verioChartObj[chartID].properties.yseries[yseriesIndex];

					/*
					if(gFilters[chartProperties.xseries[0].field].settings.nested){
						yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = {
							 "reverse_nested": {},
							 "aggs": {
								"innernestout": {

								}
							}
						};
					}else{
						yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = {
							"filter": {
								"match_all": {}
							 },
							 "aggs": {
								"innernestout": {

								}
							}
						};
					}
					*/

					yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = {}


					if( (yseriesItem.expression && yseriesItem.expression != null && yseriesItem.expression.length > 0) || (false && yseriesItem.field == "coll" || yseriesItem.field == "res") ){
						yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = { "filter": filterExpressionsGenerator(yseriesItem.expression, yseriesItem.field), "aggs": {} };
					}else{
						yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = { "filter": {"match_all": {}}, "aggs": {} };
					}


					var temp = {};
					if(chartProperties.charttype == "boxplot"){
						temp["extended_stats"] = { "field": (gFilters[yseriesItem.field].settings.nested ? "" : "") + yseriesItem.field};						
						yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field]["aggs"][yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = temp;
						var temp2 = {};
						temp2["percentiles"] = { "field": (gFilters[yseriesItem.field].settings.nested ? "" : "") + yseriesItem.field};		
						yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field]["aggs"][yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field + "_percentiles" ] = temp2;
					}else{
						temp[convertAggregationTermtoMasterKey(yseriesItem.aggregation)] = { "field": (gFilters[yseriesItem.field].settings.nested ? "" : "") + yseriesItem.field};						
						yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field]["aggs"][yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = temp;
					}

					
					if(chartProperties.xseries[0].vizdefaults && chartProperties.xseries[0].vizdefaults.forecast && chartProperties.xseries[0].vizdefaults.forecast != 0){
						var forecastPeriod = 7; //7 instead of 5 because 2 x-axis is shifted left when rendering plot
						forecastPeriod = chartProperties.xseries[0].vizdefaults.forecast == 1 ? 7 :
										chartProperties.xseries[0].vizdefaults.forecast == 2 ? 12 : //12 instead of 10 because 2 x-axis is shifted left when rendering plot
										forecastPeriod;
						
						yseries_aggs.aggs["forecast_expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = {
							  "moving_avg": {
									"buckets_path": "expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field + ">" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field,
									"window": parseInt(chartProperties.xseries[0].vizdefaults.forecastfitparam) || 10,
									"predict": forecastPeriod,
									"model": "holt_winters",
									"minimize": true,
									"settings" : {
											"type" : "mult",
											"alpha" : 0.4,
											"beta" : 0.1,
											"gamma" : 0.5,
											//"period" : 2
											//"alpha" : parseFloat(chartProperties.xseries[0].vizdefaults.forecastfitparam) || 0.7
									}
								}
						}
					}

					//in android above statement's right side assignment with dynamic key in square bracket does NOT work!
					/*
					var temp = {}; //
					if(gFilters[chartProperties.xseries[0].field].settings.nested){
						if(gFilters[yseriesItem.field].settings.nested){
							temp = { "nested": { "path": gFilters[yseriesItem.field].settings.nested }, "aggs": { "nestout": {} } };
							temp["aggs"]["nestout"][convertAggregationTermtoMasterKey(yseriesItem.aggregation)] = { "field": yseriesItem.field};
						}else{
							temp = { "reverse_nested": {}, "aggs": { "nestout": {} } };
							temp["aggs"]["nestout"][convertAggregationTermtoMasterKey(yseriesItem.aggregation)] = { "field": yseriesItem.field};
						}
					}else{
						if(gFilters[yseriesItem.field].settings.nested){
							temp = { "nested": { "path": gFilters[yseriesItem.field].settings.nested }, "aggs": { "nestout": {} } };
							temp["aggs"]["nestout"][convertAggregationTermtoMasterKey(yseriesItem.aggregation)] = { "field": yseriesItem.field};
						}else{
							temp = { "filter": {"match_all": {}}, "aggs": { "nestout": {} } };
							temp["aggs"]["nestout"][convertAggregationTermtoMasterKey(yseriesItem.aggregation)] = { "field": yseriesItem.field};
						}
					}


					yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field]["aggs"]["innernestout"]["aggs"][yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = temp;

					*/



					if(iterationCount == 0){

						sortPath = "expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field +
									">" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field

						if(chartProperties.charttype == "boxplot"){
							sortPath = sortPath + "." + "avg";
						}else if(yseriesItem.aggregation == "std_deviation" || yseriesItem.aggregation == "variance"){
							sortPath = sortPath + "." + yseriesItem.aggregation;
						}else{
							sortPath = sortPath + "." + "value";
						}

						firstYseriesOBJ = {yseriesIndex: yseriesIndex, yseriesItem: yseriesItem};

					}else{
						/*
						yseries_secondary_aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field];


						yseries_aggs.aggs["expfilter_" + firstYseriesOBJ.yseriesIndex + "_" + firstYseriesOBJ.yseriesItem.aggregation + "_" + firstYseriesOBJ.yseriesItem.field]["aggs"]["innernestout"]["aggs"][firstYseriesOBJ.yseriesIndex + "_" + firstYseriesOBJ.yseriesItem.aggregation + "_" + firstYseriesOBJ.yseriesItem.field]["aggs"]["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] =
								yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field];

						delete yseries_aggs.aggs["expfilter_" + yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field];
						*/

					}

					iterationCount++;

				}


				//start of beginning of root viz for the chart
				var chartagg = { "aggs" : {} };

				if(chartProperties.charttype == "dhheat"){
						chartagg.aggs[chartID] = {
													"terms" : {
														"field" : "" + "day", //Force filed to be nested in OBR...hardcoded to OBR. +
													},
													"aggs" : {
														"hours": {
															 "terms": {
																"field": "" + "hr", //Force filed to be nested in OBR...hardcoded to OBR. +
																"size": 24
															 },
															 "aggs": yseries_aggs.aggs
														}
													}
													//"aggs": yseries_aggs.aggs
												};
				}else if(chartProperties.charttype == "funnel"){
						chartagg.aggs[chartID] = {
													"filter": {
														"match_all": {}
													},
													"aggs": yseries_aggs.aggs
												};
				}else if(chartProperties.charttype == "textarea"){
					//do nothing
				}else if(chartProperties.charttype == "datatable"){
					filterObj.datatable.push({chartID: chartID, sort: null, search: null, filters: null});
				}else{
					var temp_xSeries_Settings = gFilters[chartProperties.xseries[0].field].settings;

					var tempOrder = {};
					if(chartProperties.xseries[0].vizdefaults && chartProperties.xseries[0].vizdefaults.order && iterationCount==1){
						tempOrder[sortPath] = chartProperties.xseries[0].vizdefaults.order == 0 ? "desc" :
									chartProperties.xseries[0].vizdefaults.order == 1 ? "asc" :
									null;
					}else if(chartProperties.xseries[0].vizdefaults && chartProperties.xseries[0].vizdefaults.order && iterationCount>1){
						tempOrder["_count"] = chartProperties.xseries[0].vizdefaults.order == 0 ? "desc" :
									chartProperties.xseries[0].vizdefaults.order == 1 ? "asc" :
									null;
						/*
							chartProperties.xseries[0].vizdefaults.order == 2 ? { "_term" : "asc" } :
							chartProperties.xseries[0].vizdefaults.order == 3 ? { "_term" : "desc" } :
						*/
					}else{
						tempOrder[sortPath] = "desc";
					}

					if(chartProperties.xseries[0].datatype == "date"){
						var intervalStr = "month";
						var lowerDate = moment( Number($(".filterparentDOM input[name='coll_lower']").val()) );
						var upperDate = moment( Number($(".filterparentDOM input[name='coll_upper']").val()) );
						var datediff = upperDate.diff(lowerDate, 'days');
						if(datediff <= 60 ){
							intervalStr = "day";
						}else if(datediff > 60 && datediff <= 730){
							intervalStr = "month";
						}else{
							intervalStr = "year";
						}

						if(chartProperties.xseries[0].vizdefaults && chartProperties.xseries[0].vizdefaults.datehistogram && chartProperties.xseries[0].vizdefaults.datehistogram != 0){
							intervalStr = chartProperties.xseries[0].vizdefaults.datehistogram == 1 ? "month" :
											chartProperties.xseries[0].vizdefaults.datehistogram == 2 ? "year" :
											intervalStr;
						}


						chartProperties.xseries[0].dateinterval = intervalStr;

						
						chartagg.aggs[chartID] = {
													"date_histogram": {
														"field": (gFilters[chartProperties.xseries[0].field].settings.nested ? "" : "") + chartProperties.xseries[0].field, //Force filed to be nested in OBR...hardcoded to OBR. +
														"interval": intervalStr,
														"min_doc_count": 0
													 },
													 "aggs": yseries_aggs.aggs
												};
					}else if(chartProperties.xseries[0].datatype == "numeric" || temp_xSeries_Settings.type == "numeric"){
						chartagg.aggs[chartID] = {
													"histogram": {
														"field": (gFilters[chartProperties.xseries[0].field].settings.nested ? "" : "") + chartProperties.xseries[0].field, //Force filed to be nested in OBR...hardcoded to OBR. +
														"interval": "1",
														"min_doc_count": temp_xSeries_Settings.mindoccount || "1",
													 },
													 "aggs": yseries_aggs.aggs
												};
						if(chartProperties.xseries[0].vizdefaults){ //custom viz settings for a x-series dimension
							chartagg.aggs[chartID].histogram.interval = chartProperties.xseries[0].vizdefaults.interval || chartagg.aggs[chartID].histogram.interval;
							chartagg.aggs[chartID].histogram.min_doc_count = chartProperties.xseries[0].vizdefaults.interval_mincount || chartagg.aggs[chartID].histogram.min_doc_count;
							if(chartProperties.xseries[0].vizdefaults.boundary){
								chartagg.aggs[chartID].histogram["extended_bounds"] = { "min" : chartProperties.xseries[0].vizdefaults.boundary[0], "max" : chartProperties.xseries[0].vizdefaults.boundary[1]};
							}
						}
					}else if(chartProperties.xseries[0].datatype == "zip"){
						chartagg.aggs[chartID] = {
													"terms" : {
														"field" : (gFilters[chartProperties.xseries[0].field].settings.nested ? "" : "") + chartProperties.xseries[0].field, //Force filed to be nested in OBR...hardcoded to OBR. +
														"size" : 1000,
														//"min_doc_count": 1
													},
													"aggs": yseries_aggs.aggs
												};
						if(tempOrder){
							chartagg.aggs[chartID].terms.order = tempOrder;
						}

					}else{
						chartagg.aggs[chartID] = {
													"terms" : {
														"field" : (gFilters[chartProperties.xseries[0].field].settings.nested ? "" : "") + chartProperties.xseries[0].field, //Force filed to be nested in OBR...hardcoded to OBR. +
														"size" : chartProperties.xseries[0].vizdefaults ? (chartProperties.xseries[0].vizdefaults.size || 10) : 10,
														//"min_doc_count": 1
														//"order" : { "_count" : "asc" }
													},
													"aggs": yseries_aggs.aggs
												};
						if(tempOrder){
							chartagg.aggs[chartID].terms.order = tempOrder;
						}

					}

				}


				if(Object.keys(chartagg.aggs).length > 0){
					
					//Force the JSON to start with nested OBR...hardcoded to OBR
					var tempChartAgg = {"aggs": {}};
					/*
					tempChartAgg.aggs["nestedtop_" + chartID] = {
														 "nested": {
															"path": "obr"
														 },
														 "aggs": chartagg.aggs
					};
					*/
					tempChartAgg.aggs = chartagg.aggs;


					chartagg = tempChartAgg;


					filterObj.visualizations.push(chartagg);
					
				}

			});

			/*var totalRecordsSpecialAgg = { "aggs" : {
			        	"VERIO_SPL_TOTAL_COUNT" : { "value_count" : { "field" : "coll" } }
			        }};
			*/
			//filterObj.visualizations.push(totalRecordsSpecialAgg);

			//console.log(JSON.stringify(filterObj.datatable));
			//console.log(JSON.stringify(filterObj.filters));
			//console.log(JSON.stringify(filterObj.visualizations));


			$.ajax({
				type: "POST",
				url: "/anal" + "yti" + "cs/a" + "pi/ge" + "tda" + "ta",
				//since some data values are numeric, POST will send data as string and ES loses datatype and throws error.
				//stringify and parse on server to get numeric values
				data: {dataval: JSON.stringify({h: filterObj.datatable, o: filterObj.filters, v: filterObj.visualizations, t: Date.now()})},

				success: function(resData){
					//console.log(JSON.stringify(resData));
					//computeMultiAnalytics, dataOnDemand

					if (resData && resData.dataOnDemand){ 
						var resCMA = resData.dataOnDemand;
						for(var responseIndex in resCMA.responses){
							//console.log(resCMA.responses[responseIndex].hits.total);
							var chartID = resCMA.responses[responseIndex].chartID;
							$("#dashboard-chartarea #" + chartID).updateVCChartData(resCMA.responses[responseIndex].hits, verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
						}
					}
					
					if (resData && resData.computeMultiAnalytics){ 
						var msg = resData.computeMultiAnalytics;
						//console.log(msg);
						
						//var VERIO_SPECIAL_AGGS = {totalrecords: msg.VERIO_SPL_TOTAL_COUNT};
						//delete msg.VERIO_SPL_TOTAL_COUNT;

						var rawArrayObjForStats = {}; //This is raw data arraystore for computing stats

						for(var responseIndex in msg.responses){
							var aggresult = msg.responses[responseIndex].aggregations.nestedtop || msg.responses[responseIndex].aggregations;

							var firstLevelKeys = Object.keys(aggresult);
							if(firstLevelKeys.length == 1 && firstLevelKeys[0].startsWith("nestedtop_") == true){
								aggresult = aggresult[firstLevelKeys[0]];
							}
							delete aggresult.doc_count;

							for(var key in aggresult){
								if( key == "error" && aggresult[key] == true ){
									$("#" + firstLevelKeys[0].replace("nestedtop_", "") + " .errorflag").removeClass("hidden");
									$("#" + firstLevelKeys[0].replace("nestedtop_", "") + " .mychart").addClass("hidden");
									break;
								}else if(aggresult[key].error){
									$("#" + key + " .errorflag").removeClass("hidden");
									$("#" + key + " .mychart").addClass("hidden");
									break;
								}else{
									$("#" + key + " .errorflag").addClass("hidden");
									$("#" + key + " .mychart").removeClass("hidden");
								}

								var yseriesObj = {};
								var yseriesPropertyObj = {};
								var maxYvalue = 0;

								var iterationCount = 0;
								var firstYseriesObj = null;

								rawArrayObjForStats[key]={};

								//console.log(verioChartObj[key].properties.yseries);
								for (var yseriesIndex in verioChartObj[key].properties.yseries){
									var yseriesItem = verioChartObj[key].properties.yseries[yseriesIndex];
									//console.log(yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field);
									rawArrayObjForStats[key][yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = [];

									yseriesObj[yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = [];
									yseriesPropertyObj[yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field] = yseriesItem;

									if(iterationCount==0){
										firstYseriesObj = {yseriesIndex: yseriesIndex, yseriesItem: yseriesItem, yseriesObj: yseriesObj};
									}
									iterationCount++;
								}


								/*for(var bucketIndex in aggresult[key].buckets){
									var temp_key = firstYseriesObj.yseriesIndex + "_" + firstYseriesObj.yseriesItem.aggregation + "_" + firstYseriesObj.yseriesItem.field;
									var temp_master_outputnode = aggresult[key].buckets[bucketIndex] ["expfilter_" + temp_key]["innernestout"][temp_key];
									var temp_master_outputnode_nestout = aggresult[key].buckets[bucketIndex] ["expfilter_" + temp_key]["innernestout"][temp_key]["nestout"];
									var temp_master_outputnode_doc_count = aggresult[key].buckets[bucketIndex] ["expfilter_" + temp_key]["innernestout"][temp_key]["doc_count"];

									aggresult[key].buckets[bucketIndex] ["expfilter_" + temp_key]["innernestout"][temp_key] = {"doc_count": temp_master_outputnode_doc_count, "nestout": temp_master_outputnode_nestout};
									delete temp_master_outputnode.doc_count;
									delete temp_master_outputnode.nestout;
									jQuery.extend(aggresult[key].buckets[bucketIndex],temp_master_outputnode);
								}*/

								var chartPlotData = [];
								if(verioChartObj[key].properties.charttype == "dhheat"){
									for (var day=1; day<=7; day++){
										for (var hour=1; hour<=24; hour++){
											chartPlotData.push([day, hour, 0]);
										}
									}

									for(var yseriesItem in yseriesObj){
										var aggValueKey = yseriesPropertyObj[yseriesItem].aggregation;
										for (var dayIndex in aggresult[key].buckets){
											var day = aggresult[key].buckets[dayIndex].key;
											var hourBuckets = aggresult[key].buckets[dayIndex].hours.buckets;
											for (var hourIndex in hourBuckets){
												var hour = hourBuckets[hourIndex].key;
												var value;
												if(aggValueKey == "std_deviation" || aggValueKey == "variance"){
													value = hourBuckets[hourIndex]["expfilter_" + yseriesItem][yseriesItem][yseriesPropertyObj[yseriesItem].aggregation];
												}else{
													value = hourBuckets[hourIndex]["expfilter_" + yseriesItem][yseriesItem].value; //nestedout change
												}
												var arryIndex = (((day - 1) * 24) + hour)-1;
												chartPlotData[arryIndex] = [day, hour, value];
											}
										}
									}

								}else if(verioChartObj[key].properties.charttype == "funnel"){
									for (var yseriesIndex in verioChartObj[key].properties.yseries){
											var yseriesItem = verioChartObj[key].properties.yseries[yseriesIndex];
											
											var yseriesKey = yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field;

											if(yseriesItem.aggregation == "std_deviation" || yseriesItem.aggregation == "variance"){
												yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem][yseriesPropertyObj[yseriesItem].aggregation]} );
												chartPlotData.push([(yseriesItem.label != "") ? yseriesItem.label: yseriesItem.caption,aggresult[key]['expfilter_' + yseriesKey][yseriesKey][yseriesItem.aggregation], yseriesItem.color, isColorDark(yseriesItem.color) ? '#ffffff' : '#000000']);
											}else{
												chartPlotData.push([(yseriesItem.label != "") ? yseriesItem.label: yseriesItem.caption,aggresult[key]['expfilter_' + yseriesKey][yseriesKey].value, yseriesItem.color, isColorDark(yseriesItem.color) ? '#ffffff' : '#000000']);
											}
											
									}

								}else if(verioChartObj[key].properties.charttype == "boxplot"){

									//https://www.leansigmacorporation.com/wp/wp-content/uploads/2015/12/Box-Plot-MTB_01.png
									var temp_minvalue = 0;
									var temp_maxvalue = 0;
									for (var itemIndex in aggresult[key].buckets){
											for(var yseriesItem in yseriesObj){
												var serializename = verioChartObj[key].properties.xseries[0].field;
												var xKey = xRefFilterCode2ListValue(serializename, aggresult[key].buckets[itemIndex].key) || aggresult[key].buckets[itemIndex].key;
												var stats = aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem];
												var percentiles = aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem + "_percentiles"].values;

												temp_minvalue = Math.min(temp_minvalue, stats.min);
												temp_maxvalue = Math.max(temp_maxvalue, stats.max);
												var Q1 = percentiles["25.0"]; //stats.avg - (stats.std_deviation * 1);
												var Q3 = percentiles["75.0"]; //stats.avg + (stats.std_deviation * 1);
												yseriesObj[yseriesItem].push( {
														id: yseriesPropertyObj[yseriesItem].id,
														label: xKey, 
														color: verioChartObj[key].properties.yseries[yseriesPropertyObj[yseriesItem].id].color,
														values: {
															Q1: Q1,
															Q2: percentiles["50.0"], //stats.avg,
															Q3: Q3,
															whisker_low: Math.max(stats.min, Q1 - 1.5*(Q3-Q1)),
															whisker_high: Math.min(stats.max, Q3 + 1.5*(Q3-Q1)),
															outliers: [stats.min, stats.max]
														}
														} );
											}
											chartPlotData = yseriesObj[yseriesItem];
									}
									
									verioChartObj[key].pluginclass.yDomain([temp_minvalue,temp_maxvalue]);

									
									if(verioChartObj[key].properties.xseries[0].datatype == "date"){
										if(verioChartObj[key].properties.xseries[0].dateinterval == "day"){
											//verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { console.log(d); return moment(d).utc().format("MM/DD/YYYY"); }); //d3.time.format("%m/%d/%y")(new Date(d));
											verioChartObj[key].pluginclass.x(function(d) { return moment(d.label).utc().format("MM/DD/YYYY"); });
										}else if(verioChartObj[key].properties.xseries[0].dateinterval == "year"){
											//verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { console.log(d); return moment(d).utc().year(); }); //d3.time.format("%Y")(new Date(d+86400000));
											verioChartObj[key].pluginclass.x(function(d) { return moment(d.label).utc().year(); });
										}else{ //month
											//verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { console.log(d); return moment(d).utc().format("MMM 'YY"); }); //d3.time.format("%b '%y")(new Date(d));
											verioChartObj[key].pluginclass.x(function(d) { return moment(d.label).utc().format("MMM 'YY"); });
										}

									}else{
										//verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { return d; })
										verioChartObj[key].pluginclass.x(function(d) { return d.label; });
									}
									
									
								}else{
									
									var iteration_bucket_index = -1;

									for (var itemIndex in aggresult[key].buckets){

										iteration_bucket_index++;

										var serializename = verioChartObj[key].properties.xseries[0].field;
										var fieldCaption = verioChartObj[key].properties.xseries[0].caption;

										if(verioChartObj[key].properties.xseries[0].datatype == "date"){
											for(var yseriesItem in yseriesObj){
												var aggValueKey = yseriesPropertyObj[yseriesItem].aggregation;
												var xKey = xRefFilterCode2ListValue(serializename, aggresult[key].buckets[itemIndex].key) || aggresult[key].buckets[itemIndex].key;

												try{ //very crude way for setting forecast/predict values - Bad rewrite later - TODO
														if(aggValueKey == "std_deviation" || aggValueKey == "variance"){
															yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem][yseriesPropertyObj[yseriesItem].aggregation]} );
														}if(aggValueKey == "cusum" || aggValueKey == "cucount"){
															var lastYValue = 0;
															if(yseriesObj[yseriesItem].length > 0){
																lastYValue = yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y;
															}
															yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem].value + lastYValue} ); //nestedout change
														}else{
															yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem].value} ); //nestedout change
														}
														
														//Forecasting/Prediction
														if(verioChartObj[key].properties.xseries[0].vizdefaults && verioChartObj[key].properties.xseries[0].vizdefaults.forecast && verioChartObj[key].properties.xseries[0].vizdefaults.forecast != 0){
																//yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].predictval = aggresult[key].buckets[itemIndex]["forecast_expfilter_" + yseriesItem] ? aggresult[key].buckets[itemIndex]["forecast_expfilter_" + yseriesItem].value : "";
																if(aggresult[key].buckets[itemIndex]["forecast_expfilter_" + yseriesItem]){
																	var xval = aggresult[key].buckets[itemIndex-1].key;
																	yseriesObj[yseriesItem].push( {color:"transparent", id: yseriesPropertyObj[yseriesItem].id, predict: true, state: "model", x: xval, y: aggresult[key].buckets[itemIndex]["forecast_expfilter_" + yseriesItem].value} );
																}
														}
												}catch(e){
													//very crude way for setting forecast/predict values - Bad rewrite later - TODO
													if(verioChartObj[key].properties.xseries[0].vizdefaults && verioChartObj[key].properties.xseries[0].vizdefaults.forecast && verioChartObj[key].properties.xseries[0].vizdefaults.forecast != 0){
															var xval = aggresult[key].buckets[itemIndex-1].key;
															yseriesObj[yseriesItem].push( {color:"transparent", id: yseriesPropertyObj[yseriesItem].id, predict: true, state: "future", x: xval, y: aggresult[key].buckets[itemIndex]["forecast_expfilter_" + yseriesItem].value} );
													}
												}

												//console.log(yseriesPropertyObj[yseriesItem].id);

												maxYvalue = Math.max(maxYvalue, yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y);
												//console.log(key, yseriesItem, yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y);
												rawArrayObjForStats[key][yseriesItem].push(yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y);

												if(verioChartObj[key].properties.charttype == "scatter"){
													yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].shape = yseriesPropertyObj[yseriesItem].shape;
													yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].size = yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y;
												}
											}
										}else{

											for(var yseriesItem in yseriesObj){
												var aggValueKey = yseriesPropertyObj[yseriesItem].aggregation;
												var xKey = xRefFilterCode2ListValue(serializename, aggresult[key].buckets[itemIndex].key) || aggresult[key].buckets[itemIndex].key;

												if(verioChartObj[key].properties.xseries[0].datatype == "list" && (verioChartObj[key].properties.charttype == "line" || verioChartObj[key].properties.charttype == "scatter" || verioChartObj[key].properties.charttype == "multichart")){
													if(aggValueKey == "std_deviation" || aggValueKey == "variance"){
														yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: iteration_bucket_index, label: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem][yseriesPropertyObj[yseriesItem].aggregation] } );
													}else if(aggValueKey == "cusum" || aggValueKey == "cucount"){
														var lastYValue = 0;
														if(yseriesObj[yseriesItem].length > 0){
															lastYValue = yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y;
														}
														yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: iteration_bucket_index, label: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem].value + lastYValue} ); //nestedout change
														
													}else{
														yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: iteration_bucket_index, label: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem].value } ); //nestedout change
													}
												}else{
													if(aggValueKey == "std_deviation" || aggValueKey == "variance"){
														yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem][yseriesPropertyObj[yseriesItem].aggregation] } );
													}else if(aggValueKey == "cusum" || aggValueKey == "cucount"){
														var lastYValue = 0;
														if(yseriesObj[yseriesItem].length > 0){
															lastYValue = yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y;
														}
														yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem].value + lastYValue} ); //nestedout change
														
													}else{
														yseriesObj[yseriesItem].push( {id: yseriesPropertyObj[yseriesItem].id, x: xKey, y: aggresult[key].buckets[itemIndex]["expfilter_" + yseriesItem][yseriesItem].value } ); //nestedout change
													}
												}

												maxYvalue = Math.max(maxYvalue, yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y);
												rawArrayObjForStats[key][yseriesItem].push(yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y);


												if(verioChartObj[key].properties.charttype == "scatter"){
													yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].shape = yseriesPropertyObj[yseriesItem].shape;
													yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].size = yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1].y;
												}
												//console.log(yseriesObj[yseriesItem][yseriesObj[yseriesItem].length-1]);

											}
										}

									}

									var fullchart_minvalue = 0;
									var fullchart_maxvalue = 0;

									for (var yseriesIndex in verioChartObj[key].properties.yseries){
										var yseriesItem = verioChartObj[key].properties.yseries[yseriesIndex];

										var pushData = {key: yseriesItem.label || ((yseriesItem.expression && yseriesItem.expression.length>0) ? "F-" : "") + formatAggregationCaption(yseriesItem.aggregation) + "(" + yseriesItem.caption + ")", values: yseriesObj[yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field]};

										gChartStats[yseriesIndex] = calculateBasicStats(rawArrayObjForStats[key][yseriesIndex + "_" + yseriesItem.aggregation + "_" + yseriesItem.field]);
										gChartStats[yseriesIndex].chartID = key;

										fullchart_minvalue = Math.min(fullchart_minvalue, gChartStats[yseriesIndex].min);
										fullchart_maxvalue = Math.max(fullchart_maxvalue, gChartStats[yseriesIndex].max);

										if(verioChartObj[key].properties.charttype == "multichart"){
											pushData.type = yseriesItem.multicharttype || "bar";
											pushData.yAxis = 1;
											//temp hack to resolve nv d3 multichart error - https://github.com/novus/nvd3/issues/1299
											$("#" + key + " .nv-groups").empty();
											$("#" + key + " .stack1Wrap .nv-areaWrap").empty();
											setTimeout(function(){
													d3.select("#" + key + " .lines1Wrap").moveToFront();
													d3.select("#" + key + " .lines2Wrap").moveToFront();
												}, 1000);
											//end hack
											verioChartObj[key].pluginclass.yDomain1([fullchart_minvalue,fullchart_maxvalue]);
											
										}

										if(yseriesItem.color && yseriesItem.color != ""){
											pushData.color = yseriesItem.color;
										}else{
											if(yseriesIndex < gColors.length){ //todo
												pushData.color = gColors[yseriesIndex];
											}else{
												pushData.color = "#fff000";
											}
										}

										pushData.serializename = yseriesItem.field;

										chartPlotData.push(pushData);
									}

								}

								//console.log(chartPlotData);

								var temp_xseriestype = verioChartObj[key].properties.xseries[0].datatype;
								var temp_charttype = verioChartObj[key].properties.charttype;

								if (temp_charttype == "map"){
									var heatData = {};
									//var heatPoints = [];
									var heatZips = {};
									var maxVal = 0;

									for(var valueIndex in chartPlotData[0].values){
										var zip = chartPlotData[0].values[valueIndex].x;
										heatZips[zip] = {count: chartPlotData[0].values[valueIndex].y};
										maxVal = Math.max(chartPlotData[0].values[valueIndex].y, maxVal);

										//var zipmetric = chartPlotData[0].values[valueIndex].y;
										/*
										if(gZIPGeo[zip]){
											maxVal = Math.max(zipmetric, maxVal);
											var temp_zipgeo = gZIPGeo[zip];
											heatPoints.push({lat: temp_zipgeo[0], lng: temp_zipgeo[1], count: zipmetric});
										}*/
									}

									var heatData = {
									  max: maxVal, //VERIO_SPECIAL_AGGS.totalrecords, //maxVal,
									  data: heatZips, //heatPoints
									  key: chartPlotData[0].key,
									  units: gFilters[chartPlotData[0].serializename] ? gFilters[chartPlotData[0].serializename].units : "",
									};


									//http://www.howcast.com/videos/359111-how-to-normalize-data/
									/*
									for(var valueIndex in chartPlotData[0].values){
										var zip = chartPlotData[0].values[valueIndex].x;
										var zipmetric = chartPlotData[0].values[valueIndex].y;
										if(gZIPGeo[zip]){
											var temp_zipgeo = gZIPGeo[zip];
											var normalized_zipmetric = 1 + (((zipmetric - 0) * (10-1))/(5000 - 0));
											console.log(normalized_zipmetric);
											heatPoints.push({lat: temp_zipgeo[0], lng: temp_zipgeo[1], count: normalized_zipmetric});
										}
									}

									var heatData = {
									  max: 10,
									  data: heatPoints
									};
									*/

									$("#dashboard-chartarea #" + key).updateVCChartData(heatData, verioChartObj[key].properties.charttype, verioChartObj[key].pluginclass);

								}else if (temp_charttype == "dhheat" || temp_charttype == "funnel" || temp_charttype == "boxplot"){ 

										$("#dashboard-chartarea #" + key).updateVCChartData(chartPlotData, verioChartObj[key].properties.charttype, verioChartObj[key].pluginclass);

								//}else if (temp_charttype == "funnel"){

									//$("#dashboard-chartarea #" + key).updateVCChartData(chartPlotData, verioChartObj[key].properties.charttype, verioChartObj[key].pluginclass);

								}else if (temp_charttype == "pie" || temp_charttype == "donut"){
									//sort values descending before pie charted
									chartPlotData[0].values.sort(function(a, b) {
									   var compA = a.y;
									   var compB = b.y;
									   return !(compA < compB) ? -1 : !(compA > compB) ? 1 : 0;
									})
									if(temp_xseriestype == "date"){
										if(verioChartObj[key].properties.xseries[0].dateinterval == "day"){
											verioChartObj[key].pluginclass.x(function(d) { return moment(d.x).utc().format("MM/DD/YYYY"); });
										}else if(verioChartObj[key].properties.xseries[0].dateinterval == "year"){
											verioChartObj[key].pluginclass.x(function(d) { return moment(d.x).utc().year(); });
										}else{ //month
											verioChartObj[key].pluginclass.x(function(d) { return moment(d.x).utc().format("MMM 'YY"); });
										}
									}else{
										verioChartObj[key].pluginclass.x(function(d) { return d.x; });
									}
									$("#dashboard-chartarea #" + key).updateVCChartData(chartPlotData[0].values, verioChartObj[key].properties.charttype, verioChartObj[key].pluginclass);

								}else if(verioChartObj[key].properties.xseries[0].datatype == "list" && (temp_charttype == "line" || temp_charttype == "scatter"  || temp_charttype == "multichart")){

										verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) {
											var label = chartPlotData[0].values[d].label;
											return label;
										});
										$("#dashboard-chartarea #" + key).updateVCChartData(chartPlotData, verioChartObj[key].properties.charttype, verioChartObj[key].pluginclass);

								}else{

									if(temp_xseriestype == "date"){
										if(verioChartObj[key].properties.xseries[0].dateinterval == "day"){
											verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { return moment(d).utc().format("MM/DD/YYYY"); }); //d3.time.format("%m/%d/%y")(new Date(d));
										}else if(verioChartObj[key].properties.xseries[0].dateinterval == "year"){
											verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { return moment(d).utc().year(); }); //d3.time.format("%Y")(new Date(d+86400000));
										}else{ //month
											verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { return moment(d).utc().format("MMM 'YY"); }); //d3.time.format("%b '%y")(new Date(d));
										}

									}else{
										verioChartObj[key].pluginclass.xAxis.tickFormat(function(d) { return d; })

										/*
										verioChartObj[key].pluginclass.tooltip.headerFormatter(function(d) {
											var temp_filterObj = JSON.parse(JSON.stringify(gFilters[verioChartObj[key].properties.xseries[0].field]));//zzz
											if(temp_filterObj.datatype == "list"){
												return temp_filterObj.caption + " - " + (temp_filterObj.listKeys[d] || (d=="U" ? "Unknown" : d));
											}else{
												return temp_filterObj.caption + " - " + d;
											}
										});
										*/

									}

									if(temp_charttype == "horizontal-bar"){
										verioChartObj[key].pluginclass.margin({left: 100});
									}else{
										if(maxYvalue > 0){
											if(maxYvalue < 10) verioChartObj[key].pluginclass.margin({left: 20});
											if(maxYvalue >= 10 && maxYvalue < 99) verioChartObj[key].pluginclass.margin({left: 20});
											if(maxYvalue >= 99 && maxYvalue < 999) verioChartObj[key].pluginclass.margin({left: 30});
											if(maxYvalue >= 999 && maxYvalue < 99999) verioChartObj[key].pluginclass.margin({left: 40});
											if(maxYvalue >= 99999) verioChartObj[key].pluginclass.margin({left: 50});
										}else{
											//safety valve
											verioChartObj[key].pluginclass.margin({left: 40});
										}
									}



									d3.selectAll("#dashboard-chartarea #" + key + " .vmed-label-values").remove(); //removes all the values on the bar elements
									d3.selectAll("#dashboard-chartarea #" + key + " .vmed-label-markers").remove();
									d3.selectAll('#dashboard-chartarea #' + key + ' .predicted-model-lines').remove();
									$("#dashboard-chartarea #" + key).updateVCChartData(chartPlotData, verioChartObj[key].properties.charttype, verioChartObj[key].pluginclass);

								}
							}
						}

					}
								
					gOnLoadComplete = true;

				},

				error: function(request, status, error) {
					//PageNotifications("Error - " + request.responseText, "error");
				}

			});


	}


function calculateBasicStats(array){
	var stats = {
		mean: null,
		meadian: null,
		mode: null,
		stdev: null,
		variance: null,
		min: null,
		max: null,
		count: null,
		sum: null,
		mean_plus_std1 : null,
		mean_plus_std2 : null,
		mean_plus_std3 : null,
		mean_minus_std1 : null,
		mean_minus_std2 : null,
		mean_minus_std3 : null,
	};

stats.count = array.length;
stats.max = Math.max.apply(null, array);
stats.min = Math.min.apply(null, array);

	var num = 0;
	for (var i = 0, l = array.length; i < l; i++) num += array[i];

stats.sum =  num;
stats.mean = stats.sum/stats.count;
stats.avg = stats.mean;

	num = 0;
	for (var i = 0, l = array.length; i < l; i++) num += Math.pow(array[i] - stats.mean, 2);

stats.variance = num/stats.count;
stats.stdev = Math.sqrt(stats.variance);

stats.mean_plus_std1 = stats.mean + stats.stdev;
stats.mean_plus_std2 = stats.mean + (2 * stats.stdev);
stats.mean_plus_std3 = stats.mean + (3 * stats.stdev);
stats.mean_minus_std1 = stats.mean - stats.stdev;
stats.mean_minus_std2 = stats.mean - (2 * stats.stdev);
stats.mean_minus_std3 = stats.mean - (3 * stats.stdev);


/*
	median: function(array) {
		array.sort(function(a, b) {
			return a - b;
		});
		var mid = array.length / 2;
		return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
	},

	modes: function(array) {
		if (array.length === 0) return null;
		var modeMap = {},
			maxCount = 1,
			modes = [array[0]];

		array.forEach(function(val) {
			if (modeMap[val] === undefined) modeMap[val] = 1;
			else modeMap[val]++;

			if (modeMap[val] > maxCount) {
				modes = [val];
				maxCount = modeMap[val];
			}
			else if (modeMap[val] == maxCount) {
				modes.push(val);
				maxCount = modeMap[val];
			}
		});
		return modes;
	},
	meanAbsoluteDeviation: function(array) {
		var mean = arr.mean(array);
		return arr.mean(array.map(function(num) {
			return Math.abs(num - mean);
		}));
	},

	zScores: function(array) {
		var mean = arr.mean(array);
		var standardDeviation = arr.standardDeviation(array);
		return array.map(function(num) {
			return (num - mean) / standardDeviation;
		});
	}
*/


	return stats;
}


function formatAggregationCaption(aggs_key){
	return aggs_key.replace("value_count","count").replace("std_deviation","stddev").replace("variance","var");
}

function convertAggregationTermtoMasterKey(aggs_term){
	return aggs_term.replace("std_deviation","extended_stats").replace("variance","extended_stats").replace("cusum", "sum").replace("cucount","value_count");
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? "rgb(" + 
        parseInt(result[1], 16) + "," +
        parseInt(result[2], 16) + "," +
        parseInt(result[3], 16) + ")"
     : null;
}

function isColorDark( color ) {
		if(color.indexOf("#") > -1) color = hexToRgb(color);
    var match = /rgb\((\d+).*?(\d+).*?(\d+)\)/.exec(color);
    return ( match[1] & 255 )
         + ( match[2] & 255 )
         + ( match[3] & 255 )
           < 3 * 256 / 2;
}


function generateNewChartTitle(viztype) {
    var newTitle = "New Visualization";
		if(viztype == "line") return "New Line Chart";
		if(viztype == "bar" || viztype == "horizontal-bar") return "New Bar Chart";
		if(viztype == "pie") return "New Pie Chart";
		if(viztype == "multichart") return "New MultiViz Chart";
		if(viztype == "map") return "New GeoMaps";
		if(viztype == "scatter") return "New Scatter Chart";
		if(viztype == "donut") return "New Donut Chart";
		if(viztype == "area") return "New Area Chart";
		if(viztype == "dhheat") return "New HeatMap";
		if(viztype == "funnel") return "New Funnel Chart";
		if(viztype == "datatable") return "Data On-Demand";
		if(viztype == "textarea") return "Text Area";
		if(viztype == "boxplot") return "New BoxPlot";
		
    return newTitle;
}


function addVizChartExisting(vizData){

	if ($("#message-emptyDashboardTab").length){
		$("#message-emptyDashboardTab").addClass("hidden");
		$("#footer").remove();
	}

	var chartID = vizData.id;

	var clone_template_viz_barchart = $("#template_viz_barchart").find(".chartbox").clone();

	clone_template_viz_barchart.css("height", vizData.val.chartposition.height);
	clone_template_viz_barchart.addClass(vizData.val.chartposition.width);
	clone_template_viz_barchart.attr("id", chartID).attr("chartid", chartID);
	clone_template_viz_barchart.find(".mychart").attr("id", "mychart" + chartID);

	verioChartObj[chartID] = {};
	verioChartObj[chartID].properties = vizData.val;

	clone_template_viz_barchart.find(".vizcaption span").text(verioChartObj[chartID].properties.chartcaption);
	clone_template_viz_barchart.attr("chart-properties", verioChartObj[chartID].properties);


	$("#dashboard-chartarea").append(clone_template_viz_barchart);


	if(gDeviceSize == "xs"){
		$("#" + chartID).css("position", "");
		$("#" + chartID).css("height", "250");
		$("#" + chartID).addClass("col-xs-12");
	}else{
		var chartposition = vizData.val.chartposition;
		$("#" + chartID).css("top", chartposition.top * gContainerDimensions.height);
		$("#" + chartID).css("left", chartposition.left * gContainerDimensions.width);
		$("#" + chartID).css("height", chartposition.height * gContainerDimensions.height);
		$("#" + chartID).css("width", chartposition.width * gContainerDimensions.width);
	}

	verioChartObj[chartID].pluginclass = $("#dashboard-chartarea #" + chartID).find('.mychart').createVCChart(vizData.val);


	//-----Setup Axis buttons-------

		if(vizData.val.xseries.length > 0){
			$("#" + chartID + " .baseseries_btn span.caption").html(vizData.val.xseries[0].caption);
			if(vizData.val.charttype == "bar" || vizData.val.charttype == "horizontal-bar"){
				$("#" + chartID + " .baseseries_btn_chart_options").removeClass("hidden");
			}
		}

		for (var yseriesIndex in vizData.val.yseries){
			var new_ySeriesIndex = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now();

			var clone_template_dimension_series_btn = $("#template_dimension_series_btn").clone();
			clone_template_dimension_series_btn.find("button").attr("seriesIndex", (vizData.val.yseries[yseriesIndex].id || new_ySeriesIndex) );
			clone_template_dimension_series_btn.find("button").addClass("series-" + (vizData.val.yseries[yseriesIndex].id || new_ySeriesIndex) );
			clone_template_dimension_series_btn.find(".btnset1 .color").css("background-color", vizData.val.yseries[yseriesIndex].color);
			clone_template_dimension_series_btn.find(".btnset1 .caption").html(vizData.val.yseries[yseriesIndex].caption);

			$("#" + chartID).find(".dimensionseries .group-btns .btn-group").append(clone_template_dimension_series_btn.children());

		}


	//-----End - Setup Axis buttons-------

	//initializeChartBoxResizable();
	chartboxResize( $("#" + chartID) );

	//This need to be setup after the chartbox is render else height will be zero and cannot be calculated
	$("#" + chartID).find(".baseseries").toggleClass("hidden", !vizData.val.chartoptions.xaxis); //true value means visible
	$("#" + chartID).find(".dimensionseries").toggleClass("hidden", !vizData.val.chartoptions.yaxis); //true value means visible
	$("#" + chartID).find(".nv-legend").css("visibility", (vizData.val.chartoptions.legend) ? "visible" : "hidden");

	$("#" + chartID).find(".mychart").toggleClass("nvd3-nolegend", !vizData.val.chartoptions.yaxis); //true value means visible

	$(this).updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
	InitializeDrapDrop($("#" + chartID), $("#" + chartID).find(".cdr"));
	//InitializeDrapDrop($(".chartbox"), $(".chartbox").find(".cdr"));

};




function addVizChart(viztype, setupProperty){

	if(gRowsArray.length >= 5){
		alert("Please re-arrange your dashboard, too many rows exist. We don't want to clutter it!");
		return;
	}

	if($("#dashboard-chartarea .chartbox").length >= 10){
		alert("Too many charts added to dashboard. We don't want to clutter it!");
		return;
	}

	if ($("#message-emptyDashboardTab").length){
		$("#message-emptyDashboardTab").addClass("hidden");
		$("#footer").remove();
	}

	var chartID = "vcc" + tabIDslicedlast5 + (new Date()).getTime();
	var chartareaHeight = gContainerDimensions.height;
	var chartareaWidth = gContainerDimensions.width;
	var count_chartrowcontainer = gRowsArray.length;

	var clone_template_viz_barchart = $("#template_viz_barchart").find(".chartbox").clone();
	clone_template_viz_barchart.css("height",(chartareaHeight)/(count_chartrowcontainer + 1));
	clone_template_viz_barchart.css("width",chartareaWidth);
	clone_template_viz_barchart.addClass("col-sm-12");
	clone_template_viz_barchart.attr("id", chartID).attr("chartid", chartID);
	clone_template_viz_barchart.find(".mychart").attr("id", "mychart" + chartID);

	clone_template_viz_barchart.css("top",0);
	clone_template_viz_barchart.css("left",0);

	verioChartObj[chartID] = {properties: {}};
	if(!setupProperty || setupProperty == null){
		verioChartObj[chartID].properties = {	charttype: viztype,
												chartcaption: generateNewChartTitle(viztype), //"New " + viztype + " chart",
												chartposition: {pos: 0, width: 100, height: 100},
												chartoptions: {xaxis: true, yaxis: true, legend: true},
												xseries: [
													{
														"caption" : "Ordered",
														"datatype" : "date",
														"field" : "coll",
														"vizdefaults": {
															"datehistogram": 0
														},
													}
												],
												yseries: {},
											};

		var new_ySeriesIndex = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now();
		verioChartObj[chartID].properties.yseries[new_ySeriesIndex] = 	{
														"id" : new_ySeriesIndex,
														"charttype" : viztype,
														"color" : gColors[0],
														"label" : "",
														"aggregation" : "value_count",
														"caption" : "Total Orders",
														"datatype" : "date",
														"field" : "isMaster",
														"expression" : [],
													};

		if(viztype == "map"){ //exception clause
			verioChartObj[chartID].properties.xseries[0].caption = "Zipcode";
			verioChartObj[chartID].properties.xseries[0].datatype = "zip";
			verioChartObj[chartID].properties.xseries[0].field = "zip";
			verioChartObj[chartID].properties.xseries[0].vizdefaults = {"intensity":0.7,"gradient": 0};
		}else if(viztype == "scatter"){
			verioChartObj[chartID].properties.yseries[new_ySeriesIndex].shape = "circle";
		}else if(viztype == "datatable"){
			verioChartObj[chartID].properties.xseries[0].vizdefaults = {tablefields : [{id:"coll", width: null}, {id:"age", width: null}, {id:"sex", width: null}, {id:"tc", width: null}]};
		}else if(viztype == "funnel"){
			verioChartObj[chartID].properties.xseries[0].vizdefaults = { block: { dynamicHeight: true, dynamicSlope: false, fill: {type: "solid"}, highlight: false }, chart: { animate: 0, bottomPinch: 1 } };
			verioChartObj[chartID].properties.xseries[0].datatype = "funnel";
			
			//Default funnel with sales collection chart...
			verioChartObj[chartID].properties.yseries = {};

			var new_ySeriesIndex_funnel = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now();
			verioChartObj[chartID].properties.yseries[new_ySeriesIndex_funnel] = 	{
															"id" : new_ySeriesIndex_funnel,
															"field" : "lp",
															"datatype" : "numeric",
															"caption" : "Test Cost",
															"aggregation" : "sum",
															"label" : "Total Cost ($)",
															"color" : "#1f77b4",
															"charttype" : "funnel",
															"expression" : []
														};
			new_ySeriesIndex_funnel = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now();
			verioChartObj[chartID].properties.yseries[new_ySeriesIndex_funnel] = 	{
															"id" : new_ySeriesIndex_funnel,
															"field" : "ab",
															"datatype" : "numeric",
															"caption" : "Test Billed Amount",
															"aggregation" : "sum",
															"label" : "Billed ($)",
															"color" : "#ff7f0e",
															"charttype" : "funnel",
															"expression" : []
														};
			new_ySeriesIndex_funnel = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now();
			verioChartObj[chartID].properties.yseries[new_ySeriesIndex_funnel] = 	{
															"id" : new_ySeriesIndex_funnel,
															"field" : "ac",
															"datatype" : "numeric",
															"caption" : "Test Collected Amount",
															"aggregation" : "sum",
															"label" : "Net ($)",
															"color" : "#2ca02c",
															"charttype" : "funnel",
															"expression" : []
														};
		}else if(viztype == "boxplot"){
			verioChartObj[chartID].properties.xseries[0].caption = "Orderable Test/Exam";
			verioChartObj[chartID].properties.xseries[0].datatype = "list";
			verioChartObj[chartID].properties.xseries[0].field = "tc";
			verioChartObj[chartID].properties.xseries[0].vizdefaults = {order : 0, size: 10};

			
			//Default funnel with sales collection chart...
			verioChartObj[chartID].properties.yseries = {};

			var new_ySeriesIndex_boxplot = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now();
			verioChartObj[chartID].properties.yseries[new_ySeriesIndex_boxplot] = 	{
															"id" : new_ySeriesIndex_boxplot,
															"field" : "tat",
															"datatype" : "numeric",
															"caption" : "Test TAT",
															"aggregation" : "value_count",
															"label" : "Total TAT",
															"color" : "#1f77b4",
															"charttype" : "boxplot",
															"expression" : []
														};			
		}

	}else{
		$.extend( true, verioChartObj[chartID].properties, setupProperty ); //deep copy.
		//verioChartObj[chartID] = setupProperty;
	}

	clone_template_viz_barchart.find(".vizcaption span").text(verioChartObj[chartID].properties.chartcaption);
	clone_template_viz_barchart.attr("chart-properties", verioChartObj[chartID].properties);

	$("#dashboard-chartarea").prepend(clone_template_viz_barchart);

	verioChartObj[chartID].pluginclass = $("#dashboard-chartarea #" + chartID).find('.mychart').createVCChart({ charttype: viztype });

	//-----Setup Axis buttons-------

		var vizData = {val: verioChartObj[chartID].properties};

		if(vizData.val.xseries.length > 0){
			$("#" + chartID + " .baseseries_btn span.caption").html(vizData.val.xseries[0].caption);
			if(vizData.val.charttype == "bar" || vizData.val.charttype == "horizontal-bar"){
				$("#" + chartID + " .baseseries_btn_chart_options").removeClass("hidden");
			}
		}

		for (var yseriesIndex in vizData.val.yseries){
			new_ySeriesIndex = "yr" + Math.random().toString(36).substr(2); //tabIDslicedlast5 + Date.now();
			var clone_template_dimension_series_btn = $("#template_dimension_series_btn").clone();
			clone_template_dimension_series_btn.find("button").attr("seriesIndex", (vizData.val.yseries[yseriesIndex].id || new_ySeriesIndex));
			clone_template_dimension_series_btn.find("button").addClass("series-" + (vizData.val.yseries[yseriesIndex].id || new_ySeriesIndex));
			clone_template_dimension_series_btn.find(".btnset1 .caption").html(vizData.val.yseries[yseriesIndex].caption);
			clone_template_dimension_series_btn.find(".btnset1 .color").css("background-color", vizData.val.yseries[yseriesIndex].color);


			$("#" + chartID).find(".dimensionseries .group-btns .btn-group").append(clone_template_dimension_series_btn.children());
		}


	//-----End - Setup Axis buttons-------

	//initializeChartBoxResizable();
	//chartboxResize( $("#" + chartID) );

	updateAllCharts(chartID);

	var top = chartareaHeight/(count_chartrowcontainer + 1);
	var topCounter = top;
	for (var rIndex in gRowsArray){
		$.each(gRowsArray[rIndex], function(chartID_Index, item){
			$("#" + chartID_Index).css("height", (chartareaHeight)/(count_chartrowcontainer + 1));
			$("#" + chartID_Index).css("top", topCounter + 0);

			if($("#" + chartID_Index).data("bottom")){
				var bottomElemID = $("#" + chartID_Index).data("bottom");
				$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
				$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
				$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
			}

		});
		topCounter = topCounter + top;
	}

	$( "#dashboard-chartarea .chartbox" ).each(function( index ) {
		chartboxResize( $(this) );
	});

	$("body").redrawAllVCCharts();
	calculateChartBoxes();
	InitializeDrapDrop($("#" + chartID), $("#" + chartID).find(".cdr"));
	//InitializeDrapDrop($(".chartbox"), $(".chartbox").find(".cdr"));

};


function initializeChartBoxResizable_NOT_IN_USE(){
	//PROD - This will initialize the resizable event for chartbox

	$("#dashboard-chartareazzzap").find(".chartbox").resizable({ containment: "#dashboard-chartarea"});

	$("#dashboard-chartareazzzap").find(".chartbox").resizable().on('resizestop', function (e) {
		totalareawidth = ($("#dashboard-chartarea").width()-40)/12;
		totaldivwidth = $($(this)).width();
		coltotals = Math.round(totaldivwidth/totalareawidth);
		$($(this)).removeClass (function (index, css) {
								return (css.match (/\bcol-sm-\S+/g) || []).join(' ');
		});

		$($(this)).css('width', '');
		$($(this)).addClass("col-sm-" + coltotals);

		chartID = $(this).attr("id");
		verioChartObj[chartID].properties.chartposition.width = "col-sm-" + coltotals;
		verioChartObj[chartID].properties.chartposition.height = $(this).outerHeight();

	});

	$("#dashboard-chartarea").find(".chartbox").on('resize', function (e) {

		chartboxResize($(this));

	});

}


function chartboxResize(elem){
	var dimensionseries_height = elem.find(".chartbase").innerHeight() - 80;
	elem.find(".dimensionseries").width( dimensionseries_height );

	if( dimensionseries_height - 20 <= elem.find(".dimensionseries .group-btns .btn-group").width() ){
		if(dimensionseries_height < 250){//hide everything if box is < 250px
			elem.find(".dimensionseries .group-default").addClass("hidden");
			elem.find(".dimensionseries .group-btns").css("visibility","hidden").css("position", "fixed");
		}else{ //show only dimensions btn
			elem.find(".dimensionseries .group-default").removeClass("hidden");
			elem.find(".dimensionseries .group-btns").css("visibility","hidden").css("position", "fixed");
		}
	}else{ //show all buttons
		elem.find(".dimensionseries .group-default").addClass("hidden");
		elem.find(".dimensionseries .group-btns").css("visibility","").css("position", "");
	}

	var chartID = elem.closest(".chartbox").attr("id");

	$(this).updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);

}


function assignNewColor(dimensionObj){
	var usedColorsArray = [];
	for (var dimensionObjIndex in dimensionObj){
		if(dimensionObj[dimensionObjIndex].color && dimensionObj[dimensionObjIndex].color != ""){
			usedColorsArray[usedColorsArray.length] = dimensionObj[dimensionObjIndex].color;
		}
	}


	for (var gColorsIndex in gColors){
		if(usedColorsArray.indexOf( gColors[gColorsIndex] ) == -1){
			return gColors[gColorsIndex];
		}
	}

	return gColorsOutOfBounds;
}


function assignNewShape(dimensionObj){
	var usedShapesArray = [];
	for (var dimensionObjIndex in dimensionObj){
		if(dimensionObj[dimensionObjIndex].shape && dimensionObj[dimensionObjIndex].shape != ""){
			usedShapesArray[usedShapesArray.length] = dimensionObj[dimensionObjIndex].shape;
		}
	}


	for (var gShapesIndex in gShapes){
		if(usedShapesArray.indexOf( gShapes[gShapesIndex] ) == -1){
			return gShapes[gShapesIndex];
		}
	}

	return "circle";
}


$.fn.createVCChart = function(options)
{
	if(options.charttype == "line"){

		var chart = nv.models.lineChart();
		chart.margin({left: 40, bottom: 30, right: 10});  //Adjust chart margins to give the x-axis some breathing room.

		chart.useInteractiveGuideline(false);  //We want nice looking tooltips and a guideline!
		//chart.transitionDuration(350);  //how fast do you want the lines to transition?
		chart.xAxis.showMaxMin(false);
		chart.yAxis.showMaxMin(false);
		chart.showLegend(true);       //Show the legend, allowing users to turn on/off line series.
		chart.showYAxis(true);        //Show the y-axis
		chart.showXAxis(true);        //Show the x-axis
		chart.noData("");

		chart.color(gColors); //d3.scale.category20().range());

		//chart.xAxis
		//	.tickFormat(function(d) { return d3.time.format("%b '%y")(new Date(d)); })
		chart.tooltip.valueFormatter(function (d) { return d; })

		chart.forceY([0,100]);
		chart.yAxis
			//.tickFormat(d3.format('s'));
			.tickFormat(function(d) {
					if(d >= 1000 && d < 999999){
						var divi = (d/1000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "k";
					}else if(d >= 1000000){
						var divi = (d/1000000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "M";
					}else{
						var fixer = (d).toFixed(2);
						if(fixer.toString().endsWith("00") == true){
							fixer = Math.round(fixer);
						}
						return fixer;
					}
					//return (d >= 1000) ? (d/1000).toFixed(2)+"k" : d;
				});


		d3.select(this[0]).append("svg")    //Select the <svg> element you want to render the chart in.
		  .datum([])         //Populate the <svg> element with chart data...
		  .call(chart);          //Finally, render the chart!

		var self = this;
		var cb2 = function(e) {
			var chartID = $(this).closest(".chartbox").attr("id");

			chartShowLabel(chartID);
			chartSetColorsByStat(chartID);


		}
		chart.dispatch.on("renderEnd", cb2.bind(self));

		return chart;

	}//end linechart


	if(options.charttype == "bar" || options.charttype == "horizontal-bar"){

		var isStacked = false;
		if(options.barstacked != null){
			isStacked = options.barstacked;
		}
		/*
		isHorizontal = false;
		if(options.horizontal != null){
			isHorizontal = options.horizontal;
		}
		*/

		var chart;
		if(options.charttype == "horizontal-bar"){
			chart = nv.models.multiBarHorizontalChart();
			chart.duration(0); //hack - renderEnd event doesnt fire without this for horizontal-bar chart....
		}else{
			chart = nv.models.multiBarChart();
		}
		chart.showControls(false);
		chart.stacked(isStacked);
		chart.margin({left: 40, bottom: 30, right: 10});
		chart.xAxis.showMaxMin(false);
		chart.yAxis.showMaxMin(false);
		chart.showLegend(true);
		chart.showYAxis(true);
		chart.showXAxis(true);
		chart.noData("");

		chart.color(gColors);

		//chart.xAxis
		//	.tickFormat(function(d) { return d3.time.format("%b '%y")(new Date(d)); })

		//chart.y(function(d) { return d.y; });
		chart.tooltip.valueFormatter(function (d) { return d; })
		
		chart.yAxis
			//.tickFormat(d3.format('s'));
			.tickFormat(function(d) {
					if(d >= 1000 && d < 999999){
						var divi = (d/1000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "k";
					}else if(d >= 1000000){
						var divi = (d/1000000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "M";
					}else{
						var fixer = (d).toFixed(2);
						if(fixer.toString().endsWith("00") == true){
							fixer = Math.round(fixer);
						}
						return fixer;
					}
					//return (d >= 1000) ? (d/1000).toFixed(2)+"k" : d;
				});


		d3.select(this[0]).append("svg")
		  .datum([])
		  .call(chart);


		var self = this;
		var cb = function(e) {

			if(gTemp_CTRL_Pressed == false){
				gDrillDownFlyFilters.filters = {};
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}

			var chartID = $(this).closest(".chartbox").attr("id");

			if(gDrillDownFlyFilters.chartInitiator != chartID){
				gDrillDownFlyFilters.filters = {};
				$(".chartboxreleasedrilldown").addClass("hidden");
				$(".chartbox").css("background-color", "");
				$(".chartbox").removeClass("nv-elems-opaque");
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}

			gDrillDownFlyFilters.chartInitiator = chartID;
			var XSeriesField = verioChartObj[chartID].properties.xseries[0].field; //this is serializename
		 	if(gDrillDownFlyFilters.filters[XSeriesField] == null){
				gDrillDownFlyFilters.filters[XSeriesField] = [];
			}

			var selectedKey = e.data.x;
			var selected_FieldCode = selectedKey; //just temp assignment

			var existInArrayIndex = -1;

			var findInJSONObj = function(upperValue, findKey) {
				for (var i = 0, len = gDrillDownFlyFilters.filters[XSeriesField].length; i < len; i++) {
					if (gDrillDownFlyFilters.filters[XSeriesField][i][findKey] === upperValue)
						return i;
				}
				return -1;
			}

			if(gFilters[XSeriesField].datatype == "numeric"){
				var interval = verioChartObj[chartID].properties.xseries[0].vizdefaults.interval;
				selected_FieldCode = {lower: Number(selectedKey), upper: Number(selectedKey) + Number(interval)};

				existInArrayIndex = findInJSONObj(selected_FieldCode.upper, "upper");

			}else if(gFilters[XSeriesField].datatype == "date"){

				if(verioChartObj[chartID].properties.xseries[0].dateinterval == "month"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("month").valueOf()}; //startOf
				}else if(verioChartObj[chartID].properties.xseries[0].dateinterval == "year"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("year").valueOf()}; //startOf
				}else if(verioChartObj[chartID].properties.xseries[0].dateinterval == "day"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("day").valueOf()}; //startOf
				}

				existInArrayIndex = findInJSONObj(selected_FieldCode.upper, "upper");

			}else{
				selected_FieldCode = xRefListValue2FilterCode(XSeriesField, selectedKey);
				existInArrayIndex = gDrillDownFlyFilters.filters[XSeriesField].indexOf(selected_FieldCode);
			}


			if(existInArrayIndex < 0){
				gDrillDownFlyFilters.filters[XSeriesField].push(selected_FieldCode);
				//$("#" + chartID).find(".nv-series-" + e.data.series).find("rect:nth-child(" + (e.index + 1) + ")").addClass("nv-elems-not-opaque");
				d3.selectAll("#" + chartID).selectAll(".nv-series-" + e.data.series).selectAll("rect:nth-child(" + (e.index + 1) + ")").classed("nv-elems-not-opaque",true);
				//selectAll("[class^='nv-series']")
			}else{
				gDrillDownFlyFilters.filters[XSeriesField].splice(existInArrayIndex, 1);
				//$("#" + chartID).find(".nv-series-" + e.data.series).find("rect:nth-child(" + (e.index + 1) + ")").removeClass("nv-elems-not-opaque");
				d3.selectAll("#" + chartID).selectAll(".nv-series-" + e.data.series).selectAll("rect:nth-child(" + (e.index + 1) + ")").classed("nv-elems-not-opaque",false);
			}

			if(Object.keys(gDrillDownFlyFilters.filters[XSeriesField]).length == 0){
				delete gDrillDownFlyFilters.filters[XSeriesField]; //this means nothing is selected for this serializename/field.
			}

			if(Object.keys(gDrillDownFlyFilters.filters).length == 0){
				gDrillDownFlyFilters.chartInitiator = null; //this means nothing is selected in the chart.
				$(".chartboxreleasedrilldown").addClass("hidden");
				$(".chartbox").css("background-color", "");
				$(".chartbox").removeClass("nv-elems-opaque");
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}else{
				$("#" + chartID + " .chartboxreleasedrilldown").removeClass("hidden");
				$("#" + chartID).css("background-color", "#C0FF00");
				$("#" + chartID).addClass("nv-elems-opaque");
			}

			updateAllCharts(); //"DRILL_DOWN_FLY"
		 };
		 chart.multibar.dispatch.on('elementClick', cb.bind(self));

		var cb2 = function(e) {
			var chartID = $(this).closest(".chartbox").attr("id");

			chartHighlightPredictions(chartID);
			chartShowLabel(chartID);
			chartSetColorsByStat(chartID);

		}
		chart.dispatch.on("renderEnd", cb2.bind(self));

/*
		chart.multibar.dispatch.on("elementClick", function(e) {
			console.log(e.seriesIndex);
			d3.select(this).classed("nv-bar-onclick", true);
		});

			chartClick
			elementClick
			elementDblClick
			elementMousemove
			elementMouseout
			elementMouseover
			renderEnd

*/

		return chart;

	}//end barchart



	if(options.charttype == "multichart"){

		var chart = nv.models.multiChart();
		//chart.showControls(false);
		chart.margin({left: 40, bottom: 30, right: 10});
		chart.showLegend(true);
		chart.xAxis.showMaxMin(false);
		chart.yAxis1.showMaxMin(false);

		//chart.showYAxis(true);
		//chart.showXAxis(true);
		chart.noData("");

		chart.color(gColors);

		//chart.yDomain1([0,100]);
		chart.tooltip.valueFormatter(function (d) { return d; })

		chart.yAxis1
			//.tickFormat(d3.format('s'));
			.tickFormat(function(d) {
					if(d >= 1000 && d < 999999){
						var divi = (d/1000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "k";
					}else if(d >= 1000000){
						var divi = (d/1000000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "M";
					}else{
						var fixer = (d).toFixed(2);
						if(fixer.toString().endsWith("00") == true){
							fixer = Math.round(fixer);
						}
						return fixer;
					}
					//return (d >= 1000) ? (d/1000).toFixed(2)+"k" : d;
				});

		chart.bars1.duration = 0;
		chart.bars2.duration = 0;
		chart.lines1.duration = 0;
		chart.lines2.duration = 0;
				
		d3.select(this[0]).append("svg")
		  .datum([])
		  .call(chart);


		var self = this;
		var cb2 = function(e) {
			var chartID = $(this).closest(".chartbox").attr("id");

			chartShowLabel(chartID);
			chartSetColorsByStat(chartID);

		}

		chart.bars1.dispatch.on("renderEnd", cb2.bind(self));
		chart.bars2.dispatch.on("renderEnd", cb2.bind(self));
		chart.lines1.dispatch.on("renderEnd", cb2.bind(self));
		chart.lines2.dispatch.on("renderEnd", cb2.bind(self));
			
		return chart;

	}//end multichart



	if(options.charttype == "pie"){

		var chart = nv.models.pieChart()
				//.x(function(d) { return d3.time.format("%b '%y")(new Date(d.x)); })
				.y(function(d) { return d.y; })
				.labelThreshold(.05)
				.labelType("percent")
				.legendPosition("right")
				.showLegend(false)
				/*
				.labelType(function(d, i, values) {
					return values.key + ':' + values.value + ':' + values.percent;
				})
				*/
				;

		chart.margin({left: 20, bottom: -10, right: -10, top: -10});
		chart.noData("");

		chart.color(gColors);
		chart.tooltip.valueFormatter(function (d) { return d; })

		d3.select(this[0]).append("svg")
		  .datum([])
		  .call(chart);



			var self = this;
			var cb = function(e) {

			if(gTemp_CTRL_Pressed == false){
				gDrillDownFlyFilters.filters = {};
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}

			var chartID = $(this).closest(".chartbox").attr("id");

			if(gDrillDownFlyFilters.chartInitiator != chartID){
				gDrillDownFlyFilters.filters = {};
				$(".chartboxreleasedrilldown").addClass("hidden");
				$(".chartbox").css("background-color", "");
				$(".chartbox").removeClass("nv-elems-opaque");
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}

			gDrillDownFlyFilters.chartInitiator = chartID;
			var XSeriesField = verioChartObj[chartID].properties.xseries[0].field; //this is serializename
		 	if(gDrillDownFlyFilters.filters[XSeriesField] == null){
				gDrillDownFlyFilters.filters[XSeriesField] = [];
			}


			var selectedKey = e.data.x;
			var selected_FieldCode = selectedKey; //just temp assignment

			var existInArrayIndex = -1;

			var findInJSONObj = function(upperValue, findKey) {
				for (var i = 0, len = gDrillDownFlyFilters.filters[XSeriesField].length; i < len; i++) {
					if (gDrillDownFlyFilters.filters[XSeriesField][i][findKey] === upperValue)
						return i;
				}
				return -1;
			}

			if(gFilters[XSeriesField].datatype == "numeric"){
				var interval = verioChartObj[chartID].properties.xseries[0].vizdefaults.interval;
				selected_FieldCode = {lower: Number(selectedKey), upper: Number(selectedKey) + Number(interval)};

				existInArrayIndex = findInJSONObj(selected_FieldCode.upper, "upper");

			}else if(gFilters[XSeriesField].datatype == "date"){

				if(verioChartObj[chartID].properties.xseries[0].dateinterval == "month"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("month").valueOf()}; //startOf
				}else if(verioChartObj[chartID].properties.xseries[0].dateinterval == "year"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("year").valueOf()}; //startOf
				}else if(verioChartObj[chartID].properties.xseries[0].dateinterval == "day"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("day").valueOf()}; //startOf
				}

				existInArrayIndex = findInJSONObj(selected_FieldCode.upper, "upper");

			}else{
				selected_FieldCode = xRefListValue2FilterCode(XSeriesField, selectedKey);
				existInArrayIndex = gDrillDownFlyFilters.filters[XSeriesField].indexOf(selected_FieldCode);
			}


			if(existInArrayIndex < 0){
				gDrillDownFlyFilters.filters[XSeriesField].push(selected_FieldCode);
				d3.selectAll("#" + chartID).selectAll(".nv-pie").selectAll(".nv-slice:nth-child(" + (e.index + 1) + ")").classed("nv-elems-not-opaque",true);
			}else{
				gDrillDownFlyFilters.filters[XSeriesField].splice(existInArrayIndex, 1);
				d3.selectAll("#" + chartID).selectAll(".nv-pie").selectAll(".nv-slice:nth-child(" + (e.index + 1) + ")").classed("nv-elems-not-opaque",false);
			}

			if(Object.keys(gDrillDownFlyFilters.filters[XSeriesField]).length == 0){
				delete gDrillDownFlyFilters.filters[XSeriesField]; //this means nothing is selected for this serializename/field.
			}

			if(Object.keys(gDrillDownFlyFilters.filters).length == 0){
				gDrillDownFlyFilters.chartInitiator = null; //this means nothing is selected in the chart.
				$(".chartboxreleasedrilldown").addClass("hidden");
				$(".chartbox").css("background-color", "");
				$(".chartbox").removeClass("nv-elems-opaque");
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}else{
				$("#" + chartID + " .chartboxreleasedrilldown").removeClass("hidden");
				$("#" + chartID).css("background-color", "#C0FF00");
				$("#" + chartID).addClass("nv-elems-opaque");
			}

			updateAllCharts(); //"DRILL_DOWN_FLY"
		 };
		 chart.pie.dispatch.on('elementClick', cb.bind(self));




		return chart;

	}//end piechart



	if(options.charttype == "donut"){

		var chart = nv.models.pieChart()
				//.x(function(d) { return d3.time.format("%b '%y")(new Date(d.x)); })
				.y(function(d) { return d.y; })
				.labelThreshold(.05)
				.labelType("percent")
				.legendPosition("right")
				.showLegend(false)
				.donut(true)
				.donutRatio(0.4)
				;

		chart.margin({left: 20, bottom: -10, right: -10, top: -10});
		chart.noData("");

		chart.color(gColors);
		chart.tooltip.valueFormatter(function (d) { return d; })

		d3.select(this[0]).append("svg")
		  .datum([])
		  .call(chart);



			var self = this;
			var cb = function(e) {

			if(gTemp_CTRL_Pressed == false){
				gDrillDownFlyFilters.filters = {};
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}

			var chartID = $(this).closest(".chartbox").attr("id");

			if(gDrillDownFlyFilters.chartInitiator != chartID){
				gDrillDownFlyFilters.filters = {};
				$(".chartboxreleasedrilldown").addClass("hidden");
				$(".chartbox").css("background-color", "");
				$(".chartbox").removeClass("nv-elems-opaque");
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}

			gDrillDownFlyFilters.chartInitiator = chartID;
			var XSeriesField = verioChartObj[chartID].properties.xseries[0].field; //this is serializename
		 	if(gDrillDownFlyFilters.filters[XSeriesField] == null){
				gDrillDownFlyFilters.filters[XSeriesField] = [];
			}


			var selectedKey = e.data.x;
			var selected_FieldCode = selectedKey; //just temp assignment

			var existInArrayIndex = -1;

			var findInJSONObj = function(upperValue, findKey) {
				for (var i = 0, len = gDrillDownFlyFilters.filters[XSeriesField].length; i < len; i++) {
					if (gDrillDownFlyFilters.filters[XSeriesField][i][findKey] === upperValue)
						return i;
				}
				return -1;
			}

			if(gFilters[XSeriesField].datatype == "numeric"){
				var interval = verioChartObj[chartID].properties.xseries[0].vizdefaults.interval;
				selected_FieldCode = {lower: Number(selectedKey), upper: Number(selectedKey) + Number(interval)};

				existInArrayIndex = findInJSONObj(selected_FieldCode.upper, "upper");

			}else if(gFilters[XSeriesField].datatype == "date"){

				if(verioChartObj[chartID].properties.xseries[0].dateinterval == "month"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("month").valueOf()}; //startOf
				}else if(verioChartObj[chartID].properties.xseries[0].dateinterval == "year"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("year").valueOf()}; //startOf
				}else if(verioChartObj[chartID].properties.xseries[0].dateinterval == "day"){
					selected_FieldCode = {lower: Number(selectedKey), upper: moment(Number(selectedKey)).utc().endOf("day").valueOf()}; //startOf
				}

				existInArrayIndex = findInJSONObj(selected_FieldCode.upper, "upper");

			}else{
				selected_FieldCode = xRefListValue2FilterCode(XSeriesField, selectedKey);
				existInArrayIndex = gDrillDownFlyFilters.filters[XSeriesField].indexOf(selected_FieldCode);
			}


			if(existInArrayIndex < 0){
				gDrillDownFlyFilters.filters[XSeriesField].push(selected_FieldCode);
				d3.selectAll("#" + chartID).selectAll(".nv-pie").selectAll(".nv-slice:nth-child(" + (e.index + 1) + ")").classed("nv-elems-not-opaque",true);
			}else{
				gDrillDownFlyFilters.filters[XSeriesField].splice(existInArrayIndex, 1);
				d3.selectAll("#" + chartID).selectAll(".nv-pie").selectAll(".nv-slice:nth-child(" + (e.index + 1) + ")").classed("nv-elems-not-opaque",false);
			}

			if(Object.keys(gDrillDownFlyFilters.filters[XSeriesField]).length == 0){
				delete gDrillDownFlyFilters.filters[XSeriesField]; //this means nothing is selected for this serializename/field.
			}

			if(Object.keys(gDrillDownFlyFilters.filters).length == 0){
				gDrillDownFlyFilters.chartInitiator = null; //this means nothing is selected in the chart.
				$(".chartboxreleasedrilldown").addClass("hidden");
				$(".chartbox").css("background-color", "");
				$(".chartbox").removeClass("nv-elems-opaque");
				$(".nv-elems-not-opaque").removeClass("nv-elems-not-opaque");
				d3.selectAll(".nv-elems-not-opaque").classed("nv-elems-not-opaque",false);
			}else{
				$("#" + chartID + " .chartboxreleasedrilldown").removeClass("hidden");
				$("#" + chartID).css("background-color", "#C0FF00");
				$("#" + chartID).addClass("nv-elems-opaque");
			}

			updateAllCharts(); //"DRILL_DOWN_FLY"
		 };
		 chart.pie.dispatch.on('elementClick', cb.bind(self));


		return chart;

	}//end donutchart



	if(options.charttype == "area"){

		var chart = nv.models.stackedAreaChart();
		chart.showControls(false);
		chart.margin({left: 40, bottom: 30, right: 10});
		chart.showLegend(true);
		chart.showYAxis(true);
		chart.showXAxis(true);
		chart.clipEdge(true);
		chart.noData("");

		chart.color(gColors);
		chart.tooltip.valueFormatter(function (d) { return d; })

		chart.yAxis
			//.tickFormat(d3.format('s'));
			.tickFormat(function(d) {
					if(d >= 1000 && d < 999999){
						var divi = (d/1000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "k";
					}else if(d >= 1000000){
						var divi = (d/1000000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "M";
					}else{
						var fixer = (d).toFixed(2);
						if(fixer.toString().endsWith("00") == true){
							fixer = Math.round(fixer);
						}
						return fixer;
					}
					//return (d >= 1000) ? (d/1000).toFixed(2)+"k" : d;
				});

		d3.select(this[0]).append("svg")
		  .datum([])
		  .call(chart);

		return chart;

	}//end barchart



	if(options.charttype == "scatter"){

		var chart = nv.models.scatterChart();
		chart.margin({left: 40, bottom: 30, right: 10});
		chart.showLegend(true);
		chart.showYAxis(true);
		chart.showXAxis(true);
		chart.noData("");
		//chart.pointSize(300);
		//chart.pointRange(3.14,6.28);
		//chart.pointShape("cross");

		chart.color(gColors);
		chart.tooltip.valueFormatter(function (d) { return d; })

		chart.yAxis
			//.tickFormat(d3.format('s'));
			.tickFormat(function(d) {
					if(d >= 1000 && d < 999999){
						var divi = (d/1000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "k";
					}else if(d >= 1000000){
						var divi = (d/1000000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "M";
					}else{
						var fixer = (d).toFixed(2);
						if(fixer.toString().endsWith("00") == true){
							fixer = Math.round(fixer);
						}
						return fixer;
					}
					//return (d >= 1000) ? (d/1000).toFixed(2)+"k" : d;
				});

		d3.select(this[0]).append("svg")
		  .datum([])
		  .call(chart);

		return chart;

	}//end scatter




	if(options.charttype == "boxplot"){

		var chart = nv.models.boxPlotChart();
		chart.margin({left: 40, bottom: 30, right: 10});
		//chart.showYAxis(true);
		//chart.showXAxis(true);
		chart.noData("");
    chart.staggerLabels(true);
    chart.maxBoxWidth(15);

		chart.color(gColors);


		chart.y(function(d) { return d; });
		chart.yAxis
			//.tickFormat(d3.format('s'));
			.tickFormat(function(d) {
					if(d >= 1000 && d < 999999){
						var divi = (d/1000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "k";
					}else if(d >= 1000000){
						var divi = (d/1000000).toFixed(2);
						if(divi.toString().endsWith("00") == true){
							divi = Math.round(divi);
						}
						return divi + "M";
					}else{
						var fixer = (d).toFixed(2);
						if(fixer.toString().endsWith("00") == true){
							fixer = Math.round(fixer);
						}
						return fixer;
					}
					//return (d >= 1000) ? (d/1000).toFixed(2)+"k" : d;
				});

		d3.select(this[0]).append("svg")
		  .datum([])
		  .call(chart);

		return chart;

	}//end scatter	
	
	
	
	
	if(options.charttype == "map"){

		var chartboxID = $(this).closest(".chartbox").attr("id");
		$("#" + chartboxID).find(".baseseries").remove();
		$("#" + chartboxID).find(".chartboxcopy").remove();
		

		var mapdiv = $("<div>", {id: "map" + chartboxID});
		mapdiv.css("margin","10px").css("margin-bottom","50px").css("height","100%");
		$(this).append(mapdiv);


		var maplegenddiv = $("<div>", {id: "maplegend" + chartboxID, class: "maplegendtop", html: "<div><div class='lhead'>Legend</div><div class='city'></div><div class='zip'></div><span>Hover over map</span></div>"});
		$(this).append(maplegenddiv);

		var mapinfohoverdiv = $("<div>", {id: "mapinfohover" + chartboxID, class: "mapinfohover hidden", html: "<div><div class='lhead'>Legend</div><div class='city'></div><div class='zip'></div><span>Hover over map</span></div>"});
		$(this).append(mapinfohoverdiv);


		var cfg = {
			"intensity": 0.8,
			"gradient": ['#feedde','#fdbe85','#fd8d3c','#d94701'],
		};


		if(options.xseries && options.xseries[0] && options.xseries[0].vizdefaults){
			var selectedGradIndex = Number(options.xseries[0].vizdefaults.gradient || 0);
			var selectedIntensity = options.xseries[0].vizdefaults.intensity || 0.7;
			if(selectedGradIndex < gHeatGradients.length){
				cfg.gradient = gHeatGradients[selectedGradIndex];
			}
			cfg.intensity = selectedIntensity;
		}

		var chart = L.map("map" + chartboxID).setView(gConfigs.mapcenter, 10);  //hawaii - [21.470358, -157.995809]

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWFudXByYWIiLCJhIjoiY2ltZ3UzaGozMDA4NXVsa285d2xiMnhrdyJ9.XKC94sYGN9Kd7DhTaKgAUw', {
					maxZoom: 18,
					attribution: '� VerioMed',
					id: 'mapbox.streets'
				}).addTo(chart);

		window.setTimeout(function() {
			var cog_aElem = $('<a />', {class: 'fa fa-cog baseseries_btn_options', href: '#', title: 'Settings'});
			var divSettings = $('<div />', {class: 'leaflet-bar leaflet-control'}); //'<div class="leaflet-control-zoom leaflet-bar leaflet-control"><a class="leaflet-control-zoom-in" href="#" title="Zoom in">+</a></div>';
			divSettings.append(cog_aElem);
			$("#" + chartboxID).find(".leaflet-control-container .leaflet-bottom.leaflet-left").append(divSettings);

			var info_aElem = $('<a />', {class: 'fa fa-info mapinfobtn', style: 'cursor:pointer'});
			var divInfo = $('<div />', {class: 'leaflet-bar leaflet-control'}); //'<div class="leaflet-control-zoom leaflet-bar leaflet-control"><a class="leaflet-control-zoom-in" href="#" title="Zoom in">+</a></div>';
			divInfo.append(info_aElem);
			$("#" + chartboxID).find(".leaflet-control-container .leaflet-top.leaflet-left").append(divInfo);

		}, 1000);


		var topoLayer = new L.TopoJSON();
		topoLayer.addData(gZIPTopoJSON);
		topoLayer.addTo(chart);

/*
		var popup = new L.Popup({ autoPan: false });
		chart.popup = popup;
		chart.topoLayer = topoLayer;
*/

		chart.vccchartID = chartboxID;

		$(this).find(".leaflet-control-attribution").html("&#169; VerioMed");

		return {map: chart, topoLayer: topoLayer, cfg: cfg, data: null}; //popup: popup,

	}//end map



	if(options.charttype == "dhheat"){

		var chartboxID = $(this).closest(".chartbox").attr("id");
		$("#" + chartboxID).find(".baseseries").remove();

		var chart = new heatmapChart(this[0]);
		return {heatobj: chart, data: [], elem: this[0]};

	} // end dhheat


	if(options.charttype == "datatable"){

		var chartboxID = $(this).closest(".chartbox").attr("id");
		$("#" + chartboxID).find(".baseseries").remove();
		$("#" + chartboxID).find(".dimensionseries").remove();
		$("#" + chartboxID).find(".chartboxoptions").remove();
		$("#" + chartboxID).find(".chartboxcopy").remove();
		$("#" + chartboxID).find(".chartboxexportdata").removeClass("hidden");
		$("#" + chartboxID).find(".mychart").css("left","16px").css("right","16px");

		
		var fields = verioChartObj[chartboxID].properties.xseries[0].vizdefaults.tablefields;// = ["coll", "age", "sex", "tc"];
		if(!fields){
			fields = [{id:"coll", width: null}, {id:"age", width: null}, {id:"sex", width: null}, {id:"tc", width: null}];
		}

		var chart = new dataTableChart(chartboxID, this[0], fields);

		return {tableobj: chart, data: [], elem: this[0], fields: fields};

	} // end datatable
	
	
	if(options.charttype == "funnel"){

		var chartboxID = $(this).closest(".chartbox").attr("id");
		$("#" + chartboxID).find(".baseseries").remove();
		$("#" + chartboxID).find(".mychart").css("margin","20px 50px 0");

		var cog_aElem = $('<a />', {class: 'fa fa-cog baseseries_btn_options', href: '#', title: 'Settings'});
		var divSettings = $('<div />', {class: 'leaflet-bar leaflet-control'});
		divSettings.append(cog_aElem);
		divSettings.attr("style", "position: absolute;bottom: 20px;right: 20px;box-shadow: 0 0px 1px rgba(0,0,0,0.65);border-radius:0px");
		$("#" + chartboxID).find(".chartbase").append(divSettings);
		
		var options = verioChartObj[chartboxID].properties.xseries[0].vizdefaults;
		if(!options){
			options = { block: { dynamicHeight: true, dynamicSlope: false, fill: {type: "solid"}, highlight: false }, chart: { animate: 0, bottomPinch: 1 } };
		}
		
		var divFunnel = $('<div />', {class: 'funnelcontainer', style: 'height:100%'});
		this.append(divFunnel);
		var chart = new funnelChart(chartboxID, this.find(".funnelcontainer")[0], options);
		return {funnelobj: chart, data: [], elem: this[0]};

	} // end funnel



	if(options.charttype == "textarea"){
		
		var chartboxID = $(this).closest(".chartbox").attr("id");
		$("#" + chartboxID).find(".baseseries").remove();
		$("#" + chartboxID).find(".dimensionseries").remove();
		$("#" + chartboxID).find(".chartboxoptions").remove();
		$("#" + chartboxID).find(".chartboxsettings").remove();
		$("#" + chartboxID).find(".chartboxfullscreen").remove();
		$("#" + chartboxID).find(".chartboxcopy").remove();
		$("#" + chartboxID).find(".chartboxedittextarea").removeClass("hidden");
		
		
		if(options.reinit == null){
		var divEditor = $('<div />', {class: 'htmleditor', style: 'padding: 10px;overflow-x: auto;overflow-y: auto;'});
		divEditor.css("height", $('#' + chartboxID + ' .chartboxpanel').outerHeight());
		var divEditorbody = $('<div />', {class: 'htmleditorbody'});
		divEditor.append(divEditorbody);

		$("#" + chartboxID).find(".chartboxpanel").append(divEditor);
		
		$('#' + chartboxID + ' .chartbase').empty().css('padding','0px');
		$('#' + chartboxID + ' .nv-panel-body').find('hr').remove();
		$('#' + chartboxID + ' .nv-panel-body').find('.vizcaption').remove();
		$('#' + chartboxID + ' .nv-panel-body').css('padding','0px');
		$('#' + chartboxID + ' .nv-template-header').detach().prependTo('#' + chartboxID).css('position','absolute').css('right','25px').css('top','10px');
		}
		var vizdefaults = verioChartObj[chartboxID].properties.xseries[0].vizdefaults;
		var decodedHTMLData = "";
		if(vizdefaults && vizdefaults.htmldata && vizdefaults.htmldata != ""){
			decodedHTMLData = decodeURIComponent((vizdefaults.htmldata));
		}else{
			decodedHTMLData = '<p><span style="font-size: 18pt;">Rich Presentation!</span></p><p><span style="color: #ff6600;">Click on the edit menu button to start creating your rich textual presentation content</span></p>';
		}
		
		$("#" + chartboxID).find(".htmleditorbody").html(decodedHTMLData);
		$("#" + chartboxID).find(".chartbase").html(decodedHTMLData);

		var htmlEditor = tinymce.init({
			selector: '#' + chartboxID + ' .chartbase',
			//height: $('#' + chartboxID + ' .chartbase').outerHeight(),
			//height: "100%",
			menubar: false,
			statusbar: false,
			paste_data_images: true,
			toolbar: "vmeddone vmedtest | styleselect sizeselect | fontselect fontsizeselect | bold italic | forecolor backcolor emoticons | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
			plugins: [
				'advlist autolink lists link image charmap print preview anchor',
				'searchreplace visualblocks code fullscreen',
				'insertdatetime media table contextmenu paste code',
				'emoticons template paste textcolor colorpicker textpattern imagetools',
				//'autoresize',
			],
			/*
			content_css: [
				'//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
				'//www.tinymce.com/css/codepen.min.css'
			],*/
			//inline: true,
			//toolbar_item_size: "small",
			//contextmenu: "cut copy paste",
			//theme: "modern",
    setup: function (theEditor) {

        theEditor.on("init", function () {
            if(options.reinit == null){
							$(this.contentAreaContainer.parentElement).find("div.mce-toolbar-grp").hide();
							$("#" + theEditor.id).closest(".chartbox").find(".nv-panel-body").addClass("hidden");
						}
        });
				theEditor.on('change', function(e) {
					 $("#" + theEditor.id).closest(".chartbox").find(".htmleditorbody").html(theEditor.getContent());
						var invoked_chartID = $("#" + theEditor.id).closest(".chartbox").attr("id");
						verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults.htmldata = (encodeURIComponent(theEditor.getContent()));
				});

				theEditor.addButton('vmeddone', {
					text: 'Done',
					icon: false,
					onclick: function () {
						//theEditor.insertContent('&nbsp;<b>It\'s my button!</b>&nbsp;');
						$("#" + theEditor.id).closest(".chartbox").find("div.mce-toolbar-grp").hide();
						$("#" + theEditor.id).closest(".chartbox").find(".nv-template-header").removeClass("hidden");
						$("#" + theEditor.id).closest(".chartbox").find(".nv-panel-body").addClass("hidden");
						$("#" + theEditor.id).closest(".chartbox").find(".htmleditorbody").html(theEditor.getContent());

						//var ftest = $("#filter_gender").closest(".filterparentDOM").clone(false, false);
						//ftest.width("170");
						//$("#" + theEditor.id).closest(".chartbox").find(".htmleditorbody").append(ftest);
						
						var invoked_chartID = $("#" + theEditor.id).closest(".chartbox").attr("id");
						verioChartObj[invoked_chartID].properties.xseries[0].vizdefaults.htmldata = (encodeURIComponent(theEditor.getContent()));
						
						$("#" + theEditor.id).closest(".chartbox").find(".htmleditorbody .rich_action_filter").each(function(index) {
							var filter_serializename = $(this).attr("data-filter");
							alert(filter_serializename);
							var filterObj = $("#filter_" + gFilters[filter_serializename].name).closest(".filterparentDOM").clone(false, false);
							filterObj.width("170");
							filterObj.insertBefore($(this));
							$(this).remove();

							filterObj.find(".cb" + gFilters[filter_serializename].name).change(function(event) {
									var tempfiltertype = $(this).closest('.filtercontainer').attr('filtertype');
									var tempfiltername = $(this).closest('.filtercontainer').attr('name');

									if( tempfiltertype == 'checkbox' ) {

											$(this).closest('.filtercontainer').find( ".cb" + tempfiltername + "noneselected" ).toggleClass( 'filterserialize', false);

											if ( ($(this).closest('.filtercontainer').find("input.cb" + tempfiltername + ":checkbox:not(:checked)").length) == 0) { //number of unchecked boxes
														$(this).closest('.filtercontainer').find( ".cb" + tempfiltername ).toggleClass( 'filterserialize', false ); //Dont set filterserialize when all boxes checked
											}else{
														if ($(this).closest('.filtercontainer').find("input.cb" + tempfiltername).length == $(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":checkbox:not(:checked)" ).length ){
																	$(this).closest('.filtercontainer').find( ".cb" + tempfiltername + "noneselected" ).toggleClass( 'filterserialize', true);
																	$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername ).toggleClass( 'filterserialize', false);
														}else{
																	$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":checkbox:checked" ).toggleClass( 'filterserialize', true);
																	$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":checkbox:not(:checked)" ).toggleClass( 'filterserialize', false );
														}
											}

									} else if( tempfiltertype == 'radio' ) {
											$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername ).toggleClass( 'filterserialize', false);
											$(this).closest('.filtercontainer').find( "input.cb" + tempfiltername + ":radio:checked" ).toggleClass( 'filterserialize', true);
									}

									updateAllCharts();
							});							
							//zzz
						});
						
						
						
					}
				});

				theEditor.addButton('vmedtest', {
					text: 'Filters',
					icon: false,
					onclick: function () {
						//var ftest = $("#filter_gender").closest(".filterparentDOM").clone(false, false);
						//ftest.width("170");
						theEditor.insertContent('<div class="rich_action_filter" data-filter="sex" style="position: relative;padding: 10px;background-color: gainsboro;width: 170px;font-size: 12px;cursor: pointer;"><span>Filter: </span><span style="color: red;">Gender</span><div style="position: absolute;top: 0;left: 0;width: 190px;height: 35px;">aaa</div></div>');
						//theEditor.insertContent("<div class='filterparentDOM'>" + ftest.html() + "</div>");
					}
				});				
    }
		});

		var chart = new textareaChart(chartboxID);		
		return {htmleditor: chart, elem: htmlEditor};

	} // end textarea	

}

			function getTransformInObj(a){
				var b={};
				for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
				{
					var c = a[i].match(/[\w\.\-]+/g);
					b[c.shift()] = c;
				}
				return b;
			}

			
			function chartHighlightPredictions(chartID){
				
				try{
					d3.selectAll('#dashboard-chartarea #' + chartID + ' .predicted-model-lines').each(function(pmv){
						d3.select(this).remove();
					});
					if(verioChartObj[chartID].properties.xseries[0].vizdefaults && verioChartObj[chartID].properties.xseries[0].vizdefaults.forecast && verioChartObj[chartID].properties.xseries[0].vizdefaults.forecast != 0){
						d3.selectAll('#dashboard-chartarea #' + chartID + ' .nv-group').each(function(group){
								var g = d3.select(this);
								var prevBar = null;
								var prevBarObj = null;

								g.selectAll('.nv-bar').each(function(bar){

									if(bar.predict == true){
											if(bar.y < 0){
												d3.select(this)
												.attr("y", Number(d3.select(this).attr("y")) + Number(d3.select(this).attr("height")))
											}

											d3.select(this)
													.attr("rx", "5")
													.attr("ry", "5")
													.attr("x", (d3.select(this).attr("width")/2)-5)
													.attr("width", "10")
													.attr("height", "10")
													.attr("style", "fill:#FF2626")
													.classed('predicted-model-values', true);

											
											if(prevBar != null){
												g.append("line")
													.classed("predicted-model-lines", true)
													.attr("style", (prevBarObj.state == "future") ? "stroke:#FF2626;stroke-width:1;stroke-dasharray:5,3" : "stroke:#FF2626;stroke-width:1")
													.attr("x1", 5 + Number(d3.select(prevBar).attr("x")) + Number(getTransformInObj(d3.select(prevBar).attr('transform')).translate[0])).attr("y1", Number(d3.select(prevBar).attr("y")) + 5)
													.attr("x2", 5 + Number(d3.select(this).attr("x")) + Number(getTransformInObj(d3.select(this).attr('transform')).translate[0])).attr("y2", Number(d3.select(this).attr("y")) + 5);
											}
											prevBar = this;
											prevBarObj = bar;

									}
								});
						});
					}
						
				}catch(e){
				}

			}

			function chartShowLabel(chartID){
				//showValueInteger = 0:false, 1:true
				try{
					
					var showValueInteger = verioChartObj[chartID].properties.xseries[0].vizdefaults.showlabel || "0";
					var chartType = verioChartObj[chartID].properties.charttype;

					if(showValueInteger.toString() == "0" || showValueInteger == "False"){
						d3.selectAll("#dashboard-chartarea #" + chartID + " .vmed-label-values").remove();
					}else{
						d3.select('#dashboard-chartarea #' + chartID + ' .nvd3').each(function(group){ // .nv-multibar .nv-group
							var g = d3.select(this);

							// Remove previous labels if there is any
							g.selectAll('.vmed-label-values').remove();

							if(chartType=="line"){
								var totalPoints = g.selectAll('.nv-point')[0].length;
								var previous_BarY = null;
								var YSeriesID = null;
								
								g.selectAll('.nv-point').each(function(point, pointIndex){

								if(YSeriesID != point[0].id){
									previous_BarY = null;
								}
								YSeriesID = point[0].id;
								
								var b = d3.select(this);
								var tsfrm = getTransformInObj(b.attr('transform'));

								g.append('text')
									.attr('transform', "translate(" + ((pointIndex == totalPoints-1) ? (Number(tsfrm.translate[0]) - 40) : (Number(tsfrm.translate[0]) + 5)) + "," + (Number(tsfrm.translate[1])-10) + ")") //b.attr('transform')
									.text(function(){
										
										var yVal = (point[0].y).toFixed(2);
										var prefix = "";
										var suffix = "";

										if(showValueInteger == 1){
											yVal = Number(yVal).toFixed(2);
										}else{
											if(previous_BarY != null){
												if(showValueInteger == 2){
													yVal = ((yVal - previous_BarY)*100)/previous_BarY;
													suffix = "%";
												}else if(showValueInteger == 3){
													yVal = (yVal - previous_BarY);
												}
												if(yVal >= 0) {
													prefix = "+";
												}
												yVal = Number(yVal).toFixed(2);
											}else{
												yVal = "";
											}
										}
										
										if(yVal != "" && yVal.toString().endsWith("00") == true){
												yVal = parseFloat(Math.round(yVal));
										}
										previous_BarY = point[0].y;
										
										return prefix + yVal + suffix;

										
									
									
									
									})
									.attr('style', 'fill: black;font-size: 12px;pointer-events:none;')
									.attr('class', 'vmed-label-values');
								});

							}else if(chartType=="bar" || chartType=="multichartzzzz"){
								var previous_BarY = null;
								var YSeriesID = null;
								g.selectAll('.nv-bar').each(function(bar){

									if(bar.predict != true){
								
										if(YSeriesID != bar.id){
											previous_BarY = null;
										}
										YSeriesID = bar.id;

										var b = d3.select(this);
										var barWidth = b.attr('width');
										var barHeight = b.attr('height');

										g.append('text')
											.attr('transform', b.attr('transform'))
											.text(function(){
												var yVal = (bar.y).toFixed(2);
												var prefix = "";
												var suffix = "";

												if(showValueInteger == 1){
													yVal = Number(yVal).toFixed(2);
												}else{
													if(previous_BarY != null){
														if(showValueInteger == 2){
															yVal = ((yVal - previous_BarY)*100)/previous_BarY;
															suffix = "%";
														}else if(showValueInteger == 3){
															yVal = (yVal - previous_BarY);
														}
														if(yVal >= 0) {
															prefix = "+";
														}
														yVal = Number(yVal).toFixed(2);
													}else{
														yVal = "";
													}
												}
												
												if(yVal != "" && yVal.toString().endsWith("00") == true){
														yVal = parseFloat(Math.round(yVal));
												}
												previous_BarY = bar.y;
												
												return prefix + yVal + suffix;
											})
											.attr('style', function(){
												if(this.getBBox().width > barWidth){
													return 'fill: black;font-size: 10px;pointer-events:none;';
												}else{
													return 'fill: white;font-size: 12px;pointer-events:none;';
													//return 'fill: black;font-size: 12px;pointer-events:none;';											
												}
											})
											
											.attr('y', function(){
												//var height = this.getBBox().height;
												return parseFloat(b.attr('y')) + 15;
											})
											.attr('x', function(){
												// Center label horizontally
												var width = this.getBBox().width;
												return parseFloat(b.attr('x')) + (parseFloat(barWidth) / 2) - (width / 2);
											})
											.attr('class', 'vmed-label-values');
										}
									}
								);
								
							}else if(chartType=="horizontal-bar"){
								var previous_BarY = null;
								var YSeriesID = null;
								
								g.selectAll('.nv-bar').each(function(bar){

								if(YSeriesID != bar.id){
									previous_BarY = null;
								}
								YSeriesID = bar.id;
								
								var b = d3.select(this);
								var barWidth = b.attr('width');
								var barHeight = b.attr('height');

								g.append('text')
									.attr('transform', b.attr('transform'))
									.text(function(){
										var yVal = (bar.y).toFixed(2);
										var prefix = "";
										var suffix = "";

										if(showValueInteger == 1){
											yVal = Number(yVal).toFixed(2);
										}else{
											if(previous_BarY != null){
												if(showValueInteger == 2){
													yVal = ((yVal - previous_BarY)*100)/previous_BarY;
													suffix = "%";
												}else if(showValueInteger == 3){
													yVal = (yVal - previous_BarY);
												}
												if(yVal >= 0) {
													prefix = "+";
												}
												yVal = Number(yVal).toFixed(2);
											}else{
												yVal = "";
											}
										}
										
										if(yVal != "" && yVal.toString().endsWith("00") == true){
												yVal = parseFloat(Math.round(yVal));
										}
										previous_BarY = bar.y;
										
										return prefix + yVal + suffix;
									})

									.attr('style', 'fill: white;font-size: 12px;pointer-events:none;')
									.attr('y', function(){
										var height = b.node().getBBox().height;
										return parseFloat((height/2) + 4);
									})
									.attr('x', function(){
										// Center label horizontally
										var width = b.node().getBBox().width;
										var textWidth = this.getBBox().width;
										return parseFloat(width - textWidth - 10);
									})
									.attr('class', 'vmed-label-values');
								});
							}


						});
					}
				
				}catch(e){
					
				}
			}






			function chartSetColorsByStat(chartID){
				try{
					var chartType = verioChartObj[chartID].properties.charttype;
					var plotDimensions = {maxValue:0, minValue:0};
					var visibleDimensions = {}; //because when legend is clicked series might be invisible, we need to calculate max value of visible series to compute charted heights of avg etc...
					
					d3.selectAll("#dashboard-chartarea #" + chartID + " .vmed-label-markers").remove();
					
					d3.selectAll('#dashboard-chartarea #' + chartID ).each(function(group){ // + ' .nvd3' .nv-multibar .nv-group
						var g = d3.select(this);

						if(chartType=="line"){

							g.selectAll('.nv-point').each(function(point){
								var b = d3.select(this);

								plotDimensions.maxValue = Math.max(plotDimensions.maxValue, point[0].y);
								plotDimensions.minValue = Math.min(plotDimensions.minValue, point[0].y);
								visibleDimensions[point[0].id] = chartID;
								//console.log(plotDimensions.maxValue, point[0].y);
								
								var dimension_object = verioChartObj[chartID].properties.yseries[point[0].id];

								if(dimension_object.markers && dimension_object.markers.showMaxValColor && dimension_object.markers.showMaxValColor.status == "visible" && point[0].y == gChartStats[point[0].id].max){
									b.attr('style', 'stroke: ' + dimension_object.markers.showMaxValColor.color + ';fill: ' + dimension_object.markers.showMaxValColor.color);
								}
								if(dimension_object.markers && dimension_object.markers.showMinValColor && dimension_object.markers.showMinValColor.status == "visible" && point[0].y == gChartStats[point[0].id].min){
									b.attr('style', 'stroke: ' + dimension_object.markers.showMinValColor.color + ';fill: ' + dimension_object.markers.showMinValColor.color);
								}
								for(var levelsIndex in dimension_object.colorlevels){
																	
									var CL = dimension_object.colorlevels[levelsIndex];
									var leftCompVal = 0;
									if(CL.Metric == "value"){
										leftCompVal = CL.Value;
									}else if(CL.Metric == "percent"){
										leftCompVal = (CL.Value/100) * gChartStats[point[0].id].sum;
									}else{
										leftCompVal = gChartStats[point[0].id][CL.Metric];
									}

									if(CL.Operator == "gt" && point[0].y > leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
									if(CL.Operator == "gte" && point[0].y >= leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
									if(CL.Operator == "lt" && point[0].y < leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
									if(CL.Operator == "lte" && point[0].y <= leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}					
									if(CL.Operator == "eq" && point[0].y == leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}	
									if(CL.Operator == "neq" && point[0].y != leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
								}
								
							});

							}else if(chartType=="bar" || chartType=="horizontal-bar"){

							g.selectAll('.nv-bar').each(function(bar){
								var b = d3.select(this);

								plotDimensions.maxValue = Math.max(plotDimensions.maxValue, bar.y);
								plotDimensions.minValue = Math.min(plotDimensions.minValue, bar.y);
								visibleDimensions[bar.id] = chartID;
								//console.log(plotDimensions.maxValue, bar.y);
								
								var dimension_object = verioChartObj[chartID].properties.yseries[bar.id];

								if(dimension_object.markers && dimension_object.markers.showMaxValColor && dimension_object.markers.showMaxValColor.status == "visible" && bar.y == gChartStats[bar.id].max){
									b.attr('style', 'stroke: ' + dimension_object.markers.showMaxValColor.color + ';fill: ' + dimension_object.markers.showMaxValColor.color);
								}
								if(dimension_object.markers && dimension_object.markers.showMinValColor && dimension_object.markers.showMinValColor.status == "visible" && bar.y == gChartStats[bar.id].min){
									b.attr('style', 'stroke: ' + dimension_object.markers.showMinValColor.color + ';fill: ' + dimension_object.markers.showMinValColor.color);
								}
								
								for(var levelsIndex in dimension_object.colorlevels){
																	
									var CL = dimension_object.colorlevels[levelsIndex];
									var leftCompVal = 0;
									if(CL.Metric == "value"){
										leftCompVal = CL.Value;
									}else if(CL.Metric == "percent"){
										leftCompVal = (CL.Value/100) * gChartStats[bar.id].sum;
									}else{
										leftCompVal = gChartStats[bar.id][CL.Metric];
									}

									if(CL.Operator == "gt" && bar.y > leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
									if(CL.Operator == "gte" && bar.y >= leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
									if(CL.Operator == "lt" && bar.y < leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
									if(CL.Operator == "lte" && bar.y <= leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}					
									if(CL.Operator == "eq" && bar.y == leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}	
									if(CL.Operator == "neq" && bar.y != leftCompVal){
										b.attr('style', 'stroke: ' + CL.Color + ';fill: ' + CL.Color);
									}
								}
								
							});
							
						}

						
						//Dimension Markers like avg, stddev lines.....

						$.each(visibleDimensions, function(groupID, nvgroup) {
							var gCA = d3.select('#dashboard-chartarea #' + chartID + ' .nv-groups');
							if(chartType=="line"){
								gCA = d3.select('#dashboard-chartarea #' + chartID + ' .nvd3 rect');
							}
							var gCA_Dimensions = gCA.node().getBBox(); //spits out x, y, height, width
							
							if(chartType=="horizontal-bar"){

									var funcDrawLine = function (metricTitle, metricVal, computedXVal, color){
										var appendElem = d3.select('#dashboard-chartarea #' + chartID + ' .nv-groups');
										appendElem.append('line')
												.attr('style', 'fill:' + color + ';stroke:' + color + ';stroke-width:1')
												.attr('x1', computedXVal)
												.attr('x2', computedXVal)
												.attr('y1', 0)
												.attr('y2', gCA_Dimensions.height+20)
												.attr('class', 'vmed-label-markers');

										//var metricVal = gChartStats[groupID].mean.toFixed(2);
										if(metricVal.toString().endsWith("00") == true){
											metricVal = Math.round(metricVal);
										}

										appendElem.append("g")
												.attr("class", "vmed-label-markers")
												.attr("transform", "translate(" + (computedXVal + 9) +"," + 5 + ")")
											.append("text")
												.attr("y", 0)
												.attr("x", 9)
												.attr("dy", ".35em")
												.attr("transform", "rotate(90)")
												.text(metricTitle + '=' + metricVal)
												.style("text-anchor", "start");
										
										/*appendElem.append('text')
												.text(metricTitle + '=' + metricVal)
												.attr('transform','translate(' + 0 + ',' + 5 + ')rotate(90)')
												.attr('style', 'fill: black;font-size: 12px;font-weight: bold;')
												.attr('y', computedXVal+4)
												.attr('x', 5)
												.style("text-anchor", "start")
												.attr('class', 'vmed-label-markers');*/
									};

									
									var computedStatsDimension = {};
									var markers = verioChartObj[chartID].properties.yseries[groupID].markers;
									if(markers!=null){
										$.each(markers, function(markerID, markerItem) {
											if(markers[markerID].status == "visible"){
												var metricTitle;
												var metricVal;
												var computedYVal;
												var color;

												if(markerID == "showAverageMarker"){
													metricTitle = "Avg";
													computedYVal = ((gCA_Dimensions.width * gChartStats[groupID].mean)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												if(markerID == "showSD1Marker"){
													metricTitle = "+1σ";
													computedYVal = ((gCA_Dimensions.width * gChartStats[groupID].mean_plus_std1)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_plus_std1.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);

													metricTitle = "-1σ";
													computedYVal = ((gCA_Dimensions.width * gChartStats[groupID].mean_minus_std1)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_minus_std1.toFixed(2);
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												if(markerID == "showSD2Marker"){
													metricTitle = "+2σ";
													computedYVal = ((gCA_Dimensions.width * gChartStats[groupID].mean_plus_std2)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_plus_std2.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);

													metricTitle = "-2σ";
													computedYVal = ((gCA_Dimensions.width * gChartStats[groupID].mean_minus_std2)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_minus_std2.toFixed(2);
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												if(markerID == "showSD3Marker"){
													metricTitle = "+3σ";
													computedYVal = ((gCA_Dimensions.width * gChartStats[groupID].mean_plus_std3)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_plus_std3.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);

													metricTitle = "-3σ";
													computedYVal = ((gCA_Dimensions.width * gChartStats[groupID].mean_minus_std3)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_minus_std3.toFixed(2);
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												
											}
										});
									}



							
							}else{ //All other non-horizontal-bar charts....
							
									//var gYAxis_Dimensions = d3.select('#dashboard-chartarea #' + chartID + ' .nvd3 rect').node().getBBox(); //spits out x, y, height, width

									var funcDrawLine = function (metricTitle, metricVal, computedYVal, color){
										var appendElem = d3.select('#dashboard-chartarea #' + chartID + ' .nv-groups');
										appendElem.append('line')
												.attr('style', 'fill:' + color + ';stroke:' + color + ';stroke-width:1')
												.attr('x1', 0)
												.attr('x2', gCA_Dimensions.width+100)
												.attr('y1', computedYVal)
												.attr('y2', computedYVal)
												.attr('class', 'vmed-label-markers');

										//var metricVal = gChartStats[groupID].mean.toFixed(2);
										if(metricVal.toString().endsWith("00") == true){
											metricVal = Math.round(metricVal);
										}

										appendElem.append('text')
												.text(metricTitle + '=' + metricVal)
												.attr('style', 'fill: black;font-size: 12px;font-weight: bold;')
												.attr('y', computedYVal-4)
												.attr('x', 5)
												.attr('class', 'vmed-label-markers');
									};

									
									var computedStatsDimension = {};
									var markers = verioChartObj[chartID].properties.yseries[groupID].markers;
									if(markers!=null){
										$.each(markers, function(markerID, markerItem) {
											if(markers[markerID].status == "visible"){
												var metricTitle;
												var metricVal;
												var computedYVal;
												var color;

												if(markerID == "showAverageMarker"){
													metricTitle = "Avg";
													computedYVal = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												if(markerID == "showSD1Marker"){
													metricTitle = "+1σ";
													computedYVal = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean_plus_std1)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_plus_std1.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);

													metricTitle = "-1σ";
													computedYVal = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean_minus_std1)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_minus_std1.toFixed(2);
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												if(markerID == "showSD2Marker"){
													metricTitle = "+2σ";
													computedYVal = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean_plus_std2)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_plus_std2.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);

													metricTitle = "-2σ";
													computedYVal = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean_minus_std2)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_minus_std2.toFixed(2);
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												if(markerID == "showSD3Marker"){
													metricTitle = "+3σ";
													computedYVal = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean_plus_std3)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_plus_std3.toFixed(2);
													color = markers[markerID].color || "green";
													funcDrawLine(metricTitle, metricVal, computedYVal, color);

													metricTitle = "-3σ";
													computedYVal = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean_minus_std3)/plotDimensions.maxValue);
													metricVal = gChartStats[groupID].mean_minus_std3.toFixed(2);
													funcDrawLine(metricTitle, metricVal, computedYVal, color);
												}
												
											}
										});
									}
									
							}
							
						});


							
							
							/*
							if(markers.showAverageMarker == "visible"){
								
							}
							if(markers.showSD1Marker == "visible"){
								
							}
							if(markers.showSD2Marker == "visible"){
								
							}
							if(markers.showSD3Marker == "visible"){
								
							}
							

							

					
							computedStatsDimension.avg = gCA_Dimensions.height - ((gCA_Dimensions.height * gChartStats[groupID].mean)/plotDimensions.maxValue);
							//console.log(plotDimensions.maxValue, computedStatsDimension.avg, gCA_Dimensions.height, gChartStats[groupID].mean);
								
							gCA.append('line')
									.attr('style', 'fill: green;stroke: green;stroke-width:1')
									.attr('x1', 0)
									.attr('x2', gCA_Dimensions.width)
									.attr('y1', computedStatsDimension.avg)
									.attr('y2', computedStatsDimension.avg)
									.attr('class', 'vmed-label-values');

							var metricVal = gChartStats[groupID].mean.toFixed(2);
							if(metricVal.toString().endsWith("00") == true){
								metricVal = Math.round(metricVal);
							}

							gCA.append('text')
									.text('avg=' + metricVal)
									.attr('style', 'fill: black;font-size: 12px;')
									.attr('y', computedStatsDimension.avg-4)
									.attr('x', 5)
									.attr('class', 'vmed-label-values');
									
							*/
						
						
					});

				}catch(e){
					
				}

			}




/*
---------------------------------------
		TOPO JSON START
---------------------------------------
*/
	L.TopoJSON = L.GeoJSON.extend({
	  addData: function(jsonData) {
		if (jsonData.type === "Topology") {
		  for (key in jsonData.objects) {
			geojson = topojson.feature(jsonData, jsonData.objects[key]);
			L.GeoJSON.prototype.addData.call(this, geojson);
		  }
		}
		else {
		  L.GeoJSON.prototype.addData.call(this, jsonData);
		}
	  }
	});


    function handleLayer(layer){

		var layerZIP = layer.feature.properties.ZIP;
		var zipIntesity = 0;
		layer.feature.properties.INTENSITY = 0;
		layer.feature.properties.INTENSITY_ORIGINAL = 0;

		try{
		if(gTemp_MapDataValues.data[layerZIP]){
			zipIntesity = gTemp_MapDataValues.data[layerZIP].count / gTemp_MapDataValues.max;
			layer.feature.properties.INTENSITY = zipIntesity;
			layer.feature.properties.INTENSITY_ORIGINAL = gTemp_MapDataValues.data[layerZIP].count;
		}
		}catch(e){
		}

		var gradientIndex = parseInt(zipIntesity/0.25);
        var fillColor = gTemp_MapDataValues.cfg.gradient[gradientIndex > 3 ? 3 : gradientIndex];
        if(gradientIndex == 0) fillColor = 'white';

        layer.setStyle({
			fillColor : fillColor,
			weight: 1,
			opacity: 1,
			color: 'white',
			fillOpacity: (gradientIndex > 0) ? gTemp_MapDataValues.cfg.intensity : 0, //0.7 is deafult
        });

		layer.on({
			mouseover : mousemove,
			mouseout: mouseout,
			click: zoomToFeature
		});

    }



  var closeTooltip;

  function mousemove(e) {

	  var vccchartID = e.target._map.vccchartID;
	  var city = (e.target.feature.properties.CITY || "");
	  $("#maplegend" + vccchartID).find(".zip").html(city == "" ? "Zip: " + e.target.feature.properties.ZIP : city + " (" + e.target.feature.properties.ZIP + ")");
	  $("#maplegend" + vccchartID).find("span").html("Value: " + (e.target.feature.properties.INTENSITY_ORIGINAL || 0)); //+ " " + (e.target._map.UNITS || "")

      e.target.setStyle({
		weight: 3,
		dashArray: '1',
      });

/*

      //var layer = e.target;
      //var popup = layer._map.popup;
      //var map = layer._map;
      window.clearTimeout(closeTooltip);

      e.target._map.popup.setLatLng({lat: e.target.feature.properties.LAT, lng: e.target.feature.properties.LON}); //e.latlng
      e.target._map.popup.setContent('<div class="marker-title">' +
      					'<b>Zipcode:&emsp;' + e.target.feature.properties.ZIP +'</b>' +
      					'</div>' +
      					'<div class="marker-title">' +
      					e.target._map.LEGEND_KEY +
      					':&emsp;' + e.target.feature.properties.INTENSITY_ORIGINAL || 0 +
      					'</div>');


      if (!e.target._map.popup._map) e.target._map.popup.openOn(e.target._map);


      // highlight feature
      e.target.setStyle({
		weight: 3,
		//fillOpacity: 1,
		//color: 'white',
		dashArray: '1',
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          e.target.bringToFront();
      }
*/
  }

  function mouseout(e) {
	  //console.log("mouseout");
      //e.target._map.topoLayer.resetStyle(e.target);
      this.setStyle({
		weight: 1,
		dashArray: null,
      });

	  var vccchartID = e.target._map.vccchartID;
	  //$("#maplegend" + vccchartID).find(".city").html("");
	  $("#maplegend" + vccchartID).find(".zip").html("");
	  $("#maplegend" + vccchartID).find("span").html("Hover over map");

/*
      closeTooltip = window.setTimeout(function() {
          //map.closePopup();
          e.target._map.closePopup();
      }, 1000);
*/
  }

  function zoomToFeature(e) {
      e.target._map.fitBounds(e.target.getBounds());
  }


/*
---------------------------------------
		TOPO JSON END
---------------------------------------
*/




$.fn.updateVCChartData = function(data, chartType, chart){
	//console.log(data);
	if(gOnLoadComplete == true){
		$(".saveDashboard i").css("color", "red");
	}	

	if(chartType == "map"){

		var vccchartID = chart.map.vccchartID;
		$("#maplegend" + vccchartID).find(".lhead").html(data.key);

		chart.data = data;
		chart.map.LEGEND_KEY = data.key;
		chart.map.UNITS = data.units;
		data.cfg = chart.cfg; //set the config so color etc can be rendered on map

		gTemp_MapDataValues = data;
		chart.topoLayer.eachLayer(handleLayer);
		gTemp_MapDataValues = null;


		var slot = (data.max/4);
		slot = slot < 10 ? slot:parseInt(slot);
		var ranges = [0, slot, slot*2, slot*3],
		labels = [],
		from, to;

		for (var i = 0; i < ranges.length; i++) {
		  from = ranges[i];
		  to = ranges[i + 1];

		  labels.push(
			'<li><span class="swatch" style="background:' + chart.cfg.gradient[i] + '"></span> ' +
			from + (to ? '&ndash;' + to : '+')) + '</li>';
		}

		$("#mapinfohover" + vccchartID).html('<span>' + data.key + '</span><ul>' + labels.join('') + '</ul>');


	}else if(chartType == "dhheat"){ //day hour heat map
		chart.heatobj.setData(data); // heatmapChart(data, chart);
	}else if(chartType == "funnel"){
		var vccchartID = $(this).attr("id");
		var options = verioChartObj[vccchartID].properties.xseries[0].vizdefaults;
		chart.funnelobj.setData(data, options);
	}else if(chartType == "datatable"){
		chart.data = data;
		chart.tableobj.setData(data);
	}else if (chartType == "textarea"){
		//do nothing
	}else{
		//chart.duration(300);
		d3.select($(this).find('svg')[0]).datum(data).transition().call(chart);

		/*window.setTimeout(
			function() {
				d3.selectAll(".nv-bar").on('click',
					function(e){
						d3.select(this).classed("nv-bar-onclick", true);
						 console.log(this); //.closest(".chartbox").attr("id")
						 $(this).addClass("nv-bar-onclick");
					}
				);
				}
	   , 1500);*/


	}
}

$.fn.updateVCChartRender = function(chartType, chart){

	if(gOnLoadComplete == true){
		$(".saveDashboard i").css("color", "red");
	}	
	
	if(chartType == "map"){
		chart.map._onResize();
		chart.map.invalidateSize();
	}else if(chartType == "dhheat"){
		chart.heatobj.update();
	}else if(chartType == "funnel"){
		chart.funnelobj.update();
	}else if(chartType == "datatable"){
		chart.tableobj.update();
	}else if (chartType == "textarea"){
		chart.htmleditor.update();
	}else{
		chart.update();
	}

}

$.fn.redrawAllVCCharts = function(){
	for(var chartID in verioChartObj){
		$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
	}
}



function calculateChartBoxes(){
	var rowCount = 0;
	var rowsArray = [];
	var rowCharts = {};
	var itemRowReference = {};
	var prev = null;
	var cummulativeSum = 0;
	var totalHeight = 0;

	$(".chart-hori-divider").remove();
	$(".chart-verti-divider").remove();

	var width = 0;
	var height = 0;
	var lastItemProcesses = null;
	var chartCounter = 0;
	var rColcount = 0;
	var startRowTop = 0;
	var rowMaxHeight = 0; //first available max height
	var row_true_MaxHeight = 0; //true max height of one full item (non splits)
	var temp_splitBottomElemsObj = {};

	$("#dashboard-chartarea .chartbox").each(function(index) {
		//We reset this to display all regions. Later below for vertical splits we hide them
		$(this).find(".droparea .chartdropregion-base .daregion").css('display', '');

		var isItemVertSplit = false;
		lastItemProcesses = $(this);
		width = $(this).outerWidth();
		height = $(this).outerHeight();
		cummulativeSum += Number(width);

		$(this).data("bottom",""); //safety valve
		$(this).removeData("bottom");
		$(this).data("top",""); //safety valve
		$(this).removeData("top");

		if(rColcount == 0){
			startRowTop = $(this).position().top;
			rowMaxHeight = $(this).outerHeight();
			row_true_MaxHeight = Math.max($(this).outerHeight(), row_true_MaxHeight);
		}else{
			if($(this).position().top == startRowTop){
				isItemVertSplit = false;
			}else{
				isItemVertSplit = true;
				cummulativeSum -= Number(width);
			}
			if(rColcount == 1 && isItemVertSplit == true){
				rowMaxHeight += $(this).outerHeight();
			}
		}

		itemRowReference[$(this).attr("id")] = rowCount;
		if(isItemVertSplit == false){
			row_true_MaxHeight = Math.max($(this).outerHeight(), row_true_MaxHeight);

			rowCharts[$(this).attr("id")] = {ref: $(this), p: prev, n: null};
			try{
				rowCharts[prev].n = $(this).attr("id");
				//if previous statement does not error then set the vertical divider...
				var vdivider = $("#dashboard-chartarea").insertVDivider(rowCount + "-" + (Number(rColcount)+1), {'top': lastItemProcesses.position().top + 5,'left': Math.floor(lastItemProcesses.position().left-2.5),'height': Math.max(rowMaxHeight,lastItemProcesses.outerHeight())-10 });
				vdivider.initVertiDividerDraggable();
				vdivider.data("prev",prev);
				vdivider.data("next",$(this).attr("id"));
			}catch(e){
			}
			prev = $(this).attr("id");
			rColcount++;
		}else{
			temp_splitBottomElemsObj[$(this).attr("id")] = {obj: $(this), totalHeight: $(this).outerHeight() + $("#" + prev).outerHeight()};
			rowCharts[prev].bottom = $(this).attr("id");
			$("#" + prev).data("bottom", $(this).attr("id"));
			$(this).data("top", prev);
			$("#" + prev).attr("bottom", $(this).attr("id"));
			$(this).attr("top", prev);

			$("#" + prev).find(".droparea .chartdropregion-base .daregion:not(.chartdropregion-full)").css('display', 'none');
			$(this).find(".droparea .chartdropregion-base .daregion:not(.chartdropregion-full)").css('display', 'none');

			var splitHdivider = $("#dashboard-chartarea").insertSplitHDivider(rowCount + "-" + (Number(rColcount)+1), {'top': Math.floor(lastItemProcesses.position().top-2.5),'left': lastItemProcesses.position().left + 5,'width': (lastItemProcesses.outerWidth() - 10) });
			splitHdivider.initSplitHoriDividerDraggable();
			splitHdivider.data("top", prev);
			splitHdivider.data("bottom", $(this).attr("id"));
		}

		verioChartObj[$(this).attr("id")].properties.chartposition = {'height': $(this).outerHeight()/gContainerDimensions.height, 'width': $(this).outerWidth()/gContainerDimensions.width, 'left': $(this).position().left/gContainerDimensions.width, 'top': $(this).position().top/gContainerDimensions.height, 'pos': chartCounter };
		chartCounter++;

		var rowBottomPixel = (startRowTop + rowMaxHeight);
		var lastItemBottomPixel = lastItemProcesses.position().top + lastItemProcesses.outerHeight();

		if((cummulativeSum >= gContainerDimensions.width - 10) && (cummulativeSum <= gContainerDimensions.width + 10) && (lastItemBottomPixel >= rowBottomPixel-10 && lastItemBottomPixel <= rowBottomPixel+10) ){
			//height adjustment code
			if(Math.abs(row_true_MaxHeight - rowMaxHeight) > 30){
				row_true_MaxHeight = rowMaxHeight; //happens when a row contains no full element. everything only splits
			}
			for(sbeKey in temp_splitBottomElemsObj){
				var sbeItem = temp_splitBottomElemsObj[sbeKey];
				if(sbeItem.totalHeight != row_true_MaxHeight){
					sbeItem.obj.css("height", sbeItem.obj.outerHeight() + (row_true_MaxHeight - sbeItem.totalHeight));
				}
			}
			totalHeight = totalHeight + height;
			rowsArray.push(rowCharts);
			rowCount++;
			rowCharts = {};
			cummulativeSum = 0;
			prev = null;
			temp_splitBottomElemsObj = {};
			$("#dashboard-chartarea").insertHDivider(rowCount, {'top': Math.floor(startRowTop + Math.max(rowMaxHeight,lastItemProcesses.outerHeight())-2.5),'left': 5,'width': (gContainerDimensions.width - 10) }).initHoriDividerDraggable();
			//$("#dashboard-chartarea").insertVDivider(0, {'top': lastItemProcesses.position().top + 5,'left': 0,'height': lastItemProcesses.outerHeight()-10 }).css("pointer-events", "none");
			//$("#dashboard-chartarea").insertVDivider(rColcount, {'top': lastItemProcesses.position().top + 5,'left': (gContainerDimensions.width - 5),'height': lastItemProcesses.outerHeight()-10 }).css("pointer-events", "none");
			rColcount = 0;
		}

	});

	if(cummulativeSum > 0){
		totalHeight = totalHeight + height;
		rowsArray.push(rowCharts);
		rowCount++;
		rowCharts = {};
		cummulativeSum = 0;
		prev = null;
		//$("#dashboard-chartarea").insertHDivider(rowCount, {'top': lastItemProcesses.position().top + lastItemProcesses.outerHeight()-2,'left': 5,'width': (gContainerDimensions.width - 10) }).initHoriDividerDraggable();
	}else{
		$(".chart-hori-divider:last").remove();
	}

	$("#dashboard-chartarea").insertHDivider(0, {'top': 0,'left': 5,'width': (gContainerDimensions.width - 10) }).css("pointer-events", "none");
	$("#dashboard-chartarea").insertHDivider(rowCount, {'top': gContainerDimensions.height,'left': 5,'width': (gContainerDimensions.width - 10) }).css("pointer-events", "none");

	gRowsArray = rowsArray;
	gItemRowReference = itemRowReference;

	//console.log((gRowsArray));
	//console.log(JSON.stringify(gItemRowReference));
}

$.fn.insertHDivider = function(HDivider_ID, HDivider_Style){
	var hDiv = $('<div />', {id: 'hdiv-chart-' + HDivider_ID, class: 'chart-hori-divider', 'data-divider-id': HDivider_ID, 'data-divider-type': 'horizontal'});
	hDiv.css("top", HDivider_Style.top);
	hDiv.css("left", HDivider_Style.left);
	hDiv.css("width", HDivider_Style.width);
	$(this).append(hDiv);
	return $('#hdiv-chart-' + HDivider_ID);
}

$.fn.insertSplitHDivider = function(HDivider_ID, HDivider_Style){
	var hDiv = $('<div />', {id: 'split-hdiv-chart-' + HDivider_ID, class: 'chart-hori-divider', 'data-divider-id': "split-" + HDivider_ID, 'data-divider-type': 'horizontal'});
	hDiv.css("top", HDivider_Style.top);
	hDiv.css("left", HDivider_Style.left);
	hDiv.css("width", HDivider_Style.width);
	$(this).append(hDiv);
	return $('#split-hdiv-chart-' + HDivider_ID);
}

$.fn.insertVDivider = function(VDivider_ID, VDivider_Style){
	var vDiv = $('<div />', {id: 'vdiv-chart-' + VDivider_ID, class: 'chart-verti-divider', 'data-divider-id': VDivider_ID, 'data-divider-type': 'vertical'});
	vDiv.css("top", VDivider_Style.top);
	vDiv.css("left", VDivider_Style.left);
	vDiv.css("height", VDivider_Style.height);
	$(this).append(vDiv);
	return $('#vdiv-chart-' + VDivider_ID);
}


$.fn.initHoriDividerDraggable = function(){

	$(this).draggable({
		axis: "y",
		scroll: false,
		refreshPositions: true,
		helper: "clone",
		containment: "#dashboard-chartarea",

		start: function (event, ui) {
			$(ui.helper).css("background-color", "gray");
		},

		drag: function( event, ui ) {

			var top_divider = ui.position.top;
			var dataID_divider = $(this).attr('data-divider-id');

			var top_divider_TopBound = $('#hdiv-chart-' + (Number(dataID_divider)-1)).position().top;
			var top_divider_BottomBound = $('#hdiv-chart-' + (Number(dataID_divider)+1)).position().top;


			if(ui.position.top < (top_divider_TopBound + 30)){
				ui.position.top = top_divider_TopBound + 30;
				//return false;
			}else if(ui.position.top > (top_divider_BottomBound - 30)){
				ui.position.top = top_divider_BottomBound - 30;
			}

		},

		stop: function (event, ui) {
			var top_divider = Math.round( ui.position.top + ($(this).outerHeight()/2) ); //ui.position.top;
			var dataID_divider = $(this).attr('data-divider-id');

			heightTop = $('#hdiv-chart-' + dataID_divider).offset().top - $('#hdiv-chart-' + (Number(dataID_divider)-1)).offset().top -10;
			heightBottom = $('#hdiv-chart-' + (Number(dataID_divider)+1)).offset().top - $('#hdiv-chart-' + dataID_divider).offset().top ;

			$.each(gRowsArray[dataID_divider-1], function(chartID_Index, item){
				if( $("#" + chartID_Index).data("bottom") ){ //split vertical charts in same row
					$("#" + chartID_Index).css("height", (top_divider - $("#" + chartID_Index).position().top)/2);
					var bottomChartID = $("#" + chartID_Index).data("bottom");
					$("#" + bottomChartID).css("height", $("#" + chartID_Index).outerHeight() );
					$("#" + bottomChartID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
				}else{
					$("#" + chartID_Index).css("height", top_divider - $("#" + chartID_Index).position().top);
				}
				chartboxResize( $("#" + chartID_Index) );
			});

			$.each(gRowsArray[dataID_divider], function(chartID_Index, item){
				if( $("#" + chartID_Index).data("bottom") ){ //split vertical charts in same row
					var bottomChartID = $("#" + chartID_Index).data("bottom");
					$("#" + chartID_Index).css("height", ( ($("#" + chartID_Index).position().top - top_divider) + $("#" + chartID_Index).outerHeight() + $("#" + bottomChartID).outerHeight() )/2);
					$("#" + chartID_Index).css("top", top_divider);
					$("#" + bottomChartID).css("height", $("#" + chartID_Index).outerHeight() );
					$("#" + bottomChartID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
				}else{
					$("#" + chartID_Index).css("height", ($("#" + chartID_Index).position().top - top_divider) + $("#" + chartID_Index).outerHeight() );
					$("#" + chartID_Index).css("top", top_divider);
				}
				chartboxResize( $("#" + chartID_Index) );
			});

			$("body").redrawAllVCCharts();
			calculateChartBoxes();
		}

	});
}

$.fn.initSplitHoriDividerDraggable = function(){

	$(this).draggable({
		axis: "y",
		scroll: false,
		refreshPositions: true,
		helper: "clone",
		containment: "#dashboard-chartarea",

		start: function (event, ui) {
			$(ui.helper).css("background-color", "gray");
		},

		drag: function( event, ui ) {

			var top_divider = ui.position.top;
			//var dataID_divider = $(this).attr('data-divider-id');
			var topElem = $("#" + $(this).data("top"));
			var bottomElem = $("#" + $(this).data("bottom"));
			var topBoundary = topElem.position().top;
			var bottomBoundary = bottomElem.position().top + bottomElem.outerHeight();

			if(ui.position.top < (topBoundary + 50)){
				ui.position.top = topBoundary + 50;
			}else if(ui.position.top > (bottomBoundary - 50)){
				ui.position.top = bottomBoundary - 50;
			}

		},

		stop: function (event, ui) {
			var top_divider = Math.round( ui.position.top + ($(this).outerHeight()/2) );
			//var dataID_divider = $(this).attr('data-divider-id');
			var topElem = $("#" + $(this).data("top"));
			var bottomElem = $("#" + $(this).data("bottom"));
			var bottomBoundary = bottomElem.position().top + bottomElem.outerHeight();
			var totalHeightOfElems = topElem.outerHeight() + bottomElem.outerHeight();

			//topElem.css("height", top_divider - topElem.position().top);

			topElem.css("height", Math.floor(top_divider - topElem.position().top));
			bottomElem.css("top", topElem.position().top + topElem.outerHeight());
			bottomElem.css("height", Math.round(totalHeightOfElems - topElem.outerHeight()));
			//bottomElem.css("height", Math.round(bottomBoundary - top_divider));


			$("body").redrawAllVCCharts();
			calculateChartBoxes();
		}

	});
}

$.fn.initVertiDividerDraggable = function(){

	$(this).draggable({
		axis: "x",
		scroll: false,
		refreshPositions: true,
		helper: "clone",
		containment: "#dashboard-chartarea",

		start: function (event, ui) {
			$(ui.helper).css("background-color", "gray");
		},

		drag: function( event, ui ) {

			var left_divider = ui.position.left;
			var dataID_divider = $(this).attr('data-divider-id');

			var idOfLeftChart = $(this).data("prev");
			var idOfRightChart = $(this).data("next");

			var left_divider_LeftBound = $("#" + idOfLeftChart).position().left; // $('#vdiv-chart-' + (Number(dataID_divider)-1)).position().left;
			var left_divider_RightBound = $("#" + idOfRightChart).position().left + $("#" + idOfRightChart).outerWidth(); //$('#vdiv-chart-' + (Number(dataID_divider)+1)).position().left;


			if(ui.position.left < (left_divider_LeftBound + 50)){
				ui.position.left = left_divider_LeftBound + 50;
			}else if(ui.position.left > (left_divider_RightBound - 50)){
				ui.position.left = left_divider_RightBound - 50;
			}

		},

		stop: function (event, ui) {
			var left_divider = Math.round( ui.position.left + ($(this).outerWidth()/2) );
			var dataID_divider = $(this).attr('data-divider-id');

			var idOfLeftChart = $(this).data("prev");
			var idOfRightChart = $(this).data("next");

			var diffWidth = $("#" + idOfRightChart).position().left - left_divider;

			$("#" + idOfLeftChart).css("width", $("#" + idOfLeftChart).outerWidth() - diffWidth);
			$("#" + idOfRightChart).css("left", $("#" + idOfRightChart).position().left - diffWidth); //$("#" + idOfRightChart).css("left", left_divider);
			$("#" + idOfRightChart).css("width", $("#" + idOfRightChart).outerWidth() + diffWidth);

			if($("#" + idOfLeftChart).data("bottom")){
				$("#" + $("#" + idOfLeftChart).data("bottom")).css("width", $("#" + idOfLeftChart).outerWidth());
			}

			if($("#" + idOfRightChart).data("bottom")){
				$("#" + $("#" + idOfRightChart).data("bottom")).css("left", $("#" + idOfRightChart).position().left);
				$("#" + $("#" + idOfRightChart).data("bottom")).css("width", $("#" + idOfRightChart).outerWidth());
			}

			$("body").redrawAllVCCharts();
			calculateChartBoxes();
		}

	});

}


$.fn.getChartboxWidth = function(){
		var classList = $(this).attr('class').split(/\s+/);
		var width = 0;
		$.each(classList, function(index, item) {
			if (item.indexOf('col-sm-') > -1) {
				width = item.replace("col-sm-", "");
				return width;
			}
		});

		return width;
}


function InitializeDrapDrop(elemChartbox, elemCDR){

  if(gDeviceSize == "xs") return; //if device is xs like mobile, dont drag drop

  elemChartbox.draggable({
	  refreshPositions: true,
	  //containment: "#dashboard-chartarea", //For some reason adding this, droppable not firing randomly
	  cursor: "crosshair",
	  helper: "clone",
	  start: function (event, ui) {
		$(ui.helper).remove(); //destroy clone
		$(ui.draggable).remove(); //remove from list

		$(".droparea").removeClass("hidden");
		$(this).closest(".chartbox").find(".droparea").addClass("hidden");
		//$(this).closest(".chartbox").css("opacity", "0.5");
		$(this).closest(".chartbox").find(".chartboxpanel").css("border-width", "2");

			$(this).show().addClass('original-placeholder');
			$(this).css("opacity", "0.4");
			$(this).children(".chartboxpanel").css('border-color', '');
			$(this).children(".chartboxpanel").toggleClass("panel-on-drag");

	  },
	  stop: function (event, ui) {
		$(".droparea").addClass("hidden");
		//-$(this).closest(".chartbox").css("opacity", "");
		$(this).closest(".chartbox").find(".chartboxpanel").css("border-width", "");

			$(this).show();
			$(this).css("opacity", "1");
			var my_this = $(this);
			$(this).children(".chartboxpanel").animate({
						borderLeftColor: "#ddd",
						borderTopColor: "#ddd",
						borderRightColor: "#ddd",
						borderBottomColor: "#ddd",
						//borderWidth: 1
			}, 750, function() {
				// Animation complete.
				my_this.children(".chartboxpanel").toggleClass("panel-on-drag");
			});

	  }

  });



  elemCDR.droppable({
	  greedy: true,
	  tolerance: "pointer",
	  accept: ".chartbox",
	  drop: function (event, ui) {
		  //console.log("dropped");
		  	var dropzone = gDroppableHoverRegion; //$(this).find(".daregion.dropzone").attr("data-region") ||

			var dragElem = $(ui.draggable).closest(".chartbox");
			var dropElem = $("#" + gDroppableHoverRegion_CDR_ElemID);

			var drag_elem_row = gItemRowReference[dragElem.attr("id")];
			var drop_elem_row = gItemRowReference[dropElem.attr("id")];

			var rowRef_dragElem = gItemRowReference[dragElem.attr("id")];
			var rowRef_dropElem = gItemRowReference[dropElem.attr("id")];

			var id_dropElem = dropElem.attr("id");
			var id_dragElem = dragElem.attr("id");
			var left_dropElem = dropElem.position().left;
			var left_dragElem = dragElem.position().left;
			var width_dropElem = dropElem.outerWidth();
			var width_dragElem = dragElem.outerWidth();
			var height_dropElem = dropElem.outerHeight();
			var height_dragElem = dragElem.outerHeight();
			var top_dropElem = dropElem.position().top;
			var top_dragElem = dragElem.position().top;


			var drag_properties = {
				class: dragElem.attr("class"),
				style: dragElem.attr("style"),
			};
			var drop_properties = {
				class: dropElem.attr("class"),
				style: dropElem.attr("style"),
			};


			if(dropzone == "full"){
				//console.log("full");

				dragElem.before("<div id='ccdivdrag'></div>");
				dropElem.before("<div id='ccdivdrop'></div>");

				if(rowRef_dragElem == rowRef_dropElem){
					$("#ccdivdrag").replaceWith($("#" + gDroppableHoverRegion_CDR_ElemID));
					$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));

					dropElem.css("left", left_dragElem);
					dragElem.css("left", left_dropElem);
					dropElem.css("width", width_dragElem);
					dragElem.css("width", width_dropElem);

					if( dragElem.data("bottom") || dragElem.data("top") || dropElem.data("bottom") || dropElem.data("top")){
						dropElem.css("height", height_dragElem);
						dragElem.css("height", height_dropElem);
						dropElem.css("top", top_dragElem);
						dragElem.css("top", top_dropElem);
						//TODO - if full swapping between top and bottom same block check data attribute if calculating correctly.
					}

				}else{
					$("#ccdivdrag").replaceWith($("#" + gDroppableHoverRegion_CDR_ElemID).attr("class",drag_properties.class).attr("style",drag_properties.style).css("opacity", "1"));
					$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox").attr("class",drop_properties.class).attr("style",drop_properties.style));
				}

				$("#ccdivdrag").remove();
				$("#ccdivdrop").remove();

				calculateChartBoxes();

				for(var chartID in verioChartObj){
					$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
					chartboxResize( $("#" + chartID) );
				}



			}else if(dropzone == "right"){ //-------------------------------------------------
										  //-------------------------------------------------
										  //-------------------------------------------------
										  //-------------------------------------------------

			  //console.log("right");

				dragElem.before("<div id='ccdivdrag'></div>");
				dropElem.after("<div id='ccdivdrop'></div>");

				//var gContainerDimensions = {height: 0, width: 0};
				if((rowRef_dragElem != rowRef_dropElem)){ // || (dropElem.position().top != dragElem.position().top) || (dropElem.outerWidth() < gContainerDimensions.width + 10 && dropElem.outerWidth() > gContainerDimensions.width - 10)){ //drag elem is in different row than drop elem

					if(Object.keys(gRowsArray[rowRef_dragElem]).length > 1){ //there were more than one element in this row so expand elems in this row to fit width

						if(dragElem.data("bottom") || dragElem.data("top")){
							var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

							$("#" + dragElem_pairElem_ID).css("top", Math.min(top_dragElem, $("#" + dragElem_pairElem_ID).position().top));
							$("#" + dragElem_pairElem_ID).css("height", height_dragElem + $("#" + dragElem_pairElem_ID).outerHeight() );
						}else{

							$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
								if(chartID_Index == id_dragElem){
									var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
									var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
									if(item.n == null && item.p != null){
										$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

										if($("#" + item.p).data("bottom")){
											var bottomID = $("#" + item.p).data("bottom");
											$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
										}
									}else if(item.p == null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}else  if(item.p != null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}
								}
							});

						}

					}else{ //there is ONLY one element in this row so expand elems height in this row to fit
						if(rowRef_dragElem == (rowRef_dropElem + 1)){ //if drag row is immediately below
							$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
								$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

								if($("#" + chartID_Index).data("bottom")){
									var bottomElemID = $("#" + chartID_Index).data("bottom");
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
									$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
									$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
								}
							});
							dragElem.css("height", dragElem.outerHeight() + height_dragElem);
						}else{

							if(rowRef_dragElem == 0){
								if(gRowsArray.length >= 2){
									$.each(gRowsArray[1], function(chartID_Index, item){
										$("#" + chartID_Index).css("top", 0);
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

										if($("#" + chartID_Index).data("bottom")){
											var bottomElemID = $("#" + chartID_Index).data("bottom");
											$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
											$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
											$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
											$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
										}

									});
									dragElem.css("top", 0);
									dragElem.css("height", dragElem.outerHeight() + height_dragElem);
								}
							}else{
								$.each(gRowsArray[rowRef_dragElem-1], function(chartID_Index, item){
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomElemID = $("#" + chartID_Index).data("bottom");
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
										$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
										$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}

								});
							}

						}
					}

					dropElem.css("width", dropElem.outerWidth()/2);
					dragElem.css("width", dropElem.outerWidth());
					dragElem.css("top", dropElem.position().top);
					dragElem.css("left", dropElem.position().left + dropElem.outerWidth());
					dragElem.css("height", dropElem.outerHeight());

					$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));

				}else{ //drag elem is in same row as drop elem

					if( dragElem.data("bottom") || dragElem.data("top") ){
						dropElem.css("width", dropElem.outerWidth()/2);
						dragElem.css("width", dropElem.outerWidth());
						dragElem.css("top", dropElem.position().top);
						dragElem.css("left", dropElem.position().left + dropElem.outerWidth());
						dragElem.css("height", dropElem.outerHeight());

						var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

						$("#" + dragElem_pairElem_ID).css("top", dropElem.position().top);
						$("#" + dragElem_pairElem_ID).css("height", dropElem.outerHeight());

						$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));

					}else{

							//Todo - shitf ops need adj to splits. 1/2,3,4. change to 1,2/3,4. move 4 to right of 1
							var iterateIndex = 0;
							var droppos = 0;
							var dragpos = 0;
							$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){ //Find positions/order of drag & drop elements
								if(id_dropElem == chartID_Index){
									droppos = iterateIndex;
								}
								if(id_dragElem == chartID_Index){
									dragpos = iterateIndex;
								}
								iterateIndex++;
							});

							if(dragpos > droppos){

								$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));
								$(ui.draggable).closest(".chartbox").css("left", left_dropElem + width_dropElem);

								var startShift = false;
								$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
									if((id_dropElem == chartID_Index) || startShift == true){
										if(id_dragElem == chartID_Index){
											//alert("set false " + chartID_Index);
											startShift = false;
										}else if(id_dropElem == chartID_Index){
											//alert("dropElem " + chartID_Index);
											startShift = true;
										}else{
											//alert(chartID_Index);
											startShift = true;
											$("#" + chartID_Index).css("left", $("#" + chartID_Index).position().left + width_dragElem);
											if($("#" + chartID_Index).data("bottom")){
												var bottomElemID = $("#" + chartID_Index).data("bottom");
												$("#" + bottomElemID).css("left", $("#" + chartID_Index).position().left);
											}
										}
									}
								});

							}else if(dragpos < droppos){

								var startShift = false;
								$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
									if((id_dragElem == chartID_Index) || startShift == true){

										if(id_dropElem == chartID_Index){
											//alert("set false " + chartID_Index);
											startShift = false;
											$("#" + chartID_Index).css("left", $("#" + chartID_Index).position().left - width_dragElem);
											if($("#" + chartID_Index).data("bottom")){
												var bottomElemID = $("#" + chartID_Index).data("bottom");
												$("#" + bottomElemID).css("left", $("#" + chartID_Index).position().left);
											}
										}else if(id_dragElem == chartID_Index){
											//alert("dropElem " + chartID_Index);
											startShift = true;
										}else{
											//alert(chartID_Index);
											startShift = true;
											$("#" + chartID_Index).css("left", $("#" + chartID_Index).position().left - width_dragElem);
											if($("#" + chartID_Index).data("bottom")){
												var bottomElemID = $("#" + chartID_Index).data("bottom");
												$("#" + bottomElemID).css("left", $("#" + chartID_Index).position().left);
											}
										}
									}
								});

								$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));
								$(ui.draggable).closest(".chartbox").css("left", dropElem.position().left + width_dropElem);

							}

					}

				}

				$("#ccdivdrag").remove();
				$("#ccdivdrop").remove();
				calculateChartBoxes();

				for(var chartID in verioChartObj){
					$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
					chartboxResize( $("#" + chartID) );
				}




			}else if(dropzone == "left"){ //-------------------------------------------------
										  //-------------------------------------------------
										  //-------------------------------------------------
										  //-------------------------------------------------
			  //console.log("left");



				dragElem.before("<div id='ccdivdrag'></div>");
				dropElem.before("<div id='ccdivdrop'></div>");

				//var gContainerDimensions = {height: 0, width: 0};
				if((rowRef_dragElem != rowRef_dropElem)){ // if((dropElem.position().top != dragElem.position().top) || (dropElem.outerWidth() < gContainerDimensions.width + 10 && dropElem.outerWidth() > gContainerDimensions.width - 10)){ //drag elem is in different row than drop elem

					if(Object.keys(gRowsArray[rowRef_dragElem]).length > 1){ //there were more than one element in this row so expand elems in this row to fit width

						if(dragElem.data("bottom") || dragElem.data("top")){
							var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

							$("#" + dragElem_pairElem_ID).css("top", Math.min(top_dragElem, $("#" + dragElem_pairElem_ID).position().top));
							$("#" + dragElem_pairElem_ID).css("height", height_dragElem + $("#" + dragElem_pairElem_ID).outerHeight() );
						}else{

							$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
								if(chartID_Index == id_dragElem){
									var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
									var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
									if(item.n == null && item.p != null){
										$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

										if($("#" + item.p).data("bottom")){
											var bottomID = $("#" + item.p).data("bottom");
											$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
										}
									}else if(item.p == null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}else  if(item.p != null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}
								}
							});

						}

					}else{
						if(rowRef_dragElem == (rowRef_dropElem + 1)){ //if drag row is immediately below
							$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
								$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

								if($("#" + chartID_Index).data("bottom")){
									var bottomElemID = $("#" + chartID_Index).data("bottom");
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
									$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
									$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
								}
							});
							dragElem.css("height", dragElem.outerHeight() + height_dragElem);
						}else{

							if(rowRef_dragElem == 0){
								if(gRowsArray.length >= 2){
									$.each(gRowsArray[1], function(chartID_Index, item){
										$("#" + chartID_Index).css("top", 0);
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

										if($("#" + chartID_Index).data("bottom")){
											var bottomElemID = $("#" + chartID_Index).data("bottom");
											$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
											$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
											$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
											$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
										}
									});
									dragElem.css("top", 0);
									dragElem.css("height", dragElem.outerHeight() + height_dragElem);
								}
							}else{
								$.each(gRowsArray[rowRef_dragElem-1], function(chartID_Index, item){
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomElemID = $("#" + chartID_Index).data("bottom");
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
										$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
										$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}
								});
							}

						}
					}

					dropElem.css("width", dropElem.outerWidth()/2);
					dragElem.css("width", dropElem.outerWidth());
					dragElem.css("top", dropElem.position().top);
					dragElem.css("left", dropElem.position().left);
					dragElem.css("height", dropElem.outerHeight());
					dropElem.css("left", left_dropElem + dropElem.outerWidth());

					$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));

				}else{ //drag elem is in same row as drop elem

					if( dragElem.data("bottom") || dragElem.data("top") ){
						dropElem.css("width", dropElem.outerWidth()/2);
						dragElem.css("width", dropElem.outerWidth());
						dragElem.css("top", dropElem.position().top);
						dragElem.css("left", dropElem.position().left);
						dragElem.css("height", dropElem.outerHeight());
						dropElem.css("left", left_dropElem + dropElem.outerWidth());

						var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

						$("#" + dragElem_pairElem_ID).css("top", dropElem.position().top);
						$("#" + dragElem_pairElem_ID).css("height", dropElem.outerHeight());

						$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));

					}else{

							var iterateIndex = 0;
							var droppos = 0;
							var dragpos = 0;
							$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){ //Find positions/order of drag & drop elements
								if(id_dropElem == chartID_Index){
									droppos = iterateIndex;
								}
								if(id_dragElem == chartID_Index){
									dragpos = iterateIndex;
								}
								iterateIndex++;
							});

							if(dragpos > droppos){

								var startShift = false;
								$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
									if((id_dropElem == chartID_Index) || startShift == true){
										if(id_dragElem == chartID_Index){
											startShift = false;
										}else if(id_dropElem == chartID_Index){
											startShift = true;
											$("#" + chartID_Index).css("left", $("#" + chartID_Index).position().left + width_dragElem);
											if($("#" + chartID_Index).data("bottom")){
												var bottomElemID = $("#" + chartID_Index).data("bottom");
												$("#" + bottomElemID).css("left", $("#" + chartID_Index).position().left);
											}
										}else{
											startShift = true;
											$("#" + chartID_Index).css("left", $("#" + chartID_Index).position().left + width_dragElem);
											if($("#" + chartID_Index).data("bottom")){
												var bottomElemID = $("#" + chartID_Index).data("bottom");
												$("#" + bottomElemID).css("left", $("#" + chartID_Index).position().left);
											}
										}
									}
								});

								$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));
								$(ui.draggable).closest(".chartbox").css("left", left_dropElem);

							}else if(dragpos < droppos){

								$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));
								$(ui.draggable).closest(".chartbox").css("left", dropElem.position().left - width_dragElem);

								var startShift = false;
								$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
									if((id_dragElem == chartID_Index) || startShift == true){

										if(id_dropElem == chartID_Index){
											startShift = false;
											//$("#" + chartID_Index).css("left", $("#" + chartID_Index).position().left - width_dragElem);
										}else if(id_dragElem == chartID_Index){
											startShift = true;
										}else{
											startShift = true;
											$("#" + chartID_Index).css("left", $("#" + chartID_Index).position().left - width_dragElem);
											if($("#" + chartID_Index).data("bottom")){
												var bottomElemID = $("#" + chartID_Index).data("bottom");
												$("#" + bottomElemID).css("left", $("#" + chartID_Index).position().left);
											}
										}
									}
								});


							}


					}
				}

				$("#ccdivdrag").remove();
				$("#ccdivdrop").remove();
				calculateChartBoxes();

				for(var chartID in verioChartObj){
					$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
					chartboxResize( $("#" + chartID) );
				}






			}else if(dropzone == "top"){ //-------------------------------------------------
										  //-------------------------------------------------
										  //-------------------------------------------------
										  //-------------------------------------------------
			  //console.log("top");

				dragElem.before("<div id='ccdivdrag'></div>");
				dropElem.before("<div id='ccdivdrop'></div>");


				if((rowRef_dragElem != rowRef_dropElem)){ // if((dropElem.position().top != dragElem.position().top) || (dropElem.outerWidth() < gContainerDimensions.width + 10 && dropElem.outerWidth() > gContainerDimensions.width - 10)){ //drag elem is in different row than drop elem

					if(Object.keys(gRowsArray[rowRef_dropElem]).length > 1){ //drop elem row has more than one element

						dropElem.css("height", dropElem.outerHeight()/2);
						dragElem.css("width", width_dropElem);
						dragElem.css("left", left_dropElem);
						dragElem.css("top", top_dropElem);
						dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block
						dropElem.css("top", top_dropElem + dropElem.outerHeight());


						if(Object.keys(gRowsArray[rowRef_dragElem]).length > 1){ //drag elem row has more than one element

							if(dragElem.data("bottom") || dragElem.data("top")){
								var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

								$("#" + dragElem_pairElem_ID).css("top", Math.min(top_dragElem, $("#" + dragElem_pairElem_ID).position().top));
								$("#" + dragElem_pairElem_ID).css("height", height_dragElem + $("#" + dragElem_pairElem_ID).outerHeight() );
							}else{

								$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
									if(chartID_Index == id_dragElem){
										var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
										var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
										if(item.n == null && item.p != null){
											$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

											if($("#" + item.p).data("bottom")){
												var bottomID = $("#" + item.p).data("bottom");
												$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
											}
										}else if(item.p == null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}else  if(item.p != null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}
									}
								});

							}

						}else{

							if(rowRef_dragElem < rowRef_dropElem){
								$.each(gRowsArray[rowRef_dragElem + 1], function(chartID_Index, item){
									$("#" + chartID_Index).css("top", $("#" + chartID_Index).position().top - height_dragElem);
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomElemID = $("#" + chartID_Index).data("bottom");
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
										$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
										$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}

									if(chartID_Index == id_dropElem){
										//Since drop & drag elems were modified already we need to remodify.
										$("#" + chartID_Index).css("top", top_dropElem - height_dragElem);
										$("#" + chartID_Index).css("height", height_dropElem + height_dragElem);

										dropElem.css("height", dropElem.outerHeight()/2);
										dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block
										dropElem.css("top", dropElem.position().top + dropElem.outerHeight());
										dragElem.css("top", dropElem.position().top - dragElem.outerHeight());
									}

								});
							}else{
								$.each(gRowsArray[rowRef_dragElem - 1], function(chartID_Index, item){
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomElemID = $("#" + chartID_Index).data("bottom");
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
										$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
										$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}

									if(chartID_Index == id_dropElem){
										//Since drop & drag elems were modified already we need to remodify.
										$("#" + chartID_Index).css("height", height_dropElem + height_dragElem);

										dropElem.css("height", dropElem.outerHeight()/2);
										dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block
										dropElem.css("top", dragElem.position().top + dragElem.outerHeight());
									}

								});
							}

						}


					}else{//drop elem row has only one element

						if(Object.keys(gRowsArray[rowRef_dragElem]).length > 1){ //drag elem row has more than one element

							dragElem.css("height", dropElem.outerHeight()/2);
							$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
								$("#" + chartID_Index).css("height", dropElem.outerHeight()/2);
							});

							dragElem.css("width", width_dropElem);
							dragElem.css("left", left_dropElem);
							dragElem.css("top", top_dropElem);
							dropElem.css("top", top_dropElem + height_dropElem/2);

							if(dragElem.data("bottom") || dragElem.data("top")){
								var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

								$("#" + dragElem_pairElem_ID).css("top", Math.min(top_dragElem, $("#" + dragElem_pairElem_ID).position().top));
								$("#" + dragElem_pairElem_ID).css("height", height_dragElem + $("#" + dragElem_pairElem_ID).outerHeight() );
							}else{

								$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
									if(chartID_Index == id_dragElem){
										var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
										var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
										if(item.n == null && item.p != null){
											$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

											if($("#" + item.p).data("bottom")){
												var bottomID = $("#" + item.p).data("bottom");
												$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
											}
										}else if(item.p == null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}else  if(item.p != null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}
									}
								});

							}



						}else{
							//Todo - include bottom elem for width adjustment
							for(var dragseq = rowRef_dragElem; dragseq < gRowsArray.length; dragseq++){
								$.each(gRowsArray[dragseq], function(chartID_Index, item){
									$("#" + chartID_Index).css("top", $("#" + chartID_Index).position().top - height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomID = $("#" + chartID_Index).data("bottom");
										$("#" + bottomID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}
								});
							}

							for(var dropseq = rowRef_dropElem; dropseq < gRowsArray.length; dropseq++){
								$.each(gRowsArray[dropseq], function(chartID_Index, item){
									$("#" + chartID_Index).css("top", $("#" + chartID_Index).position().top + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomID = $("#" + chartID_Index).data("bottom");
										$("#" + bottomID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}
								});
							}

							dragElem.css("width", width_dropElem);
							dragElem.css("left", left_dropElem);
							//dragElem.css("height", height_dropElem);

							if(rowRef_dragElem < rowRef_dropElem){
								dragElem.css("top", top_dropElem - height_dragElem);
							}else{
								dragElem.css("top", top_dropElem);
							}

						}

					}



				}else{ //drag elem is in same row as drop elem

					dropElem.css("height", dropElem.outerHeight()/2);
					dragElem.css("left", left_dropElem);
					dragElem.css("top", top_dropElem);
					dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block
					dropElem.css("top", top_dropElem + dropElem.outerHeight());

					if(Object.keys(gRowsArray[rowRef_dropElem]).length == 2){ //drop elem row has 2 elements so expand to 100% conditionally based on splits
						if(dragElem.data("bottom") || dragElem.data("top")){
							var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

							$("#" + dragElem_pairElem_ID).css("top", top_dropElem);
							$("#" + dragElem_pairElem_ID).css("height", height_dropElem);
							dragElem.css("width", width_dropElem);
						}else{
							dragElem.css("width", gContainerDimensions.width);
							dropElem.css("width", gContainerDimensions.width);
							dragElem.css("left", 0);
							dropElem.css("left", 0);
						}
					}else{

						if(dragElem.data("bottom") || dragElem.data("top")){
							var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

							$("#" + dragElem_pairElem_ID).css("top", top_dropElem);
							$("#" + dragElem_pairElem_ID).css("height", height_dropElem);
						}else{
							$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
								if(chartID_Index == id_dragElem){
									var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
									var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
									if(item.n == null && item.p != null){
										$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

										if($("#" + item.p).data("bottom")){
											var bottomID = $("#" + item.p).data("bottom");
											$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
										}
									}else if(item.p == null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}else  if(item.p != null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}
								}
							});
						}

						dragElem.css("width", dropElem.outerWidth());
						dragElem.css("left", dropElem.position().left);

					}

				}

				$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));

				$("#ccdivdrag").remove();
				$("#ccdivdrop").remove();
				calculateChartBoxes();


				for(var chartID in verioChartObj){
					$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
					chartboxResize( $("#" + chartID) );
				}




			}else if(dropzone == "bottom"){ //-------------------------------------------------
											  //-------------------------------------------------
											  //-------------------------------------------------
											  //-------------------------------------------------

			  //console.log("bottom");



				dragElem.before("<div id='ccdivdrag'></div>");
				dropElem.after("<div id='ccdivdrop'></div>");


				if((rowRef_dragElem != rowRef_dropElem)){ // if((dropElem.position().top != dragElem.position().top) || (dropElem.outerWidth() < gContainerDimensions.width + 10 && dropElem.outerWidth() > gContainerDimensions.width - 10)){ //drag elem is in different row than drop elem

					if(Object.keys(gRowsArray[rowRef_dropElem]).length > 1){ //drop elem row has more than one element

						dropElem.css("height", dropElem.outerHeight()/2);
						dragElem.css("width", width_dropElem);
						dragElem.css("left", left_dropElem);
						dragElem.css("top", top_dropElem + dropElem.outerHeight());
						dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block

						if(Object.keys(gRowsArray[rowRef_dragElem]).length > 1){ //drag elem row has more than one element

							if(dragElem.data("bottom") || dragElem.data("top")){
								var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

								$("#" + dragElem_pairElem_ID).css("top", Math.min(top_dragElem, $("#" + dragElem_pairElem_ID).position().top));
								$("#" + dragElem_pairElem_ID).css("height", height_dragElem + $("#" + dragElem_pairElem_ID).outerHeight() );
							}else{

								$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
									if(chartID_Index == id_dragElem){
										var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
										var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
										if(item.n == null && item.p != null){
											$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

											if($("#" + item.p).data("bottom")){
												var bottomID = $("#" + item.p).data("bottom");
												$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
											}
										}else if(item.p == null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}else  if(item.p != null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}
									}
								});

							}

						}else{

							if(rowRef_dragElem < rowRef_dropElem){
								$.each(gRowsArray[rowRef_dragElem + 1], function(chartID_Index, item){
									$("#" + chartID_Index).css("top", $("#" + chartID_Index).position().top - height_dragElem);
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomElemID = $("#" + chartID_Index).data("bottom");
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
										$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
										$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}

									if(chartID_Index == id_dropElem){
										//Since drop & drag elems were modified already we need to remodify.
										$("#" + chartID_Index).css("top", top_dropElem - height_dragElem);
										$("#" + chartID_Index).css("height", height_dropElem + height_dragElem);

										dropElem.css("height", dropElem.outerHeight()/2);
										dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block
										dragElem.css("top", dropElem.position().top + dropElem.outerHeight());
									}

								});
							}else{
								$.each(gRowsArray[rowRef_dragElem - 1], function(chartID_Index, item){
									$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomElemID = $("#" + chartID_Index).data("bottom");
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight() + $("#" + bottomElemID).outerHeight());
										$("#" + chartID_Index).css("height", $("#" + chartID_Index).outerHeight()/2);
										$("#" + bottomElemID).css("height", $("#" + chartID_Index).outerHeight()); //Already halfed in above statement
										$("#" + bottomElemID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}


									if(chartID_Index == id_dropElem){
										//Since drop & drag elems were modified already we need to remodify.
										$("#" + chartID_Index).css("height", height_dropElem + height_dragElem);

										dropElem.css("height", dropElem.outerHeight()/2);
										dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block
										dragElem.css("top", dropElem.position().top + dropElem.outerHeight());
									}

								});
							}

						}


					}else{//drop elem row has only one element

						if(Object.keys(gRowsArray[rowRef_dragElem]).length > 1){ //drag elem row has more than one element

							dragElem.css("height", dropElem.outerHeight()/2);
							$.each(gRowsArray[rowRef_dropElem], function(chartID_Index, item){
								$("#" + chartID_Index).css("height", dropElem.outerHeight()/2);
							});

							dragElem.css("width", width_dropElem);
							dragElem.css("left", left_dropElem);
							dragElem.css("top", top_dropElem + height_dropElem/2);
							//dropElem.css("top", top_dropElem + height_dropElem/2);


							if(dragElem.data("bottom") || dragElem.data("top")){
								var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

								$("#" + dragElem_pairElem_ID).css("top", Math.min(top_dragElem, $("#" + dragElem_pairElem_ID).position().top));
								$("#" + dragElem_pairElem_ID).css("height", height_dragElem + $("#" + dragElem_pairElem_ID).outerHeight() );
							}else{

								$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
									if(chartID_Index == id_dragElem){
										var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
										var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
										if(item.n == null && item.p != null){
											$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

											if($("#" + item.p).data("bottom")){
												var bottomID = $("#" + item.p).data("bottom");
												$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
											}
										}else if(item.p == null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}else  if(item.p != null && item.n != null){
											$("#" + item.n).css("left", leftBound);
											$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

											if($("#" + item.n).data("bottom")){
												var bottomID = $("#" + item.n).data("bottom");
												$("#" + bottomID).css("left", leftBound);
												$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
											}
										}
									}
								});

							}



						}else{
							for(var dragseq = rowRef_dragElem; dragseq < gRowsArray.length; dragseq++){
								$.each(gRowsArray[dragseq], function(chartID_Index, item){
									$("#" + chartID_Index).css("top", $("#" + chartID_Index).position().top - height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomID = $("#" + chartID_Index).data("bottom");
										$("#" + bottomID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}
								});
							}

							for(var dropseq = rowRef_dropElem + 1; dropseq < gRowsArray.length; dropseq++){
								$.each(gRowsArray[dropseq], function(chartID_Index, item){
									$("#" + chartID_Index).css("top", $("#" + chartID_Index).position().top + height_dragElem);

									if($("#" + chartID_Index).data("bottom")){
										var bottomID = $("#" + chartID_Index).data("bottom");
										$("#" + bottomID).css("top", $("#" + chartID_Index).position().top + $("#" + chartID_Index).outerHeight());
									}
								});
							}


							dragElem.css("width", width_dropElem);
							dragElem.css("left", left_dropElem);
							//dropElem.css("top", top_dropElem + height_dragElem);
							dragElem.css("top", top_dropElem);


							if(rowRef_dragElem < rowRef_dropElem){
								dragElem.css("top", top_dropElem);
							}else{
								dragElem.css("top", top_dropElem + height_dropElem);
							}


						}

					}



				}else{ //drag elem is in same row as drop elem

					dropElem.css("height", dropElem.outerHeight()/2);
					dragElem.css("left", left_dropElem);
					dragElem.css("top", top_dropElem + dropElem.outerHeight());
					dragElem.css("height", dropElem.outerHeight()); //already set to half above....first statement in this block

					if(Object.keys(gRowsArray[rowRef_dropElem]).length == 2){ //drop elem row has 2 elements so expand to 100%
						if(dragElem.data("bottom") || dragElem.data("top")){
							var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

							$("#" + dragElem_pairElem_ID).css("top", top_dropElem);
							$("#" + dragElem_pairElem_ID).css("height", height_dropElem);
							dragElem.css("width", width_dropElem);
						}else{
							dragElem.css("width", gContainerDimensions.width);
							dropElem.css("width", gContainerDimensions.width);
							dragElem.css("left", 0);
							dropElem.css("left", 0);
						}
					}else{

						if(dragElem.data("bottom") || dragElem.data("top")){
							var dragElem_pairElem_ID = dragElem.data("bottom") || dragElem.data("top");

							$("#" + dragElem_pairElem_ID).css("top", top_dropElem);
							$("#" + dragElem_pairElem_ID).css("height", height_dropElem);
						}else{

							$.each(gRowsArray[rowRef_dragElem], function(chartID_Index, item){
								if(chartID_Index == id_dragElem){
									var rightBound = (item.n != null) ? $("#" + item.n).position().left : gContainerDimensions.width;
									var leftBound = (item.p != null) ? $("#" + item.p).position().left + $("#" + item.p).outerWidth() : 0;
									if(item.n == null && item.p != null){
										$("#" + item.p).css("width", $("#" + item.p).outerWidth() + (rightBound-leftBound));

										if($("#" + item.p).data("bottom")){
											var bottomID = $("#" + item.p).data("bottom");
											$("#" + bottomID).css("width", $("#" + item.p).outerWidth());
										}
									}else if(item.p == null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}else  if(item.p != null && item.n != null){
										$("#" + item.n).css("left", leftBound);
										$("#" + item.n).css("width", $("#" + item.n).outerWidth() + (rightBound-leftBound));

										if($("#" + item.n).data("bottom")){
											var bottomID = $("#" + item.n).data("bottom");
											$("#" + bottomID).css("left", leftBound);
											$("#" + bottomID).css("width", $("#" + item.n).outerWidth());
										}
									}
								}
							});

						}

						dragElem.css("width", dropElem.outerWidth());
						dragElem.css("left", dropElem.position().left);

					}

				}

				$("#ccdivdrop").replaceWith($(ui.draggable).closest(".chartbox"));

				$("#ccdivdrag").remove();
				$("#ccdivdrop").remove();
				calculateChartBoxes();


				for(var chartID in verioChartObj){
					$("body").updateVCChartRender(verioChartObj[chartID].properties.charttype, verioChartObj[chartID].pluginclass);
					chartboxResize( $("#" + chartID) );
				}




			}


	  },


  });

}



//----------------------------


function textareaChart(chartID) {
		this._chartID = chartID;

		this.update = function(){
			var containerHeight = $('#' + this._chartID + ' .chartboxpanel').height();
			$('#' + this._chartID + ' .htmleditor').css('height', containerHeight);
			$('#' + this._chartID + ' .mce-edit-area').css('height', containerHeight - $('#' + this._chartID + ' .mce-toolbar-grp').height() - 3);

			if($('#' + this._chartID + ' .htmleditor').hasScrollBar()){
				$('#' + this._chartID + ' .nv-template-header').css("right","25px");
			}else{
				$('#' + this._chartID + ' .nv-template-header').css("right","15px");
			}
		};
		
}

function funnelChart(chartID, thisChart, options) {
		this._chart = thisChart;
		this._chartID = chartID;
		this._chartOptions = options;
		this._chartObj;
		this._chartData;


    this._chartObj = new D3Funnel(thisChart);
    
		this.update = function(){
			if(this._chartData && this._chartData.length > 0){
				this._chartObj.draw(this._chartData, this._chartOptions);
			}
		};
		
		this.setData = function (data, options) {
			//$(this._chart).find(".statusbar").html("&nbsp;Total records: " + tabledata.total);
			this._chartOptions = options;
			this._chartData = data;
			this._chartObj.draw(data, options);
		}
		
}





function dataTableChart(chartID, thisChart, thisfields) {
		this._chart = thisChart;
		this._chartID = chartID;
		this._rowCount = 0;
		this._fields = thisfields;
		
		this.update = function(){
			$(this._chart).find(".smarttable-mastertbl").colResizable({disable:true});
			$(this._chart).find('.smarttable-mastertbl').width($(this._chart).find('.smarttable-tblparentdiv').outerWidth() - 25);
			$(this._chart).find(".smarttable-tblparentdiv").height($(this._chart).outerHeight()-15);
			$(this._chart).find(".smarttable-mastertbl").colResizable({
				liveDrag:true,
				//gripInnerHtml:"<div class='grip'></div>",
				draggingClass:"dragging",
				resizeMode:'overflow',
				//partialRefresh: true,
				//onResize:onSampleResized
			});
		};

		this.updateGridFields = function(newfields){
			this._fields = newfields;
			
			$(this._chart).empty();

			var clone_template_dataondemand_table = $("#template_dataondemand_table").clone();
			clone_template_dataondemand_table.find(".smarttable-tblparentdiv").height($(this._chart).outerHeight()-15);
			for(fieldIndex in newfields){
				var getFieldName = gFilters[newfields[fieldIndex].id].title;
				var td = $("<td>").addClass(getFieldName).attr("data-serialize", getFieldName).append($("<div>").append($("<span>").html(getFieldName)));
				clone_template_dataondemand_table.find("thead tr").append(td);
			}
			
			$(this._chart).append(clone_template_dataondemand_table.children());
			$(this._chart).find('.smarttable-mastertbl').width($(this._chart).find('.smarttable-tblparentdiv').outerWidth() - 25);

			$(this._chart).find(".smarttable-mastertbl").colResizable({
				liveDrag:true,
				//gripInnerHtml:"<div class='grip'></div>",
				draggingClass:"dragging",
				resizeMode:'overflow',
				partialRefresh: true,
				//onResize:onSampleResized
			}); 

			$(this._chart).find('.smarttable-tblparentdiv').data("scroll","");
			$(this._chart).find('.smarttable-tblparentdiv').scroll(function(){

				if($(this).data("scroll") == "" && $(this).scrollTop() > 0.7 * $(this).find('.smarttable-mastertbl').outerHeight()) {

						$(this).data("scroll","querying");
						
						if(verioChartObj[chartID].pluginclass.data.hits.length > 2000) return;
						
						var datatable = [];
						datatable.push({chartID: $(this).closest(".chartbox").attr("id"), from: this._rowCount+1, sort: null, search: null, filters: null});
						
						$.ajax({
							type: "post",
							url: "/anal" + "yti" + "cs/a" + "pi/ge" + "tda" + "ta",					
							data: {dataval: JSON.stringify({h: datatable})},

							success: function(resData){
								if (resData && resData.dataOnDemand){ 
									var resCMA = resData.dataOnDemand;
									for(var responseIndex in resCMA.responses){
										var chartID = resCMA.responses[responseIndex].chartID;
										
										verioChartObj[chartID].pluginclass.tableobj.appendData(resCMA.responses[responseIndex].hits);

										resCMA.responses[responseIndex].hits.hits = verioChartObj[chartID].pluginclass.data.hits.concat(resCMA.responses[responseIndex].hits.hits);
										verioChartObj[chartID].pluginclass.data = resCMA.responses[responseIndex].hits;
										
										if(resCMA.responses[responseIndex].hits.total > 0){
											$("#dashboard-chartarea #" + chartID).find('.smarttable-tblparentdiv').data("scroll","");
										}
										
									}
								}			
							},

							error: function(){

							}

						});

				}
			});			
		};
		this.updateGridFields(thisfields);
		
		this.setData = function (tabledata) {
			
			this._rowCount = tabledata.total;
			
			$(this._chart).find("tbody").empty();
			$(this._chart).find('.smarttable-tblparentdiv').scrollTop(0);
			
			for(dataIndex in tabledata.hits){
				var rowData = tabledata.hits[dataIndex]._source;
				var tr = $("<tr>", {class: "datatable-tr"});
				for(fieldIndex in this._fields){
					var fieldValue = rowData[this._fields[fieldIndex].id];
					if(gFilters[this._fields[fieldIndex].id].datatype == "list"){
						fieldValue = (xRefFilterCode2ListValue(this._fields[fieldIndex].id, fieldValue) || fieldValue);
					}else if(fieldValue && gFilters[this._fields[fieldIndex].id].datatype == "date"){
						fieldValue = moment(fieldValue).format('MM/DD/YYYY  hh:mm A');
					}else if(gFilters[this._fields[fieldIndex].id].datatype == "numeric"){
						fieldValue = fieldValue ? fieldValue.toFixed(gFilters[this._fields[fieldIndex].id].decimals) : "";
					}
					var td = $("<td>").addClass("condensed").append($("<div>").html(fieldValue));
					tr.append(td);
				}
				tr.data("orderID", rowData._idcollindex);
				tr.data("patID", rowData._idPatIndex);
				$(this._chart).find("tbody").append(tr);
			}
			$(this._chart).find(".statusbar").html("&nbsp;Total records: " + tabledata.total);
		}


		this.appendData = function (tabledata) {
			
			//this._rowCount = tabledata.total;
			//this._rowCount = tabledata.hits.length;
			
			for(dataIndex in tabledata.hits){
				var rowData = tabledata.hits[dataIndex]._source;
				var tr = $("<tr>", {class: "datatable-tr"});
				for(fieldIndex in this._fields){
					var fieldValue = rowData[this._fields[fieldIndex].id];
					if(gFilters[this._fields[fieldIndex].id].datatype == "list"){
						fieldValue = (xRefFilterCode2ListValue(this._fields[fieldIndex].id, fieldValue) || fieldValue);
					}else if(fieldValue && gFilters[this._fields[fieldIndex].id].datatype == "date"){
						fieldValue = moment(fieldValue).format('MM/DD/YYYY  hh:mm A');
					}else if(gFilters[this._fields[fieldIndex].id].datatype == "numeric"){
						fieldValue = fieldValue ? fieldValue.toFixed(gFilters[this._fields[fieldIndex].id].decimals) : "";
					}
					var td = $("<td>").addClass("condensed").append($("<div>").html(fieldValue));
					tr.append(td);
				}
				tr.data("orderID", rowData._idcollindex);
				tr.data("patID", rowData._idPatIndex);
				$(this._chart).find("tbody").append(tr);
			}
			$(this._chart).find(".statusbar").html("&nbsp;Total records: " + tabledata.total);
		}		
}

$("#dashboard-chartarea").on('click', '.datatable-tr', function () {
		$(this).closest("tr").addClass("inactive");
	  window.open('/oe/op/orders/display-details/' + $(this).data("orderID") + '/' + $(this).data("patID"), '_blank');
});



function heatmapChart(thisChart) {

		this._chart = thisChart;

		var margin = { top: 50, right: 0, bottom: 100, left: 30 },
		  width = $(thisChart).innerWidth() - margin.left - margin.right,
		  height = $(thisChart).innerHeight() - margin.top - margin.bottom,
		  gridSize = Math.floor(width / 24),
		  legendElementWidth = gridSize*2,
		  buckets = 9,
		  //colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]

			colors = ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]

		  //colors = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"],
		  days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
		  daysfull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		  times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

		var svg = d3.select(thisChart).append("svg")
		  .attr("width", width + margin.left + margin.right)
		  .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var dayLabels = svg.selectAll(".dayLabel")
		  .data(days)
		  .enter().append("text")
			.text(function (d) { return d; })
			.attr("x", -5)
			.attr("y", function (d, i) { return (i * gridSize) + gridSize/2; })
			.style("text-anchor", "end")
			//.attr("transform", "translate(-6," + gridSize / 1.5 + ")")
			.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

		var timeLabels = svg.selectAll(".timeLabel")
		  .data(times)
		  .enter().append("text")
			.text(function(d) { return d; })
			.attr("x", function(d, i) { return (i * gridSize) + gridSize/2; })
			.attr("y", -5)
			.style("text-anchor", "middle")
			//.attr("transform", "translate(" + gridSize / 2 + ", -6)")
			.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

		this.update = function(){
			var margin = { top: 50, right: 0, bottom: 100, left: 30 },
			  width = $(thisChart).innerWidth() - margin.left - margin.right,
			  height = $(thisChart).innerHeight() - margin.top - margin.bottom,
			  gridSize = Math.floor(width / 24),
			  legendElementWidth = gridSize*2;

			var thissvg = $(this._chart).find("svg");
			thissvg.attr("width", width + margin.left + margin.right);
			thissvg.attr("height", height + margin.top + margin.bottom);


			$(this._chart).find(".dayLabel").each(function(index) {
			  $(this).attr("y", function (d, i) { return (index * gridSize) + gridSize/2; });
			});

			$(this._chart).find(".timeLabel").each(function(index) {
			  $(this).attr("x", function (d, i) { return (index * gridSize) + gridSize/2; });
			});


			$(this._chart).find("rect.dhheattile").each(function(index) {
			  $(this).attr("x", function(d) { return (Number($(this).attr("hrval"))) * gridSize; });
			  $(this).attr("y", function(d) { return (Number($(this).attr("dayval"))) * gridSize; });
			  $(this).attr("width", gridSize);
			  $(this).attr("height", gridSize);
			});

			$(this._chart).find(".dhheatvaltext").each(function(index) {
			  $(this).attr("x", function(d) { return ((Number($(this).attr("hrval"))) * gridSize) + gridSize/2; });
			  $(this).attr("y", function(d) { return ( (Number($(this).attr("dayval"))) * gridSize) + (gridSize*0.66); });
			});

			$(this._chart).find(".legend").each(function(index) {
				$(this).find("rect").attr("x", function(d, i) { return legendElementWidth * index; });
				$(this).find("rect").attr("y", (gridSize * 7) + gridSize/2);
				$(this).find("rect").attr("width", legendElementWidth);
				$(this).find("rect").attr("height", gridSize / 2);

				$(this).find("text").attr("x", function(d, i) { return legendElementWidth * index; });
				$(this).find("text").attr("y", (gridSize * 8) + gridSize/2);

			});



		};

		this.setData = function (heatdata) {

			var margin = { top: 50, right: 0, bottom: 100, left: 30 },
			  width = $(thisChart).innerWidth() - margin.left - margin.right,
			  height = $(thisChart).innerHeight() - margin.top - margin.bottom,
			  gridSize = Math.floor(width / 24),
			  legendElementWidth = gridSize*2;

			var minValue = d3.min(heatdata, function (d) { return (d[2] > 0) ? d[2] : null; });
			var maxValue = d3.max(heatdata, function (d) { return d[2]; });

			var adjustedBuckets = buckets;
			if(maxValue == 0){
				adjustedBuckets = 1;
			}

			var colorScale = d3.scale.quantile()
			  .domain([minValue, maxValue])
			  .range(colors);

			var cards = svg.selectAll(".hour")
			  .data(heatdata, function(d) {return d[0]+':'+d[1];});

			//cards.append("title");

			var cardsenter = cards.enter();

			cardsenter.append("rect")
				  .attr("x", function(d) { return (d[1] - 1) * gridSize; })
				  .attr("y", function(d) { return (d[0] - 1) * gridSize; })
				  .attr("rx", 4)
				  .attr("ry", 4)
				  .attr("class", "hour bordered dhheattile")
				  .attr("width", gridSize)
				  .attr("height", gridSize)
				  .attr("value", function(d) { return d[2]; })
				  .attr("day", function(d) { return days[d[0]-1]; })
				  .attr("hr", function(d) { return times[d[1]-1]; })
				  .attr("dayval", function(d) { return d[0]-1; })
				  .attr("hrval", function(d) { return d[1]-1; })
				  .attr("data-toggle", "tooltip")
				  .attr("data-original-title", function(d) { return daysfull[d[0]-1] + " at " + times[d[1]-1] + "m = " + d[2]; })
				  .style("fill", colors[0]);

			cardsenter.append("text")
				.text(function(d) { return d[2]; })
				.attr("x", function(d) { return ((d[1] - 1) * gridSize) + gridSize/2; })
				.attr("y", function(d) { return ( (d[0] - 1) * gridSize ) + (gridSize*0.66); })
				.attr("class", "hour dhheatvaltext")
				.style("text-anchor", "middle")
				.style("fill", "white")
				.attr("dayval", function(d) { return d[0]-1; })
				.attr("hrval", function(d) { return d[1]-1; });
				//.attr("transform", "translate(" + gridSize / 2 + ", -6)");

			svg.selectAll(".dhheatvaltext").data(heatdata);

			svg.selectAll(".dhheattile").transition().duration(500)
			  .style("fill", function(d) { return (d[2] == 0) ? "#fff" : colorScale(d[2]); })
			  .attr("value", function(d) { return d[2]; })
			  .attr("data-original-title", function(d) {
					var fixer = (d[2]).toFixed(2);
					if(fixer.toString().endsWith("00") == true){
						fixer = Math.round(fixer);
					}
				  return daysfull[d[0]-1] + " at " + times[d[1]-1] + "m = " + fixer; });

			svg.selectAll(".dhheatvaltext").transition().duration(500)
			  .style("fill", function(d) { return (d[2] > 0 && colorScale(d[2]) == "#ffffcc" || colorScale(d[2]) == "#ffeda0") ? "#CE6F6F" : "#fff"; })
			  .text(function(d) {
						var fixer = (d[2]).toFixed(2);
						if(fixer.toString().endsWith("00") == true){
							fixer = Math.round(fixer);
						}
						return fixer;
					});

/*


*/
			//cards.select("title").text(function(d) { return d[2]; });

			//cards.exit().remove();

			var legend = svg.selectAll(".legend")
			  .data((colorScale.quantiles()), function(d) {   return d; });

			legend.enter().append("g")
			  .attr("class", "legend");

			legend.append("rect")
			.attr("x", function(d, i) { return legendElementWidth * i; })
			.attr("y", (gridSize * 7) + gridSize/2)
			.attr("width", legendElementWidth)
			.attr("height", gridSize / 2)
			.style("fill", function(d, i) {  return colors[i]; });

			legend.append("text")
			.attr("class", "mono")
			.text(function(d) { return "" + Math.round(d); })
			.attr("x", function(d, i) { return legendElementWidth * i; })
			.attr("y", (gridSize * 8) + gridSize/2);

			legend.exit().remove();
		}

};



$("#filters-container").on("click", ".filteroptionresetfilterdates", function (event) {
	var parentFilterparentDOM = $(this).closest(".filterparentDOM");
	var filterinfo = parentFilterparentDOM.find(".filtercontainer").data("filterinfo");


	parentFilterparentDOM.find(".slidercontainer").noUiSlider({
		range: {
						'min': filterinfo.slidermin,
						'max': filterinfo.slidermax
		}
	}, true);
	
	parentFilterparentDOM.find(".slidercontainer").val([filterinfo.slidermin, filterinfo.slidermax], {set: true});
	parentFilterparentDOM.find(".filtercontainer").data("currentSliderValues", {min: filterinfo.slidermin, max: filterinfo.slidermax});	
	parentFilterparentDOM.find(".filtercontainer").data("forcedSliderMin", null);
	parentFilterparentDOM.find(".filtercontainer").data("forcedSliderMax", null);
	parentFilterparentDOM.find(".span-resetfilterdates").addClass("hidden");
	parentFilterparentDOM.find(".noUi-connect").removeClass("noUi-connect-subrange-override");

	updateAllCharts();
	
});


$("#filters-container").on("click", ".filtercontainer .lowertext", function (event) {
	var parentFilterContainer = $(this).closest(".filtercontainer");
	var parentFilterparentDOM = parentFilterContainer.closest(".filterparentDOM");
		
	if(parentFilterContainer.data("filterinfo").datatype == "date"){

		var currentFilterValues = parentFilterparentDOM.find(".filtercontainer").data("currentSliderValues");

		parentFilterContainer.find(".lowertext").datepicker({ autoclose: true, todayHighlight: false, orientation: "auto right", startDate: moment(parentFilterparentDOM.find(".filtercontainer").data("filterinfo").slidermin).format('MM/DD/YYYY'), endDate: moment(currentFilterValues.max).format('MM/DD/YYYY') });
		parentFilterContainer.find(".lowertext").datepicker('setDate', moment(Number(parentFilterContainer.find(".lowerinput").val())).format('MM/DD/YYYY'));
		parentFilterContainer.find(".lowertext").datepicker('show');

		parentFilterContainer.find(".lowertext").datepicker().on("changeDate", function(e) {
			var newTimeStamp = moment(Number(e.date)).startOf("day").valueOf();
			
			var currentFilterValues = parentFilterparentDOM.find(".filtercontainer").data("currentSliderValues");
			currentFilterValues.min = newTimeStamp;
			parentFilterparentDOM.find(".filtercontainer").data("currentSliderValues", currentFilterValues);

			parentFilterparentDOM.find(".slidercontainer").noUiSlider({
				range: {
								'min': newTimeStamp,
								'max': currentFilterValues.max
				}
			}, true);

			parentFilterparentDOM.find(".slidercontainer").val([newTimeStamp, null], {set: true});
			parentFilterparentDOM.find(".filtercontainer").data("forcedSliderMin", newTimeStamp);
			parentFilterparentDOM.find(".span-resetfilterdates").removeClass("hidden");
			parentFilterparentDOM.find(".noUi-connect").addClass("noUi-connect-subrange-override");

			updateAllCharts();
						
		});
		
		parentFilterContainer.find(".lowertext").datepicker().on("hide", function(e) {
			parentFilterContainer.find(".lowertext").datepicker().off("changeDate");
			parentFilterContainer.find(".lowertext").datepicker().off("hide");
			//parentFilterContainer.find(".lowertext").datepicker('remove');
			//parentFilterContainer.find(".lowertext").datepicker('detroy');
		});

	}

});



$("#filters-container").on("click", ".filtercontainer .uppertext", function (event) {
	var parentFilterContainer = $(this).closest(".filtercontainer");
	var parentFilterparentDOM = parentFilterContainer.closest(".filterparentDOM");
		
	if(parentFilterContainer.data("filterinfo").datatype == "date"){

		var currentFilterValues = parentFilterparentDOM.find(".filtercontainer").data("currentSliderValues");

		parentFilterContainer.find(".uppertext").datepicker({ autoclose: true, todayHighlight: false, orientation: "auto right", endDate: moment(parentFilterparentDOM.find(".filtercontainer").data("filterinfo").slidermax).format('MM/DD/YYYY'), startDate: moment(currentFilterValues.min).format('MM/DD/YYYY') });
		parentFilterContainer.find(".uppertext").datepicker('setDate', moment(Number(parentFilterContainer.find(".upperinput").val())).format('MM/DD/YYYY'));
		parentFilterContainer.find(".uppertext").datepicker('show');

		//$(".datepicker").data("invoked_filter", parentFilterContainer);

		parentFilterContainer.find(".uppertext").datepicker().on("changeDate", function(e) {
			var newTimeStamp = moment(Number(e.date)).startOf("day").valueOf();
			
			var currentFilterValues = parentFilterparentDOM.find(".filtercontainer").data("currentSliderValues");
			currentFilterValues.max = newTimeStamp;
			parentFilterparentDOM.find(".filtercontainer").data("currentSliderValues", currentFilterValues);

			parentFilterparentDOM.find(".slidercontainer").noUiSlider({
				range: {
								'min': currentFilterValues.min,
								'max': newTimeStamp
				}
			}, true);
			
			parentFilterparentDOM.find(".slidercontainer").val([null, newTimeStamp], {set: true});
			parentFilterparentDOM.find(".filtercontainer").data("forcedSliderMax", newTimeStamp);
			parentFilterparentDOM.find(".span-resetfilterdates").removeClass("hidden");
			parentFilterparentDOM.find(".noUi-connect").addClass("noUi-connect-subrange-override");

			updateAllCharts();
						
		});
		
		parentFilterContainer.find(".uppertext").datepicker().on("hide", function(e) {
			parentFilterContainer.find(".uppertext").datepicker().off("changeDate");
			parentFilterContainer.find(".uppertext").datepicker().off("hide");
		});

	}

});




$("#vt-categories").on("click", "li", function (event) {
	var skey = $(this).attr("skey");
	$("#vt-search").find("#txtsrchtempl").val(skey);
	$("#searchtemplate-tabs li:first a").click();
	$("#analytics-template-search-form").submit();
});

$("body").on("click", ".exportchartdata", function (event) {
	var invoked_chartID = $(this).closest(".chartbox").attr("id");
	var chartObj = JSON.parse(JSON.stringify(verioChartObj[invoked_chartID].properties));
	var yseriesArray = [];
	for(var ykey in chartObj.yseries){
		delete chartObj.yseries[ykey].id;
		yseriesArray.push(chartObj.yseries[ykey]);
	}
	var exportTemplate = {};
	exportTemplate.id = "";
	exportTemplate.c = chartObj.chartcaption;
	exportTemplate.d = "";
	exportTemplate.t = chartObj.charttype;
	exportTemplate.p = { "chart": chartObj};
	exportTemplate.p.chart.chartposition = {
            "pos": 0,
            "width": 100,
            "height": 100
         };
    delete exportTemplate.p.chart.yseries;
    exportTemplate.p.yseries = yseriesArray;


	exportTemplate.c = prompt("Caption", exportTemplate.c) || "";
	exportTemplate.d = prompt("Description", exportTemplate.c) || "";
	exportTemplate.p.chart.chartcaption = prompt("Chart Caption", exportTemplate.c) || "";
	exportTemplate.k = prompt("Keywords", "") || "";
	var id = prompt("ID", "");
	if(id == null){
		alert("No ID No Save!");
		return;
	}else{
		exportTemplate.id = id;
	}

	//console.log(JSON.stringify(exportTemplate));

	$.ajax({
		type: "POST",
		url: "/analytics/addTemplate",
		data: {template: exportTemplate, version: "1"},

		success: function(msg){
			if(msg=="SUCCESS"){
				alert("success");
			}else{
				alert("failure");
			}
		},

		error: function(){
			alert("Unable to connect to server or request timed out.");
		}

	});

});

