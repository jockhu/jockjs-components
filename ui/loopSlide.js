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
            if(!target){
                return;
            }
            this.target = target;
            this.config = config || {};
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
            var _left = this.config.left, _right = this.config.right, _this = this, _stop = true;
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

            if(J.g(_left).length){
            	J.g(_left).on("click", function(){
                    if(!!_stop){ //防止快速点击 切换太快
                        _stop = false;
                        var _left_ = -100, i, _list = _this.target.s("li");
                        _this.derection = "left";
                        _this.target.setStyle({marginLeft:_left_ + "%"});
                        for(i = 0; i < _this.config.count; i++){
                            var _cloneNode_ = _this.target.s("li").eq(_this.target.s("li").length -1).get().cloneNode(true);
                            //设置移动框切换到第二页的位置(left);
                            
                            //把克隆的最后一个节点插入到第一个节点前，作为第一个节点显示
                            _this.target.get().insertBefore(_cloneNode_, _this.target.first().get());
                            //
                            _this.target.last().remove();
                        }
                        if(_list.length == 3){
                            var _fake_cloneNode_ = _this.target.s("li").eq(1).get().cloneNode(true);
                            _this.target.append(_fake_cloneNode_);
                        }
                        //调用动画函数 默认marginLeft -100% -> 0% 
                        _this.animate(_this, function(){
                            setTimeout(function(){_stop = true;},100);
                            if(_list.length == 3){
                                _this.target.s("li").eq(3).remove();
                            }
                        });
                        
                    }
	                
	            });
            }

            if(J.g(_right).length){
            	J.g(_right).on("click", function(){
                    if(!!_stop){ //防止快速点击 切换太快
                        _stop = false;
    	                var _left_ = 0, i, _list = _this.target.s("li");
                        _this.derection = "right";
                        //调用动画函数 默认marginLeft 0% -> -100%
                        if(_list.length == 3){
                            var _fake_cloneNode_ = _this.target.s("li").eq(0).get().cloneNode(true);
                            _this.target.append(_fake_cloneNode_);
                        }
                        _this.animate(_this,function(){
                            if(_list.length == 3){
                                _this.target.s("li").eq(3).remove();
                            }
                            for(i = 0; i < _this.config.count; i++){
                                var _cloneNode_ = _this.target.s("li").eq(0).get().cloneNode(true);
                                //设置移动框切换到第二页的位置(left);
                                
                                //把克隆的最后一个节点插入到第一个节点前，作为第一个节点显示
                                _this.target.append(_cloneNode_);
                                //
                                _this.target.first().remove();
                            }

                            _this.target.setStyle({marginLeft:_left_ + "%"});
                            setTimeout(function(){_stop = true;},100);
                        });
                    }
	            });
            }
            
        },
        /*动画函数 默认marginLeft 0% -> -100% -> 0% 
        * @parm1 loopSlide *必需 组件对象
        * @parm2 callback 函数 animate 结束后调用
        */
        animate: function(_this, fn){
            var movePecent = 5, currentPecent, _de = _this.derection == "right" ? 1 : 0, _goal = 0, _st;

            if(_de){
                //往右切换为-100% -> 0%
                _goal = -100;
            }else{
                //往左切换为0% -> -100%
                _goal = 0;
            }
            currentPecent = parseInt(_this.target.getStyle("marginLeft"));
            if(currentPecent == _goal){
                if(fn){
                    fn(); //animate 结束后调用callback function
                }
                return;
            }
            if(_de){
                _this.target.get().style.marginLeft = (currentPecent - movePecent) + "%";
            }else{
                _this.target.get().style.marginLeft = (currentPecent + movePecent) + "%";
            }
            //循环调用自身知道满足退出条件, speed 缺省 10ms
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