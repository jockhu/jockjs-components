/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/tabs.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');
/// require('chat.box');

(function(C){


    /**
     * Tabs 函数
     * @returns {{show: show, remove: remove}}
     * @constructor
     */
    function Tabs(){

            //box对象的缓存集合
        var CATCH = {},
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


        return {
            show:show,
            remove:remove
        }
    }

    C.Tabs = Tabs;

})(J.chat);

