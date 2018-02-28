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
	venues:[],
	venLibrary:[],
	searchKeywords:{
		'cocktails':['cocktails'],
		'live music':['live music','music venue','band','rock','indie','guitar','acoustic','heavy metal','good music'],
		'desert':['gelato','ice cream','desert','cake','chocolate','sorbet'],
		'food':['restaurant','food'],
		'dancing':['club','dancing','dance','nightclub','salsa'],
		'karaoke':['karaoke']
	},
	nextVen:0,
	searchAgain:true,
	dollarSelection:[],
	starSelection:[]
}

const DET_SETTINGS = {
	client_id:data.CLIENT_ID,
	client_secret:data.CLIENT_SECRET,
	v:data.VERSION
}

const REC_SETTINGS = {
		ll:'',
		radius:7500,
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
	console.log(selectedVenue);
}

function filterGoogleReviews(response){
	let reviews = response.result.reviews;
	reviews.forEach(review => {
		data.searchKeywords[REC_SETTINGS.query].forEach(sTerm => {
			if ( review.text.toLowerCase().indexOf(sTerm) >=0 ){
				data.searchAgain = false;
			}
		});
	});
	if (data.searchAgain===false){
		genVenCard(response.result);
	} else {
		if ((data.nextVen + 1 < data.venues.length)){
			prepareSearch()
		} else {
			renderTryAgain()
		}
	}
}


function googleDetails(response){
	const payload = {
		url:`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=${response.results[0].place_id}&key=${data.GOOGLE_KEY}`,
		success:filterGoogleReviews
	}
	$.ajax(payload);
}

function googleSearch(venSearchParams){
	data.nextVen++;
	let query = venSearchParams.name + ' '+venSearchParams.address
	const payload = {
		url:`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${[venSearchParams.lat, venSearchParams.lng].join()}&key=${data.GOOGLE_KEY}`,
		success: googleDetails
	}
	$.ajax(payload)
}

function prepareSearch(){
	let venueToSearch = data.venLibrary[Object.keys(data.venues[data.nextVen])[0]];
	googleSearch(venueToSearch);
}

function rankVenues(){
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
	data.venues.sort(compare);
	prepareSearch();
}

