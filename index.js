const data = {
	API_KEY:'AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU',
	prefOrder:[],
	priceArray:[],
	minRating:''
}

const REC_SETTINGS = {
		ll:'',
		radius:500,
		section:'',
		query:'',
		venuePhotos:1,
		openNow:1,
		price:'',
		client_id:'MDDIFKZ5GFSAGZHAOFYPNQRATOT13FY2OYFUY1JDF5UNUZBA',
		client_secret:'2ZUIA2A15LIKRSBGM3EN5BCCOX0YICNBJETKSRKOHDCQFSTT',
		v:'20180210'
	}

function filterResults(response){
	console.log(response);
}

function getRecs(response){
	const payload = {
		url:'https://api.foursquare.com/v2/venues/explore',
		dataType:'json',
		data:REC_SETTINGS,
		success: filterResults
	}
	$.ajax(payload)
}

function renderPreferences(response){
	REC_SETTINGS.ll = [response.location.lat,response.location.lng].join()
	$('.preferencePage').attr('hidden',false);
	$('.start').attr('hidden',true);
	$('.card[role="button"]').click(function(e){
		console.log($(this).text())
		REC_SETTINGS.query = $(this).text()
	});
	let sliderValue = $('#rangeValue');
	let sliderObject = $('#rangeFilter');
	sliderValue.html(sliderObject.val());
	sliderObject.on('input', function(e){
		sliderValue.html(sliderObject.val())
	});
	$( "#sortable" ).sortable();
	$( "#sortable" ).disableSelection();
	$('#priceFilter, #rangeFilter').css({'display':'inline-block'});
	$('.price-option, .rating-option').css({'display':'inline-block'});
	let rating = $('.rating-option .option');
	rating.click(function(e){
		rating.css('background-color','white');
		$(this).css('background-color','green');
		rating.removeClass('selected');
		$(this).addClass('selected');
	});
	let price = $('.price-option .option')
	price.click(function(e){
		price.css('background-color','white');
		$(this).css('background-color','green');
		price.removeClass('selected');
		$(this).addClass('selected');
	});
	$('.submit-button').click(function(e){
		data.prefOrder = $('#sortable').sortable('toArray');
		REC_SETTINGS.radius = sliderObject.val();
		let priceLimit = $('.price-option .selected').attr('data-option');
		for(i=1;i<priceLimit;i++){
			data.priceArray.push(i);
		}
		REC_SETTINGS.price = data.priceArray.join();
		data.minRating = $('.rating-option .selected').attr('data-option');
		console.log(data.minRating);
		getRecs();
	});
}

function getLocation(){
	const payload = {
		url:'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU',
		method:'POST',
		dataType:'json',
		success:renderPreferences
	}
	$.post(payload)
}


$('#start').click(function(){
	getLocation()
});
