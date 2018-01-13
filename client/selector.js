var origin = [];
var destinations = [];

var url = 'https://cors-anywhere.herokuapp.com/https://api.skypicker.com/locations';

function doit(sel, maxItems) {
  $(sel).selectize({
    valueField: 'name',
    maxItems: maxItems,
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
        url: url,
        type: 'GET',
        dataType: 'json',
        data: {
          term: query,
          locale: 'en-US',
          location_types: 'city',
          limit: '100',
        },
        error: function() {
          callback();
        },
        success: function(res) {
          console.log(res.locations);
          callback(res.locations);
        }
      });
      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        data: {
          term: query,
          locale: 'en-US',
          location_types: 'airport',
          limit: '100',
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
}

doit("#select-city");
doit("#select-origin", 1);

function getOption(item, escape){
  return '<div>' +
    '<span class="title">' +
    '<span class="name">' + escape(item.name) + ' (' + escape(item.code) + ')</span>' +
    '</span>' +
    '</div>';
}
