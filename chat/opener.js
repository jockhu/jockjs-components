/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/opener.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/07
 *
 */


/// require('chat.chat');

(function(C){

    /**
     *
     * @returns {{open: open}}
     * @constructor
     */
    function Opener(){

        var cookieObj = J.cookie, cookie= C.cookie, windowOpenr = C.windowOpener,
            windowSize = C.windowSize, pId = '', bId = '', timer = null;

        /**
         * 打开聊天窗口，客户端入口
         * @param brokerId 经纪人ID
         * @param propertyId 房源ID
         */
        function open(brokerId, propertyId){
            var time = (+new Date());
            bId = brokerId || '', pId = propertyId || '';
            openWindow( getConf(), time);
        }


        /**
         * 获取cookie配置
         * @returns {*}
         */
        function getConf(){
            var cks;
            if(cks = cookieObj.getCookie(cookie.name)){
                cks = cks.split('.');
                return {
                    status:cks[0],
                    time:cks[1]
                }
            }
            return null;
        }

        /**
         * 获取chat是否已经被打开
         * @param conf
         * @returns {boolean}
         */
        function windowIsOpend(conf){
            return conf && conf.status != '0' && conf.status != '1' ? true : false;
        }

        /**
         * 打开或激活窗口
         * @param conf {
         *          status: 0 | 1 | 2 | 3,
         *          time: 1400235736365
         *        }
         * @param time
         */
        function openWindow(conf, time){
            function newWindow(){
                windowOpenr = J.W.open(C.chatDomain, C.windowName, getAttrString());
                windowOpenr.focus();
            }
            if(windowIsOpend(conf)){

                if(windowOpenr){
                    windowOpenr.focus();
                }
                // 处理意外关闭cookie没有被重置的二次验证
                clearTimeout(timer);
                updateConf(conf.status, time);
                conf = getConf();
                timer = setTimeout(function(){
                    //console.log(conf.time , getConf().time)
                    if(conf.time == getConf().time){
                        updateConf(1, time);
                        newWindow();
                    }
                },1500);
            }else{
                updateConf(1, time);
                newWindow();
            }
        }

        function updateConf(status, time){
            cookieObj.setCookie(cookie.name, status + '.' + time + '.' + bId + '.' + pId, 1, cookie.domain);
        }

        /**
         * 获取Open.Window的窗口属性字符串
         * @returns {string}
         */
        function getAttrString(){
            var wSize = windowSize[ bId ? 'dialog' : 'list'];
            return C.windowAttrs + ',width=' + wSize.width + 'px,left=' + wSize.left +
                ',top='+ wSize.top +',height=' + wSize.height + 'px'
        }


        return {
            open:open
        }
    }

    C.opener = new Opener();

})(J.chat);

