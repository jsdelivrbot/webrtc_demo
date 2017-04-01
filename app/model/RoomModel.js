var mongoose = require('mongoose');
var db = require('../db/db');
//var UserSchema = require('./UserSchema');

var RoomSchema = new mongoose.Schema({
    name: String,
    topic: String,
    creatorName: String,
    creatorEmail: String,
    createTime: Number,
    members: Array,
    maxCount: Number
});

var Room = db.model('rooms', RoomSchema);

module.exports = Room;