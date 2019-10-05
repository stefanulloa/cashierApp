const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
var http = require('http')
var WebSocket = require('ws');
var fs = require('fs');
var crypto = require('crypto');


// Create Redis Client
let redis_client = redis.createClient();

redis_client.on('connect', function(){
  console.log('Connected to Redis...');

});



// Set Port
var port = SENSIBLE_INFORMATION;

const app = express()

app.use(express.static(__dirname + '/public'));

// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json());

app.get('/', function(req, res){
  res.render('form');// if jade
  // You should use one of line depending on type of frontend you are with
  res.sendFile(__dirname + '/form.html'); //if html file is root directory
 res.sendFile("index.html"); //if html file is within public directory
});

// Route that receives a POST request to /sms
app.post('/user/add', function (req, res, next) {
  var usernameDude = req.body.UserName;
  var passwordDude = req.body.Password;
  var emailDude = req.body.Email;
  var htmlData = usernameDude + passwordDude;



    res.redirect('back');
})


app.post('/sign-in', function (req, res, next) {
  var usernameDude = req.body.UserName;
  var passwordDude = req.body.Password;

 redis_client.hgetall(usernameDude, function(err, obj){
    if(!obj){
    res.sendFile("http://SENSIBLE_INFORMATION/index.html");


    } else {
   console.log(obj)
    res.redirect("http://SENSIBLE_INFORMATION/main.html")

    }
  });

})

var eventCount=0

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var clients = [];

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};


