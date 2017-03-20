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
    //todo
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
    let user = req.session.user;
    if (!user) {
        res.status(401);
        return;
    }
    let id = req.body.id;
    Utils.getRoomInfo(user, id).then(function(data) {
        res.json({
            status: true,
            result: data.room
        });
    }, function(data) {
        res.status(400).json(data);
    });
});

router.post('/getRooms', function(req, res) {
    if (!req.session.user) {
        res.status(401);
        return;
    }
    Utils.getRooms().then(function(data) {
        res.json({
            status: true,
            result: data.rooms
        });
    }, function(data) {
        res.status(400).json(data);
    });
});

module.exports = router;