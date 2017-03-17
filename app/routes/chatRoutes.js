var express = require('express');
var router = express.Router();
var User = require('../bin/model/UserModel');
var Room = require('../bin/model/RoomModel');
var _ = require('lodash');

function getRoomsInfo(rooms) {
    return rooms.map(getRoomInfo);
}

function getRoomInfo(room) {
    return _.extend({}, room, {id: room.id});
}

router.post('/createRoom', function(req, res) {
    if (!req.session.user) {
        res.status(401);
        return;
    }
    let user = req.session.user;
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
                result: getRoomInfo(newRoom)
            });
        });
    });
});

router.post('/joinRoom', function(req, res) {
    if (!req.session.user) {
        res.status(401);
        return;
    }

    let user = req.session.user;
    let id = req.body.id;

    //更新该用户和房间信息
    User.update({email: user.email}, {'$push': {'rooms': id}}, function(err, user) {
        if (err) {
            res.json({
                status: false,
                errorMsg: 'update user info failed'
            });
            return;
        }
        Room.findOne({_id: id}, function(err, room) {
            if (err) {
                res.json({
                    status: false,
                    errorMsg: 'find room failed'
                });
                return;
            }
            if (room.members.length === room.maxCount) {
                res.json({
                    status: false,
                    errorMsg: 'this room if full'
                });
                return;
            }
            Room.update({_id: id}, {'$addToSet': {'members': user}}, function(err, room) {
                if (err) {
                    res.json({
                        status: false,
                        errorMsg: 'join room failed'
                    });
                    return;
                }
                res.json({
                    status: true,
                    result: getRoomInfo(room)
                });
            });
        });
    });
});

router.get('/getRooms', function(req, res) {
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
            result: getRoomsInfo(rooms)
        });
    });
});

module.exports = router;