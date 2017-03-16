var socketIO = require('socket.io');
var peer = require('peer');
var User = require('./model/UserModel');
var Room = require('./model/UserModel');

function start(server) {
    var ioServer = socketIO(server);
    var PeerServer = peer.PeerServer;
    var peerServer = PeerServer({
        port: 9000,
        path: '/'
    });

    ioServer.use(function(socket, next) {
        if (socket.request.headers.cookie) {
            return next();
        }
        next(new Error('Authentication error'));
    });

    //通过socketio获取初始用户列表
    ioServer.on('connection', function(socket) {
        console.log('socket connection,' + socket.id);
        //找到用户信息
        User.findOne({/*todo*/}, function(err, user) {
            if (err) {
                throw new Error('find peers failed!');
            }
            if (user) {
                // {name: String, topic: String}
                socket.on('create.room', function(opts) {
                    new Room({
                        id: '111', //TODO unique
                        name: opts.name,
                        topic: opts.topic,
                        memberCount: 1,
                        maxCount: 6
                    }).save(function(err, newRoom) {
                        if (err) {
                            throw new Error('save room info failed');
                        }
                        socket.join(newRoom.id, function() {
                            socket.emit('enter:room', newRoom);
                        });
                    });
                });
                //roomId:String
                socket.on('join.room', function(roomId) {
                    Room.findOne({id: roomId}, function(err, room) {
                        if (err) {
                            throw new Error('find room failed!');
                        }
                        if (!room) {
                            socket.emit('error:room', 'find no room');
                            return;
                        }
                        if (room.maxCount + 1 > room.maxCount) {
                            socket.emit('error:room', 'the room is full');
                            return;
                        }
                        //todo must confirm
                        room.update({memberCount: room.memberCount + 1}, function(err, newRoom) {
                            if (err) {
                                throw new Error('update room info failed');
                            }
                            socket.join(newRoom.id, function() {
                                socket.emit('enter:room', newRoom);
                            });
                        });
                    });
                });
                //通知该用户目前的room数
                Room.find({}, function(err, rooms) {
                    if (err) {
                        throw new Error('query rooms failed!');
                    }
                    socket.emit('init', rooms);
                });
            } else {
                socket.emit('error:user', 'who are you?');
            }
        });
    });

    ioServer.on('disconnect', function(socket) {
        console.log('socket disconnect,' + socket.id);
    });

    peerServer.on('connection', function(id) {
        console.log('peer connection,', id);
        PeerModel.findOne({id: id}, function(err, peerUser) {
            if (err) {
                throw new Error('find peer user failed!');
            }
            if (peerUser) {
                console.log('peer user is exit, peerUser:' + peerUser);
            } else {
                new PeerModel({
                    id: id
                }).save(function(err, newPeer) {
                    if (err) {
                        throw new Error('save peer user failed!');
                    }
                    //全体通知
                    ioServer.emit('peer_open', {
                        id: id
                    });
                });
            }
        });
    });

    peerServer.on('disconnect', function(id) {
        console.log('peer disconnect,', id);
        PeerModel.remove({id: id}, function(err) {
            if (err) {
                throw new Error('remove peer failed!');
            }
            ioServer.emit('peer_close', {
                id: id
            });
        });
    });
}

module.exports = {
    start: start
};