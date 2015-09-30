define(function(require, exports, module){
	require("./message_box.css");
	var $ = require("jquery");
	var isIE = window.ActiveXObject != null;

	var rand = function(){
		return Math.round(Math.random() * 10000000000);
	};

	var scrollerWidth = null;

	function centerIt(con){
		var contentSize = getElContentSize(con);
		var bodySize = getBodySize();

		//屏幕可见区域大小
		var ah = isIE ? document.documentElement.clientHeight: window.innerHeight;
		var aw = isIE ? document.documentElement.clientWidth: window.innerWidth;
		if (!isIE) {
			if(scrollerWidth === null){
				scrollerWidth = getScrollerWidth();
			}
			aw -= scrollerWidth;
		}

		var bh = Math.min(ah, bodySize.height);
		var bw = Math.min(aw, bodySize.width);

		var docEl = GetDocumentElement();
		var sh = docEl.scrollTop;
		var sw = docEl.scrollLeft;

		var top = (bh - contentSize.height) / 2;
		if (top < 0) top = 0;

		var left = (bw - contentSize.width) / 2;
		if (left < 0) left = 0;

		con.style.left = left + 'px';
		con.style.top = top + 'px';
	}

	function getScrollerWidth() {
		var scr = null;
		var inn = null;
		var wNoScroll = 0;
		var wScroll = 0;

		// Outer scrolling div
		scr = document.createElement('div');
		scr.style.position = 'absolute';
		scr.style.top = '-1000px';
		scr.style.left = '-1000px';
		scr.style.width = '100px';
		scr.style.height = '50px';
		// Start with no scrollbar
		scr.style.overflow = 'hidden';

		// Inner content div
		inn = document.createElement('div');
		inn.style.width = '100%';
		inn.style.height = '200px';

		// Put the inner div in the scrolling div
		scr.appendChild(inn);
		// Append the scrolling div to the doc
		document.body.appendChild(scr);

		// Width of the inner div sans scrollbar
		wNoScroll = inn.offsetWidth;
		// Add the scrollbar
		scr.style.overflow = 'auto';
		// Width of the inner div width scrollbar
		wScroll = inn.offsetWidth;

		// Remove the scrolling div from the doc
		document.body.removeChild(
		document.body.lastChild);

		// Pixel width of the scroller
		return (wNoScroll - wScroll);
	}

	function getBodySize() {
		var docEl = GetDocumentElement();
		return {
			width: Math.max(docEl.clientWidth, docEl.scrollWidth),
			height: Math.max(docEl.clientHeight, docEl.scrollHeight)
		};
	}

	function getOffset(el, name) {
		if (el[name] === 0) {
			var total = 0;
			for (var i = 0, l = el.childNodes.length; i < l; i++) {
				var child = el.childNodes[i];
				if (child.nodeType == 1) total += child[name];
			}
			return total;
		} else {
			return el[name];
		}
	}

	function getElContentSize(el) {
		return {
			width: getOffset(el, "offsetWidth"),
			height: getOffset(el, "offsetHeight")
		};
	}

	function GetDocumentElement(el) {
		var DOCUMENT_TYPE = 9;
		var b;
		if (el) {
			b = el.nodeType == DOCUMENT_TYPE ? el: (el.ownerDocument || el[document]);
		} else {
			b = document;
		}
		if (isIE && b.compatMode != "CSS1Compat") {
			return b.body;
		}
		return b.documentElement;
	}

    /**
      @class
      @name Messagebox
      @constructor
      @param {Object} option
     */
     var Messagebox  = function (option){
		if (!this.element) this.initialize(option);
     };

	/**
     * 初始化
     */
	Messagebox.prototype.initialize = function(option) {
		if (document.body) {
			if (option && option.id) {
				this.id = option.id;
				Messagebox.Map.reg(this);
			}

			var container = document.createElement("div");
			container.id = "messagebox_" + Math.round(Math.random() * 1000000);
			container.style.position = "fixed";
			container.style.top = 0;
			container.style.left = 0;
			container.style.visibility = "hidden";

			document.body.appendChild(container);
			this.element = container;
		}
	};

	/**
     * 切换为最上层弹出层
     */
	Messagebox.prototype.goTop = function() {
		if (!this.isTop()) {
			if (!this.modaless) this.mask.style.zIndex = ++Messagebox.topIndex;
			this.element.style.zIndex = ++Messagebox.topIndex;
		}
	};

	function makeContainerAsMask(alpha) {
		var mask = document.createElement("div");
		mask.style.backgroundColor = "#fff";
		mask.className = "ck1Mask";
		mask.style.display = "none";
		mask.style.position = "absolute";
		mask.style.zIndex = ++Messagebox.topIndex;
		mask.style.top = '0';
		mask.style.left = '0';

		var bodySize = getBodySize();
		mask.style.width = bodySize.width + 'px';
		mask.style.height = bodySize.height + 'px';

		if(isIE){
			mask.style.filter=alpha ? "alpha(opacity=0)" : "alpha(opacity=80)";
		}else{
			mask.style.opacity = alpha ? "0" : "0.8";
		}
		document.body.appendChild(mask);
		return mask;
	}

	/**
     * 显示
     * @param {Boolean} option.modal 是否为模态,默认为是
     * @param {String|Object} option.html 内容,可为字符串或者HTML元素或者HTML元素数组
     * @param {Object} option.position x: x坐标,y: y坐标 ,element: 与指定元素的xy一致}显示的方位，默认为屏幕中间
     * @param {Boolean} option.alpha 以完全透明形式显示遮罩
     */
	Messagebox.prototype.show = function(option) {
		if(!option)option = {};
		var defaultOpt = {
			alpha: false,
			modal: true
		};
		if (!this.element) this.initialize();
		for (var p in defaultOpt) {
			if (!option.hasOwnProperty(p)) option[p] = defaultOpt[p];
		}

		this.modaless = !option.modal; //isIE6 ? false : !option.modal;
		if (!this.modaless && ! this.mask) {
			this.mask = makeContainerAsMask(option.alpha);
			var mask = this.mask;
			this.resizeMask = function() {
				var bodySize = getBodySize();
				mask.style.width = bodySize.width + 'px';
				mask.style.height = bodySize.height + 'px';
			};
			jQuery(window).bind("resize", this.resizeMask);
		}

		var con = this.element;
		con.style.display = "block";
		con.style.visibility = "hidden";

		if (!this.modaless) var mask = this.mask;
		if (option.position) {
			showAtPosition(option.position, con, mask);
		} else {
			centerIt(con);
		}

		con.style.zIndex = ++Messagebox.topIndex;
		if (!this.modaless) mask.style.display = "block";
		con.style.visibility = "visible";
	};

	/**
     * 是否为最上面的层
     */
	Messagebox.prototype.isTop = function() {
		return parseInt(this.element.style.zIndex, 10) == Messagebox.topIndex;
	};

	/**
     * 隐藏
     */
	Messagebox.prototype.hide = function(option) {
		if (!this.modaless) this.mask.style.display = "none";
		this.element.style.display = "none";
	};

	/**
     * 关闭
     */
	Messagebox.prototype.close = function() {
		try {
			var $this = this;
			if (this.closed) {
				$this = null;
				return;
			}
			this.closed = true;
			if (this.id) {
				Messagebox.Map.unreg(this);
			}
			jQuery(window).unbind("resize", this.resizeMask);
			if (!this.modaless) this.mask.parentNode.removeChild(this.mask);
			this.element.parentNode.removeChild(this.element);
			if (this.isTop()) {
				Messagebox.topIndex -= 1;
				if (!this.modaless) Messagebox.topIndex -= 1;
			}

			$this = null;
		} catch(e) {}
	};

	/**
     * 非模态?
     * @type Boolean
     */
	Messagebox.prototype.modaless = false;

	/**
     * 消息框的起始zIndex
     * @static
     * @name startIndex
     * @type Number
     */
	Messagebox.startIndex = 10000;

	/**
     * 最上层的消息框的zIndex
     * @static
     * @name topIndex
     * @type Number
     */
	Messagebox.topIndex = Messagebox.startIndex;


	/**
     * @ignore
     */
	Messagebox.makeBox = function(option) {
		if(!option)option = {};
		var box = new Messagebox(option);
		var wrap = jQuery(box.element);
		wrap.addClass("modal modal-msgbox");
		if(option.className)wrap.addClass(option.className);
		var title = option.title || "&nbsp;";
	    var html = ['<div class="modal-header">'];
	    if(!option.noClose){
			html.push('   <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
		}
		html.push('   <h3>'+title+'</h3>');
		html.push('</div>');
		html.push('<div class="modal-body">');
		html.push('  <p></p>');
		html.push('</div>');
		html.push('<div class="modal-footer">');
		html.push('</div>');
		wrap.html(html.join(''));
		wrap.css("margin","0");
		return box;
	};

	/**
     * @ignore
     */
	Messagebox.splitMessage = function(msg) {
		var str = msg.split("||");
		if (str.length == 2) {
			return {
				main: str[0],
				sub: str[1]
			};
		} else {
			return {
				main: '',
				sub: msg
			};
		}
	};

	/**
     * 声明了ID的弹出层的集合
     * @type object
     * @name Map
     * @static
     */
	Messagebox.Map = {
		data: {},
		reg: function(obj) {
			if (obj.id) this.data[obj.id] = obj;
		},
		unreg: function(obj) {
			if (obj.id) delete this.data[obj.id];
		},
		get: function(id) {
			return this.data[id];
		}
	};

	/**
     * 关闭指定ID的弹出层
     * @static
     * @name close
     * @function
     * @param {String} id
     */
	Messagebox.close = function(id) {
		var obj = this.Map.get(id);
		if (obj) obj.close();
	};

	/**
     * 消息提示框
     * @static
     * @name info
     * @function
     * @param {String} msg 消息内容
     * @param {Function} callback 回调
     */
	Messagebox.info = function(msg, callback, option) {
		if (callback && typeof callback == "object") {
			option = callback;
			callback = null;
		}
		if(!option)option = {};

		var thisBox = Messagebox.makeBox(option);

		var ensureBtn = $("<a></a>").attr("href","javascript:;").addClass("btn").text("确定");
		ensureBtn.click(function(){
			thisBox.close();
			callback && callback();
		});

		$("p", thisBox.element).html(msg.replace(/\n/g,"<br/>"));
		$(".modal-footer", thisBox.element).append(ensureBtn);

		$(".close", thisBox.element).click(function(){
			thisBox.close();
		});

		option.alpha = true;

		thisBox.show(option);

		ensureBtn.focus();
	};

	/**
     * 自动关闭的消息框
     * @static
     * @name qinfo
     * @function
     * @param {String} msg 消息内容
     * @param {Number} seconds 自动关闭的等待时间(秒)
     * @param {Function} callback 回调
     */
	Messagebox.qinfo = function(msg, seconds, callback) {
		var DEFAULT_CLOSE_DELAY = 1.5;

		var s = parseInt(seconds, 10);
		if (isNaN(s)) s = DEFAULT_CLOSE_DELAY;

		var thisBox = Messagebox.makeBox();

		$("p", thisBox.element).html(msg.replace("\n","<br/>"));

		thisBox.show({
			alpha: true
		});

		setTimeout(function() {
			thisBox.close();
			if (typeof(callback) == "function") callback();
		}, s * 1000);
	};

	/**
     * 错误、失败消息提示框
     * @static
     * @name error
     * @function
     * @param {String} msg 消息内容
     * @param {Function} callback 回调
     */
	Messagebox.error = function(msg, callback, option) {
		if (callback && typeof callback == "object") {
			option = callback;
			callback = null;
		}

		if(!option)option = {};
		option.className = "modal-icon modal-error";
		Messagebox.info(msg, callback, option);
	};

	/**
     * 警告消息提示框
     * @static
     * @name warning
     * @function
     * @param {String} msg 消息内容
     * @param {Function} callback 回调
     */
	Messagebox.warning = function(msg, callback, option) {
		if (callback && typeof callback == "object") {
			option = callback;
			callback = null;
		}

		if(!option)option = {};
		option.className = "modal-icon modal-warning";
		Messagebox.info(msg, callback, option);
	};

	Messagebox.success = function(msg, callback, option) {
		if (callback && typeof callback == "object") {
			option = callback;
			callback = null;
		}

		if(!option)option = {};
		option.className = "modal-icon modal-success";
		Messagebox.info(msg, callback, option);
	};

	Messagebox.dialog = function(option){
		if(!option)option = {};
		if(!option.hasOwnProperty("autoShow"))option.autoShow = true;
		var thisBox = Messagebox.makeBox(option);
		var wrap = $(thisBox.element);
		wrap.addClass("modal-dialog");

		var btns = option.buttons || [];
		var footer = wrap.children(".modal-footer");
		for(var i=0,l=btns.length; i<l; i++){
			var btnOption = btns[i];
			var abtn = $("<input />",{type: btnOption.type || "button", value: btnOption.text}).addClass("btn");

			if(btnOption.className){
				abtn.addClass(btnOption.className);
			}

			(function(abtn, click, thisBox){
				abtn.click(function(){
					if(!click){
						thisBox.hide();
					}else{
						click.call(this, thisBox);
					}
				});
			})(abtn, btnOption.click, thisBox);

			footer.append(abtn);
		}


		$(".close", thisBox.element).click(function(){
			thisBox.hide();
		});

		thisBox.setContent = function(html){
			$(".modal-body", this.element).html(html);
		};

		if(option.content){
			thisBox.setContent(option.content);
		}else if(option.contentElement){
			wrap.children(".modal-body").append($(option.contentElement));
		}

		if(!option.hasOwnProperty("alpha")){
			option.alpha = true;
		}

		if(option.autoShow){
			thisBox.show(option);
		}

		return thisBox;
	};


	/**
     * 选择对话框
     * @static
     * @name confirm
     * @function
     * @param {String} msg 消息内容
     * @param {Function} ensureFn click ensure 回调
     * @param {Function} esc click escape 回调
     */
	Messagebox.confirm = function(msg, ensureFn, escFn, option) {
		var args = arguments;
		if (ensureFn && typeof ensureFn == "object") {
			return Messagebox.confirm(msg, null, null, args[1]);
		}
		if (escFn && typeof escFn == "object") {
			return Messagebox.confirm(msg, ensureFn, null, args[2]);
		}

		if(!option)option = {};

		var thisBox = Messagebox.makeBox(option);

		var ensureBtn = $("<a></a>").attr("href","javascript:;").addClass("btn btn-primary").text("确定");
		ensureBtn.click(function(){
			thisBox.close();
			ensureFn && ensureFn();
		});

		var escapeBtn = $("<a></a>").attr("href","javascript:;").addClass("btn").text("取消");
		escapeBtn.click(function(){
			thisBox.close();
			escFn && escFn();
		});

		$(".close", thisBox.element).remove();

		$("p", thisBox.element).html(msg.replace("\n","<br/>"));

		$(".modal-footer", thisBox.element).append(ensureBtn).append(escapeBtn);

		$(thisBox.element).keypress(function(event) {
			if (event.keyCode == 27) {
				escapeBtn.click();
			}
		});

		option.alpha = true;

		thisBox.show(option);

		ensureBtn.focus();
	};

	exports.Messagebox = Messagebox;
});
