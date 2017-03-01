var server = require('./server');
var _ = require('lodash');

var ioServer = require('socket.io')(server);

var users = [];

ioServer.on('connection', function(socket) {
	console.log(users);
	// for(key in socket.client) {
	// 	console.log(key);
	// }
	ioServer.to(socket.id).emit('init', users);
	socket.on('peer_open', function(user) {
		if(!_.find(users, {id: user.id})) {
			users.push(user);
			socket.broadcast.emit('broadcast', {type: 'peer_open', content: user});
		}
		console.log(users);
	});
});

module.exports = ioServer;