<template>
    <div id="app"></div>
</template>

<script>
    const $ = require('jquery');
    module.exports = {
        created: function() {
            $.ajax('./loginstatus').done(function(res) {
                if (res.status) {
                    if (res.result && res.result.loginstatus) {
                        this.$router.push('/chatroom');
                    } else {
                        this.$router.push('/login');
                    }
                }
            }).fail(function() {
                //todo
            });
        }
    };
</script>