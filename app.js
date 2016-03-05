var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var sha256 = require('js-sha256');

var peers = [];
var page_hashes = {'/hello': sha256('hello')}

var server = app.listen(9000);

var options = {
    debug: true
}

peerServer = ExpressPeerServer(server, options);

app.get('/', function(req, res, next) { 


	res.sendFile('index.html', { root : __dirname}); 
	// sendjson = {'peer_id': 'peer_id', 'content_hash': 'abcd'};
	// res.end(JSON.stringify(sendjson));

});

app.use('/api', peerServer);

app.get('/*', function(req, res, next) { 
	if (req.url in page_hashes) {
		sendjson = {'peer_id': 'peer_id', 'content_hash': page_hashes[req.url]};
		res.send(JSON.stringify(sendjson));
	} else {
		res.send('404 page not found');
	}
	
	
});

peerServer.on('connection', function(id) {
	// send content if no others fully updated, otherwise send a client to connect to
	console.log("Connected! id: " + id);
	peers.push(id);
	console.log('Peers: ' + peers);
});

peerServer.on('disconnect', function(id) { 
	// Remove client from list

	var index = peers.indexOf(id);

	if (index > -1) {
	    peers.splice(index, 1);
	}

	console.log("Disconnected! id: " + id + " index in array: " + index);
	console.log('Peers: ' + peers);

});
