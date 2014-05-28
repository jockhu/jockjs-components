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
            currentBrokerId; //当前的经纪人ID

        ;(function(){
             // container = J.s(".multiple").eq(0);
        })();

        /**
         * 显示或激活和经纪人的聊天会话tab
         * @param brokerObject:broker的实例（icon: '', name: '', id: ''）
         */
        function show(brObject, isUpdate){
            var opts = brObject.getOpts(), brokerId = opts.id, boxObject = CACHE[brokerId];　
            if (brokerId == currentBrokerId) return;//当点击当前tab时，不做任何处理
            if(!boxObject){
                if (exceedTabsTip()/* || exceedBrokersTip()*/) return false;
                boxObject = CACHE[brokerId] = new C.Box(brObject);
                //如果只有一个ｔａｂ　,则不显示关闭
                tabCount++;
                autoHideCloseTab();
                currentBrokerId && (CACHE[brokerId].prev = CACHE[currentBrokerId]);
                currentBrokerId && CACHE[currentBrokerId] && (CACHE[currentBrokerId].next = CACHE[brokerId]);
            }
            currentBrokerId && CACHE[currentBrokerId].hide();
            boxObject.show(brObject);
            calcTabsWidth();
            currentBrokerId = brokerId;
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
        function exceedBrokersTip() {
            var length = C.brlist.getListCount();
            if (length >= 500) {
                //弹出提示框

                return true;
            }
            return false;
        }

        // function listenExceedTip() {
        //     J.on(document, 'chat: exceedTip', function() {
        //         exceedTip();
        //         exceedBrokersTip();
        //     });
        // }

        /*
        * 联系人有删除，自动删除对应tab及box
        */
        function autoDeleBroker() {
            J.each(CACHE, function(k, v) {
                if (!C.brlist.BROKERSCACHE[v.id]) {
                    remove(v);
                    return;
                }
            });
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
                v.get().style.width = tabWidth + 'px';
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
            //把当前选的ｂｏｘ去除选中状态，如果删除的ｂｏｘ是当前选中的ｂｏｘ,则显示前一个或后一个，否则只是删除
            if(brokerId == currentBrokerId){
                next?next.show():prev&&prev.show();
                currentBrokerId = next?next.id:prev&&prev.id;
            }
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
            for (i in boxMsgList) {
                if (boxMsgList.hasOwnProperty(i)) {
                    if (CACHE[i]) {  
                        if (i != currentBrokerId) {
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
            getActiveBrokerId: getActiveBrokerId,
            setActiveBrokerId: setActiveBrokerId,
            updateUnreadMsg: updateUnreadMsg,
            calcTabsWidth: calcTabsWidth,
            autoDeleBroker: autoDeleBroker
        }
    }

    C.tabs = new Tabs();

})(J.chat);

