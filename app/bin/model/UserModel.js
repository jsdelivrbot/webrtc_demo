var UserSchema = require('./UserSchema');
var db = require('../db/db');

var User = db.model('users', UserSchema);

module.exports = User;