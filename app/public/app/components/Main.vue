<template>
    <div id="chatlist">
        <Profile :mySelf="mySelf"></Profile>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Profile from './Profile.vue';
import style from '../style/common.less';

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
            this.$router.push('/rooms');
        }
    },
    components: {Profile},
    computed: mapGetters([
        'mySelf'
    ]),
    methods: {
        start: function() {
        }
    }
};
</script>