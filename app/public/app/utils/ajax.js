import $ from 'jquery';

$.ajaxSetup({
    type: 'post',
    error: function() {
        console.log();
    }
});

export default $.ajax;