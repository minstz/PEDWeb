var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var sha256 = require('js-sha256');
var fs = require('fs');

// pages = [{'route': '/content', 'file': 'content.html'}]
pages = {'/content': 'content.html', '/test': 'index_new.html'}


// Peer format: {'id': 'peerID', 'currentPage': '/content', 'pageHash': theirhash}
var peers = [];
var page_hashes = {}

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

app.get('/static/*', function(req, res, next) { 
	// console.log("staticstaticstaticstaticstaticstaticstaticstatic");
	res.sendFile(req.url.slice(1,req.url.length), { root : __dirname}); 
});

app.get('/*/*_metadata', function(req, res, next) { 
	// console.log("ASDFGHJKL");
	// url = req.url.slice(0, req.url.length - 9)
	url = req.url.split("/");
	peer = url[1];
	url = url.slice(2,url.length);
	url = '/' + url.join('/');
	url = url.slice(0, url.length - 9)
	// console.log(url)
	if (url in page_hashes) {

		// by default, tell them to get the content from themselves. This means get it from the server.
		var to_connect_to = peer;

		for (var i = 0; i < peers.length; i++) {
			console.log(peers[i]['id']);

			if (peers[i]['id'] == peer) {
				// Update where this person is.
				peers[i]['currentPage'] = url;
				peers[i]['pageHash'] = page_hashes[url];
			} else {
				if (peers[i]['currentPage'] == url && peers[i]['pageHash'] == page_hashes[url]) {
					// Found a peer we can use to get the content
					to_connect_to = peers[i]['id'];
				}	
			}
		}

		sendjson = {'peer_id': to_connect_to, 'content_hash': page_hashes[url]};
		res.send(JSON.stringify(sendjson));
	} else {
		res.send('404 page not found');
	}
});

app.get('/*/*', function(req, res, next) {
	url = req.url.split("/");
	peer = url[1];
	url = url.slice(2,url.length);
	url = '/' + url.join('/');

	if (url in page_hashes) {
		res.sendFile(pages[url],  { root : __dirname});
	} else {
		res.send('404 page not found: ' + url);
	}
});

peerServer.on('connection', function(id) {
	// send content if no others fully updated, otherwise send a client to connect to
	console.log("Connected! id: " + id);
	peers.push({'id': id, 'currentPage': undefined, 'pageHash': undefined});
	console.log('Peers: ' + peers);
});

peerServer.on('disconnect', function(id) { 
	// Remove client from list

	var tempPeers = [];
	for(var p in peers) {
		if(p['id'] != id) {
			tempPeers.push(p);
		}
	}
	peers = tempPeers;

});

// Go through the configuration data, get the hash for the files and initialize the people on each page.
for (var route in pages) {
	var filepath = pages[route]
	var contents = fs.readFileSync(filepath, 'utf8');
	page_hashes[route] = sha256(contents);
}

console.log(page_hashes);