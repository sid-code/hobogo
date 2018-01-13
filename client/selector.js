$('#select-beast').selectize({
    create: false,
    sortField: 'text'
});

$('#select-city').selectize({
    valueField: 'title',
    labelField: 'title',
    searchField: 'title',
    options: [],
    create: false,
    render: {
	option: function(item, escape) {
	    var actors = [];
	    for (var i = 0, n = item.abridged_cast.length; i < n; i++) {
		actors.push('<span>' + escape(item.abridged_cast[i].name) + '</span>');
	    }

	    return '<div>' +
		'<img src="' + escape(item.posters.thumbnail) + '" alt="">' +
		'<span class="title">' +
		'<span class="name">' + escape(item.title) + '</span>' +
		'</span>' +
		'<span class="description">' + escape(item.synopsis || 'No synopsis available at this time.') + '</span>' +
		'<span class="actors">' + (actors.length ? 'Starring ' + actors.join(', ') : 'Actors unavailable') + '</span>' +
		'</div>';
	}
    },
    load: function(query, callback) {
	if (!query.length) return callback();
	$.ajax({
	    url: 'https://api.skypicker.com/locations',
	    type: 'GET',
	    dataType: 'jsonp',
	    data: {
		term: query,
		locale: 'en-US',
		location_types: 'city',
		limit: '10'
	    },
	    error: function() {
		console.log("ERROR");
		//callback();
	    },
	    success: function(res) {
		console.log(res.locations)
		//callback(res.movies);
	    }
	});
    }
});
