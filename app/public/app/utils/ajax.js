import $ from 'jquery';

$.ajaxSetup({
    type: 'post',
    error: function() {
        console.log();
    }
});

module.exports = $.ajax;