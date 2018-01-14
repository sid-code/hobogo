var data = {
  homeLoc: null,
  timeRange: {start: null, end: null},
  maxStay: null,
  minStay: null,
  maxPrice:null,
  minLength:null,
  destList: null
};

function submit() {
  data.homeLoc = getOriginCode();
  data.timeRange = getTimeRange();
  data.maxStay = parseInt(document.getElementById("maxStay").value);
  data.minStay = parseInt(document.getElementById("minStay").value);
  data.maxPrice = parseInt(document.getElementById("maxPrice").value);
  data.minLength = parseInt(document.getElementById("minLength").value);
  data.destList = getDestinationCodes();
  console.log(data);
  console.log(JSON.stringify(data));
}
