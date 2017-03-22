var User = require('../model/UserModel');
var Room = require('../model/RoomModel');
var _ = require('lodash');

function mapUserInfo(user, opts) {
    let info = {
        userName: user.username,
        email: user.email,
        id: user._id
    };
    if (opts && opts.type === 'basic') {
        return info;
    }
    info.rooms = user.rooms;
    return info;
}

function mapRoomsInfo(rooms) {
    return rooms.map(mapRoomInfo);
}

function mapRoomInfo(room) {
    if (!room) {
        return room;
    }
    return {
        id: room._id,
        name: room.name,
        topic: room.topic,
        creatorEmail: room.creatorEmail,
        creatorName: room.creatorName,
        members: room.members
    };
}

function createRoom(user, name, topic) {
    return new Promise((resolve, reject) => {
        User.findOne({email: user.email}, function(err, user) {
            if (err) {
                reject({errorMsg: 'match user failed'});
                return;
            }
            Room.create({
                name: name,
                topic: topic,
                creatorName: user.username,
                creatorEmail: user.email,
                //status: 'created',
                members: [],
                maxCount: 6
            }, function(err, newRoom) {
                if (err) {
                    reject({errorMsg: 'create room failed'});
                    return;
                }
                resolve({
                    room: mapRoomInfo(newRoom)
                });
            });
        });
    });
}

function deleteRoom(user, roomId) {
    return new Promise((resolve, reject) => {
        Room.findOneAndRemove({_id: roomId, creatorName: user.email}, function(err, room) {
            console.log('delete room:', room);
            if (err) {
                reject({errorMsg: 'delete room failed'});
                return;
            }
            if (!room) {
                reject({errorMsg: 'create room failed'});
                return;
            }
            resolve({
                room: {id: roomId}
            });
        });
    });
}

function joinRoom(user, roomId) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({email: user.email}, {'$push': {'rooms': roomId}}, function(err, _user) {
            console.log('user update:', _user);
            if (err) {
                reject({errorMsg: 'update user info failed'});
                return;
            }
            if (!_user) {
                reject({errorMsg: 'no user matched'});
                return;
            }
            Room.findOne({_id: roomId}, function(err, room) {
                if (err) {
                    reject({errorMsg: 'find room failed'});
                    return;
                }
                if (!room) {
                    reject({errorMsg: 'no room matched'});
                    return;
                }
                if (room.members.length === room.maxCount) {
                    reject({errorMsg: 'this room if full'});
                    return;
                }
                Room.findOneAndUpdate({_id: roomId}, {'$push': {'members': mapUserInfo(_user)}}, function(err, _room) {
                    console.log('Room update:', _room);
                    if (err) {
                        reject({errorMsg: 'join room failed'});
                        return;
                    }
                    resolve({
                        room: {id: roomId}
                    });
                });
            });
        });
    });
}

function getRoomInfo(roomId) {
    return new Promise((resolve, reject) => {
        Room.findOneById(roomId, function(err, room) {
            console.log('delete room:', room);
            if (err) {
                reject({errorMsg: 'find room failed'});
                return;
            }
            if (!room) {
                reject({errorMsg: 'find no room'});
                return;
            }
            resolve({
                room: mapRoomInfo(room)
            });
        });
    });
}

function getRooms() {
    return new Promise((resolve, reject) => {
        Room.find({}, function(err, rooms) {
            if (err) {
                reject({errorMsg: 'get rooms failed'});
                return;
            }
            resolve({
                rooms: mapRoomsInfo(rooms)
            });
        });
    });
}

function exitRoom(user, roomId) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({email: user.email}, {'$pull': {'rooms': roomId}}, function(err, _user) {
            console.log('user update:', _user);
            if (err) {
                reject({errorMsg: 'update user info failed'});
                return;
            }
            if (!_user) {
                reject({errorMsg: 'no user matched'});
                return;
            }
            Room.findOne({_id: roomId}, function(err, room) {
                if (err) {
                    reject({errorMsg: 'find room failed'});
                    return;
                }
                if (!room) {
                    reject({errorMsg: 'no room matched'});
                    return;
                }
                if (room.members.length === room.maxCount) {
                    reject({errorMsg: 'this room if full'});
                    return;
                }
                Room.findOneAndUpdate({_id: roomId}, {'$pull': {'members': mapUserInfo(_user, {type: 'basic'})}}, function(err, _room) {
                    console.log('Room update:', _room);
                    if (err) {
                        reject({errorMsg: 'join room failed'});
                        return;
                    }
                    resolve({
                        user: mapUserInfo(user),
                        room: {id: roomId}
                    });
                });
            });
        });
    });
}

function extend(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent` constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
}

module.exports = {
    mapUserInfo: mapUserInfo,
    mapRoomsInfo: mapRoomsInfo,
    mapRoomInfo: mapRoomInfo,
    createRoom: createRoom,
    deleteRoom: deleteRoom,
    joinRoom: joinRoom,
    getRoomInfo: getRoomInfo,
    getRooms: getRooms,
    exitRoom: exitRoom,
    extend: extend
};