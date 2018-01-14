var timeRange = {start: null, end: null};
function initCalendar()
{
  var datepick = document.getElementById("datepick");
  flatpickr(datepick, {
    mode:"range",
    minDate: "today",
    dateFormat: "Y-m-d",
    onClose: function(selectedDates)
    {
      var start = selectedDates[0].getTime()/1000;
      var end = selectedDates[1].getTime()/1000;
      timeRange.start = start;
      timeRange.end = end;
    }	
  });
}

function getTimeRange(){
  return timeRange;
}
