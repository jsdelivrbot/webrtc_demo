<template>
    <div id="login">
        <el-form ref="form" :model="loginForm" label-position="left" label-width="100px">
            <router-link to="/signup">没有账户？加入我们</router-link>
            <el-form-item label="Email" prop="email">
                <el-input v-model="loginForm.email" placeholder="请输入有效email账户"></el-input>
            </el-form-item>
            <el-form-item label="password" prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入7位以上中英混合密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="requestLogin">Log In</el-button>
            </el-form-item>
            <p class="error-tip">{{errorMsg}}</p>
        </el-form>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import style from '../style/login.less';

    module.exports = {
        data: function() {
            var validatePass = function(str) {
                return str.match(/([A-Z]|[\d]){7}?/);
            };
            return {
                loginForm: {
                    email: '',
                    password: ''
                },
                rules: {
                    email: [
                        { required: true, message: '请输入email', trigger: 'blur' },
                        { type: 'email', message: '请输入有效email账户', trigger: 'blur,change' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { validate: validatePass, message: '请输入7位以上中英混合密码', trigger: 'blur' }
                    ]
                },
                errorMsg: ''
            };
        },
        validatePass: function() {

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