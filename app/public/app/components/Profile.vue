<template>
    <div id="profile">
        <p class="username">{{mySelf ? mySelf.username : ''}}</p>
        <input class="logout-btn" @click="requestLogout($event)" type="button" value="logout"/>
        <p class="error-tip">{{errorMsg}}</p>
    </div>
</template>
<style>
    .username {
        
    }
    .logout-btn {
        
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