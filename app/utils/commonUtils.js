var _ = require('lodash');

function mapUserInfo(user, opts) {
    let info = {
        userName: user.username,
        email: user.email,
        id: user._id
    };
    if (opts && opts.type === 'basic') {
        return info;
    }
    info.rooms = user.rooms;
    return info;
}

function checkIfExit(props, Table) {
    return new Promise(function(resolve, reject) {
        Table.findOne(props, function(err, doc) {
            if (err) {
                reject();
                return;
            }
            if (!doc) {
                resolve(false);
                return;
            }
            resolve(doc);
        });
    });
}

function extend(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent` constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
}

module.exports = {
    mapUserInfo,
    checkIfExit,
    extend
};