wss.on('connection', function connection(ws) {

  console.log("user connected");

  clients.push( ws );

  ws.on('message', function incoming(data) {

    var secret = "SENSIBLE_INFORMATION"

    var data = JSON.parse(data);

    if(data.type==="chat"){
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }

    else if (data.type==="login"){

      var mykey = crypto.createCipher('aes-128-cbc', data.password).update( secret , 'utf8', 'hex');

      redis_client.hgetall(data.username, function(err, obj){

        if(!obj){

          var data_json = {
              type: "login_error",
              content: "useraname does not exist or wrong password",
              };

              ws.send( JSON.stringify( data_json ));


        } else {

          if(mykey==obj.password){

              var data_json = {
              type: "login",
              content: "logged in successfully",
              obj: obj,
              };

              ws.send( JSON.stringify( data_json ));

                  }

            else{

              var data_json = {
              type: "login_fail",
              content: "Wrong password",
              };

              ws.send( JSON.stringify( data_json ));

              }

          }
      });

    }

    else if (data.type==="signup"){

    var mykey = crypto.createCipher('aes-128-cbc', data.password).update( secret , 'utf8', 'hex');

    redis_client.hmset(data.username, [
    'username', data.username,
    'password', mykey,
    'email', data.email,
    'friendCount', 0,

      ], function(err, reply){
      if(err){
        console.log(err);

      }
      console.log(reply);

       var data_json = {
       type: "singup_ok",
       content: "signed up successfully",

        };

        ws.send( JSON.stringify( data_json ));

      });

    }

    else if (data.type==="Session"){

      redis_client.hgetall(data.username,function(err, obj){
        if(!obj){

          console.log("item not found")

        } else {

          if(obj.password===data.password){


             var data_json = {
             type: "local_checked",
             obj: obj,
             };

             ws.send( JSON.stringify( data_json ));
          }
        }
      });

    }

    else if (data.type==="update"){


      if(data.content==="newEvent"){


        eventCount+=1

        var eventID="myEvent"+eventCount.toString();


          redis_client.hmset(eventID, [
          'eventName', data.name,
          'eventID', eventCount,
          'userID1', data.creator,
          'userCount', 1,
          'breakdowncount', 0,
            ], function(err, reply){
            if(err){
              console.log(err);

            }
            console.log(reply);

             var data_json = {
             type: "event_ok",
             content: eventID,
             eventName: data.name,
             creator: data.creator,
              };

              ws.send( JSON.stringify( data_json ));

            });


          redis_client.hmset(data.creator, [

          eventID, data.name,
            ], function(err, reply){
            if(err){
              console.log(err);

            }

            console.log(reply);

            });
      }


      else if(data.content==="addFriend"){

        redis_client.hgetall(data.friend, function(err, obj){
            if(!obj){

                var data_json = {
                type: "add_friend_not_ok",
                content: "Your friend does not exist",

              };

              ws.send( JSON.stringify( data_json ));


            } else {


                data.friendCount += 1;

                var data_json = {
                type: "friend_found",
                friendName: obj.username,
                friendCount: data.friendCount,

                  };


            var myfriendID="myFriend"+data.friendCount.toString();

            redis_client.hmset(data.creator, [

            myfriendID, obj.username,
            'friendCount', data.friendCount,
            ], function(err, reply){
            if(err){
              console.log(err);

            }

            console.log(reply);


            var myfriendID2="myFriend"+obj.friendCount.toString();

            redis_client.hmset(data.friend, [

            myfriendID2, data.creator,
            'friendCount',obj.friendCount+1,
            ], function(err, reply){
            if(err){
              console.log(err);

            }


            console.log(reply);

            });

            });


             ws.send( JSON.stringify( data_json ));

            }

        });

      }

      else if(data.content==="addParticipant"){

        redis_client.hgetall(data.event, function(err, obj){

            if(!obj){

                var data_json = {
                    type: "add_participant_event_not_ok",
                    content: "This event does not exist",
                };

            ws.send( JSON.stringify( data_json ));

            }

            else {


                var data_json = {

                    type: "added_participant_event_ok",
                    content: data.participant,
                    event: obj.eventName,

                };
                countValue = parseInt(obj.userCount);
                obj.userCount=countValue+1;
                var myparticipantID="userID"+obj.userCount.toString();


                redis_client.hmset(data.event, [

                    'userCount', obj.userCount,
                    myparticipantID, data.participant,

                ], function(err, reply){

                    if(err){

                        console.log(err);

                    }

                    console.log(reply);

                    redis_client.hmset(data.participant, [

                        data.event, obj.eventName,

                    ], function(err, reply){

                        if(err){

                            console.log(err);

                        }

                        console.log(reply);

                    });

                });


                ws.send( JSON.stringify( data_json ));

            }

        });



      }



      else if(data.content=="loadParticipants"){


        redis_client.hgetall(data.event, function(err, obj){

            if(!obj){

                var data_json = {
                    type: "load_participant_event_not_ok",
                    content: "Could not recover event",
                    event: data.event,
                };

            ws.send( JSON.stringify( data_json ));

            }

            else{


              var data_json = {
                    type: "load_participant_event_ok",
                    obj: obj,
                };

            ws.send( JSON.stringify( data_json ));

            }



      });

    }



    else if(data.content=="loadOwners"){

        redis_client.hgetall(data.event, function(err, obj){

            if(!obj){

                var data_json = {
                    type: "load_owner_event_not_ok",
                    content: "Could not recover event",
                    event: data.event,
                };

            ws.send( JSON.stringify( data_json ));

            }

            else{


              var data_json = {
                    type: "load_owner_event_ok",
                    obj: obj,
                };

            ws.send( JSON.stringify( data_json ));

            }
      });

    }


    else if(data.content=="newBreakdown"){

           var newBreakdownCount=0;

            redis_client.hgetall(data.event, function(err, obj){

            if(!obj){

              console.log(err);

            }

            else{

              newBreakdownCount= parseInt(obj.breakdowncount);

              newBreakdownCount=newBreakdownCount+1;
              console.log(newBreakdownCount)
              desire="breakdownDesire_"+newBreakdownCount.toString()+"_"+data.desire;
              price="breakdownPrice_"+newBreakdownCount.toString()+"_"+data.price;
              description="breakdownDescription_"+newBreakdownCount.toString()+"_"+data.description;




                      var data_json = {
                      type: "new_breakdowncount",
                      newBreakdownCount: newBreakdownCount,
                      event: obj.eventName,
                      desire: desire,
                      price, price,
                      description, description,

                    };




                redis_client.hmset(data.event, [

                    'breakdowncount', newBreakdownCount,
                    desire,data.desire,
                    price,data.price,
                    description, data.description,

                ], function(err, reply){

                    if(err){

                        console.log(err);
                    }


               });



                ws.send( JSON.stringify( data_json ));



            }});


    }

    else if(data.content=="loadBreakdowns"){


        redis_client.hgetall(data.event, function(err, obj){

            if(!obj){

               console.log(err);

            }

            else{


              var data_json = {
                    type: "load_allbreakdowns_ok",
                    obj: obj,

                };

            ws.send( JSON.stringify( data_json ));

            }

      });

    }





    }
  });

  ws.on('close', function (message) {
    console.log("somebody is gone");
  var index = clients.indexOf( ws );
  clients.splice( index );
  });

  ws.send('something');
});


server.listen(port, function(err) {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log("server is listening on " + port)
})
