/*! a1ron-assets Created by aron_阿伦 on 2015-10-09 */
define(function(require,exports,module){var a=require("jquery");require("jq_tmpl"),a.pagedList=function(b,c,d){function e(a){var b=d.pagesToDisplay,c=Math.floor(b/2),e=[],f=a.PageNumber-c;1>f&&(f=1);var g;g=f+b>a.PageCount?a.PageCount:f+b;for(var h=f;g>=h;h++)e.push(h);return{pages:e,showStartEllipses:1!=f,showEndEllipses:e[e.length-1]!=a.PageCount}}return d=a.extend({pagesToDisplay:10},d),{render:function(d){return a.tmpl(b,{pagedList:d,renderOptions:e(d),generatePageUrl:c})}}}});
