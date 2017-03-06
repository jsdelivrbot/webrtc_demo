//import 'babel-polyfill';
import Vue from 'vue';
import ChatList from './components/ChatList.vue';

new Vue({
    el: '#app',
    render: h => h(ChatList)
});