var express = require('express');
var router = express.Router();
var Utils = require('../utils/Utils');
//var _ = require('lodash');

//User.findOneAndUpdate({}, {'$set': {'rooms': []}}, function(err, _user) {});

function checkAuth(req, res, next) {
    let user = req.session.user;
    if (!user) {
        res.status(401);
        return;
    }
    next();
}

router.post('/createRoom', checkAuth, function(req, res) {
    let user = req.session.user;
    let name = req.body.name;
    let topic = req.body.topic;

    Utils.createRoom(user, name, topic).then(function(data) {
        res.json({
            status: true,
            result: data.room
        });
    }, function(data) {
        res.json({
            status: false,
            errorMsg: data.errorMsg
        });
    });
});

router.post('/deleteRoom', checkAuth, function(req, res) {
    let user = req.session.user;
    let roomId = req.body.roomId;

    Utils.deleteRoom(user, roomId).then(function(data) {
        res.json({
            status: true,
            result: data.room
        });
    }, function(data) {
        res.json({
            status: false,
            errorMsg: data.errorMsg
        });
    });
});

router.post('/joinRoom', function(req, res) {
    let user = req.session.user;
    let roomId = req.body.roomId;

    Utils.joinRoom(user, roomId).then(function(data) {
        res.json({
            status: true,
            result: data.room
        });
    }, function(data) {
        res.json({
            status: false,
            errorMsg: data.errorMsg
        });
    });
});

router.post('/exitRoom', function(req, res) {
    let user = req.session.user;
    let roomId = req.body.id;

    Utils.exitRoom(user, roomId).then(function(data) {
        res.json({
            status: true,
            result: data.room
        });
    }, function(data) {
        res.json({
            status: false,
            errorMsg: data.errorMsg
        });
    });
});

router.post('/getRoomInfo', function(req, res) {
    let user = req.session.user;
    let roomId = req.body.roomId;

    Utils.getRoomInfo(user, roomId).then(function(data) {
        res.json({
            status: true,
            result: data.room
        });
    }, function(data) {
        res.json({
            status: false,
            errorMsg: data.errorMsg
        });
    });
});

router.post('/getRooms', function(req, res) {
    Utils.getRooms().then(function(data) {
        res.json({
            status: true,
            result: data.rooms
        });
    }, function(data) {
        res.json({
            status: false,
            errorMsg: data.errorMsg
        });
    });
});

module.exports = router;