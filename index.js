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
	venLibrary:[]
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

function genVenCard(response){
	console.log(response);
}


function googleDetails(response){
	const payload = {
		url:`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=${response.results[0].place_id}&key=${data.GOOGLE_KEY}`,
		success:genVenCard
	}
	$.ajax(payload);
}

function googleSearch(topVen){
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
	googleSearch(data.venLibrary[0][Object.keys(venues[0])[0]])
}

function scoreRecs(venues){
	let totalVen = venues.length
	for (venue in venues){
		let score = 0;
		let _id = Object.keys(venues[venue])[0]
		let keys = Object.keys(venues[venue][_id])
		for (key in keys){
			let _rank = venues[venue][_id][keys[key]]
			let _points = 0;
			if (keys[key]==='priceTier'){
				_points += (5 - _rank)
				if ( (data.prefOrder.indexOf('priceTier')===0) && (_rank===1) ){
					_points += 20
				}
			} else {
				_points += (totalVen - _rank)
				if ( (data.prefOrder.indexOf(keys[key])===0) && (_rank < 5) ){
					_points += data.bonusOne[_rank.toString()]
				}
			}
			if ( (data.prefOrder.indexOf(keys[key])===1) && (_rank < 5) ){
				_points += data.bonusTwo[_rank.toString()]
			}
			venues[venue][_id][keys[key]] = _points;
			score += _points;
		}
		venues[venue][_id].score = score;
	}
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
	console.log(venues);
	for (venue in venues) {
		let _id = Object.keys(venues[venue])[0]
		let _rating = venues[venue][_id].rating
		let _dist = venues[venue][_id].distance
		let _checkins = venues[venue][_id].checkins
		let ratRank = 1
		let distRank = 1
		let popRank = 1
		for (nextVen in venues){
			let nextID = Object.keys(venues[nextVen])[0]
			let nextRating = venues[nextVen][nextID].rating
			let nextDistance = venues[nextVen][nextID].distance
			let nextCheck = venues[nextVen][nextID].checkins
			if( (venue !== nextVen) ){
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
		}
		venues[venue][_id].rating = ratRank
		venues[venue][_id].distance = distRank
		venues[venue][_id].checkins = popRank
	}
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
			console.log(option);
			return $(option).attr('data-option');
		});
		console.log(data.priceArray);
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
