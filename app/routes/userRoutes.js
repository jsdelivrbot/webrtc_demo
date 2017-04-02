var express = require('express');
var router = express.Router();
var hash = require('../auth/pass').hash;
var auth = require('../auth/auth');
var User = require('../model/UserModel');
var CommonUtils = require('../utils/CommonUtils');
var _ = require('lodash');

var mapUserInfo = CommonUtils.mapUserInfo;
var checkIfExit = CommonUtils.checkIfExit;

router.post('/getMySelf', function(req, res) {
    res.json({
        status: true,
        result: req.session.user ? _.extend({loginstatus: true}, mapUserInfo(req.session.user)) : {loginstatus: false}
    });
});

router.post('/login', function(req, res) {
    console.log('userRouter::login enter');
    auth.authenticate(req.body.email, req.body.password, function(err, user) {
        console.log('user:', user);
        if (err) {
            console.log('find user error:', err);
            res.json({
                status: false,
                result: {
                    loginstatus: false,
                    errorMsg: err.errorMsg
                }
            });
            return;
        }
        if (user) {
            req.session.regenerate(function() {
                console.log('regenerate session end:');
                req.session.user = user;
                console.log('login:', user);
                req.session.success = 'Authenticated as ' + user.username;// + ' click to <a href="/logout">logout</a>. You may now access <a href="/restricted">/restricted</a>.';
                //res.redirect('/');
                res.json({
                    status: true,
                    result: _.extend({loginstatus: true}, mapUserInfo(user))
                });
            });
        } else {
            console.log('no user found!');
            req.session.error = 'Authentication failed, please check your username and password.';
            res.json({
                status: true,
                result: {loginstatus: false, errorMsg: req.session.error}
            });
        }
    });
});

router.post('/logout', function (req, res) {
    req.session.destroy(function () {
        res.json({
            status: true,
            result: {
                loginstatus: false
            }
        });
    });
});

router.post('/signup', auth.userExist, function (req, res) {
    console.log('userRouter::signup enter');
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
        console.log('hash password end');
        if (err) throw err;
        User.create({
            email: email,
            username: username,
            salt: salt,
            hash: hash
        }, function (err, newUser) {
            console.log('create user end:', newUser);
            if (err) throw err;
            req.session.regenerate(function() {
                console.log('regenerate session end:');
                req.session.user = newUser;
                req.session.success = 'Authenticated as ' + newUser.username;
                res.json({
                    status: true,
                    result: _.extend({loginstatus: true}, mapUserInfo(newUser))
                });
            });
            /*auth.authenticate(newUser.email, password, function(err, user) {
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
            });*/
        });
    });
});

router.post('/checkEmail', function (req, res) {
    let email = req.body.email;
    checkIfExit({email: email}, User)
        .then(function(result) {
            if (result) {
                res.json({
                    status: false,
                    errorMsg: 'email is exist'
                });
            } else {
                res.json({
                    status: true
                });
            }
        }, function() {
            res.json({
                status: false,
                errorMsg: 'check email failed'
            });
        });
});

router.post('/checkUsername', function (req, res) {
    let username = req.body.username;
    checkIfExit({username: username}, User)
        .then(function(result) {
            if (result) {
                res.json({
                    status: false,
                    errorMsg: 'username is exist'
                });
            } else {
                res.json({
                    status: true
                });
                return;
            }
        }, function() {
            res.json({
                status: false,
                errorMsg: 'check username failed'
            });
        });
});

module.exports = router;