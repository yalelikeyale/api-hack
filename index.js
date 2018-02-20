const data = {
	GOOGLE_KEY:'AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU',
	CLIENT_ID:'MDDIFKZ5GFSAGZHAOFYPNQRATOT13FY2OYFUY1JDF5UNUZBA',
	CLIENT_SECRET:'2ZUIA2A15LIKRSBGM3EN5BCCOX0YICNBJETKSRKOHDCQFSTT',
	VERSION:'20180210',
	prefOrder:[],
	priceArray:[],
	minRating:'',
	bonusOne:{
		1:12,
		2:10,
		3:7,
		4:3
	},
	bonusTwo:{
		1:5,
		2:4,
		3:3,
		4:2
	},
	venLibrary:[],
	searchKeywords:{
		'live music':['music','live','band','rock','indie','guitar','acoustic']
	},
	cont:true
}

const DET_SETTINGS = {
	client_id:data.CLIENT_ID,
	client_secret:data.CLIENT_SECRET,
	v:data.VERSION
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
		client_id:data.CLIENT_ID,
		client_secret:data.CLIENT_SECRET,
		v:data.VERSION
	}

function genVenCard(selectedVenue){
	data.cont = false;
	console.log(selectedVenue);
}

function filterGoogleReviews(response){
	console.log('reading google reviews');
	let reviews = response.result.reviews;
	for ( review in reviews) {
		for (sTerm in data.searchKeywords[REC_SETTINGS.query]){
			if ( reviews[review].text.toLowerCase().indexOf(data.searchKeywords[REC_SETTINGS.query][sTerm]) >=0){
				genVenCard(response.result)
			}
		}
	}
}


function googleDetails(response){
	console.log('getting venue details from google');
	const payload = {
		url:`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=${response.results[0].place_id}&key=${data.GOOGLE_KEY}`,
		success:filterGoogleReviews
	}
	$.ajax(payload);
}

function googleSearch(topVen){
	console.log('searching google for venue');
	const payload = {
		url:`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${topVen.name}&location=${[topVen.lat, topVen.lng].join()}&key=${data.GOOGLE_KEY}`,
		success: googleDetails
	}
	$.ajax(payload)
}

function rankVenues(venues){
	function compare(a,b){
		let id_a = Object.keys(a)[0];
		let id_b = Object.keys(b)[0];
		if(a[id_a].score < b[id_b].score){
			return 1
		} else if ( a[id_a].score > b[id_b].score){
			return -1
		} else {
			return 0
		}
	}
	venues.sort(compare);
	for(venueKey in venues){
		console.log('in for loop line 98');
		if(data.continue === false){
			break
		} else {
			googleSearch(data.venLibrary[0][Object.keys(venues[venueKey])[0]]);
		}
	}
}

function scoreRecs(venues){
	let totalVen = venues.length
	venues.forEach(venue => {
		let score = 0;
		let _id = Object.keys(venue)[0]
		let keys = Object.keys(venue[_id])
		keys.forEach(key =>{
			let _rank = venue[_id][key]
			let _points = 0;
			if (key==='priceTier'){
				_points += (5 - _rank)
				if ( (data.prefOrder.indexOf('priceTier')===0) && (_rank===1) ){
					_points += 20
				}
			} else {
				_points += (totalVen - _rank)
				if ( (data.prefOrder.indexOf(key)===0) && (_rank < 5) ){
					_points += data.bonusOne[_rank.toString()]
				}
			}
			if ( (data.prefOrder.indexOf(key)===1) && (_rank < 5) ){
				_points += data.bonusTwo[_rank.toString()]
			}
			venue[_id][key] = _points;
			score += _points;			
		});
		venue[_id].score = score;
		return venue;
	});
	rankVenues(venues)
}

function genRecsObj(venue) {
	let venueObj = {};
	let ven_ID = venue.venue.id;
	if(venue.venue.price && venue.venue.price.tier && venue.venue.rating){
		data.venLibrary[0][ven_ID] = {};
		data.venLibrary[0][ven_ID].name = venue.venue.name;
		data.venLibrary[0][ven_ID].address = venue.venue.location.formattedAddress.join();
		data.venLibrary[0][ven_ID].lat = venue.venue.location.lat
		data.venLibrary[0][ven_ID].lng = venue.venue.location.lng
		data.venLibrary[0][ven_ID].phone = venue.venue.contact.phone
		venueObj[ven_ID] = {};
		venueObj[ven_ID].rating = venue.venue.rating;
		venueObj[ven_ID].priceTier = venue.venue.price.tier;
		venueObj[ven_ID].distance = venue.venue.location.distance;
		venueObj[ven_ID].checkins = venue.venue.stats.checkinsCount;
		return venueObj;
	} else {
		return null;
	}
}

function rankResults(response){
	data.venLibrary[0] = {};
	let recVenues = response.response.groups[0].items;
	let venues = recVenues.map( venue => genRecsObj(venue)).filter(venue => venue);
	venues.forEach(venue => {
		let _id = Object.keys(venue)[0]
		let _rating = venue[_id].rating
		let _dist = venue[_id].distance
		let _checkins = venue[_id].checkins
		let ratRank = 1
		let distRank = 1
		let popRank = 1
		venues.forEach(nextVen => {
			let nextID = Object.keys(nextVen)[0]
			let nextRating = nextVen[nextID].rating
			let nextDistance = nextVen[nextID].distance
			let nextCheck = nextVen[nextID].checkins
			if( _id !== nextID ){
				if (nextRating > _rating){
					ratRank++
				}
				if (nextDistance < _dist){
					distRank++
				}
				if (nextCheck < _checkins){
					popRank++
				}
			}			
		});
		venue[_id].rating = ratRank
		venue[_id].distance = distRank
		venue[_id].checkins = popRank
		return venue;
	});
	scoreRecs(venues)
}

function getRecs(response){
	const payload = {
		url:'https://api.foursquare.com/v2/venues/explore',
		dataType:'json',
		data:REC_SETTINGS,
		success: rankResults
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
		REC_SETTINGS.query = $(this).attr('data-query');
		$('.submit-button').removeAttr('data-tooltip');
		$('.submit-button').attr('disabled',false);
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
	$('.price-option .option').click(function(e){
		if($(this).hasClass('selected')){
			$(this).removeClass('selected');
		} else {
			$(this).addClass('selected');
		}
	});
	$('.submit-button').click(function(e){
		data.prefOrder = $('#sortable').sortable('toArray');
		REC_SETTINGS.radius = sliderObject.val();
		data.priceArray = $.map($('.price-option .selected'), function(option){
			return $(option).attr('data-option');
		});
		data.minRating = $('.rating-option .selected').attr('data-option');
		getRecs();
	});
}

function getLocation(){
	const payload = {
		url:`https://www.googleapis.com/geolocation/v1/geolocate?key=${data.GOOGLE_KEY}`,
		method:'POST',
		dataType:'json',
		success:renderPreferences
	}
	$.post(payload)
}

$('#start').click(function(){
	getLocation()
});
