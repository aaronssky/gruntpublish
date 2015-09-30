define(function(require, exports, module) {
	var jQuery = require("jquery");
	var mbox = require("../widget/message_box").Messagebox;


    var sayswho = (function(){
        var ua= navigator.userAgent, tem, 
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\bOPR\/(\d+)/)
            if(tem!= null) return 'Opera '+tem[1];
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();

    navigator.browser_name = sayswho.split(" ")[0];
    navigator.browser_version = sayswho.split(" ")[1];

    /**
     * 启用onceError函数
     * @link ck1.onceError
     * @type Boolean
     */
    $onceErrorOpened = false;


    module.exports = {
        /**
         * 对象成员复制
         * 复制源对象的成员到目标对象中,如果目标存在同名成员,则覆盖
         * @param {Object} src 源对象
         * @param {Object} dst 目标对象
         */
        extend: function(dst, src) {
            for (var p in src) {
				if(src.hasOwnProperty(p))dst[p] = src[p];
            }
            return dst;
        },

        /**
         * 弹出一个居中浮动层
         * @description 自动为内容中的a.close a.btnClose绑定关闭动作
         * @param {Object} opt
         * @param {String} opt.url  获取内容的url
         * @param {String} opt.html 显示的内容，此参数优先于opt.url
         * @param {Function} opt.success 加载完成后的回调function(String:content, Messagebox:msgbox)，可选
         * @param {Boolean} opt.modal 是否显示遮罩层，默认显示，可选
         * @param {Number} opt.time 指定时间（毫秒）后自动关闭时间，未设置时不自动关闭, 可选
         * @param {String} opt.id 指定浮动层的id, 可选, ck1.close(id)关闭此浮动层
         */
        popup: function(opt) {
            var def_opt = {
                modal: true
            };
            opt = this.extend(def_opt, opt);

            var msgbox = opt.id ? (this.getBox(opt.id) || new mbox({
                id: opt.id
            })) : (new mbox());

            var show = function(html) {
                    var args = {
                        html: html,
                        modal: opt.modal
                    };
                    msgbox.show(args);

                    jQuery("a.close,a.btnClose", msgbox.element).click(function(e) {
                        /*e.preventDefault();*/
                        msgbox.close();
                    });
                    //ck1.initWidget(msgbox.element);

                    if (!isNaN(opt.time)) {
                        window.setTimeout(function() {
                            msgbox.close();
                        }, opt.time);
                    }

                    if (typeof(opt.success) == "function") {
                        opt.success(html, msgbox);
                    }
                };

            if (typeof opt.html == "string") {
                if (opt.html.replace(/[\n\r ]/g, '') === '') {
                    msgbox.close();
                    ck1.warning("显示内容为空");
                } else {
                    show(opt.html);
                }
            } else if (opt.url) {
                jQuery.ajax({
                    url: opt.url,
                    method: "GET",
                    success: function(data, type) {
                        show(data);
                    }
                });
            }
        },

        /**
         * 显示等待动画
         * @param {String} content 动画下面要显示的文字，默认为：数据载入中...
         */
        loading: function(content) {
            if (!window.$loading) {
                /**
                 * 全局的等待浮动层
                 * @name $loading
                 * @type mbox
                 */
                window.$loading = new mbox();
                var wrap = jQuery(window.$loading.element);
                wrap.html("<div><img src='http://pic.chukou1.com/0/0_8a6502.gif'  /><h3 style='display:inline;margin-left:10px'>数据载入中...</h3></div>");
            }
            if (content) jQuery("h3", window.$loading.element).html(content);
            window.$loading.show({
                modal: true
            });
        },

        /**
         * 局部更新
         * @param {String} url 获取内容的地址
         * @param {Element} el 要更新的元素
         * @param {Function} callback 更新后的回调函数
         */
        load: function(url, el, callback) {
            jQuery.post(url, function(data) {
                jQuery(el).html(data);
                if (typeof callback == "function") callback();
            });
        },

        /**
         * 隐藏等待动画
         */
        unloading: function() {
            if (window.$loading) {
                window.$loading.hide();
            }
        },

        /**
         * 弹出普通消息提示框(成功操作提示...)
         * ck1.info("hello", {"title": "title"})
         * ck1.info("hello", callback, {"title": "title"})
         * @param {String} msg 消息内容
         * @param {Function} callback 点击确定后的回调
         * @param {Object} option 选项
         */
        info: function(msg, callback) {
            mbox.info.apply(mbox.info, arguments);
        },

		dialog: function(option){
            if(!option.id){
                option.id = "ck1Popup_" + this.random();
                this.popupId = option.id;
            }
            return mbox.dialog.apply(mbox.dialog, arguments);
		},

        /**
         * 弹出指定时间后自动关闭的消息框
         * @param {String} msg 消息内容
         * @param {Number} seconds 时间秒
         * @param {Function} callback 关闭消息框后回调函数
         */
        qinfo: function(msg, seconds, callback) {
            mbox.qinfo.apply(mbox.qinfo, arguments);
        },

        /**
         * 弹出错误消息框(前端后端代码执行错误引起的操作失败...)
         * @param {String} msg 消息内容
         * @param {Function} callback 点击确定后的回调
         * @param {Object} option 选项
         */
        error: function(msg, callback) {
            mbox.error.apply(mbox.error, arguments);
        },

        /**
         * 弹出警告消息框(表单验证，G币不足，体力不足...)
         * @param {String} msg 消息内容
         * @param {Function} callback 点击确定后的回调
         * @param {Object} option 选项
         */
        warning: function(msg, callback) {
            mbox.warning.apply(mbox.warning, arguments);
        },

        alert: function(msg, callback){
            mbox.warning.apply(mbox.warning, arguments);
        },

        success: function(msg, callback) {
            var alertEl = jQuery('<div class="alert alert-success alert-lite"><button type="button" class="close" data-dismiss="alert">×</button></div>')
                .append(msg).appendTo(document.body);
                
            alertEl.find(".close").click(function(){
                $(this).parent().remove();
            });

            callback && callback();
        },

        /**
         * 弹出确认对话框
         * @param {String} msg 消息内容
         * @param {Function} ensureFn 点击确定的回调
         * @param {Function} escFn    点击消后的回调
         */
        confirm: function(msg, ensureFn, escFn) {
            mbox.confirm.apply(mbox.confirm, arguments);
        },


		confirmEvent : function(event){
			var trigger  = $(this);

			if(trigger.data("yes") === "yes"){
				trigger.data("yes", "");
                if(this.nodeName.toLowerCase() == "a"){ //hack asp.net __doPostBack()
                    var href = trigger.attr("href");
                    var jshead = "javascript:";
                    if(href.match(jshead)){
                        eval(href.substr(jshead.length));
                    }
                }
				return true;
			}

			var option = {};

            var title = trigger.data('title');
            if(!title){title = trigger.attr("title"); }
            if(!title && this.nodeName){
                switch(this.nodeName.toLowerCase()){
                    case "input":
                        title= trigger.val();
                        break;
                    case "button":
                    case "a":
                        title = trigger.text();
                        break;
                }
            }
			if(title)option.title = title;

			mbox.confirm(trigger.data("confirm"), function(){
				trigger.data("yes","yes")[event.type]();
			}, function(){
				event.stopImmediatePropagation(); //停止绑定到触发元素的其他处理函数
				event.stopPropagation(); //停止事件冒泡
			}, option);

			event.preventDefault();
            event.stopImmediatePropagation(); //阻止后面的事件处理函数
            event.stopPropagation(); //阻止事件冒泡
		},


        /**
         * 同时只显示一个的错误消息框
         */
        onceError: function(msg) {
            if (!$onceErrorOpened) {
                this.error(msg, function() {
                    $onceErrorOpened = false;
                });
                $onceErrorOpened = true;
            }

        },

        /**
         * 初始化自定义UI
         * @param {jQuerySelExp} parentEl 初始化目标,默认为body
         */
        initWidget: function(parentEl) {
			var ck1 = this;
            if (!parentEl) parentEl = document.body;
        },

        /**
         * 返回一个随机数
         * @returns {Number} random
         */
        random: function() {
            return Math.round(Math.random() * 10000000000);
        },



        /**
         *以Iframe的形式弹出一个浮动层
         * @param {String} url
         * @param {Number} width, 默认600
         * @param {Number} height, 默认300
         * @param {Boolean} modal, 默认非模态
         */
        popupIframe: function(option) {
            var ck1  = this;
            if(ck1.popupId){
                var p = ck1.getBox(ck1.popupId);
                p && p.close && p.close();
            }

            var defaultOpt = {
                width: '500',
                height: '300',
                title: '',
                modal: false
            };
            option = ck1.extend(defaultOpt, option);

            option.contentElement = $("<iframe></iframe>",{
                css: {
                    width: option.width + 'px',
                    height: option.height + 'px'
                },
                frameborder: '0',
                scrolling: 'auto',
                allowtransparency: 'true',
                src: option.url,
                name: 'popupIframe'
            });

			delete option.width;
			delete option.height;
			delete option.url;

            if(!option.id){
                option.id = "ck1Popup_" + ck1.random();
            }

            ck1.popupId = option.id;

            var dialog = ck1.dialog(option);
            dialog.hide = dialog.close;
            return dialog;
        },
        closePop: function(){
            if(this.popupId){
                var p = this.getBox(this.popupId);
                p && p.close && p.close();
                delete this.popupId;
            }
        },
        /**
         * 根据ID获取浮动层
         * @returns {mbox}
         */
        getBox: function(id) {
            return mbox.Map.get(id);
        },
        /**
         * 关闭指定浮动层
         * @param {String} id
         */
        closeWindow: function(id) {
            try {
                mbox.close(id);
            } catch (e) {}
        },
        /**
         * 局部更新并初始化自定义UI
         * @param {jQuerySelExp} target
         * @param {String} url
         * @param {Function} callback
         */
        render: function(target, url, params, callback) {
			var ck1 = this;
            if (typeof params == "function") {
                callback = params;
                params = {};
            }
            jQuery(target).load(url, params, function() {
                //ck1.initWidget(target);
                callback && callback();
            });
        }
    };
});
