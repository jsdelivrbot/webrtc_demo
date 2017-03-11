<template>
    <div id="login">
        <form>
            <lable for="username">User Name</lable>
            <input id="username" type="text" name="username"/>
            <lable for="password">Password</lable>
            <input id="password" type="text" name="password"/>
            <input v-if="type==='signup'" id="email" type="text" name="email"/>
            <input v-on:click="requestLogin($event)" type="button" v-bind:value="type==='login' ? 'Log In' : 'Sign Up'"/>
        </form>
        <button v-if="type==='signup'" id="email" type="text" name="email"></button>
        <p class="error-tip">{{errorMsg}}</p>
    </div>
</template>

<script>
    const loginRequestUrl = '/login';
    const signRequestUrl = './signup';
    const $ = require('jquery');

    module.exports = {
        data: function() {
            return {
                type: 'login', //signup
                errorMsg: ''
            };
        },
        created: function() {

        },
        methods: {
            requestLogin: function(e) {
                let url = this.type === 'login' ? loginRequestUrl : signRequestUrl;
                let formData = $(this.$el).find('form').serialize();
                $.ajax(url, {
                    type: 'post',
                    data: JSON.stringify(formData)
                }).done(function() {

                }).fail(function() {

                });
            }
        }
    };
</script>