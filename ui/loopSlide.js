/**
 * Aifang Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/loopSide.js
 * @author: John
 * @version: 1.0.0
 * @date: 2014/1/16
 *
 */

/**
 * @namespace J.ui.loopSlide
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
    function LoopSlide(target,config){
        this.init(target,config);
    }

    LoopSlide.prototype = {
        config: {
            left:"focusLeftBtn",    //轮播图上左切换的按钮的id
            right:"focusRightBtn", //轮播图上右切换的按钮的id
            auto: false,            //是否自动播放
            autoSpeed: 3000,        //自动播放速度
            speed: 10,              //播放速度
            showLRButton: true,    //
            count: 1
        },
        init: function(target,config){
            //判断target参数类型是否是dom，不是终止
            if(target.length < 1){
                return;
            }
            this.target = target;
            this.customConfig = config || {};
            this.derection = "right";
            this.config = this.extend(this.config,config);
            this.setActionButton(); //设置和绑定焦点图上左右切换动作
            if(this.config.auto){   
                this.autoPlay();    //if set auto play to doing
            }
        },
        autoPlay: function(){
            var _this = this;
            this.loop = window.setInterval(function(){
                J.g(_this.config.right).get().click();
            },_this.config.autoSpeed);
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
	                var _left_ = -100, i;
                    _this.derection = "left";
                    _this.target.setStyle({marginLeft:_left_ + "px"});
                    for(i = 0; i < _this.config.count; i++){
                        var _cloneNode_ = _this.target.s("li").eq(_this.target.s("li").length -1).get().cloneNode(true);
                        //设置移动框切换到第二页的位置(left);
                        
                        //把克隆的最后一个节点插入到第一个节点前，作为第一个节点显示
                        _this.target.get().insertBefore(_cloneNode_, _this.target.first().get());
                        //
                        _this.target.last().remove();
                    }
                    _this.animate(_this);
	            });
            }

            if(J.g(_right)){
            	J.g(_right).on("click", function(){
	                var _left_ = 0, i;
                    _this.derection = "right";
                    _this.animate(_this,function(){
                        for(i = 0; i < _this.config.count; i++){
                            var _cloneNode_ = _this.target.s("li").eq(0).get().cloneNode(true);
                            //设置移动框切换到第二页的位置(left);
                            
                            //把克隆的最后一个节点插入到第一个节点前，作为第一个节点显示
                            _this.target.append(_cloneNode_);
                            //
                            _this.target.first().remove();
                        }
                        _this.target.setStyle({marginLeft:_left_ + "px"});
                    });
	            });
            }
            
        },
        animate: function(_this, fn){
            var movePecent = 5, currentPecent, _de = _this.derection == "right" ? 1 : 0, _goal = 0, _st;

            if(_de){

                _goal = -100;
            }else{

                _goal = 0;
            }
            currentPecent = parseInt(_this.target.getStyle("marginLeft"));
            if(currentPecent == _goal){
                if(fn){
                    fn();
                }
                return;
            }
            if(_de){
                _this.target.get().style.marginLeft = (currentPecent - movePecent) + "%";
            }else{
                _this.target.get().style.marginLeft = (currentPecent + movePecent) + "%";
            }

             _st = setTimeout(function(){_this.animate(_this, fn)},_this.config.speed);

        },
        //extend覆盖新的键值对
        extend: function(o,n){
            for(var p in n){
                o[p] = n[p];
            }
            return o;
        }
    }

    J.ui.loopSlide = function(target, config){
        return new LoopSlide(target, config);
    }

 })(J, document);