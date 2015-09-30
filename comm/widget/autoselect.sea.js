define(function(require, exports, module) {
	//
	var $ = require('jquery');
	require('jqui');
	require('./autoselect.css');
	
	$.widget("ui.autoselect", {
		options: {
			appendTo: "body",
			autoFocus: false,
			delay: 300,
			position: {
				my: "left top",
				at: "left bottom",
				collision: "none"
			},
			textAsValue: false
		},
		_collectData: function(select) {
			var data = [];
			$("option", select).each(function() {
				data.push($(this).text());
			});
			return data;
		},
		_create: function() {
			var self = this,
				select = this.element[0];

			$(select).hide();

			var opts = self.options;
			opts.minLength = 0;

			var data = self._collectData(select);
			opts.source = function(req, res) {
				var term = req.term;
				if (term === "") return res(data);
				var reg = new RegExp("^" + term, "i");
				res($.grep(data, function(value) {
					return reg.test(value);
				}));
			}

			var _change = opts.change;
			opts.change = function(event, ui) {
				var index = data.indexOf(this.value);
				if (index !== -1) {
					select.selectedIndex = index;
				}
				_change && _change.apply(this, event, ui);
			}

			var wrapper = $("<span>").addClass("ui-autoselect input-append").insertAfter(select);

			var input = $("<input>",{
				type: "text",
				value: data[select.selectedIndex],
				className: "input-small"
			})
			.appendTo(wrapper)
			.addClass("ui-autoselect-input")
			.addClass("ui-widget ui-widget-content ui-corner-left");


			$("<a>").attr("tabIndex", -1).attr("title", "Show All Items").appendTo(wrapper).button({
				icons: {
					primary: "ui-icon-triangle-1-s"
				},
				text: false
			}).removeClass("ui-corner-all").addClass("add-on ui-corner-right").click(function() {
				// close if already visible
				if (input.autocomplete("widget").is(":visible")) {
					input.autocomplete("close");
					return;
				}

				// work around a bug (likely same cause as #5265)
				$(this).blur();

				// pass empty string as value to search for, displaying all results
				input.autocomplete("search", "");
				input.focus();
			});

			$(input).autocomplete(opts);
		} //end create
	});
});