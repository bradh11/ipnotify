/**
* A cisco tropo example with shipped deployment.
 * Showing with the Express framwork http://expressjs.com/
 * Express must be installed for this sample to work
 */

var tropowebapi = require('./lib/tropo-webapi');
var express = require('express');
var serveStatic = require("serve-static");
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var jsonfile = require('jsonfile');
var util = require('util');
var file = './files/contacts.json';
var _ = require('underscore');

//Main Contact List.
var ContactList =[];
var selectedContact="";
// Define sample contacts
var contacts = [	
					{"echo": { namechoices: "Echo, Echo Test", 	number:	"9093900003" }}
					
				];
 

//Load all Contactsfrom json file on app load
jsonfile.readFile(file, function(err, obj) {		
		if(obj) {		
				ContactList=JSON.parse(obj);
		}else{
			//Write Static contacts as samples, pls comment this section if not required.
			ContactList=contacts;
			jsonfile.writeFile(file, JSON.stringify(ContactList), function (err) {
					if (err) {
						console.log('err',err);
					}	
				});
			 
		}
		console.log('obj',ContactList);
    });
	


app.use(serveStatic(__dirname + "/ui"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

 app.get('/', function (req, res) {
    res.send('Hello from Cisco Shipped!');
});
	 
//Main menu
app.post('/', function(req, res){
	
	// Create a new instance of the TropoWebAPI object.
	var tropo = new tropowebapi.TropoWebAPI();
	
	tropo.say("Welcome to Shipped Tropo Web API demo.");
	
	// use the ask method https://www.tropo.com/docs/webapi/say.htm	 
	var say = new Say(" . For weather, press 1. For contact search, press 2.");
	var choices = new Choices("1,2");
	 
	// Action classes can be passes as parameters to TropoWebAPI class methods.
	// use the ask method https://www.tropo.com/docs/webapi/ask.htm	 
	tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);

	// use the on method https://www.tropo.com/docs/webapi/on.htm	
	tropo.on("continue", null, "/selection", true);	
	 
    res.send(tropowebapi.TropoJSON(tropo));
});

//on Main menu option selection 
app.post('/selection', function(req, res) {
	  
	var tropo = new tropowebapi.TropoWebAPI();	
	console.log("--selection --");
	console.log(req.body.result);
	var choice=req.body.result.actions.interpretation;	 
	tropo.say("Your choice is invalid.");
	
	if (choice == "1"){
		weatherReport(res,function(){});
	}else if (choice == "2"){
		tropo.say("Searching for contacts.");	
		attendent(res, function(){});
	}else{
	res.send(tropowebapi.TropoJSON(tropo));
	}
 });
	
//helper func
//return string with , seperated contacts
listNames= function ( theContacts ){
  var s = '';
  for( var i=0;i<theContacts.length;i++) {
	  
	  for( var f in theContacts[i] ) {		   
		if (s != '') { s = s + ", " };
		s = s + f;
	  }
  }
  return s;
};

//for Nomae choice object
listOptions=function ( theContacts ){
  var s ='';
   for( var i=0;i<theContacts.length;i++) {   
 
	 for( var f in theContacts[i] ) {	
	
		if (s != '') { s = s + ", " };
		s = s + f + " (" + theContacts[i][f].namechoices + ")";
	  }
   }
  return s;
};
					
attendent = function(res, callback){
	var tropo = new tropowebapi.TropoWebAPI();	
	//Create event objects
	var e1 = {"value":"Sorry, I did not hear anything.","event":"timeout"};
    var e2 = {"value":"Sorry, that was not a valid option.","event":"nomatch:1"};
    var e3 = {"value":"Nope, still not a valid response","event":"nomatch:2"};  
	selectedContact="";			
		 
    //Create an array of all events
    var e = new Array(e1,e2,e3);
       
	// Demonstrates how to use the base Tropo action classes.
	var say = new Say("Who would you like to call?  Just say name, like echo", null, e, null, null, null);
		 
	var choices = new Choices(listOptions( ContactList ));	 
	tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
	tropo.on("continue", null, "/call", true);
	
	res.send(tropowebapi.TropoJSON(tropo));
	callback();
	
	
};

// on contact selection.
app.post('/call', function(req, res){	
	 
	var tropo = new tropowebapi.TropoWebAPI();	 
	selectedContact=req.body.result.actions.interpretation;
	 
	//console.log(contact)
	 
	tropo.say( "ok, you said " + selectedContact +" .");
	
	
	var say = new Say(" to confirm, press 1. For retry, press 2.");
	var choices = new Choices("1,2");	 
	 
	tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);	
	tropo.on("continue", null, "/selectioncontact", true);		
	
	res.send(tropowebapi.TropoJSON(tropo));
	
});
//on contact option selection 
app.post('/selectioncontact', function(req, res) {
	  
	var tropo = new tropowebapi.TropoWebAPI();	
	 
	console.log(req.body.result);
	var choice=req.body.result.actions.interpretation;	 
	tropo.say("Your choice is invalid.");	
	if (choice == "1"){
		callcontact(res,function(){});		
	}else if (choice == "2"){		
		attendent(res, function(){});	
	}else{
	 res.send(tropowebapi.TropoJSON(tropo));
	}
 });
 
