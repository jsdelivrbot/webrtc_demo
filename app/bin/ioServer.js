var server = require('./server');
var _ = require('lodash');

var ioServer = require('socket.io')(server);

var users = [];

ioServer.on('connection', function(socket) {
	// for(key in socket.client) {
	// 	console.log(key);
	// }
	ioServer.to(socket.id).emit('init', users);
	socket.on('peer_open', function(id) {
		users.push({id: id});
		users = _.unique(users);
		//socket.broadcast.to(id)
		socket.broadcast.emit('broadcast', {type: 'peer_open', content: id});
	});
});

module.exports = ioServer;