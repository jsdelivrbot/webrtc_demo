//import 'babel-polyfill';
import Vue from 'vue';
import Login from './components/Login.vue';
import Profile from './components/Profile.vue';
import Main from './components/Main.vue';
import ChatList from './components/ChatList.vue';
//import Signup from './components/Signup.vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {path: '/', component: Main},
    {path: '/login', component: Login},
    {path: '/profile', component: Profile},
    {path: '/chatroom', component: ChatList}
];

const router = new VueRouter({
    routes
});

new Vue({
    router
}).$mount('#app');