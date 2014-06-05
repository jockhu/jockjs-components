/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/brlist.js
 * @author: 霍本林
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */

/// require('chat.chat');
/// require('chat.pdata');
/// require('chat.broker');
/// require('chat.tabs');

(function(C){

    /**
     * Brlist
     * @constructor
     */
    function Brlist(){  
        var BROKERSCACHE = {}, brokerCount = 0, TMPECACHE = {}, arrHtml = [], newBroker = {}, brLen = 0, listBox = J.g('brlist'), allUnreadMsgNum = 0;//联系人列表数组，每个元素是borker实例

        /**
         * 初始化：只初始化BROKERSCACHE数组
         * @param：friends元素需要字段brokerId, icon, nick_name（获取的数据作处理）
         */
        function init(){
            C.pdata.getFriends(fillList);
            eventBind();
        }


        function fillData(result){
            var i, friends;
            for (i = 0; i < result.length; i++) {
                friends = result[i].friends;
                J.each(friends, function(fi, fv) {
                    if (fv.user_type == 2) {
                        BROKERSCACHE[fv.to_uid] = new C.Broker({
                            id: fv.to_uid,
                            brokerId: '',
                            name: fv.nick_name,
                            icon: fv.icon
                        });
                        brokerCount++;
                    }
                });
            }
        }


        function fillList(data){   
            if (data.status == 'OK' && data.result) {
                fillData(data.result); 
                C.pdata.getChatList(update);
            }
        }


        function brCallback(data){
            if(!data || !data.result) return;
            var result = data.result, brObj, v = newBroker.chatInfo;
            TMPECACHE[v.from_uid] = brObj = new C.Broker({
                id: v.from_uid,
                brokerId: '',
                name: result.nick_name,
                icon: result.icon
            });
            arrHtml[newBrokerIndex] = brObj.getHtml(v.new_msg_count, v.last_active * 1000);
            if(brLen == arrHtml.length){
                BROKERSCACHE = TMPECACHE;
                listBox.html(arrHtml.join(''));
            }
            newBroker = {};
        }

        /*
        * 监听是否用户给经纪人第一次发送消息，建立关系，并添加到联系人列表
        */
        function listenNewBroker() {
            J.on(document,'chat:newBroker', addBroker);

            /*
            * data包括broker的icon,name,id,count,houseId,lasttime
            */
            function addBroker(e) {  
                var data = e.data, listBoxDom = listBox.get();
                var firstEle = listBoxDom.firstChild, brObj, appendDom, createdTime = data.created * 1000;
                brObj = BROKERSCACHE[data.id] = new C.Broker({
                    id: data.id,
                    brokerId: data.brokerId,
                    name: data.name,
                    icon: data.icon,
                    count: data.count,
                    houseId: data.houseId,
                    lasttime: ''
                });
                appendDom = getDomByHtml(brObj.getHtml(0, createdTime));
                firstEle ? listBoxDom.insertBefore(appendDom, firstEle) : listBoxDom.appendChild(appendDom);
                brokerCount++;
                showBrokerCount(brokerCount);
                //单独事件绑定
                brokerBindEvent(J.g(appendDom));
            }
        }

        /*
        * 将html转成对应的dom元素
        */
        function getDomByHtml(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return div.firstChild;
        }


        /**
         *@param:chatList（getChatList接口返回数据）元素需要字段from_uid(brokerId), new_msg_count, last_active
         @数据分析：1.已有联系人的未读消息有变化，box变化
                   2.联系人变化（add+remove）
                   3.若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
                   4.右侧未读消息显示[获取当前Tab]
                   5."所有经纪人"按钮上显示的未读消息数
         */
        function update(chatList){
            var brObj, curChatId, boxMsgList = {}, brokersNum = 0, dealNewMsgCount = 0;
            
            if( chatList.status == 'OK' ){
                allUnreadMsgNum = 0;
                arrHtml = [];
                brLen = chatList.result.length;
                brokersNum = brokerCount;
                curChatId = C.tabs.getActiveChatId();
                brokerCount = 0;
                J.each(chatList.result, function(i, v){

                    dealNewMsgCount = ((curChatId == v.from_uid) ? 0 : v.new_msg_count);
                    allUnreadMsgNum += dealNewMsgCount * 1;
                    brokerCount++;

                    brObj = BROKERSCACHE[v.from_uid];
                    if( brObj ){
                        arrHtml.push( brObj.getHtml(dealNewMsgCount, v.last_active * 1000) );
                        TMPECACHE[v.from_uid] = brObj;
                        boxMsgList[v.from_uid] = v.new_msg_count;  //key[uid]-value[new_msg_count]
                    }else{
                        arrHtml.push('');
                        newBroker = {
                            index: i,
                            chatInfo: v
                        };
                        C.pdata.getFriendInfo(v.from_uid, brCallback);
                    }
                });

                if(!newBroker['index']){
                    BROKERSCACHE = TMPECACHE;
                    listBox.html(arrHtml.join(''));
                }

                //"所有经纪人"按钮显示未读消息数
                showAllUnreadMsgCount(allUnreadMsgNum);  
                //显示共多少名经纪人
                showBrokerCount(brLen);
                //多个tab显示未读消息数
                C.tabs.updateUnreadMsg(boxMsgList); 
                //若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
                sendMsgToTabs(brLen, brokersNum);
                updateEvent();
            }
        }

        /*
        * 显示共多少名经纪人
        */
        function showBrokerCount(count) {
            C.container.brlistNum.html('共' + count + '名');
        }

        /*
        "所有经纪人"按钮显示未读消息数
        */
        function showAllUnreadMsgCount(unreadMsgNum) {  
            if (unreadMsgNum > 0) {
//                unreadMsgNum = (unreadMsgNum > 99) ? '99+' : unreadMsgNum;
                unreadMsgNum = (unreadMsgNum > 10) ? '10+' : unreadMsgNum;
                C.container.allUnreadMsg.html(unreadMsgNum);
                C.container.allUnreadMsg.show();
            } else {
                C.container.allUnreadMsg.hide();
            }
            
        }

        /*
        *若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
        */
        function sendMsgToTabs(brLen, brokersNum){
            if (brLen != brokersNum) { //表明有联系人删除
                C.tabs.autoDeleBroker();
            }
        }

        /*
        事件代理
        */
        function eventBind() {  
            var eventTarget, event_broker_click = 'event_broker_click',
                peoList = J.g('peoList'),
                btn_up = peoList.s('.btn_up').eq(0),
                btnShowAll = J.g("btnShowAll");

            hasClass = function (element, className) {
                if (!element) return false;
                var elementClassName = element.className;
                if (!elementClassName) return false;
                return (elementClassName.length > 0 && (elementClassName == className ||
                    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
            };

            listBox.on('click', function(e){  
                var brokerObject, brokerHtml;
                eventTarget = e.target ||  e.srcElement;  
                while( eventTarget != listBox.get() ){
                    if( hasClass(eventTarget, event_broker_click)){
                        brokerObject = BROKERSCACHE[ J.g(eventTarget).attr('chatid') ];
                        C.tabs.show(brokerObject,true);
                        showAllUnreadMsgCount(allUnreadMsgNum - brokerObject.getOpts().count);
                        brokerObject.updateNewMsgCount(0, J.g(eventTarget));//消息条数置为0
                        return false;
                    }
                    if (!eventTarget) return;
                    eventTarget = eventTarget.parentNode;
                }
            });

            btn_up.on('click',function(){
//                peoList.hide();
                hideBrlistPanel();
            });

            btnShowAll.on('click',function(e){
                if (peoList.getStyle('display') == 'none') {
                    showBrlistPanel();

                } else {
                    hideBrlistPanel();
                }
                
                e.stop();
            })

            peoList.on('click',function(e){
                e.stop();
            });
            J.g(document).on('click',function(){
                hideBrlistPanel();
//                peoList.hide();
            });

            listenNewBroker();

            /*
             * '所有经纪人'
             */
            function showBrlistPanel() {
                btnShowAll.addClass('on');
                peoList.show();
            }

        }

        /*
        * 隐藏联系人列表的面板
        */
        function hideBrlistPanel() {
            var peoList = J.g('peoList'),
                btnShowAll = J.g("btnShowAll");
            btnShowAll.removeClass('on');
            peoList.hide();
        }



        function updateEvent() {
            listBox.s('.cf').each(function(k, v) {
                brokerBindEvent(v);
            });
        }

        function brokerBindEvent(v) {
            var hoverClassName = 'hover';
            v.on('mouseenter', function() {
                v.addClass(hoverClassName);
            });
            v.on('mouseleave', function() {
                v.removeClass(hoverClassName);
            });
        }

        /*
        * 只更新未读消息数
        */
        function updateOnlyMsgCount(brokerObject) {  
            var opts = brokerObject.getOpts();
            var dlarr = listBox.s('.event_broker_click');  
            J.each(dlarr, function(k, v) {  
                if (J.g(v).attr('chatid') == opts.id) {
                    brokerObject.updateNewMsgCount(0, J.g(v));
                    return;
                }
            });
        }

        function getListCount(){
            return brokerCount;
        }

        function getBrokerInfo(brokerId){
            return BROKERSCACHE[brokerId];
        }


        return {
            init: init,
            hideBrlistPanel: hideBrlistPanel,
            getBrokerInfo: getBrokerInfo,
            update: update,
            BROKERSCACHE: BROKERSCACHE,
            getListCount:getListCount,
            showAllUnreadMsgCount: showAllUnreadMsgCount,
            updateOnlyMsgCount: updateOnlyMsgCount
        }
    }

    C.brlist = new Brlist();
//    C.Brlist = Brlist;

})(J.chat);

