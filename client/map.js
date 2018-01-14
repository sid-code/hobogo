var map;
var service;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.819, lng: -100.781},
    zoom: 4
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

var flightPath;
function drawRoute(airportCodeList){
  if(flightPath){
    flightPath.setMap(null);
  }
  var flightPlanCoordinates = [];
  var done = 0;
  for(i = 0;i < airportCodeList.length;i++){
    var request = { 
      query: airportCodeList[i],
      type: 'airport'
    };
    service.textSearch(request, function(results, status){
      done++;
      if (status == google.maps.places.PlacesServiceStatus.OK) {
	var latt = results[0].geometry.location.lat();
	var lngg = results[0].geometry.location.lng();
	flightPlanCoordinates.push({lat: latt, lng:lngg});
      }

      if (done == airportCodeList.length) {
	flightPlanCoordinates.push(flightPlanCoordinates[0]);
	console.log(flightPlanCoordinates);

	flightPath = new google.maps.Polyline({
	  path: flightPlanCoordinates,
	  geodesic: true,
	  strokeColor: '#33BBCC',
	  strokeOpacity: 1.0,
	  strokeWeight: 2
	});
	flightPath.setMap(map);
      }
    });
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