// on contact selection.
callcontact= function(res, callback){	
	 
	var tropo = new tropowebapi.TropoWebAPI();		
	var contact=selectedContact.toLowerCase();	
	var c=undefined;
	 for( var i=0;i<ContactList.length;i++) {	  
	  for( var f in  ContactList[i] ) {	
		  if (f.toLowerCase()==contact){
			  c=ContactList[i][f]
		  }
	  }
	 }
	if (c == undefined){
		tropo.say("Could not able to find contact information for contact "+contact+", Please try again." );			 	
	}else{
		 tropo.say("Please hold while I transfer you. Call forwarding will only works if your account is activated for call forwarding feature." );
		 
		//added ring while answered by other person.
		 var say1= new Say("http://www.phono.com/audio/holdmusic.mp3");
		 var on = new On("ring", null, null, false, say1);
		
		//transfer call to the requested contact.
		tropo.transfer(c.number, false, null, null, {'x-caller-name' : contact}, null, on, true, '#', 60.0);
		 //sms
		 //tropo.call(c.number, null, null, null, null, null, "SMS", null, null, null);

	}
	
	tropo.say( "Goodbye !");
	res.send(tropowebapi.TropoJSON(tropo));
	callback();
	
};
//
//For weather report
//

//On weather report selection from main menu.
weatherReport=function(res,callback){
	var tropo = new tropowebapi.TropoWebAPI();

	var say = new Say("Please enter your 5 digit zip code.");
	var choices = new Choices("[5 DIGITS]");

	tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
	tropo.on("continue", null, "/answer", true);
	 
    res.send(tropowebapi.TropoJSON(tropo));	
	callback();
};

//on entering 5 digit zip code.
app.post('/answer', function(req, res){	

	 var tropo = new tropowebapi.TropoWebAPI();
	//console.log(req.body['result']['actions']['interpretation'])
	var zip=req.body.result.actions.interpretation;
	
	tropo.say("Fetching weather information for your zip code "+ zip +".");
	getWeather(zip,function(response){
		var j= JSON.parse(response)
		
			if(j.cod==200){
				//Format string object from weather api response.				
				var wtr= " Weather for "+j.name+" is ! clouds " +j.weather[0].description+ ", Temperature " +j.main.temp +" kelvin, Pressure " +j.main.pressure +", Humidity " +j.main.humidity +"%"
				console.log(wtr);
				tropo.say(wtr);
				tropo.say( "Goodbye !");
			}
			else{
				console.log(j.message);
				tropo.say( "Oops ! "+ j.message);
				tropo.say( "Please try again.");
			}	
		 res.send(tropowebapi.TropoJSON(tropo));
	});
	
});


//weather bkend api call.
getWeather=function(zip, callback){
	request('http://api.openweathermap.org/data/2.5/weather?zip='+zip+'&appid=a8f81765ac74e18e357c9496ac295aad', function (error, response, body) {
	if (!error && response.statusCode == 200) {
    callback(body)
	 
	}});
	
};

 
app.post('/contacts', function (req, res) {
	
	var index = _.findIndex(ContactList, req.body);
	console.log('POST: Adding Contact - ', req.body);
	if(index !== -1) {
		res.json(ContactList);
	}
	else {
		ContactList.push(req.body);
		jsonfile.writeFile(file, JSON.stringify(ContactList), function (err) {

        if (err) {
			console.log("Error adding Contact ",err);
            res.json({'message':'internal error'});
        }
        else {
            res.json(ContactList);

        }

    });
	}

});





app.get('/contacts', function (req, res) {

    jsonfile.readFile(file, function(err, obj) {
		if(obj){
			res.json(JSON.parse(obj));
		}
		else {
				console.log("Error getting Contact ",err);
				res.json([]);
		}

    });

});

//Server listening port.
app.listen(3000);
console.log('Server running on http://0.0.0.0:3000/');
