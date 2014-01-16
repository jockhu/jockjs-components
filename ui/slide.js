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
    function Slide(data, target,config,modal){
        this.init(data, target,config,modal);
    }

    Slide.prototype = {
        config: {
            tab: "topic_focus_tab", //轮播图切换tab div的id
            left:"focusLeftBtn",    //轮播图上左切换的按钮的id
            right:"focusRightBtn", //轮播图上右切换的按钮的id
            auto: false,            //是否自动播放
            autoSpeed: 3000,        //自动播放速度
            speed: 10,              //播放速度
            hasTab: true,           //是否需要tab切换按钮
            showLRButton: true,      //
            count: 1
        },
        init: function(data, target,config,modal){
            //判断target参数类型是否是dom，不是终止
            if(target.length < 1){
                return;
            }
            this.target = target;
            this.Div = [this.target.s(".topic_focus_div").eq(0).get(), this.target.s(".topic_focus_div").eq(1).get()];
            this.customConfig = config || {};
            this.data = data;
            this.derection = "right";
            this.config = this.extend(this.config,config);
            this.pages = Math.ceil(this.data.length / this.config.count) - 1;
            this.modalHtml = modal;
            this.initHtml(); 
            this.initData();
            if(!!this.config.hasTab){
                this.setTabs();     //设置和绑定tab切换动作
            }
            
            this.setActionButton(); //设置和绑定焦点图上左右切换动作
            if(this.config.auto){
                this.autoPlay();
            }
        },
        initHtml: function(){
            this.Div[0].innerHTML = "";
            for(var i = 0; i < this.config.count; i++){
                var _copy = this.modalHtml;
                for(var _p in this.data[i]){
                    
                    if(_p == "vip" || _p == "recommend"){
                    	if(this.data[i][_p] == 0){
                    		_copy = _copy.replace('|' + _p + '|', "display:none");
                    	}
                    }else{
                    	_copy = _copy.replace('|' + _p + '|', this.data[i][_p]);
                    }
                }
                this.Div[0].innerHTML += _copy;
            }
            
        },
        initData: function(){

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
            var _currentIndex = parseInt(this.target.attr("currentIndex")), _c, _p, _last = this.pages;
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
                if(i < _currentIndex || i == _last){
                    this.derection = "left";
                    _c = i;
                    _p = _currentIndex;

                    this.target.get().style.marginLeft = "-100%";
                }
            }
            this.setData(_c, _p);
            if(!!this.config.hasTab){
                this.sync(i);
            }
            this.animate(this);
        },
        setData: function(_c, _p){
            var _index = 0;
            for(var i = 0; i < 2; i++){
                if(i == 0){
                    _index = _c * this.config.count;
                }else{
                    _index = _p * this.config.count;
                }
                this.Div[i].innerHTML = "";
                for(var x = 0; x < this.config.count; x++){
                    var _copy = this.modalHtml;
                    if(this.data[_index+x]){
	                    for(var _pram in this.data[_index+x]){
	                        if(_p == "vip" || _p == "recommend"){
		                    	if(this.data[_index+x][_pram] == 0){
		                    		_copy = _copy.replace('|' + _pram + '|', "display:none");
		                    	}
		                    }else{
		                    	_copy = _copy.replace('|' + _pram + '|', this.data[_index+x][_pram]);
		                    }
	                    }
	                    this.Div[i].innerHTML += _copy;
                    }
                }
                
            }
            
        },
        setActionButton: function(){
            var _left = this.config.left, _right = this.config.right, _this = this;
            if(this.config.showLRButton){
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
            }
            if(J.g(_left)){
            	J.g(_left).on("click", function(){
	                var _index = parseInt(_this.target.attr("currentIndex")), _last = _this.pages;
	                _this.target.attr("currentIndex", _index);
	                _this.derection = "left";
	                _index--;
	                if(_index < 0){
	                    _index = _last;
	                }
	                _this.setImgs(_index);
	            });
            }

            if(J.g(_right)){
            	J.g(_right).on("click", function(){
	                var _index = parseInt(_this.target.attr("currentIndex")), _last = _this.pages;
	                _this.target.attr("currentIndex", _index);
	                _this.derection = "right";
	                _index++;
	                if(_index > _last){
	                    _index = 0;
	                }
	                _this.setImgs(_index);
	            });
            }
            
        },
        animate: function(_this){
            var movePecent = 5, currentPecent, _de = _this.derection == "right" ? 1 : 0, _goal = 0, _st;

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

    J.ui.slide = function(data, target, config, modal){
        return new Slide(data, target, config, modal);
    }

 })(J, document);