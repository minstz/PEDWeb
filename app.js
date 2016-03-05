var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var sha256 = require('js-sha256');

var peers = [];
var page_hashes = {'/hello': sha256('hello')}

app.get('/', function(req, res, next) { 


	res.sendFile('index.html', { root : __dirname}); 
	// sendjson = {'peer_id': 'peer_id', 'content_hash': 'abcd'};
	// res.end(JSON.stringify(sendjson));

});

app.get('/*', function(req, res, next) { 
	if (req.url in page_hashes) {
		sendjson = {'peer_id': 'peer_id', 'content_hash': page_hashes[req.url]};
	} else {
		res.send('404 page not found');
	}
	
	res.send(JSON.stringify(sendjson));
});

var server = app.listen(9000);

var options = {
    debug: true
}

app.use('/api', ExpressPeerServer(server, options));



server.on('connection', function(id) {
	// send content if no others fully updated, otherwise send a client to connect to
	console.log("Connected!");
});

server.on('disconnect', function(id) { 
	// Remove client from list
	console.log("Disconnected!");
});
