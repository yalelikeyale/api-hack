const data = {
	API_KEY:'AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU',
	prefOrder:[],
	priceArray:[],
	minRating:''
}

const REC_SETTINGS = {
		ll:'',
		radius:0,
		query:'',
		limit:15,
		venuePhotos:1,
		openNow:0,
		time:'any',
		price:'',
		client_id:'MDDIFKZ5GFSAGZHAOFYPNQRATOT13FY2OYFUY1JDF5UNUZBA',
		client_secret:'2ZUIA2A15LIKRSBGM3EN5BCCOX0YICNBJETKSRKOHDCQFSTT',
		v:'20180210'
	}

function filterResults(response){
	let venues = {};
	let recVenues = response.response.groups[0].items;
	for(venue in recVenues){
		console.log(recVenues[venue]);
		venue = recVenues[venue];
		let ven_ID = venue.venue.id;
		venues[ven_ID] = {};
		venues[ven_ID].rating = venue.venue.rating;
		venues[ven_ID].priceTier = venue.venue.price.tier;
		venues[ven_ID].distance = venue.venue.location.distance;
		// if( rating > data.minRating ) {

		// }
	}
	console.log(venues);
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
		$('.card[role="button"]').removeClass('selected');
		$(this).addClass('selected');
		REC_SETTINGS.query = $(this).attr('data-query')
		console.log(REC_SETTINGS.query);
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
		rating.removeClass('selected');
		$(this).addClass('selected');
	});
	let price = $('.price-option .option')
	price.click(function(e){
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
