const data = {
	GOOGLE_KEY:'AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU',
	CLIENT_ID:'MDDIFKZ5GFSAGZHAOFYPNQRATOT13FY2OYFUY1JDF5UNUZBA',
	CLIENT_SECRET:'2ZUIA2A15LIKRSBGM3EN5BCCOX0YICNBJETKSRKOHDCQFSTT',
	VERSION:'20180210',
	userLat:'',
	userLng:'',
	today: new Date(),
	weekly_period:{
		'sunday':0,
		'monday':1,
		'tuesday':2,
		'wednesday':3,
		'thursday':4,
		'friday':5,
		'saturday':6
	},
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
	libraryKey:'',
	selectedVen:{},
	photos:[],
	searchKeywords:{
		'cocktails':['cocktails'],
		'live music':['live music','music venue','band','rock','indie','guitar','acoustic','heavy metal','good music'],
		'dessert':['gelato','ice cream','desert','cake','chocolate','sorbet', 'coffee','latte','flat white','cappuccino'],
		'food':['restaurant','food'],
		'dancing':['club','dancing','dance','nightclub','salsa'],
		'karaoke':['karaoke']
	},
	nextVen:0,
	searchAgain:true,
	dollarSelection:[],
	starSelection:[],
	directionsService:{},
	directionsDisplay:{},
	estTravel:'',
	map:{},
	startIcon:'images/car.svg',
	endIcon:'',
	startMarker:{}
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
		openNow:0,
		time:'any',
		price:'',
		client_id:data.CLIENT_ID,
		client_secret:data.CLIENT_SECRET,
		v:data.VERSION
	}

const DIRECTIONS_SETTINGS = {
	origin:'',
	destination: {
		placeId:''
	},
	travelMode:'DRIVING'
}



function makeStartMarker( position, icon, title ) {
    data.startMarker = new google.maps.Marker({
        position: position,
        map: data.map,
        icon: icon,
        title: title
    });
}

function makeEndMarker( position, icon, title ) {
    new google.maps.Marker({
        position: position,
        map: data.map,
        icon: icon,
        title: title
    });
}

var deleteMarker = function() {
    data.startMarker.setMap(null);
}

function initMap() {
    data.directionsService = new google.maps.DirectionsService;
    data.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    data.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: {
      	lat: data.userLat, 
      	lng: data.userLng,
      }
    });
    data.directionsDisplay.setMap(data.map);
    displayDirections(data.directionsService, data.directionsDisplay)
  }

function displayDirections(directionsService, directionsDisplay) {
	const icons = {
	  	start: {
	    	url: data.startIcon,
	    	size: new google.maps.Size(71, 71),
	    	origin: new google.maps.Point(0, 0),
	    	anchor: new google.maps.Point(17, 34),
	    	scaledSize: new google.maps.Size(35, 35)
	  	},
	  	end:{
	   		url: data.endIcon,
	    	size: new google.maps.Size(71, 71),
	    	origin: new google.maps.Point(0, 0),
	    	anchor: new google.maps.Point(17, 34),
	    	scaledSize: new google.maps.Size(35, 35)
	  	}
	 };
	directionsService.route(DIRECTIONS_SETTINGS, function(response, status) {
  	if (status === 'OK') {
   		directionsDisplay.setDirections(response);
   		data.estTravel = response.routes[0].legs[0].duration.text
   		console.log(data.estTravel)
   		$('.js-insert-distance').text(data.estTravel);
        let leg = response.routes[ 0 ].legs[ 0 ];
        makeStartMarker( leg.start_location, icons.start, "start" );
        makeEndMarker( leg.end_location, icons.end, 'end');
  	} else {
    	window.alert('Directions request failed due to ' + status);
  	}
	});
}

function fillStars(rating){
	const starTotal = 5;
	
	$('.stars-inner').each(star => {
		if(rating>1){
			rating-=1;
			$(`.stars-inner[data-index="${star}"`).css('width','100%')
		} else if (rating>0){
			let fill = (Math.round(rating*100))+'%'
			$(`.stars-inner[data-index="${star}"`).css('width',`${fill}`)
		}
	});
}

function fillDollars(usdCount){
	console.log('made it here');
	for(i=0;i<usdCount;i++){
		$('.js-insert-dollars').append('<li class="ven-usd"><i class="fas fa-dollar-sign"></i></li>')
	}
}

