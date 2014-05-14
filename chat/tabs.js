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
            currentBrokerId = 0;


        ;(function(){
             container = J.s(".multiple").eq(0);
            Log = new Log();



        })();

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject
         */
        function show(brokerObject){
            var brokerId = typeof brokerId=='object'?brokerObject.id:brokerObject;
            var brokerObject = CACHE[brokerId];
            if(!brokerObject){
                CACHE[brokerId] = {};
                CACHE[brokerId].tab = new C.Tab(brokerObject);
                CACHE[brokerId].box = new C.Box(brokerObject);
            }
            brokerObject.tab.show();
            brokerObject.box.show()
            currentBrokerId = brokerId;
            LOG.add(brokerId);
            return brokerObject;
        }

        /**
         * 隐藏和经纪人的对话tab
         * @param brokerObject
         */
        function hide(brokerObject){
            var activeObj = CACHE[brokerObject.id];
            if(!activeObj)return false;
            activeObj.tab.hide();
            activeObj.box.hide();
            return activeObj;
        }

        /**
         * 移除和经纪人的对话tab
         * @param brokerObject
         */
        function remove(brokerObject){
            var brokerId = brokerObject.id;
            CACHE[brokerId].box.remove();
            var curId = LOG.remove(brokerId);
            curId&&show(curId);
            delete CACHE[brokerId];
        }


        function getActiveBrokerId(){
            return currentBrokerId;
        }
        /**
         * 用于记录最近开的tab
         * @param key
         * @returns {{add: add, remove: remove}}
         */
        function Log(){
            var LOG = [];
            function add(key){
                var inx = inArray(key,LOG)
                if(inx>-1){
                    LOG.splice(inx,1)
                }
                LOG.push(key);
                return key;
            }
            //删除key,返回最近打开的key
            function remove(key){
                J.each(LOG,function(k,v){
                    (v === key)&&LOG.splice(k,1)
                })

                return LOG.length ? LOG[LOG.length-1]:false;

            }

            function inArray(key,arr){
                var i,len;
                i=0;
                len = arr.length;
                for(;i<len;i++){
                    if(key === arr[i]){
                        return i;
                    }

                }
                return -1;
            }

            return {
                add:add,
                remove:remove
            }
        }







        return {
            show:show,
            remove:remove,
            getActiveBrokerId:getActiveBrokerId
        }
    }

    C.Tabs = Tabs;

})(J.chat);

