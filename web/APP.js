	getRandomColor=function() {
	  var letters = '0123456789ABCDEF';
	  var color = '#';
	  for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}

   	myChart = {
			labels: [],
			datasets: []

		};


	dataset = {
			label: "",
			backgroundColor: getRandomColor(),
			data: [],

	}

	charts=[];

	pepe = []

var APP = {

	init: function()
	{
		//Chat.init();
		Client.init();
		
		/*
		Client.ShowChat= function (e){
			
			Chat.ShowMsg(e);
			
		}
	
		Chat.sendServer = function (e){
			
			Client.ws.send(e);
			
		}
		
		*/
		
	},

	login: function(){

		username = document.getElementById("username").value;
		password = document.getElementById("password").value;


		if(username==="" || password==="" ){

			alert("empty fields")
		  
   		}

   		else{
		var data_json = {
		type: "login",
		username: username,
		password: password,
		};
	
		Client.ws.send(	JSON.stringify( data_json ));
		}


		document.getElementById("username").value="";
		document.getElementById("password").value="";


	},


	signup: function(){

		username = document.getElementById("new_username").value;
		password = document.getElementById("new_password").value;
		email = document.getElementById("new_email").value;

 
		if(username==="" || password==="" || email==="" )
			alert("empty fields")


		else {
		var data_json = {

		type: "signup",
		username: username,
		password: password,
		email: email,

		};
	
		Client.ws.send(	JSON.stringify( data_json ));
		}

	},


	newEvent:function() {

		var template = document.querySelector("#eventTemplates .events");
		var elem = template.cloneNode(true);
		var eventName = document.querySelector("#inputNewEventID");
		eventName.value = eventName.value.split(" ").join("_");
		elem.querySelector(".eventUsername").innerText = eventName.value;

		if (eventName.value == ""){

			alert("Empty field")
			return;

		}

		var root = document.querySelector("#eventsGroup");
		root.prepend(elem);

		var data_json = {

		type: "update",
		content: "newEvent",
		name: eventName.value,
		creator: Client.user.username,
		
		};

		Client.ws.send(	JSON.stringify( data_json ))


		document.querySelector("#inputNewEventID").value = '';

		location.reload();


	},

	loadEvents:function(events){


		for (var event in events){


		var template = document.querySelector("#eventTemplates .events");
		var elem = template.cloneNode(true);

		var eventName = events[event][1]
		elem.querySelector(".eventUsername").innerText = eventName;
		var root = document.querySelector("#eventsGroup");

		root.appendChild(elem);

		}




	},

	
	logout: function (event){


 	localStorage.setItem("username", "");
	localStorage.setItem("password", "");

	Client.ws.close();
	location.reload();


	},

	addFriend: function (event){

		newFriend = document.querySelector("#new_friend").value;



		for (var key in Client.user.contacts){

			if(newFriend===Client.user.contacts[key][1]){

				alert("Friend already added");

				return;
			}

		}



		if (newFriend===Client.user.username)

			alert("find a real friend");

		else if(newFriend==""){


			alert("empty field");

		}

	

		else{

		var data_json = {

		type: "update",
		content: "addFriend",
		friend: newFriend,
		creator: Client.user.username,
		friendCount: Client.user.friendCount,
		
		};

		Client.ws.send(	JSON.stringify( data_json ))


		document.querySelector("#new_friend").value = '';

		}

	},


	newFriend: function (friend_name){


		var template = document.querySelector("#friendTemplates .friends");
		var elem = template.cloneNode(true);
		
		elem.querySelector(".friendName").innerText = friend_name;
		var root = document.querySelector("#friendsGroup");
		root.prepend(elem);
		

	},

	loadFriends:function(friends){


		for (var friend in friends){

		var template = document.querySelector("#friendTemplates .friends");
		var elem = template.cloneNode(true);

		var friendtName = friends[friend][1]
		elem.querySelector(".friendName").innerText = friendtName;
		var root = document.querySelector("#friendsGroup");

		root.appendChild(elem);


		}

	},

	showEvent:function(e){

		
		event_name= e.children[1].innerHTML
		document.getElementById("mainscreen").style.display="none";
		document.getElementById(event_name).style.display="block";
		document.getElementById(event_name).children[0].innerHTML=event_name;


	},

	goBackToMenu: function(e){

		for(var key in Client.user.events){

			document.getElementById(Client.user.events[key][1]).style.display="none";

		}

		document.getElementById("mainscreen").style.display="block";

	},

	addParticipantToEvent: function(event){


		eventN = ""

		aux= false;

		exist= false;


		newParticipant = document.querySelector("#"+event.id.replace("button1","input")).value;

		for (var key in Client.user.contacts) {

			if ( newParticipant ===Client.user.contacts[key][1])

				exist=true; 			

		}

		for (var key in document.getElementById(event.id.replace("button1","participants")).children) {

			if (document.getElementById(event.id.replace("button1","participants")).children[key].innerHTML===newParticipant)

				
				aux=true; 
			

		}


		if(aux)

			alert("user already in event")

		else if (!exist)
			alert("it is not on your friend list")


	 	else if (newParticipant===Client.user.username)

			alert("It is yourself");

		else if (newParticipant==""){

			alert("Empty field");

		}

		else{


		e = document.querySelector("#"+event.id.replace("button1",""));

		for (var key in Client.user.events){

			if(e.children[0].innerHTML===Client.user.events[key][1]){

				eventN = Client.user.events[key][0];

			}

		}

		var data_json = {

			type: "update",
			content: "addParticipant",
			participant: newParticipant,
			event: eventN,
		
		};


		Client.ws.send(	JSON.stringify( data_json ))


		document.querySelector("#"+event.id.replace("button1","input")).value = "";

		}



	},

	appendNewParticipants: function(data){


		newParticipant = document.createElement("div")
		newParticipant.style.size="15px";
		newParticipant.innerHTML = data.content;

		

		var root = document.querySelector("#"+data.event+"participants");
		root.appendChild(newParticipant);
		

	},

	loadParticipants: function(eventname,userName){

		

		var root = document.querySelector("#"+eventname+"participants");

		newParticipant = document.createElement("div");
		newParticipant.innerHTML = userName;

	
		root.appendChild(newParticipant);

	},

	loadEventDetail: function(events){

		for (var key in events){


		var template = document.getElementById("eventscreen");
						
		var elem = template.cloneNode(true);

	
						
		 elem.id=events[key][1];
		 elem.children[5].children[0].id=events[key][1]+"canvasbar"
		 elem.children[2].children[0].children[0].children[0].id=events[key][1]+"input";
		 elem.children[2].children[0].children[0].children[1].id=events[key][1] +"button1";
		 elem.children[2].children[0].children[1].id=events[key][1]+"participants";
		

		 template2 = document.getElementById("newbreakdown");
		 
		 var breakdown = template2.cloneNode(true);

		 
		 breakdown.id=events[key][1]+"newbreakdown";
	  
	   	 elem.children[4].dataset.target = "#"+events[key][1]+"newbreakdown";

	   	 elem.children[3].id=events[key][1]+"breakdowns"
	
	   	 elem.children[4].id= events[key][1]+"addbreakdown";
	   		 
	   	 breakdown.children[0].children[0].children[1].children[2].id=events[key][1]+"desire";
	   		 
	   	 breakdown.children[0].children[0].children[1].children[6].id=events[key][1]+"price";
	   		 
	   	 breakdown.children[0].children[0].children[1].children[9].id=events[key][1]+"description";

	  	 breakdown.children[0].children[0].children[2].children[1].id=events[key][1] +"button2"

	   	 
	   	 document.body.appendChild(breakdown);
	   	 
	   	 document.body.appendChild(elem);

	  
	   	 
		}

	},


	newBreakdown:function(button){

		eventname= button.id.replace("button2","");

		desire=document.getElementById(eventname+"desire").value;

		price=document.getElementById(eventname+"price").value;

		description=document.getElementById(eventname+"description").value;


		var eventID="";

		for (var key in Client.user.events){

			if(Client.user.events[key][1]===eventname)

				eventID = Client.user.events[key][0]

		}


		var data_json = {

			type: "update",
			content: "newBreakdown",
			event: eventID,
			desire: desire,
			price: price,
			description: description,
		
		};

		Client.ws.send(	JSON.stringify( data_json ))





	},


	
	loadCharts:function(events){

		
		if(events.length>3){


				eventname= events[3]

				if (!charts[eventname]){
					barChartData=JSON.parse( JSON.stringify(myChart) )

				}
				else {
					var barChartData=charts[eventname];

				}


				barChartData.labels.push(events[0])

				var aux;
				//aux.label= events[0];
				if (barChartData.datasets.length ==0) {

					aux= JSON.parse( JSON.stringify(dataset)); 
					aux.data.label=events[0]
					aux.data.push(events[1])
					barChartData.datasets.push(aux);

				}
					

				else{ 
					
		
					for (var key in barChartData.datasets)

						barChartData.datasets[key].data.push(events[1])

				}
				
				
			
				charts[eventname]=JSON.parse( JSON.stringify(barChartData))


						var ctx = document.getElementById( eventname+'canvasbar').getContext('2d');

						ctx.canvas.width=100;
						ctx.canvas.height=50;
						Chart.defaults.global.defaultSize = 10;

						window.myBar = new Chart(ctx, {
								type: 'bar',
								data: barChartData,
								options: {
									title: {
										display: true,
									
									},
									tooltips: {
										mode: 'index',
										intersect: false,
										
									},
									responsive: true,
									scales: {
										xAxes: [{

											stacked: true,
										}],
											yAxes: [{
												ticks: {
					                        beginAtZero:true,
					                        min: 0,
					                          
					                    },
											stacked: true
										}]
									}
								}
						});

			}

			
	
},

	loadBreakdowns: function(e){



			eventID = ""

			for (var key in Client.user.events){


				eventID = Client.user.events[key][0];

					var data_json = {
	        
				        	 type: 'update',
				             content: "loadBreakdowns",
				             event: eventID,

						};

				    Client.ws.send( JSON.stringify( data_json ));

			

			}   

		},

		appendBreakdowns: function(eachBreakdown){

		

					var template = document.getElementById(eachBreakdown[3]+"breakdowns");
					var elem = template.children[0].cloneNode(true);

					template2 = document.getElementById("newbreakdowndescription");
		 			var breakdowndescription = template2.cloneNode(true);

		 		
	
		 			elem.id=eachBreakdown[3]+eachBreakdown[4];
		 			console.log()

		 			var desire = eachBreakdown[0]
		 			var price = eachBreakdown[1]
		 			var description = eachBreakdown[2]
		 		
					elem.children[0].innerHTML=desire;
					elem.children[1].innerHTML=price+"$";

					elem.dataset.toggle = "modal";
		 			elem.dataset.target = "#"+eachBreakdown[3]+"newbreakdowndescription"+eachBreakdown[4];

		 			breakdowndescription.id=eachBreakdown[3]+"newbreakdowndescription"+eachBreakdown[4];

		 			

		 			breakdowndescription.children[0].children[0].children[1].children[0].innerHTML=price+"$";
		 			breakdowndescription.children[0].children[0].children[1].children[0].style.textalign="center";

					breakdowndescription.children[0].children[0].children[1].children[1].innerHTML=description;
					breakdowndescription.children[0].children[0].children[1].children[1].style.textalign="center";
				
					document.body.appendChild(breakdowndescription);
					template.appendChild(elem);
			
					
			
		},
		

	
};
