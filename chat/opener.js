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

(function(C, W, D){

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
            var conf = J.mix(getConf(), {
                brId: brokerId || '',
                prId: propertyId || ''
            });
            function newWindow(){
                updateConf(conf, 1);
                windowOpenr = J.W.open(C.chatDomain, C.windowName, getAttrString(conf));
                windowOpenr.focus();
            }
            if(windowIsOpend(conf)){
                if(windowOpenr){
                    windowOpenr.focus();
                }
                // 处理意外关闭cookie没有被重置的二次验证
                clearTimeout(timer);
                updateConf(conf);
                conf = getConf();
                timer = setTimeout(function(){
                    if(conf.time == getConf().time){
                        newWindow();
                    }
                },1500);
            }else{
                newWindow();
            }
        }


        /**
         * 获取cookie配置
         * @returns {*}
         */
        function getConf(){
            var cks;
            if(cks = cookieObj.getCookie(cookie.name) || []){
                cks = cks.split('.');
            }
            return {
                status:cks[0],
                time:cks[1],
                brId:cks[2]||'',
                prId:cks[3]||''
            };
        }

        /**
         * 获取chat窗口是否已经被打开
         * @returns {boolean}
         */
        function windowIsOpend(){
            var conf = getConf();
            return conf.status != '0' && conf.status != '1' ? true : false;
        }


        /**
         * 更新配置
         * @param conf
         * @param status
         */
        function updateConf(conf, status){
            cookieObj.setCookie(cookie.name, (status ? status : conf.status) + '.' + (+new Date()) + '.' + conf.bId + '.' + conf.pId, 1, cookie.domain);
        }

        /**
         * 获取Open.Window的窗口属性字符串
         * @returns {string}
         */
        function getAttrString(conf){
            var wSize = windowSize[ conf.bId ? 'dialog' : 'list'],
                viewPage = (D.compatMode == 'BackCompat') ? D.body : D.documentElement,
                width = wSize.width, height = wSize.height, left = wSize.left, top = wSize.top;
            return C.windowAttrs +
                ',width=' + width +
                ',height=' + height +
                ',left=' + (left ? left : (viewPage.clientWidth / 2 - width / 2)) +
                ',top=' + (top ? top : (viewPage.clientHeight / 2 - height / 2))
        }


        return {
            open:open
        }
    }

    C.opener = new Opener();

})(J.chat, J.W, J.D);

