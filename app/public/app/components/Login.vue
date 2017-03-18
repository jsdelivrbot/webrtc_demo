<template>
    <div id="login">
        <form>
            <label for="email">Email</label>
            <input id="email" type="text" name="email"/>
            <label for="username">User Name</label>
            <input id="username" type="text" name="username"/>
            <label for="password">Password</label>
            <input id="password" type="password" name="password"/>
            <input @click="requestLogin($event)" type="button" value="Log In"/>
        </form>
        <router-link to="/signup">没有账户？加入我们</router-link>
        <p class="error-tip">{{errorMsg}}</p>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import $ from 'jquery';

    module.exports = {
        data: function() {
            return {
                errorMsg: ''
            };
        },
        computed: mapGetters([
            'mySelf'
        ]),
        created: function() {
            if (this.mySelf) {
                this.$router.push('/');
            }
        },
        methods: {
            requestLogin: function(e) {
                let _this = this;
                let formData = $(this.$el).find('form').serialize();
                this.$store.dispatch('login', formData).then(function(resp) {
                    _this.$router.push('/rooms');
                }, function(err) {
                    _this.errorMsg = err.errorMsg;
                });
            }
        }
    };
</script>