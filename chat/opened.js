/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/opened.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/15
 *
 */


/// require('chat.chat');

(function(C, W){

    /**
     *
     * @returns {{open: open}}
     * @constructor
     */
    function Opened(){

        var onSuccess = null, timerI = null, timerO = null, cookieValue = '',
            cookieObj = J.cookie, cookie= C.cookie, locked = false;

        (function(){
            // 不管什么情况，打开聊天对话框就设置为打开状态
            setOpenedStatus(2);
            // 如果cookie配置为null直接退出
            if(!(cookieValue=getOpenedConf())) W.close();
            listener(true);
            W.onblur = startListener;
            W.onfocus = stopListener;
            J.D.onclick = stopListener;
            W.onbeforeunload = beforeunload;

        })();

        function beforeunload(){
            setOpenedStatus(0);
            locked = true;
        }

        function stopListener(){
            if(!locked){
                listener(false)
            }
        }

        function startListener(){
            if(!locked){
                listener(true)
            }
        }

        /**
         * 设置窗口状态
         * @param statusCode 0 窗口关闭，1 窗口打开 , 2 窗口加载完成
         */
        function setOpenedStatus(statusCode){
            conf = getOpenedConf();
            conf && cookieObj.setCookie(cookie.name, conf.replace(/^(\d)\.(\d+)/, function(a,b,c){
                return statusCode + '.' + ((statusCode == 2) ? (+new Date()) : c);
            }), 1, cookie.domain);
        }

        /**
         * 更新cookie
         * @param brokerId
         * @param propId
         */
        function update(brokerId, propId){
            cookieObj.setCookie(cookie.name, 2 + '.'+(+new Date())+'.'+brokerId+'.'+propId, 1, cookie.domain);
        }

        /**
         * 获取窗口配置
         * @returns {String}
         */
        function getOpenedConf(){
            return cookieObj.getCookie( cookie.name )
        }

        /**
         * 监听函数
         * @param listened 是否要监听
         * @returns {boolean}
         */
        function listener(listened){
            timerI && clearInterval(timerI);
            timerO && clearTimeout(timerO);
            !listened && (cookieValue = getOpenedConf());
            listened && (timerI = W.setInterval(function(){
                if( cookieValue != getOpenedConf() && (cookieValue = getOpenedConf()) ) {
                    clearTimeout(timerO);
                    W.focus();
                    if( onSuccess ){
                        var conf = cookieValue.match(/(\d+)\.(\d+)$/);
                        onSuccess(conf ? {
                            brokerId:conf[1],
                            propId:conf[2]
                        } : {});
                    }
                    // 非IE浏览器强制激活窗口
                    !J.ua.ie && (timerO = setTimeout(function(){
                        listener(false)
                        alert('聊天窗口被激活!');
                    },0));
                }
            },500));
        }

        /**
         * 公开接口，设置监听cookie发生变化时候调用的回调函数
         * @param callback
         */
        function setSuccess(callback){
            onSuccess = callback;
        }

        function getViewType(){
            return getOpenedConf().match(/(\d+)\.(\d+)$/) ? 1 : 0;
        }

        /**
         * 设置聊天窗口显示风格，1 tab模式，0 列表模式
         * @param viewType
         */
        function setView(viewType){
            if(viewType != getViewType() && viewType == 1){
                resetWindow(viewType);
            }
        }

        function resetWindow(viewType){
            var wSize = C.windowSize[ viewType ? 'dialog' : 'list'],
                width = wSize.width, height = wSize.height, left = wSize.left, top = wSize.top,
                offsetLeft = wSize.offsetLeft || 0, offsetTop = wSize.offsetTop || 0, screen = W.screen;
            W.moveTo(((left ? left : (screen.width / 2 - width / 2)) + offsetLeft),((top ? top : (screen.height / 2 - height / 2)) + offsetTop));
            W.resizeTo(width,height)
            W.focus();
        }

        function close(){
            W.close();
        }

        function getInfo(){
            var conf = cookieValue.match(/(\d+)\.(\d+)$/), res =
            conf ? {
                brokerId:conf[1],
                propId:conf[2]
            } : {};
            res.viewType = getViewType();
            return res;
        }

        return {
            update: update,
            getInfo: getInfo,
            close: close,
            setView: setView,
            setSuccess: setSuccess
        }
    }

    C.opened = new Opened();

})(J.chat, J.W);

