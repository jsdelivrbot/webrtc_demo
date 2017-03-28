<template>
    <div id="Signup">
        <el-form ref="form" :rules="rules" :model="signUpForm" label-position="left" label-width="100px">
            <router-link to="/login">已有账户，请登录</router-link>
            <el-form-item label="Email" prop="email">
                <el-input v-model="signUpForm.email" placeholder="请输入有效email账户"></el-input>
            </el-form-item>
            <el-form-item label="Nick Name" prop="username">
                <el-input v-model="signUpForm.username" placeholder="请输入您的昵称"></el-input>
            </el-form-item>
            <el-form-item label="password" prop="password">
                <el-input v-model="signUpForm.password" type="password" placeholder="请输入7位以上中英混合密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="requestSignup">Sign Up</el-button>
            </el-form-item>
            <p class="error-tip">{{errorMsg}}</p>
        </el-form>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import style from '../style/login.less';
    import validate from '../utils/validate';

    module.exports = {
        data: function() {
            return {
                signUpForm: {
                    email: '',
                    username: '',
                    password: ''
                },
                rules: {
                    email: validate.email,
                    username: validate.username,
                    password: validate.password
                },
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
                this.$store.dispatch('signup', this.signUpForm).then(function(resp) {
                    _this.$router.push('/');
                }, function(err) {
                    _this.errorMsg = err.errorMsg;
                });
            }
        }
    };
</script>