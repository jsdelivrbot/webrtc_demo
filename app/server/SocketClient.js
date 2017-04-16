var RoomUtils = require('../utils/RoomUtils');
var log4js = require('log4js');
var logger = log4js.getLogger('room-socket');
var fs = require('fs');
var path = require('path');
// var SocketStream = require('socket.io-stream');
// var path = require('path');
// var fs = require('fs');

class SocketClient {
    constructor(io, socket, user) {
        this.io = io;
        this.socket = socket;
        this.user = user;
    }
    init() {
        let socket = this.socket;
        socket.on('create.room', this.createRoom.bind(this));
        socket.on('delete.room', this.deleteRoom.bind(this));
        socket.on('join.room', this.joinRoom.bind(this));
        socket.on('get.roomInfo', this.getRoomInfo.bind(this));
        socket.on('get.rooms', this.getRooms.bind(this));
        socket.on('exit.room', this.exitRoom.bind(this));
        socket.on('video.open', this.openVideo.bind(this));
        socket.on('video.save', this.saveVideo.bind(this));

        socket.on('disconnect', function() {
            logger.trace('disconnect:', socket.id);
            //client.exitRoom();
        });

        socket.on('socket-destroyed', function() {
            logger.trace('socket-destroyed:', socket.id);
        });

        socket.emit('init');
    }
    saveVideo(file) {
        logger.trace('saveVideo');
        fs.writeFile(path.resolve(__dirname, '../public/upload') + '/' + (new Date()).getTime() + '.webm', file, function(err) {
            if (err) {
                logger.error(err);
            } else {
                logger.trace('success');
            }
        });
    }
    openVideo(blob) {
        logger.trace('openVideo');
        let user = this.user;
        let io = this.io;
        io.emit('open:video', {
            stream: blob,
            userEmail: user.email
        });
        // logger.trace(user.rooms);
        // user.rooms.forEach(function(roomId) {
        //     logger.trace('roomId:', roomId);
        //     io.to(roomId).emit('open:video', {
        //         stream: blob,
        //         userEmail: user.email
        //     });
        // });
    }
    createRoom(opts) {
        logger.trace('SocketClient::createRoom, info:', opts);
        let io = this.io;
        let socket = this.socket;
        let user = this.user;
        RoomUtils.createRoom(user, opts.name, opts.topic).then(function(data) {
            logger.trace('success:create.room');
            io.emit('success:create.room', data.room);
            //socket.broadcast.emit('success:create.room', data.room);
        }, function(data) {
            logger.error('failed:create.room,', data);
            socket.emit('failed:create.room', {
                errorMsg: data.errorMsg
            });
        });
    }
    deleteRoom(roomId) {
        logger.trace('SocketClient::deleteRoom, roomId:', roomId);
        let io = this.io;
        let socket = this.socket;
        let user = this.user;
        RoomUtils.deleteRoom(user, roomId).then(function(data) {
            logger.trace('success:delete.room');
            io.emit('success:delete.room', data.room);
        }, function(data) {
            logger.error('failed:delete.room,', data);
            socket.emit('failed:delete.room', {
                errorMsg: data.errorMsg
            });
        });
    }
    joinRoom(roomId) {
        logger.trace('SocketClient::joinRoom, roomId:', roomId);
        let io = this.io;
        let socket = this.socket;
        let user = this.user;
        socket.join(roomId, function(err) {
            if (err) {
                socket.emit('failed:join.room', {
                    errorMsg: 'join room failed'
                });
                return;
            }
            RoomUtils.joinRoom(user, roomId).then(function(data) {
                logger.trace('success:join.room');
                //socket.emit('success:join.socketRoom', data.room);
                io.to(roomId).emit('success:join.room', data); //room and user
            }, function(data) {
                logger.error('failed:join.room', data);
                socket.emit('failed:join.room', {
                    errorMsg: data.errorMsg
                });
            });
        });
    }
    exitRoom(roomId) {
        logger.trace('SocketClient::exitRoom, enter');
        let io = this.io;
        let socket = this.socket;
        let user = this.user;
        socket.leave(roomId, function(err) {
            if (err) {
                socket.emit('failed:leave.socketRoom', {
                    errorMsg: 'leave room failed'
                });
                return;
            }
            RoomUtils.exitRoom(user, roomId).then(function(data) {
                logger.trace('success:leave.socketRoom');
                socket.emit('success:leave.socketRoom', data);
                io.to(roomId).emit('success:leave.socketRoom', data); //room and user
            }, function(data) {
                logger.error('failed:leave.room,', data);
                socket.emit('failed:leave.room', {
                    errorMsg: data.errorMsg
                });
            });
        });
    }
    getRoomInfo(roomId) {
        logger.trace('SocketClient::getRoomInfo, roomId:', roomId);
        let socket = this.socket;
        RoomUtils.getRoomInfo(roomId).then(function(data) {
            logger.trace('success:get.roomInfo');
            socket.emit('success:get.roomInfo', data.room);
        }, function(data) {
            logger.error('failed:get.roomInfo,', data);
            socket.emit('failed:get.roomInfo', {
                errorMsg: data.errorMsg
            });
        });
    }
    getRooms() {
        logger.trace('SocketClient::getRooms, enter');
        let socket = this.socket;
        RoomUtils.getRooms().then(function(data) {
            logger.trace('success:get.rooms');
            socket.emit('success:get.rooms', data.rooms);
        }, function(data) {
            logger.error('failed:get.rooms,', data);
            socket.emit('failed:get.rooms', {
                errorMsg: data.errorMsg
            });
        });
    }
}

module.exports = SocketClient;