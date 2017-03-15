<template>
    <div id="Signup">
        <form>
            <label for="email">Email</label>
            <input id="email" type="text" name="email"/>
            <label for="username">User Name</label>
            <input id="username" type="text" name="username" pattern="[A-z]{3}" required="required" />
            <label for="password">Password</label>
            <input id="password" type="password" name="password"/>
            <input @click="requestSignup($event)" type="button" value="Sign Up"/>
        </form>
        <router-link to="/login">已有账户，请登录</router-link>
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
            requestSignup: function(e) {
                let _this = this;
                let formData = $(this.$el).find('form').serialize();
                this.$store.dispatch('signup', formData).then(function(resp) {
                    _this.$router.push('/');
                }, function(err) {
                    _this.errorMsg = err.errorMsg;
                });
            }
        }
    };
</script>