var PeerServer = require('peer').PeerServer;
var peerServer = PeerServer({
	port: 9000,
	path: '/'
});

peerServer.on('connection', function(id) {
	console.log(id);
});

module.exports = peerServer;