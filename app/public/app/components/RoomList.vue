<template>
    <div class="room-hall">
        <div class="room-list">
            <el-card v-for="room in rooms" :data-id="room.id">
                <p class="room-topic">topic: {{room.topic}}</p>
                <div style="padding: 14px;">
                    <span class="room-name">name: {{room.name}}</span>
                    <span class="room-creator">name: {{room.creatorName}}</span>
                    <div class="bottom clearfix">
                      <time class="time">{{room.createTimeFormat}}</time>
                      <el-button class="button" @click="deleteRoom(room.id)">delete</el-button>
                      <el-button class="button" @click="gotoRoom(room.id)">join</el-button>
                    </div>
                </div>
            </el-card>
            <el-card class="c-room c-room-add">
                <p class="room-add" @click="showAddForm">Add</p>
            </el-card>
        </div>
        <p v-if="errorMsg" class="error-tips">{{errorMsg}}</p>
        <el-dialog title="新建主题房间" v-model="dialogFormVisible">
            <el-form ref="form" :rules="rules" :model="addRoomForm" label-position="left" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="addRoomForm.name"></el-input>
                </el-form-item>
                <el-form-item label="主题" prop="topic">
                    <el-input v-model="addRoomForm.topic"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelCreateRoom">取 消</el-button>
                <el-button type="primary" @click="createRoom">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import io from 'socket.io-client';
import ss from 'socket.io-stream';
import validateUtils from '../utils/validateUtils';
import dateformat from 'dateformat';
import $ from 'jquery';

module.exports = {
    data: function() {
        return {
            rooms: [],
            rules: {
                name: validateUtils.roomName,
                topic: validateUtils.roomTopic
            },
            errorMsg: '',
            addRoomForm: {},
            dialogFormVisible: false
        };
    },
    mounted: function() {
        if (!this.mySelf) {
            this.$router.push('/login');
        } else {
            this.init();
        }
    },
    beforeDestroy: function() {
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('success:get.rooms');
            this.socket.off('success:create.room');
            this.socket.off('success:delete.room');
        }
    },
    computed: mapGetters([
        'mySelf',
        'socket'
    ]),
    methods: {
        init: function() {
            this.userId = this.mySelf.id;
            this.userName = this.mySelf.userName;
            if (!this.socket) {
                this.$store.dispatch('saveSocket', io());
            } else {
                this.socket.emit('get.rooms');
            }
            this.initSocketListeners();
        },
        initSocketListeners: function() {
            var _this = this;
            let socket = this.socket;

            socket.on('connect', function() {
                console.log('socket connect');
                socket.emit('get.rooms');
            });

            socket.on('success:get.rooms', function(rooms) {
                console.log('success:get.rooms', rooms);
                _this.rooms = rooms.map(_this.mapRoomInfo);
            });

            socket.on('success:create.room', function(room) {
                console.log('success:create.room', room);
                _this.hideAddForm();
                _this.rooms.push(_this.mapRoomInfo(room));
            });

            socket.on('success:delete.room', function(room) {
                console.log('success:delete.room');
                _this.rooms = _this.rooms.filter(function(_room) {
                    return _room.id !== room.id;
                });
            });

            return socket;
        },
        showAddForm: function() {
            this.dialogFormVisible = true;
        },
        hideAddForm: function() {
            this.dialogFormVisible = false;
        },
        mapRoomInfo: function(room) {
            return Object.assign({}, room, {
                createTimeFormat: dateformat(new Date(room.createTime), 'yyyy-mm-dd HH:MM:ss')
            });
        },
        createRoom: function() {
            this.socket.emit('create.room', this.addRoomForm);
        },
        cancelCreateRoom: function() {
            this.dialogFormVisible = false;
        },
        deleteRoom: function(roomId) {
            this.socket.emit('delete.room', roomId);
        },
        gotoRoom: function(roomId) {
            this.$router.push('/room/' + roomId);
        }
    }
};
</script>