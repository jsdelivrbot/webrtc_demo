<template>
    <div id="login">
        <form>
            <label for="username">User Name</label>
            <input id="username" type="text" name="username"/>
            <label for="password">Password</label>
            <input id="password" type="password" name="password"/>
            <input v-if="type==='signup'" id="email" type="text" name="email"/>
            <input v-on:click="requestLogin($event)" type="button" v-bind:value="type==='login' ? 'Log In' : 'Sign Up'"/>
        </form>
        <a v-on:click="toggleType($event)" href="javascript:void(0);">{{type==='signup' ? '已有账户，请登录？':'没有账户？加入我们'}}</a>
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
            toggleType: function() {
                this.type = this.type === 'login' ? 'signup' : 'login';
            },
            requestLogin: function(e) {
                let _this = this;
                let url = this.type === 'login' ? loginRequestUrl : signRequestUrl;
                let formData = $(this.$el).find('form').serialize();
                $.ajax(url, {
                    type: 'post',
                    data: JSON.stringify(formData)
                }).done(function(resp) {
                    if (resp.errorMsg) {
                        _this.errorMsg = resp.errorMsg;
                    } else {
                        if (resp.loginstatus) {
                            _this.$router.push('/chatroom');
                        }
                    }
                }).fail(function(err) {
                    _this.errorMsg = 'login fail, please retry!';
                });
            }
        }
    };
</script>