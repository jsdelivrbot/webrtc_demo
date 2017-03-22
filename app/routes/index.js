var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var user = req.session.user || {};
    res.render('index', {
        title: 'WebRTC',
        email: user.email,
        userName: user.username,
        id: user._id
    });
});

/*router.get('/', function (req, res) {
    if (req.session.user) {
        res.send('Welcome ' + req.session.user.username + '<br><a href="/logout">logout</a>');
    } else {
        res.send('<a href="/login">Login</a><br><a href="/signup">Sign Up</a>');
    }
});*/

module.exports = router;