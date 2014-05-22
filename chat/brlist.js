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
/// require('chat.main');
/// require('chat.pdata');
/// require('chat.chat');
/// require('chat.broker');
/// require('chat.tabs');

(function(C){

    /**
     * Brlist
     * @constructor
     */
    function Brlist(){  
        var BROKERSCACHE = [], TMPECACHE = [], arrHtml = [], newBroker = {}, brLen = 0, listBox = C.container.brlist;//联系人列表数组，每个元素是borker实例

        /**
         * 初始化：只初始化BROKERSCACHE数组
         * @param：friends元素需要字段brokerId, icon, nick_name（获取的数据作处理）
         */
        (function init(){ 
            C.pdata.getFriends(fillList);
            eventBind();
        })();


        function fillData(result){
            var i, friends;
            for (i = 0; i < result.length; i++) {
                friends = result[i].friends;
                J.each(friends, function(fi, fv) {
                    if (fv.user_type == 2) {
                        BROKERSCACHE[fv.to_uid] = new C.Broker({
                            id: fv.to_uid,
                            name: fv.nick_name,
                            icon: fv.icon
                        });
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
            TMPECACHE[result.user_id] = brObj = new C.Broker({
                id:result.user_id,
                name: result.nick_name,
                icon: result.icon
            });
            arrHtml[newBrokerIndex] = brObj.getHtml(v.new_msg_count, v.last_active);
            if(brLen == arrHtml.length){
                BROKERSCACHE = TMPECACHE;
                listBox.html(arrHtml.join(''));
            }
            newBroker = {};
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
            var brObj, curBrokerId, boxMsgList = {}, brokersNum = 0, allUnreadMsgNum = 0;

            if( chatList.status == 'OK' ){
                arrHtml = [];
                brLen = chatList.result.length;
                brokersNum = BROKERSCACHE.length;
                curBrokerId = C.tabs.getActiveBrokerId();
                                curBrokerId = '2000132440';
                J.each(chatList.result, function(i, v){
                    v.new_msg_count = (curBrokerId!= v.from_uid) ? v.new_msg_count : 0;
                    allUnreadMsgNum += v.new_msg_count;
                    brObj = BROKERSCACHE[v.from_uid];
                    if( brObj ){
                        arrHtml.push( brObj.getHtml(v.new_msg_count, v.last_active) );
                        TMPECACHE[v.from_uid] = brObj;
                        boxMsgList[v.from_uid] = v.new_msg_count;  //key[uid]-value[new_msg_count]
                    }else{
                        arrHtml.push('');
                        newBroker = {
                            index: i,
                            chatInfo: v
                        };
                        C.pdata.getFriendInfo(brCallback);
                    }
                });

                if(!newBroker['index']){
                    BROKERSCACHE = TMPECACHE;
                    listBox.html(arrHtml.join(''));
                }

                //"所有经纪人"按钮显示未读消息数
                showAllUnreadMsgCount(allUnreadMsgNum);
                //显示共多少名经纪人
                C.container.brlistNum.innerHTML = '共' + brLen + '名';
                //多个tab显示未读消息数
                C.tabs.updateUnreadMsg(boxMsgList); //???????????????????????
                //若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
                sendMsgToTabs(brLen, brokersNum);
                updateEvent();
            }
        }

        /*
        "所有经纪人"按钮显示未读消息数
        */
        function showAllUnreadMsgCount(allUnreadMsgNum) {
            allUnreadMsgNum = (allUnreadMsgNum > 99) ? '99+' : allUnreadMsgNum;
            C.container.allUnreadMsg.innerHTML = allUnreadMsgNum;
        }

        /*
        *若有联系人删除，则需要发送消息给tabs，判断是否需要关闭当前tab
        */
        function sendMsgToTabs(brLen, brokersNum){
            if (brLen != brokersNum) { //表明有联系人删除
                // J.fire();//触发tabs那边监听处理该情况的事件???????????????????
            }
        }

        /*
        事件代理
        */
        function eventBind() {  
            var eventTarget, event_broker_click = 'event_broker_click',
                peoList = J.g('peoList');
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
                eventTarget = e.target ||  e.srcElement;  
                while( eventTarget != listBox.get() ){
                    if( hasClass(eventTarget, event_broker_click)){
                        C.tabs.show( BROKERSCACHE[ J.g(eventTarget).attr('brokerId') ] ); //??????????????????????????
                        return false;
                    }
                    if (!eventTarget) return;
                    eventTarget = eventTarget.parentNode;
                }
            });

            btn_up.on('click',function(){
                peoList.hide();
            });

            btnShowAll.on('click',function(e){
                peoList.show();
                e.stop();
            })

            peoList.on('click',function(e){
                e.stop();
            });
            J.g(document).on('click',function(){
                peoList.hide();
            });




        }

        function updateEvent() {
            var hoverClassName = 'hover';
            listBox.s('.cf').each(function(k, v) {
                v.on('mouseenter', function() {
                    v.addClass(hoverClassName);
                });
                v.on('mouseleave', function() {
                    v.removeClass(hoverClassName);
                });
            });
        }


        return {
            // fillList: fillList,
            update: update
        }
    }

    C.brlist = new Brlist();

})(J.chat);

