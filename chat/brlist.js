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

/// require('chat.pdata');
/// require('chat.chat');
/// require('chat.broker');
/// require('chat.pdata');

(function(C){


    /**
     * Brlist
     * @constructor
     */
    function Brlist(){
        var BROKERSCACHE = [], TMPECACHE = [], arrHtml = [], newBroker = {}, brLen = 0, listBox = J.container.brlist;//联系人列表数组，每个元素是borker实例

        /**
         * 初始化：只初始化BROKERSCACHE数组
         * @param：friends元素需要字段brokerId, icon, nick_name（获取的数据作处理）
         */
        (function init(){
            C.pdata.getFriends('J.chat.brlist.fillList');
            eventBind();
        })();


        function fillData(friends){
            J.each(friends, function(i, v){
                if( v.user_type == 2 ){
                    BROKERSCACHE[v.to_uid] = new C.Broker({
                        id: v.to_uid,
                        name: v.nick_name,
                        icon: v.icon
                    });
                }
            });
        }


        function fillList(data){
            if (data.status == 'OK' && data.result && data.result.length) {
                fillData(data.result.friends);
            }
        }


        function brCallback(data){
            if(!data || !data.result) return;
            var result = data.result, brObj, v = newBroker.chatInfo;
            TMPECACHE[result.user_id] = brObj = new C.Broker({
                id:result.user_id,
                name: result.nick_name,
                icon: result.icon
            });
            arrHtml[newBrokerIndex] = brObj.getHtml(v.new_msg_count, v.last_active_time);
            if(brLen == arrHtml.length){
                BROKERSCACHE = TMPECACHE;
                listBox.html(arrHtml.join(''));
            }
            newBroker = {};
        }


        /**
         *@param:chatList（getChatList接口返回数据）元素需要字段from_uid(brokerId), new_msg_count, last_active_time
         @数据分析：1.已有联系人的未读消息有变化，box变化
                   2.联系人变化（add+remove）
                   3.若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
                   4.右侧未读消息显示[获取当前Tab]
                   5."所有经纪人"按钮上显示的未读消息数
         */
        function update(chatList){
            var brObj, curBrokerId, boxMsgList = [], brokersNum = 0, allUnreadMsgNum = 0;

            if( chatList.status == 'OK' ){
                arrHtml = [];
                brLen = chatList.result.length;
                brokersNum = BROKERSCACHE.length;
                curBrokerId = J.chat.tabs.getActiveTab();//???????????
                J.each(chatList.result, function(i, v){
                    v.new_msg_count = (curBrokerId!= v.from_uid) ? v.new_msg_count : 0;
                    allUnreadMsgNum += v.new_msg_count;
                    brObj = BROKERSCACHE[v.from_uid];
                    if( brObj ){
                        arrHtml.push( brObj.getHtml(v.new_msg_count, v.last_active_time) );
                        TMPECACHE[v.from_uid] = brObj;
                        boxMsgList[brokerId] = v.new_msg_count;  //key[uid]-value[new_msg_count]
                    }else{
                        arrHtml.push('');
                        newBroker = {
                            index: i,
                            chatInfo: v
                        };
                        C.pdata.getFriendInfo('J.chat.brlist.brCallback');
                    }
                });

                if(!newBroker['index']){
                    BROKERSCACHE = TMPECACHE;
                    listBox.html(arrHtml.join(''));
                }

                //"所有经纪人"按钮显示未读消息数
                showAllUnreadMsgCount(allUnreadMsgNum);
                //显示共多少名经纪人
                J.chat.container.brlistNum.innerHTML = '共' + brLen + '名';
                //多个tab显示未读消息数
                J.chat.tabs.xxx(boxMsgList); //???????????????????????
                //若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
                sendMsgToTabs(brLen, brokersNum);
            }


/*

            var BROKERSCACHE_new = [], i, chatSession, brokerId, boxMsgList = [], data = {}, allUnreadMsgNum = 0, friendInfo = {}, curBrokerId;
            curBrokerId = J.chat.tabs.getActiveTab();
            clearListbox();
            for (i = 0; i < chatList.length; i++) {
                chatSession = chatList[i];
                brokerId = chatSession.from_uid;
                if (curBrokerId != brokerId) {
                    allUnreadMsgNum += chatSession.new_msg_count;
                }
                if (BROKERSCACHE[brokerId]) { //已有联系人
                    BROKERSCACHE_new[brokerId] = BROKERSCACHE[brokerId];
                    boxMsgList[brokerId] = chatSession.new_msg_count;  //key[uid]-value[new_msg_count]

                } else { //新增联系人
                    //请求getFriendInfo接口，对返回接口做处理？？？？？？？？？？？？
                    friendInfo = getFriendInfo(brokerId);
                    BROKERSCACHE_new[brokerId] = new Broker(friendInfo);
                }
                data = {
                    new_msg_count: chatSession.new_msg_count,
                    last_active_time: chatSession.last_active_time
                };
                BROKERSCACHE[brokerId].update(data);//包含联系人元素的插入
                
            }
            //
            //多个tab显示未读消息数
            J.chat.tabs.xxx(boxMsgList);
            //"所有经纪人"按钮显示未读消息数
            showAllUnreadMsgCount(allUnreadMsgNum);
            //显示共多少名经纪人
            showBrokersCount(BROKERSCACHE_new.length);
            //更新联系人列表数据缓存
            BROKERSCACHE = BROKERSCACHE_new;*/

        }

        /*
        "所有经纪人"按钮显示未读消息数
        */
        function showAllUnreadMsgCount(allUnreadMsgNum) {
            allUnreadMsgNum = (allUnreadMsgNum > 99) ? '99+' : allUnreadMsgNum;
            J.chat.container.allUnreadMsg.innerHTML = allUnreadMsgNum;
        }

        /*
        *若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
        */
        function sendMsgToTabs(brLen, brokersNum){
            if (brLen != brokersNum) { //表明有联系人删除
                J.fire();//触发tabs那边监听处理该情况的事件???????????????????
            }
        }

        /*
        事件代理
        */
        function eventBind() {
            var brokerEle, eventTarget, event_broker_click = 'event_broker_click', hoverClassName = 'hover',

            hasClass = function (element, className) {
                var elementClassName = element.className;
                return (elementClassName.length > 0 && (elementClassName == className ||
                    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
            }


            listBox.on('click' ,function(e){
                eventTarget = e.target;
                while( eventTarget != listBox ){
                    if( hasClass(eventTarget, event_broker_click)){
                        C.tabs.show( BROKERSCACHE[ J.g(eventTarget).attr('brokerId') ] ); //??????????????????????????
                        return false;
                    }
                    brokerEle = e.target.parentNode;
                }
            });

            listBox.on('mouseenter' ,function(e){
                eventTarget = e.target;
                while( eventTarget != listBox ){
                    if( hasClass(eventTarget, event_broker_click)){
                        J.g(eventTarget).addClass(hoverClassName);
                        return false;
                    }
                    brokerEle = e.target.parentNode;
                }
            });

            listBox.on('mouseleave' ,function(e){
                eventTarget = e.target;
                while( eventTarget != listBox ){
                    if( hasClass(eventTarget, event_broker_click)){
                        J.g(eventTarget).removeClass(hoverClassName);
                        return false;
                    }
                    brokerEle = e.target.parentNode;
                }
            });
        }


        return {
            fillList: fillList,
            update: update
        }
    }

    C.brlist = new Brlist();

})(J.chat);

