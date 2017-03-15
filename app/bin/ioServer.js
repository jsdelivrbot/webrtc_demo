var server = require('./server');
var _ = require('lodash');

var socketIO = require('socket.io');
var peer = require('peer');
var PeerModel = require('./model/PeerModel');
//var DB = require('./db/db');

function start() {
    var ioServer = socketIO(server);
    var PeerServer = peer.PeerServer;
    var peerServer = PeerServer({
        port: 9000,
        path: '/'
    });

    //var db = DB();

    // db.open('peerUsers').then(function(collection) {
    //     collection.find({}).toArray(function(err, docs) {
    //         console.log(docs);
    //     });
    // });

    peerServer.on('connection', function(id) {
        console.log('peer connection,', id);
        PeerModel.findOne({id: id}, function(err, peerUser) {
            if (err) {
                throw new Error('find peer user failed!');
            }
            if (peerUser) {
                console.log('peer user is exit, peerUser:' + peerUser);
            } else {
                new PeerModel({
                    id: id
                }).save(function(err, newPeer) {
                    if (err) {
                        throw new Error('save peer user failed!');
                    }
                    ioServer.emit('peer_open', {
                        id: id
                    });
                });
            }
        });
    });

    peerServer.on('disconnect', function(id) {
        console.log('peer disconnect,', id);
        PeerModel.remove({id: id}, function(err) {
            if (err) {
                throw new Error('remove peer failed!');
            }
            ioServer.emit('peer_close', {
                id: id
            });
        });
    });

    //通过socketio获取初始用户列表
    ioServer.on('connection', function(socket) {
        console.log('socket connection,' + socket.id);

        PeerModel.find({}, function(err, docs) {
            if (err) {
                throw new Error('find peers failed!');
            }
            socket.emit('init', docs);
        });
    });

    ioServer.on('disconnect', function(socket) {
        console.log('socket disconnect,' + socket.id);
    });
}

module.exports = {
    start: start
};