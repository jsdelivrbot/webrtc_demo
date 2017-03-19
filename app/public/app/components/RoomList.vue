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
    created: function() {
        if (!this.mySelf) {
            this.$router.push('/login');
        } else {
            this.start();
        }
    },
    computed: mapGetters([
        'mySelf'
    ]),
    methods: {
        start: function() {
            let _this = this;
            $.ajax({
                url: './getRooms',
                type: 'post'
            }).done(function(resp) {
                if (resp.errorMsg) {
                    _this.errorMsg = resp.errorMsg;
                }
                _this.rooms = resp.result;
            }).fail(function(err) {
                _this.errorMsg = err.errorMsg;
            });
        },
        showAddForm: function() {
            this.formVisible = true;
        },
        createRoom: function() {
            let _this = this;
            $.ajax({
                url: './createRoom',
                type: 'post',
                data: this.addRoomForm
            }).done(function(resp) {
                if (resp.errorMsg) {
                    _this.errorMsg = resp.errorMsg;
                    return;
                }
                _this.errorMsg = '';
                if (resp.status && resp.result) {
                    _this.formVisible = false;
                    _this.rooms.push(resp.result);
                    //_this.joinRoom(resp.result.id);
                }
            }).fail(function(err) {
                _this.errorMsg = err.errorMsg;
            });
        },
        deleteRoom: function(e) {
            e.stopPropagation();
            let _this = this;
            let roomId = e.currentTarget.id;
            $.ajax({
                url: './deleteRoom',
                type: 'post',
                data: {id: roomId}
            }).done(function(resp) {
                if (resp.errorMsg) {
                    _this.errorMsg = resp.errorMsg;
                    return;
                }
                _this.errorMsg = '';
                if (resp.status && resp.result) {
                    _this.formVisible = false;
                    _this.rooms = _this.rooms.filter(room => room.id !== roomId);
                    //_this.joinRoom(resp.result.id);
                }
            }).fail(function(err) {
                _this.errorMsg = err.errorMsg;
            });
        },
        cancelCreateRoom: function() {
            this.formVisible = false;
        },
        joinRoom: function(e) {
            let _this = this;
            let roomId = e.currentTarget.id;
            $.ajax({
                url: './joinRoom',
                type: 'post',
                data: {id: roomId}
            }).done(function(resp) {
                if (resp.errorMsg) {
                    _this.errorMsg = resp.errorMsg;
                }
                if (resp.status && resp.result) {
                    _this.$store.dispatch('setCurrentRoom', resp.result);
                    _this.$router.push('/room/' + resp.result.id);
                }
            }).fail(function(err) {
                _this.errorMsg = err.errorMsg;
            });
        }
    }
};
</script>