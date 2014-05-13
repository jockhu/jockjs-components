/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/business.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/07
 *
 */


/// require('chat.chat');

(function(C){

    var cookieObj = J.cookie, cookie= C.cookie, windowOpenr = C.windowOpener,
        windowSize = C.windowSize.dialog;

    /**
     *
     * @returns {{open: open}}
     * @constructor
     */
    function Business(){

        /**
         * 打开聊天窗口，客户端入口
         * @param brokerId 经纪人ID
         * @param propertyId 房源ID
         */
        function open(brokerId, propertyId){
            var bId = brokerId || '',pId = propertyId || '', hours = (new Date).getHours();
            if(windowIsOpend(hours)){
                if(windowOpenr){
                    windowOpenr.focus();
                }
            }else{
                windowOpenr = window.open(C.url, C.windowName, getAttrString());
                windowOpenr.focus();
            }

            /**
             * cookie 保存的格式为 15|12345|23456
             * chat窗口如果在后台保持1小时，哪怕窗口存在，也强制open一个新窗口，反之是激活后台窗口
             */
            cookieObj.setCookie(cookie.name, hours + '|' + bId + '|' + pId, 0, cookie.domain);
        }

        /**
         * 获取chat是否已经被打开
         * @param hours 当前时间（小时数）
         * @returns {boolean}
         */
        function windowIsOpend(hours){
            var cks;
            if(cks = cookieObj.getCookie(cookie.name)){
                return cks.split('|')[0] == hours ? true : false;
            }
            return false;
        }

        /**
         * 获取Open.Window的窗口属性字符串
         * @returns {string}
         */
        function getAttrString(){
            var width = windowSize.width, height = windowSize.height,
                left = 150, top = 150;
            return C.windowAttrs + ',width=' + width + 'px,left=' + left +
                ',top='+ top +',height=' + windowSize.height + 'px'
        }


        return {
            open:open
        }
    }

    C.business = new Business();

})(J.chat);

