var Utils = require('./utils/Utils');

class SocketClient {
    constructor(io, socket, user) {
        this.io = io;
        this.socket = socket;
        this.user = user;
    }
    createRoom(name, topic) {
        let socket = this.socket;
        let user = this.user;
        Utils.createRoom(user, name, topic).then(function(data) {
            socket.emit('success:create.room', data.room);
        }, function(data) {
            socket.emit('failed:create.room', {
                errorMsg: data.errorMsg
            });
        });
    }
    deleteRoom(roomId) {
        let socket = this.socket;
        let user = this.user;
        Utils.deleteRoom(user, roomId).then(function(data) {
            socket.emit('success:delete.room', data.room);
        }, function(data) {
            socket.emit('failed:delete.room', {
                errorMsg: data.errorMsg
            });
        });
    }
    joinRoom(roomId) {
        let socket = this.socket;
        let user = this.user;
        socket.join(roomId, function(err) {
            if (err) {
                socket.emit('failed:join.socketRoom', {
                    errorMsg: 'join room failed'
                });
                return;
            }
            Utils.joinRoom(user, roomId).then(function(data) {
                socket.emit('success:join.socketRoom', data.room);
                socket.broadcast.to(roomId).emit('success:join.socketRoom', user);
            }, function(data) {
                socket.emit('failed:join.room', {
                    errorMsg: data.errorMsg
                });
            });
        });
    }
    exitRoom(roomId) {
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
            Utils.joinRoom(user, roomId).then(function(data) {
                socket.emit('success:leave.socketRoom', data.room);
                io.to(roomId).emit('success:leave.socketRoom', user);
            }, function(data) {
                socket.emit('failed:leave.room', {
                    errorMsg: data.errorMsg
                });
            });
        });
    }
    getRoomInfo(roomId) {
        let socket = this.socket;
        Utils.getRoomInfo(this.user, roomId).then(function(data) {
            socket.emit('success:get.roomInfo', data.room);
        }, function(data) {
            socket.emit('failed:get.roomInfo', {
                errorMsg: data.errorMsg
            });
        });
    }
    getRooms() {
        let socket = this.socket;
        Utils.getRooms().then(function(data) {
            socket.emit('success:get.rooms', data.rooms);
        }, function(data) {
            socket.emit('failed:get.roomInfo', {
                errorMsg: data.errorMsg
            });
        });
    }
}

module.exports = SocketClient;