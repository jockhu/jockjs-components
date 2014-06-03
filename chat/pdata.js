/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/pdata.js
 * @author: ????? * @version: 1.0.0
 * @date: 2014/05/08
 *
 */

//chat.main

/// require('chat.chat');

(function(C){

    /**
     * Pdata
     * @constructor
     */
    function Pdata(){

        var opts = {
            apiDomain : C.isDev ? 'http://chatapi.dev.anjuke.com' : C.isPg ? 'http://chatapi.anjuke.test': 'http://api.anjuke.com/weiliao',
            longDomain: (C.isDev || C.isPg) ? 'http://dev.aifang.com:8080/register' : 'http://push10.anjuke.com'
        }, fnid=0;

        function buildUrl(type){ 
            var urls = {
                'friends': opts.apiDomain + '/user/getFriends/' + C.phone,
                'chatlist': opts.apiDomain + '/message/getChatList',
                'friend': opts.apiDomain + '/user/getFriendInfo/' + C.phone + '/',
                'poll': opts.longDomain + '/' + C.guid + '/w-ajk-user-chat/' + C.uid+'?auth='+C.auth,
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
         * ?��?�?��人�?�?         * @param phone ?��?????��???         * @param callback ????��????�?��形�?
         */
        function getFriends(callback){
            J.get({
                url: buildUrl('friends'),
                data: {
                    'r': Math.random()
                },
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackFriends'
            });

            J.chat.pdata.callbackFriends = function(){
                var arg = Array.prototype.slice(arguments); 
                callback.apply(this, arguments);
            }
        }


        function getChatList(callback){
            var fnName;
            fnid++;
            fnName = 'J.chat.pdata.callbackChatList'+fnid;
            J.get({
                url: buildUrl('chatlist'),
                type: 'jsonp',
                data:{
                    _r:Math.random()
                },
                callback: fnName
            });
            J.chat.pdata['callbackChatList'+(fnid-1)] = function(){alert(1)};
            J.chat.pdata['callbackChatList'+(fnid)] = function(data) {
                var args = Array.prototype.slice.call(arguments);
                callback.apply(this, args);
            }
        }

        /**
         *
         */
        function getChatDetail(to_uid, min_msg_id, max_msg_id, limit, callback){
            var sendUrl = opts.apiDomain + '/message/getChatDetail/' + to_uid + '/' + min_msg_id + '/' + max_msg_id + '/' + limit;
            J.get({
                url: sendUrl,
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackDetail'
            });
            J.chat.pdata.callbackDetail = function(){
                var args = Array.prototype.slice.call(arguments);
                callback.apply(this,args);
            }
        }

        /**
         *
         */
        function getFriendInfo(brokerId, callback){
            J.get({
                url: buildUrl('friend') + brokerId,
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackFriendInfo'
            });
            J.chat.pdata.callbackFriendInfo = function() {
                var args = Array.prototype.slice.call(arguments);
                callback.apply(this, args);
            }
        }

        /**
         *
         */
        function getPollListener(callback){  
            J.get({
                url: buildUrl('poll'),
                data: {
                    'r': Math.random()
                },
                timeout: 360000,
                type: 'jsonp',
                callback: 'J.chat.pdata.callbackPoll'
            });
            J.chat.pdata.callbackPoll = function() {
                var args = Array.prototype.slice.call(arguments);
                callback.apply(this, args);
            }
        }

        /**
         *?��??��?信�?[?��?propId�??�?��??
         */
        function getRecomm(brokerId, chatId, propId, callback){
            var param = {};
            brokerId ? param = {
                broker_id: brokerId
            } : param = {
                broker_cid: chatId
            };//若有borkerId则传入,否则传入chatid
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
         *?��??��?信�?
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
         *?��?�?��人信??         */
        function getBrokerInfo(brokerId,chatId, callback){
            var param = {};
            brokerId ? param = {
                broker_id: brokerId
            } : param = {
                broker_cid: chatId
            };//若有borkerId则传入,否则传入chatid
            J.get({
                url: buildUrl('broker'),
                data: param,
                type: 'json',
                timeout:20000,
                onSuccess: callback
            });
        }

        /*
         *?��??��??��?
         *houseUrl:???�??propId�??�??�?ing??��?��?
         */
        function getHouseCard(hosueUrl, callback) {
            var param = {
                'request_url': hosueUrl
            };
            J.get({
                url: buildUrl('house'),
                type:'json',
                data: param,
                onSuccess: callback
            });
        }

        /*
         *�?????
         *@param:msgObject???�??�?sg_type, body
         */
        function sendMsgToBroker(msgObject, brokerId, callback) {
            var param = {
                    phone: C.phone,
                    body: msgObject.body,
                    msg_type: msgObject.msg_type,
                    to_uid: brokerId
                };
            J.get({
                url: buildUrl('sendmessage'),
                data: param,
                type: 'json',
                timeout:20000,
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

