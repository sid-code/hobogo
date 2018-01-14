var map;
var service;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.866, lng: 151.196},
    zoom: 15
  });
  service = new google.maps.places.PlacesService(map);
}

function addAirport(airportCode) {
  var request = {
    query: airportCode,
    type: 'airport'
  };
  service.textSearch(request, function(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMarkers(results[0], airportCode);   
    }
  });
}

function removeAirport(airportCode) {
  for(i = 0;i < markers.length;i++){
    if(markers[i].code == airportCode){
      var dead = markers.splice(i, 1);
      console.log(dead);
      dead[0].setMap(null);
      dead[0] = null;
    }
  }
}

function getPlace(airportCode) {
  var request = {
    query: airportCode,
    type: 'airport'
  };
  service.textSearch(request, searchCallback);
}

var bounds = null;
function createMarkers(place, airportCode){
  if (bounds == null) {
    bounds = new google.maps.LatLngBounds();
  }

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
    position: place.geometry.location,
    code: airportCode
  });
  console.log(marker);

  markers.push(marker);
  bounds.extend(place.geometry.location);
  map.fitBounds(bounds);
}
