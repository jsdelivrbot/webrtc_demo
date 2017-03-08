var mongoose = require('mongoose');
var dbSettings = require('../db/settings');

mongoose.connect(`mongodb://${dbSettings.HOST}:${dbSettings.PORT}/${dbSettings.DB}`);
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String
});

var User = mongoose.model('users', UserSchema);

module.exports = User;