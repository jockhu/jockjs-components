/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/searchpage.js
 * @author: mingzhewang
 * @version: 1.0.0
 * @date: 2013/09/23
 *
 */

/// require('ui.ui');

(function(J){
	function searchHistory(options){
		var defaultOptions = {
			eleId: '',
			hisLength: 10,
			hisLabel: 'anjuke',
			isFocus: true,
			onShow:null,
			onHide:null,
			onTapAction:null
		},
		spId, tag, input, opts;
		(function(){
			opts = J.mix(defaultOptions, options || {}, true);
			spId = J.g(opts.eleId);
			tag = spId.up().attr('searchTag') || opts.hisLabel;
			input = spId.s('input').eq(0);
			bindEvent();
		}());
		function htmlencode(s) {
	    	var div = document.createElement('div');
	    	div.appendChild(document.createTextNode(s));
	    	return div.innerHTML;
	    }
		//历史记录的存储过程
		function getStorage(l){
			if(localStorage){
				var tempArray, history = localStorage[l]?localStorage[l]:0;
				if(history == 0) return {length:0,content:'',array:0};
				tempArray = (history.substr(1,history.length - 2)).split(',');
				return {length:tempArray.length,content:history,array:tempArray};
			}
		}
		function setStorage(l,v){
			try{
				if(v == '') return;
	        	var value = htmlencode(v.replace(',',''));
	        	//',q,w,e,r,t,y,'
	        	var oldHistory = getStorage(l);
                if(!localStorage) return;
	        	if(oldHistory.length == 0){
	            	localStorage[l] = ',' + value + ',';
	        	}else{
	            	localStorage[l] = checkValue(oldHistory.content, value, oldHistory.length);
	        	}
	    	}
	    	catch(e){}
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
		function getHistory(){
	        var newArray = new Array(),hisArray = getStorage(tag);
	        if(hisArray.length == 0){
	            return '';
	        }else{
	            for(var i= 0;i<hisArray.length;i++){
	                newArray.push(hisArray.array[i]);
	            }
	            return newArray.reverse();
	        }
		}
		function setHistory(v){
			if(v!='') setStorage(tag, v);
		}
		function bindEvent(){
			var cancelBtn = spId.s('a').eq(0), searchBtn = spId.s('i').eq(0);
			cancelBtn.on('click',function(){
	            hidePage();
	        }, null, true, true);
	        searchBtn.on('click',function(){
	        	onTap(input.val());
	        }, null, true, true);
	        input.get().addEventListener('keydown',function(e){
	        	if(e.keyCode==13){
	        		onTap(input.val());
	            	input.get().blur();
	        	}

	        });
		}
		function onTap(v){
			setStorage(tag, v);
			opts.onTapAction && opts.onTapAction(v);
			// hidePage();
		}
		function isFocus(){
	        if(opts.isFocus){
	            input.get().focus();
	        }
	    }
	    function showPage(){
	    	opts.onShow && opts.onShow();
	    	isFocus();
	    	input.val('');
	    }
	    function hidePage(){
	    	opts.onHide && opts.onHide();
	    }
	    function changeTag(n){
	    	tag = n;
	    }

		return {
			getHistory: getHistory,
			setHistory: setHistory,
			changeTag: changeTag,
			showPage: showPage,
			hidePage: hidePage
		};
	}
	J.ui.searchHistory = searchHistory;
})(J);