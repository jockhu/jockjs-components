/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/tab.js
 * @author: 江仑
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');
/// require('chat.box');

(function(C){


    /**
     * Tab 函数
     * @returns {{show: show, remove: remove}}
     * @constructor
     */
    function Tab(option){

        var
            defOPts={
               brokerId:0,
               borkerName:'',
               unReadNum:0
            },
            opts,
            dom,
            //当前的经纪人ID
            currentBrokerId = 0;

        ;(function(){
            opts = J.mix(option,defOPts);
            dom = createElement(opts.broker_id,opts.brokerName,opts.unReadNum);

        })();


        /**
         * type priveate
         */
        function bindEvent(){

            dom.on('click',function(e){
                var e = e || window.event;
                if(e.target.className=='btn_close'){
                    remove();
                    return true;
                }
                show();
            });




        }

        /**
         *
         * @param id 经济人ｉｄ　
         * @param name　经济人姓名
         * @param num　　未读消息数
         * @returns {li|*}
         */
        function createElement(id,name,num){
            var dom = J.create("li",{
                className:'now'
            })
            var html ='<em class="tab_l"></em><strong class="name">'+name+'</strong><em class="tab_r"></em>' +
                '<a href="javascript:void(0);" class="btn_close" title="关闭"></a>' +
                '<span>'+num+'</span>'
            dom.html(html);
            J.g("tab_container").append(dom);
            return dom;
        }




        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject
         */
        function show(brokerObject){
            dom.addClass('now')
            return dom;
        }

        /**
         * 隐藏和经纪人的对话tab
         * @param brokerObject
         */
        function hide(brokerObject){
            dom.removeClass('now')
            return dom;
        }

        /**
         * 移除和经纪人的对话tab
         * @param brokerObject
         */
        function remove(brokerObject){
            J.un(dom)
            dom.remove();
            J.fire(opts.container,'chat:tabclick',{id:opts.id});
        }

        /**
         * 更新tab消息数
         * @param data
         */
        function update(data){
            var tip = dom.s(".tip").eq(0);
            tip.html(data);
            update=function(data){
                tip.html(data);
            }
        }

        /**
         * 向打开的所有tab发消息
         */
        function triggerEvent(){


        }

        /**
         * 设置tab的宽度
         */
        function setWidth(){

        }



        return {
            show:show,
            remove:remove,
            update:update
        }
    }

    C.Tab = Tab;

})(J.chat);

