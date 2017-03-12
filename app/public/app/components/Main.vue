<template>
    <div id="main"></div>
</template>

<script>
    const $ = require('jquery');
    module.exports = {
        created: function() {
            let _this = this;
            $.ajax('./loginstatus').done(function(res) {
                if (res.status) {
                    if (res.result && res.result.loginstatus) {
                        _this.$router.push('/chatroom');
                    } else {
                        _this.$router.push('/login');
                    }
                }
            }).fail(function() {
                //todo
            });
        }
    };
</script>