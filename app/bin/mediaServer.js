var socketIO = require('socket.io');
var cookieParserIO = require('cookie-parser-io');
var peer = require('peer');
var User = require('./model/UserModel');
var Room = require('./model/RoomModel');
var Utils = require('../utils/Utils');
var settings = require('./db/settings');

function start(server) {
    var ioServer = socketIO(server);
    var PeerServer = peer.PeerServer;
    var peerServer = PeerServer({
        port: 9000,
        path: '/'
    });

    ioServer.use(cookieParserIO(settings.COOKIE_SECRET));

    //建立socket连接（前端在进入聊天室后请求）
    ioServer.on('connection', function(socket) {
        console.log('socket connection,' + socket.id);

        socket.on('join.socketRoom', function(id) {
            socket.join(id, function(err) {
                if (err) {
                    socket.emit('error:join.socketRoom', {
                        errorMsg: 'join room failed'
                    });
                    return;
                }
                Room.findOneById(id, function(_err, room) {
                    if (_err) {
                        socket.emit('error:join.socketRoom', {
                            errorMsg: 'find room info failed'
                        });
                        return;
                    }
                    if (!room) {
                        socket.emit('error:join.socketRoom', {
                            errorMsg: 'this id match no room'
                        });
                        return;
                    }
                    socket.emit('success:join.socketRoom', {
                        room: Utils.getRoomInfo(room)
                    });
                });
            });
        });
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