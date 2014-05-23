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
        var CACHE = {},  //box对象的缓存集合
            tabCount = 0, 
            // container,
            // LOG,
            currentBrokerId; //当前的经纪人ID

        ;(function(){
             // container = J.s(".multiple").eq(0);
        })();

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject:broker的实例（icon: '', name: '', id: ''）
         */
        function show(brObject){
            var opts = brObject.getOpts(), brokerId = opts.id, boxObject = CACHE[brokerId];
            if(!boxObject){
                boxObject = CACHE[brokerId] = new C.Box(brObject);
                //如果只有一个ｔａｂ　,则不显示关闭
                tabCount++;
                autoHideCloseTab();
                currentBrokerId && (CACHE[brokerId].prev = CACHE[currentBrokerId]);
                currentBrokerId && CACHE[currentBrokerId] && (CACHE[currentBrokerId].next = CACHE[brokerId]);
            }
            currentBrokerId && CACHE[currentBrokerId].hide();
            boxObject.show();
            currentBrokerId = brokerId;
            return boxObject;
        }


        /**
         * 只有一个ｔａｂ时，不让关闭
         */
        function autoHideCloseTab(){
            if(tabCount == 1){
                J.each(CACHE,function(k,v){
                    v.hideCloseButton();
                })
            }else{
                J.each(CACHE,function(k,v){
                    v.showCloseButton();
                })
            }

        }



        /**
        * 切换tab
        * @param brokerObject: 切换到的当前broker
        */
       /* function switchTab(brokerObject) {
            var opts = brokerObject.getOpts(), curBox, switchedBox;
            curBox = CACHE[currentBrokerId];
            switchedBox = CACHE[opts.id];
            curBox.hide();
            switchedBox.show();//除了tab+box的显示，还需要请求未读消息内容
        }*/

        /**
        * 计算各个tab的宽度[浏览器宽度变化或者添加tab时]
        */
        function calcTabsWidth() {
            var maxTabWidth = 115, maxWidth = 880, tabWidth = 0, scale = document.body.clientWidth / C.windowSize.dialog.width;
            tabWidth = maxWidth / tabCount;
            tabWidth = Math.floor((tabWidth > maxTabWidth) ? maxTabWidth * scale : tabWidth * scale);
            C.container.tabContainer.s('li').each(function(k, v) {
                v.setStyle('width', tabWidth + 'px');
            });
        }

        /**
         * 隐藏和经纪人的对话tab
         * @param brokerObject
         */
        // function hide(){
        //     var activeObj = CACHE[brokerObject.id];
        //     if(!activeObj)return false;
        //     activeObj.hide();
        //     return activeObj;
        // }

        /**
         * 移除和经纪人的对话tab
         * @param brokerObject
         */
        function remove(brokerObject){
            var opts = brokerObject.getOpts();
            var brokerId = opts.id;
            var obj = CACHE[brokerId];
            var next = obj.next;
            var prev = obj.prev;
            obj.remove();
            next?next.show():prev&&prev.show();
            currentBrokerId = next?next.id:prev&&prev.id;
            delete CACHE[brokerId];
            next&&(next.prev = prev);
            prev&&(prev.next = next);
            tabCount--;
            autoHideCloseTab();
        }


        function getActiveBrokerId(){
            return currentBrokerId;
        }

        function setActiveBrokerId(brokerId) {
            currentBrokerId = brokerId;
        }

        /*
        *实时更新tab上的未读消息数，且若是当前窗口实时获取消息内容
        *@param boxMsgList：[brokerid]-[new_msg_count]数组
        */
        function updateUnreadMsg(boxMsgList) { 
            var i, brokerid, new_msg_count;
            console.log(boxMsgList,'boxMsgLIst')
            for (i in boxMsgList) {
                if (boxMsgList.hasOwnProperty(i)) {

                    if (CACHE[i]) {  
                        if (i != currentBrokerId) {
                            new_msg_count = boxMsgList[i] = 3;  
                            CACHE[i].updateUnreadMsg(new_msg_count);
                        } else {
                            //实时获取对应聊天内容
                            //?????????????????????????
                        }
                    }
                }
            }
        }

        return {
            show: show,
            // hide: hide,
            remove: remove,
            getActiveBrokerId: getActiveBrokerId,
            setActiveBrokerId: setActiveBrokerId,
            updateUnreadMsg: updateUnreadMsg
        }
    }

    C.tabs = new Tabs();

})(J.chat);

