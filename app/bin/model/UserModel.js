var mongoose = require('mongoose');
var db = require('../db/db');

var UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    salt: String,
    hash: String
});

var User = db.model('users', UserSchema);

module.exports = User;