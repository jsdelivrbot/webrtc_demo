var mongoose = require('mongoose');
var db = require('../db/db');
var User = require('./UserModel');

var RoomSchema = new mongoose.Schema({
    name: String,
    topic: String,
    creatorName: String,
    creatorEmail: String,
    //status: String,
    members: [User],
    maxCount: Number
});

var Room = db.model('rooms', RoomSchema);

module.exports = Room;