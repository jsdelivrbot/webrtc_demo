var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/myapp');
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String
});

var User = mongoose.model('users', UserSchema);

module.exports = User;