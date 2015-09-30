define(function(require, exports, module) {
    var $ = require('jquery');
	
        var g_last_update = "";

        function reload() {
            $.get("/Client/ismodify.ashx", function (data) {
                if (g_last_update == "") { 
                    g_last_update = data;
                }else if (g_last_update != data) {
                    g_last_update = data;
                    console.info(g_last_update);
                    document.location.reload();
                }
            });
        }

        //setInterval(reload, 1000);
	
	module.exports={
		reload:reload
	}
	
});