function renderVenPage(){
	let open_time;
	let close_time;
	DIRECTIONS_SETTINGS.destination.placeId = data.selectedVen.place_id
	$('#loading-page').attr('hidden',true);
	$('#google-results').attr('hidden',false);
	$.fn.fullpage.destroy()
	$('.js-ven-name').text(data.selectedVen.name);
	let review = data.selectedVen.reviews.find(review => {
		return (review.rating >= 4 && review.text.length < 300)
	});
	if(data.selectedVen.opening_hours!=null && data.selectedVen.opening_hours.periods!= null){
		let open_hour = data.selectedVen.opening_hours.periods[data.today.getDay()].open.hours
		let close_hour = data.selectedVen.opening_hours.periods[data.today.getDay()].close.hours
		let open_min = data.selectedVen.opening_hours.periods[data.today.getDay()].open.minutes
		if(open_min<10){
			open_min = ("0" + open_min).slice(-2);
		}
		let close_min = data.selectedVen.opening_hours.periods[data.today.getDay()].close.minutes
		if(close_min<10){
			close_min = ("0" + open_min).slice(-2);
		}
		if(open_hour>12){
			open_hour -= 12
			open_time = open_hour.toString() + ':' + open_min.toString()+'pm'
		} else {
			open_time = open_hour.toString() + ':' + open_min.toString()+'am'
		}
		if(close_hour>12){
			close_hour -= 12
			close_time = close_hour.toString() + ':' + close_min.toString()+'pm'
		} else if (close_hour === 0){
			close_time = '12:' + close_min.toString()+'am'
		} else {
			close_time = close_hour.toString() + ':' + close_min.toString()+'am'
		}
		$('.js-ven-hours').text(`${open_time} - ${close_time}`)
	} else {
		$('.js-ven-hours').text('Unknown')
	}
	fillStars(data.selectedVen.rating)
	fillDollars(data.venLibrary[data.libraryKey].pricing)
	$('.js-ven-phone').text(data.selectedVen.formatted_phone_number)
	$('.js-ven-rev').text(review.text)
	initMap()
}

function endLoading(){
	$('.check-box .check').addClass('animated')
	$('#loading-page').fadeOut(2000,()=>{
		renderVenPage()
	});
}

function storeVenueData(venue){
	data.selectedVen = venue;
	let photos = venue.photos
	photos.forEach(photo =>{
		let _url = photo.getUrl({'maxWidth': 300})
		data.photos.push(`<img class="photo" src="${_url}">`)
	})
	let slots = $('.photo-slot');
	slots.each(i => {
		$(slots[i]).html(data.photos[i])
	});
	endLoading()

}

function filterGoogleReviews(response, status){
	if(status == google.maps.places.PlacesServiceStatus.OK){
		let reviews = response.reviews;
		if(reviews != null){
			reviews.forEach(review => {
				data.searchKeywords[REC_SETTINGS.query].forEach(sTerm => {
					if ( review.text.toLowerCase().indexOf(sTerm) >=0 ){
						data.searchAgain = false;
					}
				});
			});
		} else {
			renderTryAgain()
		}
		if (data.searchAgain===false){
			storeVenueData(response)
		} else {
			if ((data.nextVen + 1 < data.venues.length)){
				prepareSearch()
			} else {
				renderTryAgain()
			}
		}
	}
}

