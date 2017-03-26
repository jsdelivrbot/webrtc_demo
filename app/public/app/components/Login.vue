<template>
    <div id="login">
        <el-form ref="form" :model="loginForm" label-position="left" label-width="100px">
            <el-form-item label="Email" prop="email">
                <el-input v-model="loginForm.email"></el-input>
            </el-form-item>
            <el-form-item label="User Name" prop="username">
                <el-input v-model="loginForm.username"></el-input>
            </el-form-item>
            <el-form-item label="password" prop="password">
                <el-input v-model="loginForm.password"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="requestLogin">Log In</el-button>
            </el-form-item>
            <router-link to="/signup">没有账户？加入我们</router-link>
            <p class="error-tip">{{errorMsg}}</p>
        </el-form>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import style from '../style/login.less';

    module.exports = {
        data: function() {
            return {
                loginForm: {},
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
                this.$store.dispatch('login', this.loginForm).then(function(resp) {
                    _this.$router.push('/rooms');
                }, function(err) {
                    _this.errorMsg = err.errorMsg;
                });
            }
        }
    };
</script>