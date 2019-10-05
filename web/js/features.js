


var newEvent=document.querySelector("#newEventButton").addEventListener("click",addEvent);

function addEvent(){

	var divElement = document.createElement("a");
	divElement.href = "#"
	divElement.className = "list-group-item active";
	divElement.id = "new"


	divElement.style.color = "#white";

	var text = document.createTextNode("Another paragraph, yay!");
	
	divElement.appendChild(text);

	document.getElementsByClassName("list-group")[0].appendChild(divElement);
}

function expandEvent(){

	var eventSelected = document.ge;
	if (eventSelected.style.display !== "none") {
    	eventSelected.style.display = "none";
	}
	else {
    	eventSelected.style.display = "block";
}

}