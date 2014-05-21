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
    function Tab(brokerObject){

        var dom, tip, tabContainer = J.chat.container.tabContainer;

        ;(function(){
            var opts = brokerObject.getOpts(); 
            createElement(opts.id, opts.name, opts.count);
            bindEvent();
        })();


        /**
         * type priveate
         */
        function bindEvent(dom){
            dom.on('click', function(e){
                var e = e || window.event, eventTarget = e.target || e.srcElement;
                if(eventTarget.className == 'btn_close') {  //关闭tab
                    C.tabs.remove(brokerObject);//???????????????????????
                    return true;
                } else { //切换tab
                    C.tabs.switchTab(brokerObject);
                }
            });
        }

        /**
         *
         * @param id 经济人ｉｄ　
         * @param name　经济人姓名
         * @param num　　未读消息数
         * @returns {li|*}
         */
        function createElement(id, name, num){
            dom = J.create("li",{
                className:'now'
            });
            var html = '<em class="tab_l"></em><strong class="name">' + name + '</strong><em class="tab_r"></em>' +
                '<a href="javascript:void(0);" class="btn_close" title="关闭"></a>' +
                '<span class="tip">' + num + '</span>';

            dom.html(html);
            tabContainer.append(dom);
            // return dom;
        }

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject
         */
        function show(){
            //同时将未读消息数隐藏
            (tip || dom.s(".tip").eq(0)).hide();
            dom.addClass('now');
        }

        /**
         * 隐藏和经纪人的对话tab
         * @param brokerObject
         */
        function hide(){
             dom.removeClass('now');
        }

        /**
         * 移除和经纪人的对话tab
         * @param brokerObject
         */
        function remove(){
            J.un(dom);
            dom.remove();
            // J.fire(opts.container,'chat:tabclick',{id:opts.id});//###############################
        }

        /**
         * 更新tab消息数
         * @param new_msg_count
         */
        function update(new_msg_count){
            tip = tip || dom.s(".tip").eq(0);
            new_msg_count = parseInt(new_msg_count) > 99 ? '99+' : data;
            tip.html(new_msg_count);
            tip.show();
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
            show: show,
             hide: hide,
            remove: remove,
            update: update
        }
    }

    C.Tab = Tab;

})(J.chat);

