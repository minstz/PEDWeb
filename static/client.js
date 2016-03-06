$(document).ready(function() {
	
	var peerID = "";
	var hash = 0;

	var peer = new Peer( {host: 'localhost', port: 9000, path: '/api'});


	//When the connection with server is opened
	peer.on('open', function(id) {

		console.log('My peer ID is: ' + id);

		//Get peerID and hash from server
		$.ajax({
			url: '/hello',
			data: id,
			dataType: 'json',
			async: false,
			success: function(json) {
				console.log("Received from Server", json);
				peerID = json["peer_id"];
				hash = json["content_hash"];
			}
		});

		//This means we are currently the only active connection on the server
		//We will now get the content directly from server
		if (peerID == id) {
			$.ajax({
				url: '/content',
				dataType: 'html',
				async: false,
				success: function(html) {
					document.write(html);
				}
			});
		}

		else {

			//connect to the specified peer id given by server
			var conn = peer.connect(peerID);

			//wait for data
		  conn.on('data', function(data){
		    console.log("received from peer", data);

		    //calculate hash
		    var recievedHash = CryptoJS.SHA256(data);

		    //compare hash to hash supplied by server
		    //if not equal, close connection, send error to server, and get new peer
		    if (hash == recievedHash) {
			    //write data (html) to the DOM
			    document.write(data);
		    }
		    else {
		    	console.log("Hashes do not match");

		    }

		  });
		 }
	});

	//On connection
	peer.on('connection', function(conn) {
		//Send data (html) to new peer
		conn.send(window.document);

	});

});
