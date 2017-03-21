var sessionMiddleware = require('./sessionMiddleware');

module.exports = function(socket, next) {
    sessionMiddleware(socket.handshake, {}, next);
};