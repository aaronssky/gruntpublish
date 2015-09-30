/*
 * 动态表格，根据设定好的表头来动态创建表格
 * setInPutTable(tr_selector, defa_row, botton_selector),tr_selector为表头行tr的id，如"#title"；
 * defa_row为默认创建的行数；botton_selector为增加按钮的id，如"#add"。
 * 每个单元格id为行号及列号构成，如r1c1
 * 
 */
 define(function(require, exports, module){
	var $ = require("jquery");
	
	function setInPutTable(tr_selector, defa_row, botton_selector) {
		$(botton_selector).click(function () {
			addRow(tr_selector);
			return false;
		});
		for(var n = 1; n <= defa_row; n++) {
			$(botton_selector).click();
		}
	}

	function addRow(tr_selector) {
		var col_amount = $("#dataTable tr:first td").length;
		var num = $("#dataTable tr").length;
		var content = "<tr id='row" + num + "'>";
		for(var n = 1; n < col_amount; n++) {
			var temp = "#dataTable tr:first td:eq(" + (n - 1) + ")";
			if($(temp).attr("class") != undefined) {
				content += "<td><input type='text'";
				content += "class=" + "'" + $(temp).attr("class") + "'";
			} else {
				content += "<td><input type='text'";
			}
			var id_text = "r" + num + "c" + n;
			content += "id=" + "'" + id_text + "'";
			content += "/>" + "</td>";
		}
		content += "<td><label class='dynamicDelBtn' style='cursor:pointer;text-decoration:underline;text-align:center;display:block'>删除</label></td></tr>";
		$("#dataTable tr:last").after(content);
		
	}

	$("#dataTable").on("click", ".dynamicDelBtn",function () {
		$(this).parent().parent().remove();
	});
		
	exports.setInPutTable = setInPutTable;
 });
