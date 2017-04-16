<template>
    <div class="chat-room" :data-id="roomId">
        <h3>{{roomInfo.name}}</h3>
        <h4>{{roomInfo.topic}}</h4>
        <!-- <input type="file"/> -->
        <div class="creator">
            <h3>{{roomInfo.creatorName}}</h3>
        </div>
        <video ref="video" src="/upload/1492332439573.webm" autoplay=""></video>
        <el-button @click="openVideo">开启视频</el-button>
        <ul>
            <li class="c-member" v-for="member in members" @click="requestVideo($event)" :id="member.id">
                <video :src="member.videoStreamSrc" autoplay="" id="camera_box"></video>
                <p class="member-name">name: {{member.userName}}</p>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';
import io from 'socket.io-client';
import MediaStreamRecorder from 'msr';
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
                console.log('success:join.room,', data);
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

            // var mediaSource = new window.MediaSource();
            // //var videoElement = this.$refs.video;
            // var sourceBuffer;
            // var queue = [];
            // //videoElement.src = window.URL.createObjectURL(mediaSource);
            // mediaSource.addEventListener('sourceopen', function (e) {
            //     console.log('source open');
            //     //videoElement.play();
            //     //console.log('mediaSource.readyState', mediaSource.readyState);
            //     //window.URL.revokeObjectURL(videoElement.src);
            //     sourceBuffer = e.target.addSourceBuffer('video/webm; codecs="vp8,vorbis"');
            //     if (sourceBuffer.mode === 'segments') {
            //         sourceBuffer.mode = 'sequence';
            //     }
            //     sourceBuffer.addEventListener('updatestart', function () {
            //         console.log('sourceBuffer updatestart');
            //     });
            //     sourceBuffer.addEventListener('update', function () {
            //         console.log('sourceBuffer update');
            //         if (queue.length > 0 && !sourceBuffer.updating) {
            //             sourceBuffer.appendBuffer(queue.shift());
            //         }
            //     });
            //     sourceBuffer.addEventListener('updateend', function () {
            //         console.log('sourceBuffer updateend', mediaSource.readyState);
            //         //mediaSource.endOfStream();
            //         //videoElement.play();
            //     });
            //     sourceBuffer.addEventListener('error', function (e, b, c) {
            //         console.log('sourceBuffer error', mediaSource.readyState);
            //     });
            // }, false);

            // mediaSource.addEventListener('sourceended', function(e) { console.log('sourceended: ' + mediaSource.readyState); });
            // mediaSource.addEventListener('sourceclose', function(e) { console.log('sourceclose: ' + mediaSource.readyState); });
            // mediaSource.addEventListener('error', function(e, b, c) {
            //     console.log('mediaSource error: ' + mediaSource.readyState);
            // });
            
            socket.on('open:video', function(data) {
                console.log('open:video');
                // var blob = new window.Blob([data.stream]);
                // _this.videoSrc = window.URL.createObjectURL(blob);
                // _this.showVideo(data.userEmail, blob);
                // if (sourceBuffer.updating || queue.length > 0) {
                //     console.log('queue push');
                //     queue.push(data.stream);
                // } else {
                //     console.log('appendBuffer');
                //     try {
                //         sourceBuffer.appendBuffer(data.stream);
                //     } catch (e) {
                //         console.log(e);
                //     }
                // }
                //console.log('video stream event, sourceBuffer status:', sourceBuffer.updating, 'data:', data.stream);
                //queue.push(data.stream);
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
        showVideo: function(email, stream) {
            if (email === this.mySelf.email) {
                return;
            }
            var src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(stream) : stream;
            this.members = this.members.map(function(member) {
                return member.email === email ? _.extend({}, member, {videoStreamSrc: src}) : member;
            });
        },
        openVideo: function() {
            var _this = this;

            //视频连接
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia = getUserMedia.bind(navigator);
            getUserMedia({
                //audio: true,
                video: true
            }, function(stream) {
                /*_this.selfvideosrc = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(stream) : stream;*/
                var mediaRecorder = new window.MediaRecorder(stream);
                //mediaRecorder.mimeType = 'video/webm';
                mediaRecorder.onstart = function(e) {
                    _this.chunks = [];
                };
                mediaRecorder.ondataavailable = function(e) {
                    console.log('video.open');
                    //var blob = new window.Blob([e.data], {type: 'video/webm; codecs="vp8,vorbis"'});
                    //_this.socket.emit('video.open', blob);
                    //console.log(e.data);
                    //_this.chunks.push(e.data);
                    //fileReader.readAsArrayBuffer(e.data);
                    var file = new File([e.data], 'msr-' + (new Date()).toISOString().replace(/:|\./g, '-') + '.webm', {
                        type: 'video/webm'
                    });
                    _this.socket.emit('video.save', file);
                };
                // mediaRecorder.onstop = function(e) {
                //     var blob = new window.Blob(_this.chunks, {type: 'video/webm; codecs="vp8,vorbis"'});
                //     _this.socket.emit('video.open', blob);
                // };

                mediaRecorder.start(5000);

                // // Stop recording after 5 seconds and broadcast it to server
                // setTimeout(function() {
                //     mediaRecorder.stop();
                // }, 5000);
            }, function(err) {
                //failFn ? failFn(err) : null;
            });
        }
    }
};
</script>