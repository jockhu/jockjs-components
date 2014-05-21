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

/// require('chat.main');

/// require('chat.chat');

(function(C){

    /**
     * Pdata
     * @constructor
     */
    function Pdata(){

        var isDev = /\.(dev\.|test)/.test(J.D.location.host), opts = {
            apiDomain : isDev ? 'http://chatapi.dev.anjuke.com' : 'http://api.anjuke.com/weiliao',
            longDomain: isDev ? 'http://dev.aifang.com:8080/register' : 'http://push10.anjuke.com'
        }

        function buildUrl(type){
            var urls = {
                'friends': opts.apiDomain + '/user/getFriends/' + C.phone,
                'chatlist': opts.apiDomain + '/message/getChatList',
                'friend': opts.apiDomain + '/user/getFriendInfo/' + C.phone + '/' + C.userId,
                'poll': opts.longDomain + '/' + C.guid + '/w-ajk-user-chat/' + C.userId,
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
                url: buildUrl('friends'),
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackFriends'
            });

            J.chat.pdata.callbackFriends = function(){ 
                callback.apply(this, arguments);
            }
        }


        /**
         *
         */
        function getChatList(callback){
            J.get({
                url: buildUrl('chatlist'),
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackChatList'
            });
            J.chat.pdata.callbackChatList = function() {
                callback.apply(this, arguments);
            }
        }

        /**
         *
         */
        function getChatDetail(to_uid, min_msg_id, max_msg_id, limit, callback){
            var sendUrl = opts.apidomain + '/message/getChatDetail/' + to_uid + '/' + min_msg_id + '/' + max_msg_id + '/' + limit;
            J.get({
                url: sendUrl,
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackDetail'
            });
            J.chat.pdata.callbackDetail = function(){
                var args = Array.prototype.slice(arguments);
                callback.apply(this,args);
            }
        }

        /**
         *
         */
        function getFriendInfo(callback){
            J.get({
                url: buildUrl('friend'),
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackFriendInfo'
            });
            J.chat.pdata.callbackFriendInfo = function() {
                callback.apply(this, arguments);
            }
        }


        /**
         *
         */
        function getPollListener(callback){
            J.get({
                url: buildUrl('poll'),
                type: 'jsonp',
                callback: callback
            });
            J.chat.pdata.callbackPoll = function() {
                callback.apply(this, arguments);
            }
        }

        /**
         *获取推荐信息[若无propId，则传空值]
         */
        function getRecomm(brokerId, propId, callback){
            var param = {
                    broker_id: brokerId
                };
            if (propId) {
                param.prop_id = propId;
            }
            J.get({
                url: buildUrl('recomm'),
                data: param,
                timeout:20000,
                type: 'json',
                onSuccess: callback
            });
        }

        /**
         *获取房源信息
         */
        function getPropertyInfo(propId, callback){
            var param = {
                    property_id: propId
                };
            J.get({
                url: buildUrl('property'),
                data: param,
                type: 'json',
                timeout:20000,
                onSuccess: callback
            });
        }

        /**
         *获取房源信息
         */
        function getBrokerInfo(brokerId, callback){
            var param = {
                    broker_id: brokerId
                };
            J.get({
                url: buildUrl('broker'),
                data: param,
                type: 'json',
                timeout:20000,
                onSuccess: callback
            });
        }

        /*
        *获取房源卡片
        *houseUrl:只需要传propId，后端自己ping单页地址
        */
        function getHouseCard(hosueUrl, callback) {
            var param = {
                'request_url': hosueUrl
            };
            J.get({
                url: buildUrl('house'),
                data: param,
                type: 'json',
                onSuccess: callback
            });
        }

        /*
        *消息发送
        *@param:msgObject包含字段：msg_type, body
        */
        function sendMsgToBroker(msgObject, brokerId, callback) {
            var param = {
                    phone: C.phone,
                    body: msgObject.body,
                    msg_type: msgObject.msg_type,
                    to_uid: brokerId
                };
            J.post({
                url: buildUrl('sendmessage'),
                data: param,
                type: 'json',
                onSuccess: callback
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

