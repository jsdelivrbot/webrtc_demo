var express = require('express');
var router = express.Router();
var Utils = require('../utils/Utils');
var _ = require('lodash');

/* GET home page. */
router.get('/', function(req, res, next) {
    var user = req.session.user || {};
    console.log('user:' + user);
    res.render('index', _.extend({
        title: 'WebRTC'
    }, Utils.mapUserInfo(user)));
});

/*router.get('/', function (req, res) {
    if (req.session.user) {
        res.send('Welcome ' + req.session.user.username + '<br><a href="/logout">logout</a>');
    } else {
        res.send('<a href="/login">Login</a><br><a href="/signup">Sign Up</a>');
    }
});*/

module.exports = router;