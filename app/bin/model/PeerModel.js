var mongoose = require('mongoose');
var db = require('../db/db');

var PeerSchema = new mongoose.Schema({
    id: String
});

var Peer = db.model('peers', PeerSchema);

module.exports = Peer;