function googleDetails(response){
	let request = {
	  placeId: response.results[0].place_id
	};
	service = new google.maps.places.PlacesService($('#map').get(0));
	service.getDetails(request, filterGoogleReviews);
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
	if(data.venues[data.nextVen] != null){
		data.libraryKey = Object.keys(data.venues[data.nextVen])[0]
		let venueToSearch = data.venLibrary[data.libraryKey];
		googleSearch(venueToSearch);
	} else {
		renderTryAgain()
	}
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
		data.venLibrary[ven_ID].pricing = venue.venue.price.tier;
		data.venLibrary[ven_ID].distance = venue.venue.location.distance;
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

function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor(type) {
	  let c;
	  if(type == "bright") {
	    c = randomNumber(130, 255);
	  } else {
	    c = randomNumber(110, 190);
	  }
	  return "rgb(" + c + "," + c + "," + c + ")";
	}

function startDisco(){
	let t = 1;
	let radius = 50;
	let squareSize = 6.5;
	let prec = 19.55;
	let fuzzy = 0.001;
	let inc = (Math.PI-fuzzy)/prec;
	let discoBall = document.getElementById("discoBall");

	for(let t=fuzzy; t<Math.PI; t+=inc) {
	  	let z = radius * Math.cos(t);
	  	let currentRadius = Math.abs((radius * Math.cos(0) * Math.sin(t)) - (radius * Math.cos(Math.PI) * Math.sin(t))) / 2.5;
	  	let circumference = Math.abs(2 * Math.PI * currentRadius);
	  	let squaresThatFit = Math.floor(circumference / squareSize);
	  	let angleInc = (Math.PI*2-fuzzy) / squaresThatFit;
	  	for(let i=angleInc/2+fuzzy; i<(Math.PI*2); i+=angleInc) {
	    	let square = document.createElement("div");
	    	let squareTile = document.createElement("div");
	    	squareTile.style.width = squareSize + "px";
	    	squareTile.style.height = squareSize + "px";
	    	squareTile.style.transformOrigin = "0 0 0";
	    	squareTile.style.webkitTransformOrigin = "0 0 0";
	    	squareTile.style.webkitTransform = "rotate(" + i + "rad) rotateY(" + t + "rad)";
	    	squareTile.style.transform = "rotate(" + i + "rad) rotateY(" + t + "rad)";
	    	if((t>1.3 && t<1.9) || (t<-1.3 && t>-1.9)) {
	     		 squareTile.style.backgroundColor = randomColor("bright");
	    	} else {
	      		squareTile.style.backgroundColor = randomColor("any");
	    	}
	    	square.appendChild(squareTile);
	    	square.className = "square";
	    	squareTile.style.webkitAnimation = "reflect 2s linear infinite";
	    	squareTile.style.webkitAnimationDelay = String(randomNumber(0,20)/10) + "s";
	    	squareTile.style.animation = "reflect 2s linear infinite";
	    	squareTile.style.animationDelay = String(randomNumber(0,20)/10) + "s";
	    	squareTile.style.backfaceVisibility = "hidden";
	    	let x = radius * Math.cos(i) * Math.sin(t);
	    	let y = radius * Math.sin(i) * Math.sin(t);
	    	square.style.webkitTransform = "translateX(" + Math.ceil(x) + "px) translateY(" + y + "px) translateZ(" + z + "px)";
	    	square.style.transform = "translateX(" + x + "px) translateY(" + y + "px) translateZ(" + z + "px)";
	    	discoBall.appendChild(square);
	  	}
	}
}

function loading(){
	$('#fullpage').attr('hidden',true);
	$('#nav-menu').attr('hidden',true);
	$('#loading-page').attr('hidden',false);
	startDisco()
}

function getRecs(response){
	const payload = {
		url:'https://api.foursquare.com/v2/venues/explore',
		dataType:'json',
		data:REC_SETTINGS,
		beforeSend:loading,
		error:function(error){
			console.log(error);
		},
		success: rankResults,
	}
	$.ajax(payload)
}

function grabLocation(response){
	REC_SETTINGS.ll = [response.location.lat,response.location.lng].join()
	DIRECTIONS_SETTINGS.origin = [response.location.lat,response.location.lng].join()
	data.userLat = response.location.lat
	data.userLng = response.location.lng
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
	toggleDisplay(['#loading-page','#try-again']);
	$('#tryAgain').click(function(){
		toggleDisplay(['#fullpage','#try-again'])
		window.location.href = "file:///Users/WiseYale/Desktop/thinkful/capstones/api-capstone/project/preferences/app.html";
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

function renderPreferences(){
	$('.fade-in').fadeIn('fast', getLocation)
	$('#fullpage').fullpage({
		anchors:['categories','pricing','ratings','range','preferences'],
		menu:'#nav-menu',
		recordHistory:false
	});

	$(".flip").flip({
	    trigger: 'hover'
	});
}

$('.final.next').click(function(e){
	data.prefOrder = $('#sortable').sortable('toArray');
	REC_SETTINGS.price = data.priceArray.join()
	data.minRating = Math.min(data.starSelection);
	getRecs();
});

$('.cat-confirm').click(function(e){
	let query = $(this).data('query')
	let iconPath = $(this).data('path')
	data.endIcon = iconPath
	REC_SETTINGS.query = query
	$('.final.next').attr('disabled',false);
});

$('.travel-methods').on('click','.method', function(e){
	let selectedMethod = $(this).data('method');
	data.startIcon = $(this).attr('src');
	DIRECTIONS_SETTINGS.travelMode = selectedMethod;
	let methods = $('.method-circle')
	methods.each(function(idx){
		$(methods[idx]).removeClass('current');
	});
	$(this).parent().addClass('current')
	$('.js-display-method').text(selectedMethod);
	deleteMarker()
	displayDirections(data.directionsService, data.directionsDisplay)
})

$('#down').click(function(){
  let $flipBook = $('.flip-book');
  let first = $flipBook.children().first();

  $(first).toggleClass('pop');

  setTimeout(function(e) {
  	$(first).toggleClass('pop');
    $flipBook.append(first);
    }, 260);
});

$('#up').click(function(){
  let $flipBook = $('.flip-book');
  let last = $flipBook.children().last()
  let first = $flipBook.children().first();
  $flipBook.prepend(last);
  $(first).toggleClass('pop');
  setTimeout(function(e) {
    $(first).toggleClass('pop');
  }, 150);  
});

$('.refresh').click(function(){
	toggleDisplay(['#fullpage','#google-results'])
	window.location.href = "file:///Users/WiseYale/Desktop/thinkful/capstones/api-capstone/project/preferences/app.html";
});

//styling js functions

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
	data.priceArray = [];
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
				data.priceArray.push(usdGroupRating);
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

$( "#sortable" ).sortable({
	handle:'.handle',
	update:(event,ui)=>{
		let prefOrder = $('#sortable .pref')
		prefOrder.each(function(i){
			$(prefOrder[i]).attr('data-rank',i+1);
		})
		$('#sortable .pref[data-rank="1"] .place').text('1st ')
		$('#sortable .pref[data-rank="2"] .place').text('2nd ')
		$('#sortable .pref[data-rank="3"] .place').text('3rd ')
	}
}).disableSelection();

$(renderPreferences)
  
  

