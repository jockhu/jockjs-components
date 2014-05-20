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
    function Tab(_brokerObject){

        var brokerObject, dom, tabContainer = J.chat.container.tabContainer;

        ;(function(){
            brokerObject = _brokerObject; console.log(_brokerObject);
            var opts = brokerObject.getOpts(); console.log('opts:'); console.log(opts);
            dom = createElement(opts.id, opts.name, opts.count);
        })();


        /**
         * type priveate
         */
        function bindEvent(){
            dom.on('click', function(e){
                var e = e || window.event, eventTarget = e.target || e.srcElement;
                if(eventTarget.className == 'btn_close') {  //关闭tab
                    C.remove(brokerObject);//???????????????????????
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
            var dom = J.create("li",{
                className:'now'
            });
            dom.attr('brokderId', id);

            var html = '<em class="tab_l"></em><strong class="name">' + name + '</strong><em class="tab_r"></em>' +
                '<a href="javascript:void(0);" class="btn_close" title="关闭"></a>' +
                '<span class="tip">' + num + '</span>';

            dom.html(html);
            tabContainer.append(dom);
            bindEvent();
            return dom;
        }

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject
         */
        function show(){
            //同时将未读消息数隐藏
            var tip = dom.s(".tip").eq(0);
            tip.setStyle('display', 'none');
            dom.addClass('now');
        }

        /**
         * 隐藏和经纪人的对话tab
         * @param brokerObject
         */
        // function hide(){
        //     dom.removeClass('now');
        // }

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
            var tip = dom.s(".tip").eq(0);
            new_msg_count = parseInt(new_msg_count) > 99 ? '99+' : data;
            tip.html(new_msg_count);
            tip.setStyle('display', 'block');
            update = function(new_msg_count){
                new_msg_count = parseInt(new_msg_count) > 99 ? '99+' : data;
                tip.html(new_msg_count);
                tip.setStyle('display', 'block');
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
            show: show,
            // hide: hide,
            remove: remove,
            update: update
        }
    }

    C.Tab = Tab;

})(J.chat);

