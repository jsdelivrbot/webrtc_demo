<template>
    <div id="profile">
        <p>{{username}}</p>
        <input v-on:click="requestLogout($event)" type="button" value="logout"/>
        <p class="error-tip">{{errorMsg}}</p>
    </div>
</template>

<script>
    const logoutRequestUrl = './logout';
    const $ = require('jquery');
    module.exports = {
        data: function() {
            return {
                errorMsg: ''
            };
        },
        methods: {
            requestLogout: function(e) {
                $.ajax(logoutRequestUrl, {
                    type: 'get'
                }).then(function() {

                });
            }
        }
    };
</script>