function scoreRecs(){
	let totalVen = data.venues.length
	data.venues.forEach(venue => {
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
	rankVenues()
}

function genRecsObj(venue) {
	let venueObj = {};
	let ven_ID = venue.venue.id;
	if(venue.venue.price && venue.venue.price.tier && venue.venue.rating){
		data.venLibrary[ven_ID] = {};
		data.venLibrary[ven_ID].name = venue.venue.name;
		data.venLibrary[ven_ID].address = venue.venue.location.formattedAddress.join();
		data.venLibrary[ven_ID].lat = venue.venue.location.lat
		data.venLibrary[ven_ID].lng = venue.venue.location.lng
		data.venLibrary[ven_ID].phone = venue.venue.contact.phone
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
	let recVenues = response.response.groups[0].items;
	data.venues = recVenues.map( venue => genRecsObj(venue)).filter(venue => venue);
	data.venues.forEach(venue => {
		let _id = Object.keys(venue)[0]
		let _rating = venue[_id].rating
		let _dist = venue[_id].distance
		let _checkins = venue[_id].checkins
		let ratRank = 1
		let distRank = 1
		let popRank = 1
		data.venues.forEach(nextVen => {
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
	scoreRecs()
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

function grabLocation(response){
	REC_SETTINGS.ll = [response.location.lat,response.location.lng].join()
}

function toggleDisplay(selectors){
	selectors.forEach(selector => {
		let attr = $(selector).attr('hidden');
		if(attr==null){
			$(selector).attr('hidden',true);
		} else {
			$(selector).attr('hidden',false);
		}
	});
}

function renderTryAgain(){
	toggleDisplay(['.preferencePage','.try-again'])
	$('#tryAgain').click(function(e){
		toggleDisplay(['.preferencePage','.try-again'])
	});
}


function getLocation(){
	const payload = {
		url:`https://www.googleapis.com/geolocation/v1/geolocate?key=${data.GOOGLE_KEY}`,
		method:'POST',
		dataType:'json',
		success:grabLocation
	}
	$.post(payload)
}

$('#fullpage').fullpage({anchors:['categories','pricing','ratings','range','preferences'],menu:'#nav-menu',recordHistory:false});

$('.card[role="button"]').click(function(e){
	$('.card[role="button"]').removeClass('selected');
	$(this).addClass('selected');
	REC_SETTINGS.query = $(this).attr('data-query');
	$('.submit-button').removeAttr('data-tooltip');
	$('.submit-button').attr('disabled',false);
});

$(".flip").flip({
    trigger: 'hover'
});

$('#slider').slider({
	max:15000,
	min:500,
	step:500,
	value:500,
	slide:function(event, ui){
		let range = ui.value;
		REC_SETTINGS.radius = range;
		if(range >= 13000){
			$('#body').css('--speed','1.7');
		} else if (range >= 10500){
			$('#body').css('--speed','1.6');	
		} else if (range >= 8000){
			$('#body').css('--speed','1.5');
		} else if (range >= 5500) {
			$('#body').css('--speed','1.4');
		} else if (range >= 3000){
			$('#body').css('--speed','1.3');		
		}
	  }
	}).slider('pips',{
	step:5,
	rest:'label'
});

//dollar ratings hover
$('#dollars').on('mouseover','.usd', function(e){
	let usdGroupNumber = $(this).data('value');
	let usdGroup = $(`.usd[data-value=${usdGroupNumber}]`)
	usdGroup.css({'border-top':'2px dashed #FF0038','border-bottom':'2px dashed #FF0038'});
	usdGroup.addClass('hover');
}).on('mouseout', '.usd',function(){
	let usdGroupNumber = $(this).data('value');
	let usdGroup = $(`.usd[data-value=${usdGroupNumber}]`)
	usdGroup.css('border','none');
	usdGroup.removeClass('hover');
});

//dollar ratings click
$('#dollars').on('click','.usd', function(e){
	data.dollarSelection = [];
	let usdGroupRating = $(this).data('value');
	let usdGrouping = $(`.usd[data-value=${usdGroupRating}]`);
	let dollarOptions = $('#dollars .usd');
	usdGrouping.each(function(i){
		$(usdGrouping[i]).toggleClass('active');
	})
	dollarOptions.each(function(i){
		let usdRating = $(dollarOptions[i]).attr('title');
		if($(dollarOptions[i]).hasClass('active')){
			if(data.dollarSelection.indexOf(usdRating)<0){
				data.dollarSelection.push(usdRating);
			}
		}
	});
    let dollarsSelected = data.dollarSelection.length;
	if(dollarsSelected > 2){
		let last = data.dollarSelection.pop();
		let grammarList = data.dollarSelection.join(', ') + ' and ' + last.toString();
    	$('.js-dollar-choice').text(`You have selected venues considered to be ${grammarList}`)
    } else if (dollarsSelected > 1) {
    	$('.js-dollar-choice').text(`You have selected venues considered to be ${data.dollarSelection.join(' and ')}`)
    } else if (dollarsSelected > 0) {
    	$('.js-dollar-choice').text(`You have selected venues considered to be ${data.dollarSelection[0]}`)
    } else {
    	$('.js-dollar-choice').html('<i>Please select each price rating you would like to include</i>')
    }
});
 
$('#stars li').on('mouseover', function(){
	let onStar = parseInt($(this).data('value'), 10);
	$(this).parent().children('li.star').each(function(e){
  	if (e+1 < onStar) {
    	$(this).addClass('hover');
  	} else {
    	$(this).removeClass('hover');
  	  }
	});
}).on('mouseout', function(){
	$(this).parent().children('li.star').each(function(e){
  $(this).removeClass('hover');
});
});
  
$('#stars li').on('click', function(){ 
	data.starSelection = [];
    let onStar = parseInt($(this).data('value'), 10);
    let stars = $('#stars .star');
    stars.removeClass('exclude');
    stars.each(function(i){
    	if(i < onStar-1){
    		$(stars[i]).addClass('exclude');
    		$(stars[i]).removeClass('include');
    	} else {
    		$(stars[i]).addClass('include');
    	}
    });
    stars.each(function(i){
    	if($(stars[i]).hasClass('include')){
    		data.starSelection.push($(stars[i]).data('value'))
    	}
    })
    let starsSelected = data.starSelection.length;
	if(starsSelected > 2){
		let last = data.starSelection.pop();
		let grammarList = data.starSelection.join(', ') + ' and ' + last.toString();
    	$('.js-star-choice').text(`You have selected venues with ${grammarList} stars`)
    } else if (starsSelected > 1) {
    	$('.js-star-choice').text(`You have selected venues with ${data.starSelection.join(' and ')} stars`)
    } else {
    	$('.js-star-choice').text(`You have selected venues with ${data.starSelection[0]} stars`)
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

$( "#sortable" ).sortable({
	handle:'.handle'
}).disableSelection();

$('#fp-nav li:nth-child(2) span').html('<i class="fas fa-dollar-sign"></i>')

$(getLocation)
  
  

