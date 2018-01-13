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
			console.log(start);
			console.log(end);	
		}	
	});
}
