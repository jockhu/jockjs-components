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
    function Tab(){

        var
            //当前的经纪人ID
            currentBrokerId = 0;

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject
         */
        function show(brokerObject){
            
        }

        /**
         * 隐藏和经纪人的对话tab
         * @param brokerObject
         */
        function hide(brokerObject){

        }

        /**
         * 移除和经纪人的对话tab
         * @param brokerObject
         */
        function remove(brokerObject){

        }

        /**
         * 更新tab消息数
         * @param data
         */
        function update(data){

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
            remove:remove
        }
    }

    C.Tab = Tab;

})(J.chat);

