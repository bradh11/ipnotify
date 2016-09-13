/**
 * Showing with the Express framwork http://expressjs.com/
 * Express must be installed for this sample to work
 */

var tropowebapi = require('./lib/tropo-webapi');
var express = require('express');

var app = express();

app.get('/', function (req, res) {
    res.send('Hello from Cisco Shipped!');
});


app.post('/', function(req, res){
	// Create a new instance of the TropoWebAPI object.
	var tropo = new tropowebapi.TropoWebAPI();
	// Use the say method https://www.tropo.com/docs/webapi/say.htm
	tropo.say("Welcome to tropo shipped project.");

    res.send(tropowebapi.TropoJSON(tropo));
});


app.listen(3000);
console.log('Server running on http://0.0.0.0:3000/')
