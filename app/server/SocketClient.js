var Utils = require('../utils/Utils');

class SocketClient {
    constructor(io, socket, user) {
        this.io = io;
        this.socket = socket;
        this.user = user;
    }
    createRoom(opts) {
        console.log('SocketClient::createRoom, info:', opts);
        let io = this.io;
        let socket = this.socket;
        let user = this.user;
        Utils.createRoom(user, opts.name, opts.topic).then(function(data) {
            console.log('success:create.room');
            io.emit('success:create.room', data.room);
            //socket.broadcast.emit('success:create.room', data.room);
        }, function(data) {
            console.log('failed:create.room,', data);
            socket.emit('failed:create.room', {
                errorMsg: data.errorMsg
            });
        });
    }
    deleteRoom(roomId) {
        console.log('SocketClient::deleteRoom, roomId:', roomId);
        let io = this.io;
        let socket = this.socket;
        let user = this.user;
        Utils.deleteRoom(user, roomId).then(function(data) {
            console.log('success:delete.room');
            io.emit('success:delete.room', data.room);
        }, function(data) {
            console.log('failed:delete.room,', data);
            socket.emit('failed:delete.room', {
                errorMsg: data.errorMsg
            });
        });
    }
    joinRoom(roomId) {
        console.log('SocketClient::joinRoom, roomId:', roomId);
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
            Utils.joinRoom(user, roomId).then(function(data) {
                console.log('success:join.room');
                //socket.emit('success:join.socketRoom', data.room);
                io.to(roomId).emit('success:join.room', data); //room and user
            }, function(data) {
                console.log('failed:join.room', data);
                socket.emit('failed:join.room', {
                    errorMsg: data.errorMsg
                });
            });
        });
    }
    exitRoom(roomId) {
        console.log('SocketClient::exitRoom, enter');
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
            Utils.exitRoom(user, roomId).then(function(data) {
                console.log('success:leave.socketRoom');
                socket.emit('success:leave.socketRoom', data);
                io.to(roomId).emit('success:leave.socketRoom', data); //room and user
            }, function(data) {
                console.log('failed:leave.room,', data);
                socket.emit('failed:leave.room', {
                    errorMsg: data.errorMsg
                });
            });
        });
    }
    getRoomInfo(roomId) {
        console.log('SocketClient::getRoomInfo, roomId:', roomId);
        let socket = this.socket;
        Utils.getRoomInfo(roomId).then(function(data) {
            console.log('success:get.roomInfo');
            socket.emit('success:get.roomInfo', data.room);
        }, function(data) {
            console.log('failed:get.roomInfo,', data);
            socket.emit('failed:get.roomInfo', {
                errorMsg: data.errorMsg
            });
        });
    }
    getRooms() {
        console.log('SocketClient::getRooms, enter');
        let socket = this.socket;
        Utils.getRooms().then(function(data) {
            console.log('success:get.rooms');
            socket.emit('success:get.rooms', data.rooms);
        }, function(data) {
            console.log('failed:get.rooms,', data);
            socket.emit('failed:get.rooms', {
                errorMsg: data.errorMsg
            });
        });
    }
}

module.exports = SocketClient;