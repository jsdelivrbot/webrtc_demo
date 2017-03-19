var express = require('express');
var router = express.Router();
var User = require('../bin/model/UserModel');
var Room = require('../bin/model/RoomModel');
var Utils = require('../utils/Utils');
//var _ = require('lodash');

//User.findOneAndUpdate({}, {'$set': {'rooms': []}}, function(err, _user) {});

router.post('/createRoom', function(req, res) {
    let user = req.session.user;
    if (!user) {
        res.status(401);
        return;
    }

    console.log(req.body);
    let name = req.body.name;
    let topic = req.body.topic;

    User.findOne({email: user.email}, function(err, user) {
        if (err) {
            res.json({
                status: false,
                errorMsg: 'match user failed'
            });
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
                res.json({
                    status: false,
                    errorMsg: 'create room failed'
                });
                return;
                //throw new Error('save room info failed');
            }
            res.json({
                status: true,
                result: Utils.getRoomInfo(newRoom)
            });
        });
    });
});

router.post('/deleteRoom', function(req, res) {
    let user = req.session.user;
    if (!user) {
        res.status(401);
        return;
    }
    let deleteRoomId = req.body.id;
    Room.findOneAndRemove({_id: deleteRoomId, creatorName: user.email}, function(err, room) {
        console.log('delete room:', room);
        if (err) {
            res.status(400).json({'error': 'delete room error'});
            return;
        }
        if (!room) {
            res.status(400).json({'error': 'no room to be deleted'});
        }
        res.json({
            status: true,
            result: Utils.getRoomInfo(room)
        });
    });
});

router.post('/joinRoom', function(req, res) {
    let user = req.session.user;
    if (!user) {
        res.status(401);
        return;
    }

    let id = req.body.id;

    //更新该用户和房间信息
    User.findOneAndUpdate({email: user.email}, {'$push': {'rooms': id}}, function(err, _user) {
        console.log('user update:', _user);
        if (err) {
            res.json({
                status: false,
                errorMsg: 'update user info failed'
            });
            return;
        }
        if (!_user) {
            res.json({
                status: false,
                errorMsg: 'no user matched'
            });
        }
        Room.findOne({_id: id}, function(err, room) {
            if (err) {
                res.json({
                    status: false,
                    errorMsg: 'find room failed'
                });
                return;
            }
            if (!room) {
                res.json({
                    status: false,
                    errorMsg: 'no room matched'
                });
            }
            if (room.members.length === room.maxCount) {
                res.json({
                    status: false,
                    errorMsg: 'this room if full'
                });
                return;
            }
            Room.findOneAndUpdate({_id: id}, {'$push': {'members': _user._id}}, function(err, _room) {
                console.log('Room update:', _room);
                if (err) {
                    res.json({
                        status: false,
                        errorMsg: 'join room failed'
                    });
                    return;
                }
                res.json({
                    status: true,
                    result: Utils.getRoomInfo(_room)
                });
            });
        });
    });
});

/*router.post('/exitRoom', function(req, res) {
    let user = req.session.user;
    if (!user) {
        res.status(401);
        return;
    }

    let id = req.body.id;


});*/

router.post('/getRoomInfo', function(req, res) {
    if (!req.session.user) {
        res.status(401);
        return;
    }
});

router.post('/getRooms', function(req, res) {
    if (!req.session.user) {
        res.status(401);
        return;
    }
    Room.find({}, function(err, rooms) {
        if (err) {
            res.status(400).json({error: 'get rooms failed'});
            return;
        }
        res.json({
            status: true,
            result: Utils.getRoomsInfo(rooms)
        });
    });
});

module.exports = router;