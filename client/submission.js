function getSearchConfig() {
  var data = {};
  data.homeLoc = getOriginCode();
  data.timeRange = getTimeRange();
  data.maxStay = parseInt(document.getElementById("maxStay").value);
  data.minStay = parseInt(document.getElementById("minStay").value);
  data.maxPrice = parseInt(document.getElementById("maxPrice").value);
  data.minLength = parseInt(document.getElementById("minLength").value);
  data.destList = getDestinationCodes();

  return data;
}
