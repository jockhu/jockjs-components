/**
 * Aifang Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/slide.js
 * @author: John
 * @version: 1.0.0
 * @date: 2014/1/2
 *
 */

/**
 * @namespace J.ui.slide
 *
 */
 (function (J, D) {

 	/**
 	 * 滑动组件
     * Slide Function
     * @param target 
     * @param options 扩展选项
     * @constructor
     */
	function Slide(target,config){
	    this.init(target,config);
	}

	Slide.prototype = {
	    config: {
	        tab: "topic_focus_tab", //轮播图切换tab div的id
	        left:"focusLeftBtn",    //轮播图上左切换的按钮的id
	        right:"focusRightBtn", //轮播图上右切换的按钮的id
	        auto: false,            //是否自动播放
	        autoSpeed: 3000,		//自动播放速度
	        speed: 70                //播放速度
	    },
	    init: function(target,config){
	        //判断target参数类型是否是dom，不是终止
	        if(target.length < 1){
	            return;
	        }
	        this.target = target;
	        this.customConfig = config || {};
	        this.data = focusPic;
	        this.derection = "right";
	        this.config = this.extend(this.config,config);
	        var a1 = J.g("slidePanel1").get().getElementsByTagName("a")[0];
	        var i1 = J.g("slidePanel1").get().getElementsByTagName("img")[0];
	        var p1 = J.g("slidePanel1").get().getElementsByTagName("p")[0];
	        a1.href = this.data[0].link;
	        i1.src = this.data[0].src;
	        p1.innerHTML = this.data[0].title;
	        this.setTabs();     //设置和绑定tab切换动作
	        this.setActionButton(); //设置和绑定焦点图上左右切换动作
	        if(this.config.auto){
	        	this.autoPlay();
	        }
	    },
	    autoPlay: function(){
	    	var _this = this;
        	this.loop = window.setInterval(function(){
        		J.g(_this.config.right).get().click();
        	},_this.config.autoSpeed);
	    },
	    setTabs: function(){
	        var _html = "<ul>", _this = this;
	        for(var i = 0; i < this.data.length; i++){
	            if(i == 0){
	                _html += "<li class='actived' index='" + i + "'></li>";
	            }else{
	                _html += "<li index='" + i + "'></li>";
	            }
	        }
	        _html += "</ul>";
	        J.g(this.config.tab).html(_html);
	        J.g("topic_focus_tab").s("li").each(function(i,v){
	            v.on("click", function(){
	                var _index = parseInt(v.attr("index")), _currentIndex = parseInt(_this.target.attr("currentIndex"));
	                if(_currentIndex > _index){
	                	_this.derection = "left";
	                }else{
	                	_this.derection = "right";
	                }
	                _this.setImgs(_index);
	            });
	        });
	    },
	    sync: function(i){
	        J.g("topic_focus_tab").s("li").each(function(i,v){
	            v.removeClass("actived");
	        });
	        J.g("topic_focus_tab").s("li").eq(i).addClass("actived");
	    },
	    setImgs: function(i){
	        var _currentIndex = parseInt(this.target.attr("currentIndex")), _c, _p, _last = this.data.length - 1;
	        if(_currentIndex == i){
	            return;
	        }else{
	            this.target.attr("currentIndex",i);
	        }
	        if(this.derection == "right"){
	        	if(i > _currentIndex || i == 0){
	        		this.derection = "right";
		            _c = _currentIndex;
		            _p = i;
		            this.target.get().style.marginLeft = "0%";
	        	}
	        }else{
	        	if(i < _currentIndex || i == this.data.length - 1){
	        		this.derection = "left";
	                _c = i;
	                _p = _currentIndex;

	            	this.target.get().style.marginLeft = "-100%";
	        	}
	        }
	        // if(i > _currentIndex || (this.derection == "right" && i == 0)){
	            
	        // }else if(i < _currentIndex || (this.derection == "left" && i == this.data.length - 1)){
	        //     this.derection = "left";
	        //         _c = i;
	        //         _p = _currentIndex;

	        //     this.target.get().style.marginLeft = "-100%";
	        // }
	        var a1 = J.g("slidePanel1").get().getElementsByTagName("a")[0];
	        var i1 = J.g("slidePanel1").get().getElementsByTagName("img")[0];
	        var p1 = J.g("slidePanel1").get().getElementsByTagName("p")[0];
	        a1.href = this.data[_c].link;
	        i1.src = this.data[_c].src;
	        p1.innerHTML = this.data[_c].title;

	        var a2 = J.g("slidePanel2").get().getElementsByTagName("a")[0];
	        var i2 = J.g("slidePanel2").get().getElementsByTagName("img")[0];
	        var p2 = J.g("slidePanel2").get().getElementsByTagName("p")[0];
	        a2.href = this.data[_p].link;
	        i2.src = this.data[_p].src;
	        p2.innerHTML = this.data[_p].title;
	        this.sync(i);
	        this.animate(this);
	    },
	    setActionButton: function(){
	        var _left = this.config.left, _right = this.config.right, _this = this;
	        //绑定左右切换按钮的mouseover显示和mouseout隐藏
	        this.target.get().parentNode.onmouseover = function(){
	            J.g(_left).show();
	            J.g(_right).show();
	            window.clearInterval(_this.loop);
	        };
	        this.target.get().parentNode.onmouseout = function(){
	            J.g(_left).hide();
	            J.g(_right).hide();
	            if(_this.config.auto){
		        	_this.autoPlay();
		        }
	        };
	        J.g(_left).on("click", function(){
	            var _index = parseInt(_this.target.attr("currentIndex")), _last = _this.data.length - 1;
	            _this.target.attr("currentIndex", _index);
	            _this.derection = "left";
	            _index--;
	            if(_index < 0){
	                _index = _last;
	            }
	            _this.setImgs(_index);
	        });
	        J.g(_right).on("click", function(){
	            var _index = parseInt(_this.target.attr("currentIndex")), _last = _this.data.length - 1;
	            _this.target.attr("currentIndex", _index);
	            _this.derection = "right";
	            _index++;
	            if(_index > _last){
	                _index = 0;
	            }
	            _this.setImgs(_index);
	        });
	    },
	    animate: function(_this){
	        var movePecent = 20, currentPecent, _de = _this.derection == "right" ? 1 : 0, _goal = 0, _st;

	        if(_de){

	            _goal = -100;
	        }else{

	            _goal = 0;
	        }
	        currentPecent = parseInt(_this.target.get().style.marginLeft);
	        if(currentPecent == _goal){
	            return;
	        }
	        if(_de){
	            _this.target.get().style.marginLeft = (currentPecent - movePecent) + "%";
	        }else{
	            _this.target.get().style.marginLeft = (currentPecent + movePecent) + "%";
	        }

	         _st = setTimeout(function(){_this.animate(_this)},_this.config.speed);

	    },
	    //extend覆盖新的键值对
	    extend: function(o,n){
	        for(var p in n){
	            o[p] = n[p];
	        }
	        return o;
	    }
	}

    J.ui.slide = function(target, config){
    	return new Slide(target, config);
    }

 })(J, document);