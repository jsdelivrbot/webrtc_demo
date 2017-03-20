var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    salt: String,
    hash: String,
    rooms: Array
});

module.exports = UserSchema;