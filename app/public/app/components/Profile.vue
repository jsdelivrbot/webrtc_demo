<template>
    <div id="profile" class="clearfix">
        <p class="username">{{mySelf ? mySelf.userName : ''}}</p>
        <el-button class="logout-btn" @click="requestLogout">logout</el-button>
        <p class="error-tip">{{errorMsg}}</p>
    </div>
</template>
<style>
    .username {
        
    }
    .logout-btn {
        /*float: right;*/
    }
</style>

<script>
    module.exports = {
        props: ['mySelf'],
        data: function() {
            return {
                errorMsg: ''
            };
        },
        methods: {
            requestLogout: function(e) {
                let _this = this;
                this.$store.dispatch('logout').then(function() {
                    _this.$router.push('/login');
                }, function(err) {
                    _this.errorMsg = err.errorMsg;
                });
            }
        }
    };
</script>