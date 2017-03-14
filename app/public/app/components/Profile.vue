<template>
    <div id="profile">
        <p>{{mySelf ? mySelf.userName : ''}}</p>
        <input @click="requestLogout($event)" type="button" value="logout"/>
        <p class="error-tip">{{errorMsg}}</p>
    </div>
</template>

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