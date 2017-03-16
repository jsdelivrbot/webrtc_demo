var mongoose = require('mongoose');
var db = require('../db/db');

var RoomSchema = new mongoose.Schema({
    id: String,
    name: String,
    memberCount: Number,
    maxCount: Number
});

var Room = db.model('users', RoomSchema);

module.exports = Room;