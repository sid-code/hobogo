var origin = [];
var destinations = [];

$('#select-city, #select-origin').selectize({
    valueField: 'name',
    labelField: 'name',
    searchField: ['name','code'],
    options: [],
    delimiter: ',',
    render: {
	option: function(item, escape) {
	    return getOption(item, escape);
	},
	item: function(item, escape){
	    return getOption(item, escape);
	}
    },
    onItemAdd: function(value, $item) {
	console.log(value);
	if(getMarkerIndex(value) == -1){
	    addAirport(value);
	}
    },
    onItemRemove: function(value) {
	console.log(value);
	removeAirport(getMarkerIndex(value));
    },
    load: function(query, callback) {
	if (!query.length) return callback();
	$.ajax({
	    url: 'https://cors-anywhere.herokuapp.com/https://api.skypicker.com/locations',
	    type: 'GET',
	    dataType: 'json',
	    data: {
		term: query,
		locale: 'en-US',
		location_types: 'city',
		limit: '10',
	    },
	    error: function() {
		callback();
	    },
	    success: function(res) {
		console.log(res.locations)
		callback(res.locations);
	    }
	});
	$.ajax({
	    url: 'https://cors-anywhere.herokuapp.com/https://api.skypicker.com/locations',
	    type: 'GET',
	    dataType: 'json',
	    data: {
		term: query,
		locale: 'en-US',
		location_types: 'airport',
		limit: '10',
	    },
	    error: function() {
		callback();
	    },
	    success: function(res) {
		callback(res.locations);
	    }
	});
    }
});

function getOption(item, escape){
    return '<div>' +
	'<span class="title">' +
	'<span class="name">' + escape(item.name) + ' (' + escape(item.code) + ')</span>' +
	'</span>' +
	'</div>';
}
