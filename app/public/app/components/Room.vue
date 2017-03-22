<template>
    <div class="chat-room" :id="roomId">
        <h3>{{roomInfo.name}}</h3>
        <h4>{{roomInfo.topic}}</h4>
        <div class="creator">
            <h3>{{roomInfo.creatorName}}</h3>
        </div>
        <ul>
            <li class="c-member" v-for="member in members" @click="requestVideo($event)" :id="member.peerId">
                <!-- <video :src="user.videoStreamSrc" autoplay="" id="camera_box"></video> -->
                <p class="room-name">name: {{room.name}}</p>
                <p class="room-topic">topic: {{room.topic}}</p>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import io from 'socket.io-client';
import Peer from '../lib/peer';
import _ from 'lodash';

module.exports = {
    data: function() {
        return {
            members: [],
            socket: null,
            peer: null,
            roomInfo: null,
            roomId: ''
        };
    },
    mounted: function() {
        if (!this.mySelf) {
            this.$router.push('/login');
        } else {
            this.init();
        }
    },
    destroyed: function() {
        //this.socket.off();
    },
    computed: mapGetters([
        'mySelf'
    ]),
    methods: {
        init: function(roomId) {
            //window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
            this.userId = this.mySelf.userId;
            this.userName = this.mySelf.userName;
            this.roomId = this.$route.params.id;
            this.socket = this.$route.params.socket;

            this.initSocketEvents();

            this.socket.emit('get.roomInfo', this.roomId);
            //this.peer = this.openPeer();
        },
        initSocketEvents: function() {
            let _this = this;
            let socket = this.socket;

            socket.on('success:exit.room', function(data) {
                console.log('success:exit.room');
                if (data.user.userid === _this.userId) {
                    _this.$router.go(-1);
                } else {
                    _this.removeMember(data.user);
                }
            });

            socket.on('success:join.room', function(data) {
                console.log('success:get.roomInfo');
                if (data.user.id !== _this.userId) {
                    _this.addMember(data.user);
                }
            });

            socket.on('success:get.roomInfo', function(room) {
                console.log('success:get.roomInfo');
                _this.members = room.members;
            });

            // 有peer接入到webrtc服务器, 服务器通过socket将其他id实时推送到客户端
            socket.on('peer_open', function(peerUser) {
                console.log('peer_open', peerUser);
                _this.addPerson(peerUser);
            });

            socket.on('peer_close', function(peerUser) {
                console.log('peer_close', peerUser);
                _this.removePerson(peerUser);
            });

            socket.on('error', function() {
                console.log('socket error');
            });

            socket.on('disconnect', function() {
                console.log('socket disconnect');
            });

            return socket;
        },
        openPeer: function() {
            var _this = this;
            // 开启一个webrtc点
            var peer = new Peer(this.userId, {
                host: '/',
                port: 9000
            });

            // The `open` event signifies that the Peer is ready to connect with other
            // Peers and, if we didn't provide the Peer with an ID, that an ID has been
            // assigned by the server.
            // webrtc点开启成功, 记录peer信息到服务器
            peer.on('open', function(id) {
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
                    // 视频请求信息
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
        closeSocket: function() {
            if (this.socket) {
                this.socket.close();
            }
        },
        addMember: function(user) {
            this.members.push(user);
        },
        removeMember: function(user) {
            this.members = this.members.filter(function(_user) {
                return _user.id !== user.id;
            });
        },
        exitRoom: function(roomId) {
            //this.socket.close();
            this.socket.emit('exit.room', roomId);
        },
        showVideo: function(id, stream) {
            var src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(stream) : stream;
            this.users = this.users.map(function(user) {
                return user.userId === id ? _.extend({}, user, {videoStreamSrc: src}) : user;
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
            //var _this = this;
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
};
</script>