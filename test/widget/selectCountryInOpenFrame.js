define(function(require, exports, module){
    /*
    require jQuery.js
    require jQuery.UI.js
    require jQuery.UI.css
     */
    var $ = require("jquery");
    require("jqui");
    require("themes_smoothness");

    var normalCountryListData = [
        {"name":"United States","zh_name":"美国"},
        {"name":"United Kingdom","zh_name":"英国"},
        {"name":"Canada","zh_name":"加拿大"},
        {"name":"Germany","zh_name":"德国"},
        {"name":"Spain","zh_name":"西班牙"},
        {"name":"France","zh_name":"法国"},
        {"name":"Italy","zh_name":"意大利"},
        {"name":"Australia","zh_name":"澳大利亚"}
    ];

    var getCountryId;

    /**
     * 初始化函数，加载弹出窗口样式、加载窗口html标记
     * @return {[type]}
     */
    function selectCountryInOpenFrameInit(width,height,callBackFunc){
        var multiple = $(".J_selectCountryBtn").data("multiple") === true;
        if(callBackFunc){
            getCountryId = callBackFunc;
        }
        //延迟国家弹出选择窗口的加载
        setTimeout(function(){
            $("head").append('<style>#countryDialog {font-size:12px;}#countryDialog h3{font-size:15px;line-height:30px;margin: 0 0;} #countryDialog ul li{ list-style: none; margin:0 0;padding:0 0;width: 260px;line-height:20px;}.country-nav a{ font-size:14px;margin-right: 2px;} .country-nav ul li {display: inline;} .J_countryCategory>h3{border-bottom:1px solid #000; width:85%;} .normal-country ul li, #countryList ul li {float: left; } .clear{ clear:both; } a { text-decoration:none; } a:hover{ text-decoration: underline; }</style>');
            $("body").append('<div id="countryDialog" style="display:none;" title="请选择目的地国家"> <div class="" style="height:300px;"> <div class="country-nav J_country-nav"><h3 style="display:inline;">快捷筛选</h3><ul  style="display:inline;"> <li> <a href="javascript:void(0);">A</a> </li> <li> <a href="javascript:void(0);">B</a> </li> <li> <a href="javascript:void(0);">C</a> </li> <li> <a href="javascript:void(0);">D</a> </li> <li> <a href="javascript:void(0);">E</a> </li> <li> <a href="javascript:void(0);">F</a> </li> <li> <a href="javascript:void(0);">G</a> </li> <li> <a href="javascript:void(0);">H</a> </li> <li> <a href="javascript:void(0);">I</a> </li> <li> <a href="javascript:void(0);">J</a> </li> <li> <a href="javascript:void(0);">K</a> </li> <li> <a href="javascript:void(0);">L</a> </li> <li> <a href="javascript:void(0);">M</a> </li> <li> <a href="javascript:void(0);">N</a> </li> <li> <a href="javascript:void(0);">O</a> </li> <li> <a href="javascript:void(0);">P</a> </li> <li> <a href="javascript:void(0);">Q</a> </li> <li> <a href="javascript:void(0);">R</a> </li> <li> <a href="javascript:void(0);">S</a> </li> <li> <a href="javascript:void(0);">T</a> </li> <li> <a href="javascript:void(0);">U</a> </li> <li> <a href="javascript:void(0);">V</a> </li> <li> <a href="javascript:void(0);">W</a> </li> <li> <a href="javascript:void(0);">X</a> </li> <li> <a href="javascript:void(0);">Y</a> </li> <li> <a href="javascript:void(0);">Z</a> </li> </ul> </div> <div class=""> <div class="normal-country J_normal-country"> <h3>常用国家</h3> <div class="clear"></div> </div> <div id="countryList"></div> </div> </div> </div>');

            loadNoramlCountryList(normalCountryListData);
            loadCountryCategory();

            $(".J_country-nav").on("click", "a", showCountrySlide);

            $(".J_normal-country").on("change", "input.usual-country", function(){
                //同步全部国家的选中状态
                var input = $(this);
                $("input.country[data-name='"+input.data('name')+"']").prop("checked", this.checked);

                selectCountry(this, multiple);
            });

            $("#countryList").on("change", "input.country", function(){
                //同步常用国家的选中状态
                var input = $(this);
                $("input.usual-country[data-name='"+input.data('name')+"']").prop("checked", this.checked);

                selectCountry(this, multiple);
            });

            $(".J_selectCountryBtn").click(function(){
                $(".J_countryCategory").show();
                $("#countryDialog").dialog({
                    height : height,
                    width : width,
                    modal: true
                });
                selectedCountries();
            });
        },500);
    }    

    //选中国家控件中已经输入的国家，虽然不重置控件，可以保持状态，但这样就不可以在同一页面使用多次这个控件了
    function selectedCountries(){
        $("input.country:checked").prop("checked", false);
        $("input.usual-country:checked").prop("checked", false);

        var t = getTargetInput(); //表单中输入国家的控件

        var selected = $.trim(t.val().replace(/  /g, ' ').replace(/\n +/g, '\n')).split('\n');
        if(selected.length){
            for(var i=0,l=selected.length; i<l; i++){
                $("input.country[data-name='"+selected[i]+"']").prop("checked", true);
                $("input.usual-country[data-name='"+selected[i]+"']").prop("checked", true);
            }
        }
    }

    /**
     * 加载常用国家列表
     * @param  {Object} normalCountryListData [常用国家列表数组]
     * @return {[type]}
     */
    function loadNoramlCountryList(data){
        var normalCountryListHtml = '<ul>';
        for(var i = 0,l = data.length; i < l; i++){
            normalCountryListHtml += '<li><label><input type="checkbox" class="usual-country" data-zn_name="' + data[i].zh_name + '" data-name="' + data[i].name + '"/>' + data[i].zh_name + '(' + data[i].name + ')</label></li>';
        }
        normalCountryListHtml += '</ul>';
        $(".J_normal-country h3").after(normalCountryListHtml);
    }

    /**
     * [加载按照字母排列的国家分类列表]
     * @return {[type]} 
     */
    function loadCountryCategory(){
        var countryListAPI = "/Client/CommonPage/CountryList.aspx?json";
        var letterHash = {"A":1,"B":1,"C":1,"D":1,"E":1,"F":1,"G":1,"H":1,"I":1,"J":1,"K":1,"L":1,"M":1,"N":1,"O":1,"P":1,"Q":1,"R":1,"S":1,"T":1,"U":1,"V":1,"W":1,"X":1,"Y":1,"Z":1};
        $.get(countryListAPI,function(data){
            var countryListCategoryHtml = "";
            var dataLength = data.length;
            $.each(data,function(i,item){
                if(letterHash[item.name.toString().charAt(0)] == 1){
                    letterHash[item.name.toString().charAt(0)] = 0;
                    countryListCategoryHtml += "<div class='J_countryCategory J_" + item.name.toString().charAt(0) + "'><h3>" + item.name.toString().charAt(0) + "</h3>"
                    countryListCategoryHtml += "<ul>";
                    countryListCategoryHtml += "<li><label>" +  "<input class='country' data-zn_name='" + item.zh_name + "'" + "data-name='" + item.name + "' type='checkbox' />" + item.zh_name + "(" + item.name + ")</label></li>";
                    if(i+1 < dataLength && letterHash[data[i+1].name.toString().charAt(0)] == 1){
                        countryListCategoryHtml += "</ul><div class='clear'></div></div>";
                    }
                    if(i+1 == dataLength){
                        countryListCategoryHtml += "</ul><div class='clear'></div></div>";
                    }
                }else{
                    countryListCategoryHtml += "<li><label>" + "<input class='country' data-zn_name='" + item.zh_name + "'" + "data-name='" + item.name + "' type='checkbox' />" + item.zh_name + "(" + item.name + ")</label></li>";
                    if(i+1 < dataLength && letterHash[data[i+1].name.toString().charAt(0)] == 1){
                        countryListCategoryHtml += "</ul><div class='clear'></div></div>";
                    }
                }
            });
            $("#countryList").append(countryListCategoryHtml);
        });
    }

    function showCountrySlide(){
        var tag = $(this).text();
        $(".J_countryCategory").hide();
        var showCountryCategory = ".J_" + tag;
        $(showCountryCategory).show();
    }

    function getTargetInput(){
        return $("#" + $(".J_selectCountryBtn").data("countrytargetid"));
    }

    function selectCountry(input, multiple){
        //multiple = true; //测试时可开启此项，省得在弹出选择国家按钮中设置是要选择多项
        var countryTargetObj = getTargetInput();
        if(multiple){
            var selected = [];
            $("input.country:checked").each(function(){
                selected.push($(this).data("name"));
            });
            countryTargetObj.val(selected.join('\n'));
        }else{
            countryTargetObj.val($(input).data("name"));
        }

        if(!multiple){
            getCountryId && getCountryId();
        }

        countryTargetObj.keyup();

        if(!multiple){
            $("#countryDialog").dialog("close");
        }
    }

    exports.selectCountryInOpenFrameInit = selectCountryInOpenFrameInit;
});
