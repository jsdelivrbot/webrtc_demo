//import 'babel-polyfill';
import Vue from 'vue';
import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
//import Main from './components/Main.vue';
import ChatList from './components/ChatList.vue';
//import Signup from './components/Signup.vue';
import VueRouter from 'vue-router';
//import $ from 'jquery';

import store from './store/store';

Vue.use(VueRouter);

const routes = [
    {path: '/', component: ChatList},
    {path: '/login', component: Login},
    {path: '/signup', component: Signup}
];

const router = new VueRouter({
    mode: 'hash',
    base: __dirname,
    routes
});

new Vue({
    el: '#app',
    router,
    store,
    template: `
        <div id="app">
            <router-view class="view"></router-view>
        </div>
    `
});