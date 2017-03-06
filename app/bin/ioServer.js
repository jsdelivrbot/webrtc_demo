var server = require('./server');
var _ = require('lodash');

var socketIO = require('socket.io');
var peer = require('peer');
var DB = require('./db/db');

function start() {
    var ioServer = socketIO(server);
    var PeerServer = peer.PeerServer;
    var peerServer = PeerServer({
        port: 9000,
        path: '/'
    });

    var db = DB();

    db.open('peerUsers').then(function(collection) {
        collection.find({}).toArray(function(err, docs) {
            console.log(docs);
        });
    });

    peerServer.on('connection', function(id) {
        console.log('peer connection,', id);
        db.open('peerUsers').then(function(collection) {
            collection.find({
                userId: id
            }).toArray(function(err, docs) {
                if (!docs.length) {
                    collection.insert({
                        userId: id
                    }, function(err, docs) {
                        ioServer.emit('peer_open', {
                            userId: id
                        });
                    });
                }
                db.close();
            });
        }, function(err) {
            console.log(err);
        });
    });

    peerServer.on('disconnect', function(id) {
        console.log('peer disconnect,', id);
        db.open('peerUsers').then(function(collection) {
            collection.deleteOne({
                userId: id
            }, function(err, docs) {
                if (!err) {
                    ioServer.emit('peer_close', {
                        userId: id
                    });
                }
                db.close();
            });
        }, function(err) {
            console.log(err);
        });
    });

    //通过socketio获取初始用户列表
    ioServer.on('connection', function(socket) {
        console.log('socket connection,' + socket.id);

        db.open('peerUsers').then(function(collection) {
            console.log('get peer collection');
            collection.find({}).toArray(function(err, docs) {
                socket.emit('init', docs);
                db.close();
            });
        }, function(err) {
            console.log(err);
        });
    });

    ioServer.on('disconnect', function(socket) {
        console.log('socket disconnect,' + socket.id);
    });
}

module.exports = {
    start: start
};