/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/searchpage.js
 * @author: mingzhewang && zhiqingchen
 * @version: 1.0.0
 * @date: 2013/08/22
 *
 */

/// require('ui.ui');
(function(J){
	function searchPage(options){
	    var defaultOptions = {
	        hisLength: 10,
	        url: null,
	        isFocus: false,
	        onCancel: null,
	        onSearch: null,
	        onTapList: null,
	        onTapHisList: null,
	        onTapAction: null
	    }, opts, hList, baseDiv, firstLoad = true, sScroll;
	    var searchHead = '<div style="position:relative;padding:8px 10px 8px 55px;background-image:-webkit-gradient(linear,0 0,0 100%,from(#fafafa),to(#e2e2e2));color:#111"><form onsubmit="return false" style="display:block;margin:0;padding:0"><a style="position:absolute;text-decoration:none;height:40px;width:50px;text-align:center;font-size:16px;line-height:40px;left:5px">取消</a><input type="text" style="border-radius:3px;height:40px;border:1px solid #d9d9d9;font-size:14px;background-color:#fff;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0);-webkit-appearance:none;margin:0;padding:0 35px 0 10px;width:100%;-webkit-box-sizing:border-box" /><i style="position:absolute;width:30px;height:32px;top:12px;right:16px;background:url(\'' + J.site.info.includePrefix + '/touch/img/search.png\') no-repeat;background-size:30px"></i></form></div>';
	    (function(){
	        opts = J.mix(defaultOptions, options || {}, true);
	        if(firstLoad){
	            firstLoad = false;
	            createTemplate();
	        }
	    }.require('ui.autocomplete', 'ui.autocomplete_m_def'));
	    //历史记录的存储过程
	    function getStorage(){
	        if(localStorage){
	            var seaArray, searchHis = localStorage.searchHis ? localStorage.searchHis : 0;
	            if(searchHis == 0){
	                return {length:0,content:'',array:0}
	            }
	            seaArray = (searchHis.substr(1,searchHis.length - 2)).split(',');
	            return {length:seaArray.length,content:searchHis,array:seaArray};
	        }
	    }
	    function setStorage(value){
	        if(value == '') return;
	        var v = encodeURI(value);
	        //',q,w,e,r,t,y,'
	        var oldHistory = getStorage();
	        if(oldHistory.length == 0){
	            localStorage.searchHis = ',' + v + ',';
	        }else{
	            localStorage.searchHis = checkValue(oldHistory.content, v, oldHistory.length);
	        }
	    }
	    function checkValue(str, v, l){
	        var cStr,subStr = ',' + v + ',';
	        if(str.indexOf(subStr) == -1 && l >= opts.hisLength){
	            cStr = str.replace(/^,.*?,/,',');
	        }else{
	            cStr = str.replace(',' + v, '');
	        }
	        return (cStr + v + ',');
	    }
	    function historyArray(){
	        var newArray = new Array(),hisArray = getStorage();
	        if(hisArray.length == 0){
	            return '';
	        }else{
	            for(var i= 0;i<hisArray.length;i++){
	                newArray.push(decodeURI(hisArray.array[i]));
	            }
	            return newArray.reverse();
	        }
	    }
	    function createTemplate(){
	        var backDiv = J.create('div',{style:'display:none;position: fixed;width: 100%;height: 100%;background-color: #f4f4f4;top:0px;left:0px;z-index: 999;'}).html(searchHead);
	        backDiv.appendTo('body');
	        baseDiv = backDiv;
	        bindEvent(backDiv);
	    }
	    function bindEvent(backDiv){
	    	var cancelBtn = backDiv.s('a').eq(0), inputText = backDiv.s('input').eq(0), searchBtn = backDiv.s('i').eq(0);
	    	(opts.onCancel && cancelBtn) && cancelBtn.on('click',function(){
	        	backDiv.hide();
	            opts.onCancel();
	        }, null, true, true);
	        searchBtn.on('click',function(){
	            tapAction(backDiv, inputText, inputText.val());
	            setStorage(inputText.val());
	            opts.onSearch &&opts.onSearch();
	        }, null, true, true);
	        inputText.get().addEventListener('keydown',function(e){
	        	if(e.keyCode==13){
	            	tapAction(backDiv, inputText, inputText.val());
	            	setStorage(inputText.val());
	        	}
	        });
	        historyList(inputText, backDiv);
	        autoComplete(backDiv, inputText);	
	    }
	    function historyList(input, backDiv){
	        if(input.val() != '') {
	            autoComplete(backDiv, inputText);
	            return;
	        };
	        var hisList = '', hisArr = historyArray();
	        for(var i=0;i<hisArr.length;i++){
	            hisList = hisList + '<span style="display:block;font-size:14px;line-height:25px;color:#550c8c;padding:10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;border-bottom:1px solid #c9c9c9">' + hisArr[i] + '</span>';
	        }
	        if(hList){
	        	hList.html(hisList);
	            hList.show();
	            sScroll.refresh();
	        }else{
	            (hList = J.create('div',{id:'hisSearchList',style:'position:absolute;width:100%;height:100%'}).html('<div><div>' + hisList + '</div></div>')).appendTo(backDiv);
	        	hList = hList.down(1);
	        	sScroll = new iScroll('hisSearchList');
	        }
	        if(hisArr != ''){
		        (opts.onTapList && hList.s('span').eq(0)) && hList.s('span').each(function(i,v){
		            v.on('click',function(){
		                tapAction(backDiv, input, v.html());
		                opts.onTapHisList();
		            });
		        });
	    	}
	    }
	    function autoComplete(backDiv, input){
	        input && input.on('input',function(){
	            if(input.val() != ''){
	                if(hList) hList.hide();
	            }else{
	                historyList(input, backDiv);
	            }
	        });
	        input.autocomplete({
	            autoSubmit: false,
	            tpl: 'autocomplete_m_def',
	            dataKey: 'communities',
	            width: document.body.clientWidth,
	            boxTarget: function(){
	                return hList.up();
	            },
	            url: opts.url,
	            offset: {
	                x: -55,
	                y: -48
	            },
	            itemBuild:function(item){
	                return {
	                    l: item.name,
	                    v: item.name
	                }
	            },
	            onSelect : function(data) {
	                tapAction(backDiv, input, data.name);
	                setStorage(data.name);
	                opts.onSearch();
	            }
	        });
	    }
	    function tapAction(backDiv, input, v){
	    	backDiv.hide();
	    	hList.show();
	    	opts.onTapAction && opts.onTapAction(v);
	    }
	    function clearAutoComplete(){
	    	var autoDiv = baseDiv.s('.autocomplete_m_def').eq(0);
	    	autoDiv && autoDiv.html('');	
	    }
	    function isFocus(input){
	        if(opts.isFocus){
	            input.get().focus();
	        }
	    }
	    function showPage(){
	        if(baseDiv){
	        	var input = baseDiv.s('input').eq(0).val('');
	            baseDiv && baseDiv.show();
	            sScroll.refresh();
	            input.val('');
	            clearAutoComplete();
	            isFocus(input);
	            if(!firstLoad){
	            	historyList(input, baseDiv);	
	            }
	        }
	    }
	    function hidePage(){
	        baseDiv && baseDiv.hide();
	    }
	    //可调用的方法
	    return {
	        hisArray: historyArray,
	        showPage:showPage,
	        hidePage:hidePage
	    };
	}
	J.ui.searchpage = searchPage;
})(J);