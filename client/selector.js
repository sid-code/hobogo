var originCode = [];
var destinationCodes = [];

var options = {
  shouldSort: true,
  threshold: 0,
  location: 0,
  distance: 100,
  maxPatternLength: 1024,
  minMatchCharLength: 1,
  keys: [
    "iata",
    "name",
    "city"
  ]
};
var fuse = new Fuse(list, options); // "list" is the item array

function doit(sel, origin) {
  $(sel).selectize({
    valueField: 'name',
    //maxItems: maxItems,
    labelField: 'name',
    searchField: ['name','iata', 'city'],
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
      codeAddRem(value, origin);
      if(getMarkerIndex(value) == -1){
	addAirport(value);
      }
    },
    onItemRemove: function(value) {
      codeAddRem(value, origin);
      removeAirport(getMarkerIndex(value));
    },
    load: function(query, callback) {
      if (!query.length) return callback();
      callback(fuse.search(query))
    }
  });
}

doit("#select-city");
doit("#select-origin", origin);

function getOption(item, escape){
  return '<div>' +
    '<span class="title">' +
    '<span class="name">' + escape(item.name) + ' (' + escape(item.iata) + ')</span>' +
    '</span>' +
    '</div>';
}

//Accepts search value, finds airport code and properly updates originCode/destinationCodes
function codeAddRem(value, origin){
  console.log(value);
  console.log(fuse.search(value));
  var code = fuse.search(value)[0].iata; //This should avoided
  if(origin){
    //Set origin
    originCode = code;
  } else {
    //Do destination add to destCodes
    destinationCodeAddRem(code);
  }
}

//I know this is dumb but no time kms
function destinationCodeAddRem(code){
  var index = -1;
  for(i = 0;i < destinationCodes.length;i++){
    if(destinationCodes[i] == code){
      index = i;
    }
  }
  if(index > -1){
    //Already in array, therefore remove because no duplicates
    destinationCodes.splice(index, 1);
  } else {
    //Not found so add to array
    destinationCodes.push(code);
  }
  console.log("destinationCodes");
  console.log(code);
  console.log(destinationCodes);
}

function getOriginCode(){
  return originCode;
}
function getDestinationCodes(){
  return destinationCodes;
}
