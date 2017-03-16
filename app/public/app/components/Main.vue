<template>
    <div id="chatlist">
        <Profile :mySelf="mySelf"></Profile>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Profile from './Profile.vue';
import $ from 'jquery';

module.exports = {
    data: function() {
        return {
            rooms: [],
            socket: null
        };
    },
    created: function() {
        if (!this.mySelf) {
            this.$router.push('/login');
        } else {
            this.start();
        }
    },
    components: {Profile},
    computed: mapGetters([
        'mySelf'
    ]),
    methods: {
        start: function() {
            window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
            this.userId = this.mySelf.userId;
            this.userName = this.mySelf.userName;
            //this.socket = this.openSocket();
            //this.peer = this.openPeer();
        },
        createRoom: function(opts) {
            let _this = this;
            $.ajax('./createroom', {
                type: 'post',
                data: JSON.stringify(opts)
            }).done(function(resp) {
                if (resp.status && resp.result) {
                    _this.rooms = resp.result.rooms;
                } else {

                }
            }).fail(function(err) {

            });
            //this.socket.emit('create:room', opts);
        },
        joinRoom: function(roomId) {
            $.ajax('./joinroom', {
                type: 'post',
                data: roomId
            }).done(function(resp) {
                //跳转到room路由
            }).fail(function(err) {
                //重试
            });
        }
    }
};
</script>