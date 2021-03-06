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



(function(C){


    /**
     * Tab 函数
     * @returns {{show: show, remove: remove}}
     * @constructor
     */
    function Tab(brokerObject){

        var dom,
            tip,
            tabContainer = J.chat.container.tabContainer,
            closeDom;

        ;(function(){
            var opts = brokerObject.getOpts(); 
            dom = createElement(opts.id, opts.name, opts.count);
            closeDom = dom.s('.btn_close').eq(0);
            bindEvent();
        })();


        /**
         * type priveate
         */
        function bindEvent(){
            dom.on('click', function(e){
                var e = e || window.event, eventTarget = e.target || e.srcElement;
                if(eventTarget.className == 'btn_close') {  //关闭tab
                    C.tabs.remove(brokerObject);
                    return true;
                } else { //切换tab
                    C.tabs.show(brokerObject,true);
                }
            });
        }

        /**
         *
         * @param id 经济人chatid　
         * @param name　经济人姓名
         * @param num　　未读消息数
         * @returns {li|*}
         */
        function createElement(id, name, num){
            dom = J.create("li",{
                chatid:id,
                className:'now'
            });
            var html = '<em class="tab_l"></em><strong class="name">' + name + '</strong><em class="tab_r"></em>' +
                '<a href="javascript:void(0);" class="btn_close" title="关闭"></a>' +
                '<span class="tip">' + num + '</span>';

            dom.html(html);
            tabContainer.append(dom);
            return dom;
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
        }

        /**
         * 更新tab消息数
         * @param new_msg_count
         */
        function update(new_msg_count){  
            tip = tip || dom.s(".tip").eq(0);
            new_msg_count = parseInt(new_msg_count) > 99 ? '99+' : new_msg_count;
            tip.html(new_msg_count);
            if (new_msg_count > 0) {
                tip.show();
            } else if (new_msg_count == 0) {
                tip.hide();
            }
        }


        function showCloseButton(){
            closeDom.show();
        }


        function hideCloseButton(){
            closeDom.hide();
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
            showCloseButton:showCloseButton,
            hideCloseButton:hideCloseButton,
            remove: remove,
            update: update
        }
    }

    C.Tab = Tab;

})(J.chat);

