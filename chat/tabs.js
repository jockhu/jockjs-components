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
            currentChatId; //当前的经纪人ID

        ;(function(){
             // container = J.s(".multiple").eq(0);
        })();

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject:broker的实例（icon: '', name: '', id: ''）
         */
        function show(brObject, isUpdate){
            var opts = brObject.getOpts(), chatId = opts.id, boxObject = CACHE[chatId];
            if (chatId == currentChatId) return;//当点击当前tab时，不做任何处理
            if(!boxObject){
                if (exceedTabsTip()) return false;
                boxObject = CACHE[chatId] = new C.Box(brObject);
                //如果只有一个ｔａｂ　,则不显示关闭
                tabCount++;
                autoHideCloseTab();
                //从单页过来联系人列表不展示
                opts.houseId && C.brlist.hideBrlistPanel();
                currentChatId && (CACHE[chatId].prev = CACHE[currentChatId]);
                currentChatId && CACHE[currentChatId] && (CACHE[currentChatId].next = CACHE[chatId]);
            }
            currentChatId && CACHE[currentChatId].hide();
            boxObject.show(brObject);
            calcTabsWidth();
            currentChatId = chatId;
            isUpdate && J.chat.opened.update(opts.id,opts.houseId)
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

        /*
        * 判断是否超过19个tab,超过给提示
        */
        function exceedTabsTip() {   
            if (tabCount >= 19) {
                //弹出提示框
                alert('同时聊天数达到上限，请先关闭部分经济人的聊天窑口');
                return true;
            }
            return false;
        }

        /*
        *  判断是否超过500个联系人，超过给提示
        */
//        function exceedBrokersTip() {
//            var length = C.brlist.getListCount();
//            if (length >= 500) {
//                //弹出提示框
//
//                return true;
//            }
//            return false;
//        }

        /*
        * 联系人有删除，自动删除对应tab及box
        */
        function autoDeleBroker() {
            J.each(CACHE, function(k, v) {
                if (!C.brlist.BROKERSCACHE[v.id]) {
                    remove(C.brlist.BROKERSCACHE[v.id].getBrokerObject());
                    return;
                }
            });
        }

        /**
        * 计算各个tab的宽度[浏览器宽度变化或者添加tab时]
        */
        function calcTabsWidth() {  
            var maxTabWidth = 115, maxWidth = 880, tabWidth = 0, scale = document.body.clientWidth / C.windowSize.dialog.width;
            tabWidth = maxWidth / tabCount;
            tabWidth = Math.floor((tabWidth > maxTabWidth) ? maxTabWidth * scale : tabWidth * scale);  
            C.container.tabContainer.s('li').each(function(k, v) {
                v.get().style.width = tabWidth + 'px';
            });
        }

        /**
         * 移除和经纪人的对话tab
         * @param brokerObject
         */
        function remove(brokerObject){
            if (!brokerObject) return;
            var opts = brokerObject.getOpts();
            var chatId = opts.id;
            var obj = CACHE[chatId];
            var next = obj.next;
            var prev = obj.prev;  
            obj.remove();
            //把当前选的ｂｏｘ去除选中状态，如果删除的ｂｏｘ是当前选中的ｂｏｘ,则显示前一个或后一个，否则只是删除
            if(chatId == currentChatId){
                next?next.show():prev&&prev.show();
                currentChatId = next?next.id:prev&&prev.id;
            }
            delete CACHE[chatId];
            next&&(next.prev = prev);
            prev&&(prev.next = next);
            tabCount--;
            autoHideCloseTab();
        }


        function getActiveChatId(){
            return currentChatId;
        }

        function setActiveChatId(chatId) {
            currentChatId = chatId;
        }

        /*
        *实时更新tab上的未读消息数，且若是当前窗口实时获取消息内容
        *@param boxMsgList：[brokerid]-[new_msg_count]数组
        */
        function updateUnreadMsg(boxMsgList) { 
            var i, chatid, new_msg_count;
            for (i in boxMsgList) {
                if (boxMsgList.hasOwnProperty(i)) {
                    if (CACHE[i]) {  
                        if (i != currentChatId) {
                            new_msg_count = boxMsgList[i];
                            CACHE[i].updateUnreadMsg(new_msg_count);
                        } else {
                            CACHE[i].updateMessage(boxMsgList[i])
                        }
                    }
                }
            }
        }

        return {
            show: show,
            // hide: hide,
            remove: remove,
            getActiveChatId: getActiveChatId,
            setActiveChatId: setActiveChatId,
            updateUnreadMsg: updateUnreadMsg,
            calcTabsWidth: calcTabsWidth,
            autoDeleBroker: autoDeleBroker
        }
    }

    C.tabs = new Tabs();

})(J.chat);

