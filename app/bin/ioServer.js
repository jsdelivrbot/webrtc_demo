var server = require('./server');
var _ = require('lodash');

var ioServer = require('socket.io')(server);
var DB = require('./db/db');

var PeerServer = require('peer').PeerServer;
var peerServer = PeerServer({
    port: 9000,
    path: '/'
});

var users;

//var users = [];

//通过socketio登录
ioServer.on('connection', function(socket) {
    console.log('socket,' + socket.id);
    var db = DB();

    peerServer.on('connection', function(id) {
        console.log('peer connection,', id);
        db.open('users').then(function(collection) {
            collection.find({userId: id}).toArray(function(err, docs) {
                if (!docs.length) {
                    collection.insert({userId: id});
                    socket.broadcast.emit('broadcast', {
                        type: 'peer_open',
                        content: {
                            userId: id
                        }
                    });
                }
                db.close();
            });
        });
    });

    peerServer.on('disconnect', function(id) {
        console.log('peer disconnection,', id);
        socket.broadcast.emit('broadcast', {
            type: 'peer_close',
            content: {
                userId: id
            }
        });
    });

    db.open('users').then(function(collection) {
        console.log('getcollection');
        collection.find({}).toArray(function(err, docs) {
            console.log(docs);
            ioServer.to(socket.id).emit('init', []);
            db.close();
        });
    });
});

module.exports = ioServer;