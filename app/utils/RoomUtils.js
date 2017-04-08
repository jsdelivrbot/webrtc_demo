var User = require('../model/UserModel');
var Room = require('../model/RoomModel');
var mapUserInfo = require('./CommonUtils').mapUserInfo;

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
        createTime: room.createTime,
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
                createTime: (new Date()).getTime(),
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
        Room.findOneAndRemove({_id: roomId, creatorEmail: user.email}, function(err, room) {
            //console.log('delete room:', room);
            if (err) {
                reject({errorMsg: 'delete room failed'});
                return;
            }
            if (!room) {
                reject({errorMsg: 'no room to delete'});
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
            //console.log('user update:', _user);
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
                Room.findOneAndUpdate({_id: roomId}, {'$push': {'members': mapUserInfo(_user, {type: 'basic'})}}, function(err, _room) {
                    //console.log('Room update:', _room);
                    if (err) {
                        reject({errorMsg: 'join room failed'});
                        return;
                    }
                    resolve({
                        user: mapUserInfo(_user, {type: 'basic'}),
                        room: {id: roomId}
                    });
                });
            });
        });
    });
}

function getRoomInfo(roomId) {
    return new Promise((resolve, reject) => {
        console.log('getRoomInfo:', roomId);
        Room.findOne({_id: roomId}, function(err, room) {
            //console.log('find room:', room);
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
            //console.log('user update:', _user);
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
                    //console.log('Room update:', _room);
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

module.exports = {
    mapRoomsInfo,
    mapRoomInfo,
    createRoom,
    deleteRoom,
    joinRoom,
    getRoomInfo,
    getRooms,
    exitRoom
};