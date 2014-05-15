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
        var CACHE = {},
            container,
            LOG,
            //当前的经纪人ID
            currentBrokerId;


        ;(function(){
             container = J.s(".multiple").eq(0);
        })();

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject
         */
        function show(brokerObject){
            var brokerId = typeof brokerId=='object'?brokerObject.id:brokerObject;
            var brokerObject = CACHE[brokerId];
            if(!brokerObject){
                brokerObject.container = container;
                CACHE[brokerId] = new C.Box(brokerObject);
                CACHE[brokerId].prev= CACHE[currentBrokerId];
                CACHE[currentBrokerId]&&(CACHE[currentBrokerId].next = CACHE[brokerId]);
            }
            brokerObject.show()
            currentBrokerId = brokerId;
            return brokerObject;
        }

        /**
         * 隐藏和经纪人的对话tab
         * @param brokerObject
         */
        function hide(brokerObject){
            var activeObj = CACHE[brokerObject.id];
            if(!activeObj)return false;
            activeObj.hide();
            return activeObj;
        }

        /**
         * 移除和经纪人的对话tab
         * @param brokerObject
         */
        function remove(brokerObject){
            var brokerId = brokerObject.id;
            var obj = CACHE[brokerId];
            var next = obj.next;
            var prev = obj.prev;
            obj.remove();
            next?next.show():prev.show();
            delete CACHE[brokerId];
            next&&(next.prev = prev);
            prev&&(prev.next = next);
        }


        function getActiveBrokerId(){
            return currentBrokerId;
        }

        return {
            show:show,
            remove:remove,
            getActiveBrokerId:getActiveBrokerId
        }
    }

    C.Tabs = Tabs;

})(J.chat);

