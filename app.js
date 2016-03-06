var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var sha256 = require('js-sha256');
var fs = require('fs');

// pages = [{'route': '/content', 'file': 'content.html'}]
pages = {'/content': 'content.html'}

var peers = [];
var page_hashes = {'/hello': sha256('hello')}

var server = app.listen(9000);

var options = {
    debug: true
}

peerServer = ExpressPeerServer(server, options);

app.use('/api', peerServer);

app.get('/', function(req, res, next) { 
	// console.log("///////////////");

	res.sendFile('index.html', { root : __dirname}); 
	// sendjson = {'peer_id': 'peer_id', 'content_hash': 'abcd'};
	// res.end(JSON.stringify(sendjson));

});

app.get('/content', function(req, res, next) { 
	res.sendFile('content.html', { root : __dirname}); 
});

app.get('/static/*', function(req, res, next) { 
	// console.log("staticstaticstaticstaticstaticstaticstaticstatic");
	res.sendFile(req.url.slice(1,req.url.length), { root : __dirname}); 
});

app.get('/*/*', function(req, res, next) {
	url = req.url.split("/");
	peer = url[1];
	url = url.slice(2,url.length);
	url = '/' + url.join('/');

	if (req.url in page_hashes) {
		sendjson = {'peer_id': 'peer_id', 'content_hash': page_hashes[url]};
		res.send(JSON.stringify(sendjson));
	} else {
		res.send('404 page not found: ' + url);
	}
});

app.get('/*_metadata', function(req, res, next) { 
	// console.log("ASDFGHJKL");
	url = req.url.slice(0, req.url.length - 9)
	console.log(url)
	if (url in page_hashes) {
		sendjson = {'peer_id': peers[0], 'content_hash': page_hashes[url]};
		res.send(JSON.stringify(sendjson));
	} else {
		res.send('404 page not found');
	}
	
	
});



app.get('/*', function(req, res, next) { 
	// console.log("ASDFGHJKL");
	if (req.url in page_hashes) {
		// sendjson = {'peer_id': peers[0], 'content_hash': page_hashes[req.url]};
		res.sendFile(JSON.stringify());
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


for (var route in pages) {
	var filepath = pages[route]
	var contents = fs.readFileSync(filepath, 'utf8');
	page_hashes[route] = sha256(contents);
}
console.log(page_hashes);