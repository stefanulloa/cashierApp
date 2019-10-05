

var User={

	username: "",
	events:[],
	contacts: [],
	friendCount: 0,


}


var Client = {

  user: User,

  address: "ws://SENSIBLE_INFORMATION/",

  ws: null,

  ShowChat: null,

  init: function(){

            if ("WebSocket" in window)
            {
               console.log("WebSocket is supported by your Browser!");

               // Let us open a web socket
               this.ws = new WebSocket("ws://SENSIBLE_INFORMATION/");
			   var ws = this.ws;
			   ws.onopen = this.onOpen.bind(this);
			   ws.onmessage = this.onMessage.bind(this);
			   ws.onclose = this.onClose.bind(this);
			   this.onOpen();

            }

            else
            {
               // The browser doesn't support WebSocket
               console.log("WebSocket NOT supported by your Browser!");
            }
         },


		 onOpen: function(){




		 		 that = this

				 this.ws.onopen = function(){
                  // Web Socket is connected, send data using send()
           		 console.log("im connected")

           		 if(localStorage.getItem("username")){
           		  var data_json = {
	              type: "Session",
	              username: localStorage.getItem("username"),
	              password: localStorage.getItem("password"),

	              };

	              this.send( JSON.stringify( data_json ));
	          	}

				}
         },

		 onMessage: function (){

		 	that = this

			this.ws.onmessage = function (evt){

    			var data = JSON.parse(evt.data);

				if(data.type==="login"){

					 alert(data.content);

					 document.getElementById("index").style.visibility="hidden";
					 document.getElementById("main").style.visibility="visible";

					 localStorage.setItem("username", data.obj.username);
					 localStorage.setItem("password", data.obj.password);


					 for (var key in data.obj){

					 	if (data.obj.hasOwnProperty(key) && key.startsWith("myEvent")) {

        						that.user.events.push([key,data.obj[key]])

   							 }

   						if (data.obj.hasOwnProperty(key) && key.startsWith("myFriend")) {

        						that.user.contacts.push([key,data.obj[key]])

   							 }

					 }


					 that.user.username=data.obj.username;

					 APP.loadEvents(that.user.events);

					 APP.loadFriends(that.user.contacts);

					 APP.loadEventDetail(that.user.events);

					 that.loadParticipants();

					 that.loadOwners();

					 APP.loadBreakdowns();



					 APP.loadCharts(that.user.events);

				}


				else if (data.type==="login_fail"){

					 alert(data.content);

				}


				else if (data.type==="login_error"){


					 alert(data.content);

				}


				else if (data.type==="singup_ok"){

					 alert(data.content);

					document.getElementById("new_username").value="";
					document.getElementById("new_password").value="";
					document.getElementById("new_email").value="";


				}


				else if (data.type==="local_checked"){



					 for (var key in data.obj){

					 	if (data.obj.hasOwnProperty(key) && key.startsWith("myEvent")) {


        						that.user.events.push([key,data.obj[key]])

   							 }

   						if (data.obj.hasOwnProperty(key) && key.startsWith("myFriend")) {

        						that.user.contacts.push([key,data.obj[key]])

   							 }

					 }

					 document.getElementById("index").style.visibility="hidden";
					 document.getElementById("main").style.visibility="visible";

					  that.user.username=data.obj.username;

					  APP.loadEvents(that.user.events);

					  APP.loadEventDetail(that.user.events);

					  APP.loadFriends(that.user.contacts);

					  that.loadParticipants();

					  that.loadOwners();

					  APP.loadBreakdowns();

					  APP.loadCharts(that.user.events);

				}


				else if (data.type==="event_ok"){
					console.log(data);
					that.user.events.push([data.content,data.eventName,data.creator]);


					var template = document.getElementById("eventscreen");
					var elem = template.cloneNode(true);
					elem.id=data.eventName;
					elem.children[2].children[0].children[0].children[0].id=data.eventName +"input";
					elem.children[2].children[0].children[0].children[1].id=data.eventName +"button1";
					elem.children[2].children[0].children[1]=data.eventName +"participants";
					document.body.appendChild(elem);


				}

				else if (data.type==="add_friend_not_ok"){


					alert(data.content);

				}

				else if (data.type==="friend_found"){

					that.user.contacts.push([data.friendCount,data.friendName]);
					that.user.friendCount = data.friendCount;
					APP.newFriend(data.friendName);

				}

				else if (data.type==="add_participant_event_not_ok"){

					alert(data.content);

				}

				else if (data.type==="added_participant_event_ok"){


					APP.appendNewParticipants(data);

				}

				else if (data.type==="load_participant_event_not_ok"){


					for (var key in that.user.events){

						if(data.event===that.user.events[key][0])
								console.log(that.user.events)
								that.user.events.splice(key,1)
								console.log(that.user.events)

					}

					alert(data.content);

				}

				else if (data.type==="load_participant_event_ok"){


					for (var key in data.obj){

					 	if ( key.startsWith("userID")) {

        						APP.loadParticipants(data.obj.eventName,data.obj[key])

   							 }

					 }

				}

				else if (data.type==="load_owner_event_not_ok"){

					alert(data.content);

				}

				else if (data.type==="load_owner_event_ok"){


					for (var key in Client.user.events){

						if (Client.user.events[key][1] === data.obj.eventName){

							that.user.events[key].splice(2,0,data.obj.userID1)


								   	 if(Client.user.username == Client.user.events[key][2]){


								   	 	   elem=document.getElementById(Client.user.events[key][1]);

								   	 	   elem.children[4].style.visibility="visible";

								   	 }


						}

					}

				}


				else if (data.type==="new_breakdowncount"){


					var template = document.getElementById(data.event+"breakdowns");
					var elem = template.children[0].cloneNode(true);

					template2 = document.getElementById("newbreakdowndescription");
		 			var breakdowndescription = template2.cloneNode(true);


		 			elem.id=data.event+data.newBreakdownCount;

		 			var desire =data.desire.replace("breakdownDesire_"+data.newBreakdownCount+"_","")
		 			var price = data.price.replace("breakdownPrice_"+data.newBreakdownCount+"_","")
		 			var description =data.description.replace("breakdownDescription_"+data.newBreakdownCount+"_","")

					elem.children[0].innerHTML=desire;
					elem.children[1].innerHTML=price+"$";

					elem.dataset.toggle = "modal";
		 			elem.dataset.target = "#"+data.event+"newbreakdowndescription"+data.newBreakdownCount;

		 			breakdowndescription.id=data.event+"newbreakdowndescription"+data.newBreakdownCount;



		 			breakdowndescription.children[0].children[0].children[1].children[0].innerHTML=price+"$";
		 			breakdowndescription.children[0].children[0].children[1].children[0].style.textalign="center";

					breakdowndescription.children[0].children[0].children[1].children[1].innerHTML=description;
					breakdowndescription.children[0].children[0].children[1].children[1].style.textalign="center";

					document.body.appendChild(breakdowndescription);
					template.appendChild(elem);

					info=[desire,price,"",data.event]
					APP.loadCharts(info);



				}

				else if (data.type==="load_allbreakdowns_ok"){


					for (var key in Client.user.events){

						if (data.obj.eventName=== Client.user.events[key][1]){

							Client.user.events[key].push(data.obj.breakdowncount)



						}

					}




					for (var key in data.obj){


						eachBreakdown = []
						desire = []
						var num = 0


					 	if (key.startsWith("breakdownDesire_")) {

        						desire = key.split("_")
        						num = desire[1]
        						eachBreakdown[0]=desire[2]



        						for (var key2 in data.obj){

        							if (key2.startsWith("breakdownPrice_"+num)) {

        							price = key2.split("_")
        							eachBreakdown[1]=price[2]


        									for (var key3 in data.obj){

					        							if (key3.startsWith("breakdownDescription_"+num)) {

					        							description = key3.split("_")
					        							eachBreakdown[2]=description[2]


					        								eachBreakdown[3] = data.obj.eventName;
					        								eachBreakdown[4] = num;
					        							 	APP.appendBreakdowns(eachBreakdown);

																APP.loadCharts(eachBreakdown)


					   									 }

        										}


   									 }

        						}


   							 }



					 }




				}


				/*
                 var received_msg = evt.data;
					console.log(received_msg)

				 if(that.ShowChat){

					 that.ShowChat(received_msg);
				 }*/

               }

		},


        onClose: function(){

				this.ws.onclose = function()
				{
                  // websocket is closed.
                  alert("Connection is closed...");

				}

		},

        onReunload: function (){

				window.onbeforeunload = function(event) {

                  socket.close();
               };

		},

		loadParticipants: function(e){



			eventID = ""

			for (var key in Client.user.events){


				eventID = Client.user.events[key][0];

					var data_json = {

				        	 type: 'update',
				             content: "loadParticipants",
				             event: eventID,

						};

				    Client.ws.send( JSON.stringify( data_json ));



			}

		},

		loadOwners: function(){


			for (var key in Client.user.events){


				eventID = Client.user.events[key][0];

					var data_json = {

				        	 type: 'update',
				             content: "loadOwners",
				             event: eventID,

						};

				    Client.ws.send( JSON.stringify( data_json ));



			}


		},





};
