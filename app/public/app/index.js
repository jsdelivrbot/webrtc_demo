//import 'babel-polyfill';
import Vue from 'vue';
import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
import Main from './components/Main.vue';
import RoomList from './components/RoomList.vue';
import Room from './components/Room.vue';
//import Signup from './components/Signup.vue';
import VueRouter from 'vue-router';
//import $ from 'jquery';

import store from './store/store';

Vue.use(VueRouter);

const routes = [
    {
        path: '/', component: Main,
        children: [
            {
                // 当 /user/:id/profile 匹配成功，
                // UserProfile 会被渲染在 User 的 <router-view> 中
                path: '/',
                component: RoomList
            },
            {
                // 当 /user/:id/posts 匹配成功
                // UserPosts 会被渲染在 User 的 <router-view> 中
                path: ':id',
                component: Room
            }
        ]
    },
    {path: '/login', component: Login},
    {path: '/signup', component: Signup}
];

const router = new VueRouter({
    mode: 'history',
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