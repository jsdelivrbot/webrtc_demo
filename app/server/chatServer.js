var socketIO = require('socket.io');
//var cookieParserIO = require('cookie-parser-io');
var peer = require('peer');
var User = require('../model/UserModel');
var ioSessionMiddleware = require('./middleware/ioSessionMiddleware');

var SocketClient = require('./SocketClient');

function start(server) {
    var ioServer = socketIO(server);
    var PeerServer = peer.PeerServer;
    var peerServer = PeerServer({
        port: 9000,
        path: '/'
    });

    ioServer.use(ioSessionMiddleware);

    //建立socket连接（前端在进入会议室大厅后请求）
    ioServer.on('connection', function(socket) {
        let session = socket.handshake.session;
        console.log('socket.handshake.session:', session);
        console.log('socket connection,' + socket.id);

        let user = session.user;

        if (!user) {
            socket.emit('failed:auth', {
                errorCode: 401,
                errorMsg: 'please login first!'
            });
        }

        let client = new SocketClient(ioServer, socket, user);

        socket.on('create.room', client.createRoom);
        socket.on('delete.room', client.deleteRoom);
        socket.on('join.room', client.joinRoom);
        socket.on('get.roomInfo', client.getRoomInfo);
        socket.on('get.rooms', client.getRooms);
        socket.on('exit.room', client.exitRoom);
    });

    ioServer.on('disconnect', function(socket) {
        console.log('socket disconnect,' + socket.id);
    });

    //使用登录用户id来开启peer
    peerServer.on('connection', function(id) {
        console.log('peer connection,', id);
        User.findOne({_id: id}, function(err, user) {
            if (err) {
                return;
            }
            user.rooms.forEach(function(room) {
                ioServer.to(room).emit('peer_open', {
                    id: id
                });
            });
        });
    });

    peerServer.on('disconnect', function(id) {
        console.log('peer disconnect,', id);
        User.findOne({_id: id}, function(err, user) {
            if (err) {
                return;
            }
            user.rooms.forEach(function(room) {
                ioServer.to(room).emit('peer_close', {
                    id: id
                });
            });
        });
    });
}

module.exports = {
    start: start
};