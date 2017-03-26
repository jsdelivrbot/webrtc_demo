var User = require('../model/UserModel');
var hash = require('./pass').hash;

module.exports = {
    authenticate: function(email, pass, fn) {
        if (!module.parent) console.log('authenticating %s:%s', email, pass);

        User.findOne({email: email}, function(err, user) {
            if (user) {
                if (err) return fn({
                    errorMsg: 'find user error'
                });
                hash(pass, user.salt, function(err, _hash) {
                    if (err) return fn(err);
                    if (_hash.toString() === user.hash) return fn(null, user);
                    fn({
                        errorMsg: 'invalid password'
                    });
                });
            } else {
                return fn({
                    errorMsg: 'no user exit'
                });
            }
        });
    },
    // requiredAuthentication: function(req, res, next) {
    //     if (req.session.user) {
    //         next();
    //     } else {
    //         req.session.error = 'Access denied!';
    //         res.redirect('/login');
    //     }
    // },
    userExist: function(req, res, next) {
        req.session.error = '';
        User.count({
            email: req.body.email
        }, function (err, count) {
            if (count === 0) {
                next();
            } else {
                req.session.error = 'User Exist';
                next();
            }
        });
    }
};