var socketIO = require('socket.io');
var log4js = require('log4js');
var logger = log4js.getLogger('room-socket');
//var cookieParserIO = require('cookie-parser-io');
//var peer = require('peer');
//var User = require('../model/UserModel');
var ioSessionMiddleware = require('../middleware/ioSessionMiddleware');

var SocketClient = require('./SocketClient');

function start(server) {
    var ioServer = socketIO(server);
    // var PeerServer = peer.PeerServer;
    // var peerServer = PeerServer({
    //     port: 9000,
    //     path: '/'
    // });

    ioServer.use(ioSessionMiddleware);

    //建立socket连接（前端在进入会议室大厅后请求）
    ioServer.on('connection', function(socket) {
        let session = socket.handshake.session;
        let user = session.user;

        logger.trace('socket connection', user.username);

        if (!user) {
            logger.error('failed:auth');
            socket.emit('failed:auth', {
                errorCode: 401,
                errorMsg: 'please login first!'
            });
        }

        let client = new SocketClient(ioServer, socket, user);
        client.init();
    });
}

module.exports = {
    start: start
};