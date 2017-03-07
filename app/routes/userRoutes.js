var express = require('express');
var router = express.Router();
var hash = require('../bin/pass').hash;
var auth = require('../bin/auth/auth');

var User = auth.User;

router.get('/login', function (req, res) {
    res.render('login');
});

router.post('/login', function (req, res) {
    auth.authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {

            req.session.regenerate(function () {

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/');
            });
        } else {
            req.session.error = 'Authentication failed, please check your username and password.';
            res.redirect('/login');
        }
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

router.get('/signup', function (req, res) {
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('signup');
    }
});

router.post('/signup', auth.userExist, function (req, res) {
    var password = req.body.password;
    var username = req.body.username;

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            salt: salt,
            hash: hash
        }).save(function (err, newUser) {
            if (err) throw err;
            auth.authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/');
                    });
                }
            });
        });
    });
});

router.get('/profile', auth.requiredAuthentication, function (req, res) {
    res.send('Profile page of ' + req.session.user.username + '<br> click to <a href="/logout">logout</a>');
});

module.exports = router;