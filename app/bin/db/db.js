var mongoose = require('mongoose');
var dbSettings = require('./settings');

var db = mongoose.connect(`mongodb://${dbSettings.HOST}:${dbSettings.PORT}/${dbSettings.DB}`);

module.exports = db;