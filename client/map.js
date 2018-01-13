var map;
var service;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
	center: {lat: -33.866, lng: 151.196},
	zoom: 15
    });
    service = new google.maps.places.PlacesService(map);
    addAirport('fco');
}

function addAirport(airportCode) {
    var request = {
	query: airportCode,
	type: 'airport'
    };
    service.textSearch(request, searchCallback);
}

function searchCallback(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK) {
	//Assume first result, using airport code + type airport should work lol
	console.log(results[0].geometry);
	createMarkers(results[0]);
    }
}

function createMarkers(place){
    var bounds = new google.maps.LatLngBounds();
    var placesList = document.getElementById('places');

    var image = {
	url: place.icon,
	size: new google.maps.Size(71, 71),
	origin: new google.maps.Point(0, 0),
	anchor: new google.maps.Point(17, 34),
	scaledSize: new google.maps.Size(25, 25)
    };

    var marker = new google.maps.Marker({
	map: map,
	icon: image,
	title: place.name,
	position: place.geometry.location
    });

    bounds.extend(place.geometry.location);
    map.fitBounds(bounds);
    map.setZoom(10);
}
