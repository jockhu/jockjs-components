/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/pdata.js
 * @author: 霍本林
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');

(function(C){

    /**
     * Pdata
     * @constructor
     */
    function Pdata(){

        var isDev = /\.(dev\.|test)/.test(J.D.location.host), opts = {
            apiDomain : isDev ? 'http://chatapi.dev.anjuke.com' : '',
            longDomain: isDev ? 'http://dev.aifang.com:8080/register' : ''
        }

        function buildUrl(type, opt){
            var urls = {
                'friends': opt.apiDomain + '/user/getFriends/' + C.phone,
                'chatlist': opt.apiDomain + '/message/getChatList',
                'friend': opt.apiDomain + '/user/getFriendInfo/' + C.phone + '/' + C.userId,
                'poll': opt.longDomain + '/' + C.guid + '/w-ajk-user-chat/' + C.userId,
                'recomm': '/api/rec',
                'property': '/property/info',
                'house': '/property/card/ershou',
                'broker': '/broker/info',
                'sendmessage': '/api/sendmsg'
            }
            return urls[type];
        }

        /**
         *
         */
        /**
         * 获取经纪人列表
         * @param phone 登录的手机号码
         * @param callback 回调函数的字符串形式
         */
        function getFriends(callback){
            J.get({
                url: buildUrl('friends',phone),
                type: 'jsonp',
                callback: callback
            });
/*
            window.processGetFriends = processGetFriends;

            function processGetFriends(response) {
                if (!response) return;
                if (response.status == 'OK' && response.result && (response.result.length > 0)) {
                    opts.brList = new Brlist(response.result.friends);
                }
            }            */
        }


        /**
         *
         */
        function getChatList(){
            var sendUrl = apidomain + '/message/getChatList';
            J.get({
                url: sendUrl,
                type: 'jsonp',
                async: 'false',



                
                callback: 'processGetUnreadChat'
            });

            window.processGetFriends = processGetFriends;

            function processGetUnreadChat(response) {
                if (!response) return;
                if (response.status == 'OK' && response.result && (response.result.length > 0)) {
                    opts.brList && opts.brList.update(response.result);
                }
            }
        }

        /**
         *
         */
        function getChatDetail(to_uid, min_msg_id, max_msg_id, limit){
            var sendUrl = apidomain + '/message/getChatDetail/' + to_uid + '/' + min_msg_id + '/' + max_msg_id + '/' + limit;
            J.get({
                url: sendUrl,
                type: 'jsonp',
                async: 'false',
                callback: 'processChatDetail'
            });
            function processChatDetail(response) {
                if (!response) return;
                if (response.status == 'OK' && response.result && (response.result.length > 0)) {
                    //返回数据???????????????????????
                }
            }
            window.processChatDetail = processChatDetail;
        }

        /**
         *
         */
        function getFriendInfo(uid){
            var sendUrl = apidomain + '/user/getFriendInfo/' + opts.phone + '/' + uid, friendInfo = {};
            J.get({
                url: sendUrl,
                type: 'jsonp',
                async: 'false',
                callback: 'processFriendInfo'
            });

            function processFriendInfo(response) {
                if (!response) return;
                if (response.status = 'OK' && response.result) {
                    friendInfo = {
                        icon: response.result.icon,
                        nick_name: response.result.nick_name,
                        broker_id: response.result.to_uid
                    };

                    return friendInfo;//???????????????????????
                }
            }
            window.processFriendInfo = processFriendInfo;
        }


        /**
         *
         */
        function getPollListener(){
            var sendUrl = longdomain + '/' + '11' + '/w-ajk-user-chat/' + userId + '?auth=1';
            J.get({
                url: sendUrl,
                type: 'jsonp',
                callback: 'processLongPolling'
            });

            window.processLongPolling = processLongPolling;

            function processLongPolling(response) {
                if (!response) return;
                if (response.status == 'OK') {
                    if (typeof(response.result) == 'object') { //表示有消息返回
                        getChatList();
                        getPollListener();
                    }
                }
            }
        }

        /**
         *获取推荐信息[若无propId，则传空值]
         */
        function getRecomm(brokerId, propId){
            var sendurl = '/api/rec',
                param = {
                    broker_id: brokerId
                };
            if (propId) {
                param.prop_id = propId;
            }
            J.get({
                url: sendurl,
                data: param,
                type: 'json',
                onSuccess: function(response) { 
                    if (!response.retcode) {

                    }
                }

            });
        }

        /**
         *获取房源信息
         */
        function getPropertyInfo(propId){
            var sendurl = '/property/info',
                param = {
                    property_id: propId
                };
            J.get({
                url: sendurl,
                data: param,
                type: 'json',
                onSuccess: function(response) {  
                    if (!response.retcode) {

                    }
                }
            });
        }

        /**
         *获取房源信息
         */
        function getBrokerInfo(brokerId){
            var sendurl = '/broker/info',
                param = {
                    broker_id: brokerId
                };
            J.get({
                url: sendurl,
                data: param,
                type: 'json',
                onSuccess: function(response) { 
                    if (!response.retcode) {

                    }
                }
            });
        }

        /*
        *获取房源卡片
        */
        function getHouseCard() {
            var sendurl = '/property/card/ershou',
            param = {
                'request_url': hosueUrl
            };
            J.get({
                url: sendurl,
                data: param,
                type: 'json',
                onSuccess: function(response) { 
                    if (response.retcode) return;

                }
            });
        }

        /*
        *消息发送
        *@param:msgObject包含字段：msg_type, body
        */
        function sendMsgToBroker(msgObject, brokerId) {
            var sendurl = '/api/sendmsg',
                param = {
                    phone: opts.phone,
                    body: msgObject.body,
                    msg_type: msgObject.msg_type,
                    to_uid: brokerId
                };
            J.post({
                url: sendurl,
                data: param,
                type: 'json',
                onSuccess: function(response) {  console.log('sendMsgToBroker:'); console.log(response);
                    if (!response.retcode) {

                    }
                }
            });
        }


        return {
            getFriends: getFriends,
            getChatList: getChatList,
            getChatDetail: getChatDetail,
            getFriendInfo: getFriendInfo,
            getPollListener: getPollListener,
            getRecomm: getRecomm,
            getPropertyInfo: getPropertyInfo,
            getHouseCard: getHouseCard,
            getBrokerInfo: getBrokerInfo,
            sendMsgToBroker: sendMsgToBroker
        }
    }

    C.pdata = new Pdata();

})(J.chat);

