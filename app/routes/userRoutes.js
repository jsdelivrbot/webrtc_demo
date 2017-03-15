var express = require('express');
var router = express.Router();
var hash = require('../bin/auth/pass').hash;
var auth = require('../bin/auth/auth');
var User = require('../bin/model/UserModel');
var _ = require('lodash');

/*router.get('/login', function (req, res) {
    res.render('login');
});
*/

function getUserInfo(user) {
    return {
        username: user.username,
        email: user.email,
        userid: user._id
    };
}

router.get('/loginstatus', function(req, res) {
    res.json({
        status: true,
        result: req.session.user ? _.extend({loginstatus: true}, getUserInfo(req.session.user)) : {loginstatus: false}
    });
});

router.post('/login', function(req, res) {
    auth.authenticate(req.body.email, req.body.password, function(err, user) {
        if (user) {
            req.session.regenerate(function() {
                req.session.user = user;
                console.log('login:', user);
                req.session.success = 'Authenticated as ' + user.username;// + ' click to <a href="/logout">logout</a>. You may now access <a href="/restricted">/restricted</a>.';
                //res.redirect('/');
                res.json({
                    status: true,
                    result: _.extend({loginstatus: true}, getUserInfo(user))
                });
            });
        } else {
            req.session.error = 'Authentication failed, please check your username and password.';
            res.json({
                status: true,
                result: {loginstatus: false, errorMsg: req.session.error}
            });
        }
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.json({
            status: true,
            result: {
                loginstatus: false
            }
        });
    });
});

/*router.get('/signup', function (req, res) {
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('signup');
    }
});*/

router.post('/signup', auth.userExist, function (req, res) {
    if (req.session.error) {
        res.json({
            status: true,
            result: {loginstatus: false, errorMsg: req.session.error}
        });
        return;
    }
    //console.log(req.body);
    var password = req.body.password;
    var username = req.body.username;
    var email = req.body.email;

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        new User({
            email: email,
            username: username,
            salt: salt,
            hash: hash
        }).save(function (err, newUser) {
            if (err) throw err;
            auth.authenticate(newUser.email, password, function(err, user) {
                //console.log('user:', user);
                if(user) {
                    req.session.regenerate(function() {
                        req.session.user = user;
                        //console.log(_.extend({loginstatus: true}, getUserInfo(req.session.user)));
                        req.session.success = 'Authenticated as ' + user.username;// + ' click to <a href="/logout">logout</a>. You may now access <a href="/restricted">/restricted</a>.';
                        //res.redirect('/');
                        res.json({
                            status: true,
                            result: _.extend({loginstatus: true}, getUserInfo(req.session.user))
                        });
                    });
                }
            });
        });
    });
});

/*router.get('/profile', auth.requiredAuthentication, function (req, res) {
    res.send('Profile page of ' + req.session.user.username + '<br> click to <a href="/logout">logout</a>');
});*/

module.exports = router;