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
/// require('chat.broker');

(function(C){


    /**
     * Brlist
     * @constructor
     */
    function Brlist(){


        var BROKERSCACHE = {}, TMPECACHE = {}, arrHtml = [], newBroker = {}, brLen = 0, listBox = J.container.brlist;//联系人列表数组，每个元素是borker实例

        /**
         * 初始化：只初始化BROKERSCACHE数组
         * @param：friends元素需要字段brokerId, icon, nick_name（获取的数据作处理）
         */
        (function init(){
           /* listBox = J.create('div',{
                //'class':'event_broker_click'
            });*/
            C.pdata.getFriends('J.chat.brlist.fillList');

            eventBind();
//            J.container.brlist.append(listBox);

        })();


        function fillData(friends){
            //var i, length = friends.length, brokerId, brokerInfo = {};
            J.each(friends, function(i, v){
                if( v.user_type == 2 ){
                    BROKERSCACHE[v.to_uid] = new C.Broker({
                        id: v.to_uid,
                        name: v.nick_name,
                        icon: v.icon
                    });
                }
            });
            /*for(i = 0; i < length; i++) {
                if (friends[i].user_type == 2) {
                    brokerId = friends[i].to_uid;
                    brokerInfo = {
                        icon: friends[i].icon,
                        nick_name: friends[i].nick_name,
                        broker_id: brokerId
                    };
                    BROKERSCACHE[brokerId] = new Broker(brokerInfo);
                }
            }*/
        }


        function fillList(data){
            if (data.status == 'OK' && data.result && data.result.length) {
                fillData(data.result.friends)
            }
        }


        function removeTab(){
            var openTabs = C.tabs.getOpenerTabs();

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
                   3.右侧未读消息显示[获取当前Tab]
                   4."所有经纪人"按钮上显示的未读消息数
         */
        function update(chatList){
            var brObj;

            if( chatList.status == 'OK' ){
                arrHtml = [];
                brLen = chatList.result.length;

                J.each(chatList.result, function(i, v){
                    brObj = BROKERSCACHE[v.from_uid];
                    if( brObj ){
                        arrHtml.push( brObj.getHtml(v.new_msg_count, v.last_active_time) );
                        TMPECACHE[v.from_uid] = brObj;
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
        清除联系人列表的html
        */
        function clearListbox() {
            var eles = J.s('.listbox');
            eles.length && eles.eq(0).html('');
        }

        /*
        "所有经纪人"按钮显示未读消息数
        */
        function showAllUnreadMsgCount(allUnreadMsgNum) {
            allUnreadMsgNum = (allUnreadMsgNum > 99) ? '99+' : allUnreadMsgNum;
            J.g('allUnreadMsg').innerHTML = allUnreadMsgNum;
        }

        /*
        共xx名：显示
        */
        function showBrokersCount(brokersCount) {
            var ele = J.g('brokersCount');
            ele.innerHTML = '共' + brokersCount + '名';
        }

        function event_broker_click(brokerElm){

        }

        /*
        事件代理
        */
        function eventBind() {
            var brokerEle, eventTarget, event_broker_click = 'event_broker_click',

            hasClass = function (element, className) {
                var elementClassName = element.className;
                return (elementClassName.length > 0 && (elementClassName == className ||
                    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
            }


            listBox.on('click' ,function(e){
                eventTarget = e.target;
                while( eventTarget != listBox ){
                    if( hasClass(eventTarget, event_broker_click)){
                        C.tabs.show( BROKERSCACHE[ J.g(eventTarget).attr('brokerId') ] );
                        return false;
                    }
                    brokerEle = e.target.parentNode;
                }
            });

            listBox.on('mouseenter' ,function(e){
                eventTarget = e.target;
                while( eventTarget != listBox ){
                    if( hasClass(eventTarget, event_broker_click)){
                        BROKERSCACHE[ J.g(eventTarget).attr('brokerId') ].mouseenter();
                        return false;
                    }
                    brokerEle = e.target.parentNode;
                }
            });


            var eles = J.s('.listbox'), dlClassName = 'cf', brokerEle, dlHoverClass = 'hover';
            eles.length && eles.eq(0).on('click', function(e) {
                brokerEle = e.target;
                if (brokerEle.className == dlClassName) {
                    //打开tab,传递brokerId

                }

            });
            eles.length && eles.eq(0).on('mouseenter', function(e) {
                brokerEle = e.target;
                if (brokerEle.className == dlClassName) {
                    J.g(brokerEle).addClass(dlHoverClass);
                }

            });
            eles.length && eles.eq(0).on('mosueleave', function(e) {
                brokerEle = e.target;
                if (brokerEle.className == dlClassName) {
                    J.g(brokerEle).removeClass(dlHoverClass);
                }
            })
        }


        return {
            fillList: fillList,
            update: update
        }
    }

    C.brlist = new Brlist();

})(J.chat);

