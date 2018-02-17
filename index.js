const data = {
	API_KEY:'AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU',
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
	}
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
	console.log(response)
}

function getTopVenDetails(topVen){
	let VEN_ID = Object.keys(topVen)[0];
	console.log(topVen);
	console.log(VEN_ID);
	let payload = {
		url:`https://api.foursquare.com/v2/venues/${VEN_ID}`,
		dataType:'json',
		data:DET_SETTINGS,
		success: genVenCard
	}
	$.ajax(payload);
}

function getTopVenue(venues){
	let topScore = 0
	let topVenues = []
	for (venue in venues){
		let _id = Object.keys(venues[venue])[0]
		let _score = venues[venue][_id].score
		if (topScore < _score ) {
			topScore = _score
		}
	}
	for (venue in venues){
		let _id = Object.keys(venues[venue])[0]
		let _score = venues[venue][_id].score
		if ( topScore === _score ) {
			topVenues.push(venues[venue])
		}
	}
	
	for (venue in topVenues){
		let _id = Object.keys(venues[venue])[0]
		let _score = venues[venue][_id].score
	}
	getTopVenDetails(topVenues[0])
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
	getTopVenue(venues)
}

function genRecsObj(venue) {

	let venues = {};
	let ven_ID = venue.venue.id;
	venues[ven_ID] = {};
	venues[ven_ID].rating = venue.venue.rating;
	venues[ven_ID].priceTier = venue.venue.price.tier;
	venues[ven_ID].distance = venue.venue.location.distance;
	venues[ven_ID].checkins = venue.venue.stats.checkinsCount;
	return venues;
}

function rankResults(response){
	let recVenues = response.response.groups[0].items;
	let venues = recVenues.map( venue => genRecsObj(venue));
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
