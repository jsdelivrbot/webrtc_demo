<template>
    <div class="error-view">
        <p class="error-msg">{{errorMsg}}</p>
    </div>
</template>

<script>
    module.exports = {
        props: ['errorMsg']
    };
</script>