<template>
    <ul>
        <li v-for="room in rooms" @click="requestVideo($event)" :id="room.id">
            <!-- <video :src="user.videoStreamSrc" autoplay="" id="camera_box"></video> -->
            <p class="room-name">name: {{room.name}}</p>
            <p class="room-topic">topic: {{room.topic}}</p>
        </li>
    </ul>
</template>

<script>
import { mapGetters } from 'vuex';

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
    computed: mapGetters([
        'mySelf'
    ]),
    methods: {
        start: function() {
        }
    }
};
</script>