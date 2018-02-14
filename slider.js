$(function(){
	let slider = document.getElementById("rangeFilter");
	let output = document.getElementById("rangeValue");
	output.innerHTML = slider.value; // Display the default slider value

	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
	    output.innerHTML = this.value;
	}

	$( "#sortable" ).sortable();
	$( "#sortable" ).disableSelection();
});
