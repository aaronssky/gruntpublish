define(function(require, exports, module) {
    var $ = require("jquery");
    require("jq_validate");
    $.extend($.validator.defaults, {
        highlight: function(element) {
            $(element).closest('.control-group').removeClass('success').addClass('error');
        },
        success: function(element) {
            element.addClass('valid').closest('.control-group').removeClass('error');
        }
    });
});