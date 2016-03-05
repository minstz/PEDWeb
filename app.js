var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) { 
	res.sendFile('index.html', { root : __dirname}); 
	// sendjson = {'peer_id': 'peer_id', 'content_hash': 'abcd'};
	// res.end(JSON.stringify(sendjson));

});

app.get('/*', function(req, res, next) { 
//	res.sendFile('index.html', { root : __dirname}); 
	sendjson = {'peer_id': 'peer_id', 'content_hash': req.url};
	res.end(JSON.stringify(sendjson));

});
// app.get('/*', function(req, res, next) { res.send('Hello world!'); });

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
