function getUrlSearch() {
    var searchStr = window.location.search.substr(1);
    var searches = searchStr.split('&');
    var searchObj = {};
    for(var i = 0; i < searches.length; i++) {
        var currentSearch = searches[i].split('=');
        searchObj[currentSearch[0]] = currentSearch[1];
    }
    return searchObj;
}

var chatList = new Vue({
    el: '#chat-list',
    data: {
        users: []
    },
    created: function() {
        window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
        this.userId = getUrlSearch().id;
        this.socket = this.openSocket();
        //this.peer = this.openPeer();
    },
    methods: {
        openSocket: function() {
            var _this = this;
            //建立与服务器的socket长连接
            var socket = io();

            //获取用户列表
            socket.on('init', function(users) {
                console.log('init,' + users);
                _this.users = users;
                _this.peer = _this.openPeer();
            });

            //有peer接入到webrtc服务器, 服务器通过socket将其他id实时推送到客户端
            socket.on('peer_open', function(peerUser) {
                console.log('peer_open', peerUser);
                _this.addPerson(peerUser);
            });

            socket.on('peer_close', function(peerUser) {
                console.log('peer_close', peerUser);
                _this.removePerson(peerUser);
            });

            return socket;
        },
        openPeer: function() {
            var _this = this;
            //开启一个webrtc点
            var peer = new Peer(this.userId, {
                host: '/',
                port: 9000
            });

            // The `open` event signifies that the Peer is ready to connect with other
            // Peers and, if we didn't provide the Peer with an ID, that an ID has been
            // assigned by the server.
            // webrtc点开启成功, 记录peer信息到服务器
            peer.on('open', function(id) {
                alert('open peer');
                console.log('peer open', id);
                _this.peerId = id;
            });
            // Wait for a connection from the second peer.
            peer.on('connection', function(connection) {
                // This `connection` is a DataConnection object with which we can send
                // data.
                // The `open` event firing means that the connection is now ready to
                // transmit data.
                connection.on('open', function() {
                    // Send 'Hello' on the connection.
                    //connection.send('Hello peer2!');
                });
                //接收到另一客户端的数据信息
                connection.on('data', function(data) {
                    switch(data.type) {
                        //视频请求信息
                        case 'video_request':
                            var isConfirm = confirm(data.content);
                            if(isConfirm) {
                                _this.openVideo(
                                    function(stream) {
                                        var call = _this.peer.call(data.id, stream);
                                        call.on('stream', function(remoteStream) {
                                            // Show stream in some video/canvas element.
                                            _this.showVideo(data.id, remoteStream);
                                        });
                                    },
                                    function(err) {
                                        console.log(err);
                                    }
                                );
                            } else {
                                return;
                            }
                    }
                });
            });

            //其他客户端共享视频流到本客户端
            peer.on('call', function(call) {
                _this.openVideo(function(stream) {
                    call.answer(stream);
                    call.on('stream', function(remoteStream) {
                        // Show stream in some video/canvas element.
                        _this.showVideo(call.peer, remoteStream);
                    });
                });
            });

            return peer;
        },
        closePeer: function() {
            if (this.peer) {
                this.peer.disconnect();
            }
        },
        addPerson: function(user) {
            this.users.push(user);
        },
        removePerson: function(user) {
            this.users = this.users.filter(function(_user) {
                return _user.userId !== user.userId;
            });
        },
        showVideo: function(id, stream) {
            var src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(stream) : stream;
            this.users = this.users.map(function(user) {
                if (user.userId === id) {
                    return _.extend({}, user, {videoStreamSrc: src});
                }
            });
        },
        requestVideo: function(e) {
            var _this = this;
            var c = this.peer.connect(e.currentTarget.id);
            //与该客户端建立连接并请求视频共享
            c.on('open', function(conn) {
                c.send({
                    id: _this.peerId,
                    type: 'video_request',
                    content: _this.peerId + ' is asked for your video sharing!',
                    toId: e.target.id
                });
            });
        },
        openVideo: function(successFn, failFn) {
            var _this = this;
            //视频连接
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia = getUserMedia.bind(navigator);
            getUserMedia({
                video: true,
                audio: true
            }, function(stream) {
                successFn ? successFn(stream) : null;
                //var call = _this.peer.call(toId, stream);
                //_this.showVideo(_this.userId, stream);
            }, function(err) {
                failFn ? failFn(err) : null;
            });
        }
    }
});

