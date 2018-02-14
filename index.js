const data = {
	API_KEY:'AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU'
}

const REC_SETTINGS = {
		ll:'',
		radius:500,
		section:'drinks',
		query:'cocktails',
		venuePhotos:1,
		openNow:1,
		price:'2,3',
		client_id:'MDDIFKZ5GFSAGZHAOFYPNQRATOT13FY2OYFUY1JDF5UNUZBA',
		client_secret:'2ZUIA2A15LIKRSBGM3EN5BCCOX0YICNBJETKSRKOHDCQFSTT',
		v:'20180210'
	}

function filterResults(response){
	console.log(response);
}

function getRecs(response){
	REC_SETTINGS.ll = [response.location.lat,response.location.lng].join()
	console.log(REC_SETTINGS.ll);
	$('.js-location').html(REC_SETTINGS.ll);
	const payload = {
		url:'https://api.foursquare.com/v2/venues/explore',
		dataType:'json',
		data:REC_SETTINGS,
		success: filterResults
	}
	$.ajax(payload)
}

function getLocation(){
	const payload = {
		url:'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBiIzpZm4vKrXS_XCBPDOa6HL_4cFq1RWU',
		method:'POST',
		dataType:'json',
		success:getRecs
	}
	$.post(payload)
}


$('#start').click(function(){
	getLocation();
});