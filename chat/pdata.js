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
            apiDomain : C.isDev ? 'http://master.mp.dev.anjuke.com/weiliao' : (C.isPg ? 'http://api.anjuke.test/weiliao' : 'http://api.anjuke.com/weiliao'),
            longDomain: (C.isDev || C.isPg) ? 'http://app20-011.i.ajkdns.com:8080/register' : 'http://push10.anjuke.com/register'
        }, fnid=0;

        function buildUrl(type){
            var urls = {
                'friends': opts.apiDomain + '/user/getFriends/',
                'chatlist': opts.apiDomain + '/message/getChatList',
                'friend': '/api/account-info',
                'poll': opts.longDomain + '/' + C.guid + '/w-ajk-user-chat/' + C.uid,
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
         * ?��?�?��人�?�?         * @param phone ?��?????��???         * @param callback ????��????�?���?��?
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
            J.chat.pdata['callbackChatList'+(fnid-1)] = function(){delete J.chat.pdata['callbackChatList'+(fnid-1)]};
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
        function getAccountInfo(brokerIds, callback) {
            J.post({
                url: buildUrl('friend'),
                data: brokerIds,
                type: 'json',
                timeout: 20000,
                onSuccess: callback
            });
        }

        var num =0;
        /**
         *
         */
        function getPollListener(callback){
		jsonp({
                url: buildUrl('poll'),
                data: {
                    'auth':C.auth,
                    'r': Math.random()
                },
                timeout: 30000,
                type: 'jsonp',
                onFailure:function(data){
                    callback(data)
                },
                onSuccess:function(data){
                    callback(data)
                }
            });
            /* J.chat.pdata.callbackPoll = function() {
             var args = Array.prototype.slice.call(arguments);
             callback.apply(this, args);
             }*/
        }



        function jsonp(option){
            var opts= {
                url:'',
                data:{},
                onSuccess:function(){},
                onFailure:function(){},
                timeout:20000
            }
            opts = J.mix(opts,option)
            var script = document.createElement("script");
            var head =  document.head || document.getElementsByTagName("head")[0];
            var strParams = '?';
            var params = opts.data;
            timer = setTimeout(timeout,opts.timeout)
            var funObj = getGuidFun(opts.onSuccess,timer);
            params.callback = funObj.name;
            var timer;
            for(var i in params){
                strParams+=i+'='+params[i]+'&';
            }
            script.src=opts.url+strParams;
            head.appendChild(script);
            script.onload=script.onreadystatechange = function(_, isAbort){
                if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                    script.onload = script.onreadystatechange = null;
                    if ( head && script.parentNode ) {
                        head.removeChild( script );
                    }
                    script = undefined
                }
            }

            function timeout(){
                opts.onFailure();
                abort();
                timer = undefined;
                funObj.destoryFun();
            }


            function abort(){
                script&&script.onload(null,true);
            }
            return {
                abort:abort
            }
        }

        function getGuidFun(callback,timer){
            var guid =0;
            getGuidFun =function(callback,timer){
                return (function(id){
                    var funName ='callback_chat'+id;
                    destoryFun();
                    window[funName] = function(){
                        timer&&clearTimeout(timer);
                        var args = Array.prototype.slice.call(arguments);
                        callback.apply(null,args);
                        window[funName] = undefined;
                    }
                    id++;
                    function destoryFun(){
                        var d_id = id-1;
                        window['callback_chat'+(d_id)]&&(window['callback_chat'+(d_id)] = function(){
                           window['callback_chat'+(d_id)]=undefined;
                        })
                    }
                    return {
                        name:funName,
                        destoryFun:destoryFun
                    }

                })(++guid);

            }
            return getGuidFun(callback,timer);
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
            };//?��?borkerId????????�??chatid
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
        function getPropertyInfo(propId, cityId, callback){
            var param = {
                property_id: propId,
                city_id: cityId
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
            };//?��?borkerId????????�??chatid
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
        function getHouseCard(hosueUrl, cityId, callback) {
            var param = {
                'request_url': hosueUrl,
                'city_id': cityId
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
                body: msgObject.body,
                msg_type: msgObject.msg_type,
                to_uid: brokerId
            };
            J.post({
                url: buildUrl('sendmessage'),
                data: param,
                type: 'json',
                timeout:20000,
                onFailure:callback,
                onSuccess: callback
            });
        }


        return {
            getFriends: getFriends,
            getChatList: getChatList,
            getChatDetail: getChatDetail,
            getAccountInfo: getAccountInfo,
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

