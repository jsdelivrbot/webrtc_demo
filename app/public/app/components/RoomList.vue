<template>
    <div class="room-list">
        <ul>
            <li class="c-room c-room-add" @click="showAddForm($event)">add</li>
            <li class="c-room" v-for="room in rooms" @click="joinRoom($event)" :id="room.id">
                <!-- <video :src="user.videoStreamSrc" autoplay="" id="camera_box"></video> -->
                <p class="room-name">name: {{room.name}}</p>
                <p class="room-topic">topic: {{room.topic}}</p>
                <button v-if="room.creatorEmail===mySelf.email" @click="deleteRoom($event)" :id="room.id">delete</button>
            </li>
        </ul>
        <p v-if="errorMsg" class="error-tips">{{errorMsg}}</p>
        <el-form ref="form" v-show="formVisible" :model="addRoomForm" label-position="left" label-width="180px">
            <el-form-item label="名称" prop="name">
                <el-input v-model="addRoomForm.name"></el-input>
            </el-form-item>
            <el-form-item label="主题" prop="topic">
                <el-input v-model="addRoomForm.topic"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="createRoom">提交</el-button>
                <el-button type="primary" @click="cancelCreateRoom">取消</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import io from 'socket.io-client';
import $ from 'jquery';

module.exports = {
    data: function() {
        return {
            rooms: [],
            errorMsg: '',
            socket: null,
            addRoomForm: {},
            formVisible: false
        };
    },
    mounted: function() {
        if (!this.mySelf) {
            this.$router.push('/login');
        } else {
            this.init();
        }
    },
    computed: mapGetters([
        'mySelf'
    ]),
    methods: {
        init: function() {
            this.userId = this.mySelf.userid;
            this.userName = this.mySelf.userName;
            this.socket = this.openSocket();
        },
        openSocket: function() {
            var _this = this;
            //建立与服务器的socket长连接
            var socket = io();

            socket.on('connect', function() {
                console.log('socket connect');
                socket.emit('get.rooms');
            });

            socket.on('success:get.rooms', function(rooms) {
                console.log('success:get.rooms');
                _this.rooms = rooms;
            });

            socket.on('success:create.room', function(room) {
                console.log('success:create.room', room);
                _this.rooms.push(room);
            });

            socket.on('success:delete.room', function(room) {
                console.log('success:delete.room');
                _this.rooms = _this.rooms.filter(function(_room) {
                    return _room.id !== room.id;
                });
            });

            socket.on('success:join.room', function(room) {
                console.log('success:join.room');
                _this.$router.push('/room/' + room.id, {params: {socket: _this.socket}});
            });

            return socket;
        },
        showAddForm: function() {
            this.formVisible = true;
        },
        createRoom: function() {
            this.socket.emit('create.room', this.addRoomForm);
        },
        deleteRoom: function(e) {
            e.stopPropagation();
            let roomId = e.currentTarget.id;
            this.socket.emit('delete.room', roomId);
        },
        cancelCreateRoom: function() {
            this.formVisible = false;
        },
        joinRoom: function(e) {
            let roomId = e.currentTarget.id;
            this.socket.emit('join.room', roomId);
        }
    }
};
</script>