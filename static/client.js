function setUpClient(requestURL) {
	
	var peerID = "";
	var hash = 0;

	var peer = new Peer( {host: 'localhost', port: 9000, path: '/api'});


	//When the connection with server is opened
	peer.on('open', function(id) {

		console.log('My peer ID is: ' + id);

		//Get peerID and hash from server
		console.log('GETting /' + id + requestURL + '_metadata' )
		$.ajax({
			url: '/' + id + requestURL + '_metadata',
			// data: id,
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
		if (peerID == id || peerID == "peer_id") {
			$.ajax({
				url: '/' + id + requestURL,
				dataType: 'html',
				async: false,
				success: function(html) {
					console.log("Got the html");
					document.body.innerHTML = "";
					console.log(sha256(html));
					console.log(html.length);
					document.write(html);
				}
			});
		}

		else {

			//connect to the specified peer id given by server
			var connection = peer.connect(peerID);

			//wait for data
		  connection.on('data', function(data){
		    console.log("received from peer", data);

		    //calculate hash
		    var recievedHash = sha256(data);

		    console.log(recievedHash);

		    //compare hash to hash supplied by server
		    //if not equal, close connection, send error to server, and get new peer
			console.log(data.length);

		    if (hash == recievedHash) {
			    //write data (html) to the DOM
			    // document.write(data);
			    document.write("<h1>YOU GOT SERVED!!!!</h1>");
		    }
		    else {
		    	console.log("Hashes do not match");

					$.ajax({
						url: '/error' + '/' + peerID + requestURL,
						dataType: 'html',
						async: false,
						success: function(html) {
							console.log("Got the html");
							document.body.innerHTML = "";
							document.write(html);
						}
					});

		    }

		  });
		}
	});

	//On connection
	peer.on('connection', function(conn) {
		conn.on('open',function() {
			var data = document.documentElement.outerHTML;
			console.log("sending html");
			//Send data (html) to new peer
			conn.send(data);
			console.log("SENT");
			console.log(data);
		});


	});

}
