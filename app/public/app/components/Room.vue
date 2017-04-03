<template>
    <div class="chat-room" :data-id="roomId">
        <h3>{{roomInfo.name}}</h3>
        <h4>{{roomInfo.topic}}</h4>
        <!-- <input type="file"/> -->
        <div class="creator">
            <h3>{{roomInfo.creatorName}}</h3>
        </div>
        <video :src="videoSrc" autoplay=""></video>
        <el-button @click="openVideo">开启视频</el-button>
        <ul>
            <li class="c-member" v-for="member in members" @click="requestVideo($event)" :id="member.id">
                <!-- <video :src="user.videoStreamSrc" autoplay="" id="camera_box"></video> -->
                <p class="member-name">name: {{member.userName}}</p>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';
import io from 'socket.io-client';
import $ from 'jquery';
//import ss from 'socket.io-stream';

module.exports = {
    data: function() {
        return {
            members: [],
            peer: null,
            roomInfo: {},
            roomId: '',
            videoSrc: ''
        };
    },
    beforeRouteEnter: function(to, from, next) {
        next();
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当钩子执行前，组件实例还没被创建
    },
    mounted: function() {
        this.init();
    },
    // beforeRouteLeave: function(to, from, next) {
    //     alert('you are in chat room, please click quit room!');
    //     return;
    // },
    beforeDestroy: function() {
        if (this.socket) {
            this.socket.off('failed:auth');
            this.socket.off('success:join.room');
            this.socket.off('success:exit.room');
            this.socket.off('success:get.roomInfo');
        }
        this.stream = null;
        this.exitRoom(this.roomId);
    },
    computed: mapGetters([
        'mySelf',
        'socket'
    ]),
    methods: {
        init: function() {
            let _this = this;
            //window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
            this.userId = this.mySelf.id;
            this.userName = this.mySelf.userName;
            this.roomId = this.$route.params.id;

            if (!this.socket) {
                this.$store.dispatch('saveSocket', io());
            }

            this.initSocketEvents();

            window.onbeforeunload = function() {
                _this.beforeDestroy();
                return true; // 可以阻止关闭
            };

            //$('input[type="file"]').on('change', function() {});
            
            this.socket.emit('join.room', this.roomId);
            //this.socket.emit('get.roomInfo', this.roomId);
            //this.peer = this.openPeer();
        },
        initSocketEvents: function() {
            let _this = this;
            let socket = this.socket;

            socket.on('failed:auth', function() {
                _this.$router.push('rooms');
            });

            socket.on('success:join.room', function(data) {
                console.log('success:join.room');
                if (data.user.id !== _this.userId) {
                    _this.addMember(data.user);
                } else {
                    socket.emit('get.roomInfo', _this.roomId);
                }
            });

            socket.on('success:exit.room', function(data) {
                console.log('success:exit.room');
                if (data.user.id === _this.userId) {
                    _this.$router.go(-1);
                } else {
                    _this.removeMember(data.user);
                }
            });

            socket.on('success:get.roomInfo', function(room) {
                console.log('success:get.roomInfo', room);
                _this.roomInfo = room;
                _this.members = room.members;
                //socket.emit('join.room', _this.roomId);
            });

            socket.on('video', function(arrayBuffer) {
                var blob = new Blob([arrayBuffer]);
                _this.videoSrc = window.URL.createObjectURL(blob);
            });

            socket.on('error', function() {
                console.log('socket error');
            });

            socket.on('disconnect', function() {
                console.log('socket disconnect');
            });

            return socket;
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
            console.log('exit.room');
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
        openVideo: function() {
            var _this = this;
            //视频连接
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia = getUserMedia.bind(navigator);
            getUserMedia({
                video: true,
                audio: true
            }, function(stream) {
                var mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.onstart = function(e) {
                    _this.chunks = [];
                };
                mediaRecorder.ondataavailable = function(e) {
                    _this.chunks.push(e.data);
                };
                mediaRecorder.onstop = function(e) {
                    var blob = new Blob(_this.chunks);
                    _this.socket.emit('video', blob);
                };

                mediaRecorder.start();
                // Stop recording after 5 seconds and broadcast it to server
                setTimeout(function() {
                    mediaRecorder.stop();
                }, 200);
            }, function(err) {
                //failFn ? failFn(err) : null;
            });
        }
    }
};
</script>