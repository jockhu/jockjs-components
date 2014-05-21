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

(function(C){

    /**
     *
     * @returns {{open: open}}
     * @constructor
     */
    function Opened(){

        var onSuccess = null, win = J.W, timerI = null, timerO = null, cookieValue = '', cookieObj = J.cookie, cookie= C.cookie;

        (function(){
            // 如果cookie配置为null直接退出
            if(!(cookieValue=getOpenedConf())) win.close();

            // 不管什么情况，打开聊天对话框就设置为打开状态
            listener(true)

            J.on(win,'focus',function(){
                listener(false)
            });
            J.on(win,'blur',function(){
                listener(true)
            });
            J.on(J.D,'click',function(){
                listener(false)
            });
            J.on(win,'beforeunload', function(){
                setOpenedStatus(0);
            });

        })();


        /**
         * 设置窗口状态
         * @param statusCode 0 窗口关闭，1 窗口后台打开 2|3 窗口 前台激活
         */
        function setOpenedStatus(statusCode){
            cookieObj.setCookie(cookie.name, (cookieValue = cookieValue.replace(/^\d{1}\.\d+/, statusCode+'.'+(+new Date()))), 1, cookie.domain);
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
         * @param isListened 是否要监听
         * @returns {boolean}
         */
        function listener(isListened){
            clearInterval(timerI);
            clearTimeout(timerO);
            if(!isListened){
                // 前台激活
                setOpenedStatus(3);
                return false;
            }
            // 后台激活
            setOpenedStatus(2);
            timerI = setInterval(function(){
                if( cookieValue != getOpenedConf() ){
                    cookieValue = getOpenedConf();
                    clearTimeout(timerO);
                    win.focus();
                    if( onSuccess ){
                        var conf = cookieValue.match(/(\d+)\.(\d+)$/);
                        onSuccess({
                            brokerId:conf[1],
                            propId:conf[2]
                        });
                    }
                    activeWindow();
                }
                //console.log('poll')
            },500);
        }

        /**
         * 非IE浏览器强制激活窗口
         */
        function activeWindow(){
            if(!J.ua.ie){
                timerO = setTimeout(function(){
                    listener(false)
                    alert('聊天窗口被激活!');
                },0);
            }
        }

        /**
         * 公开接口，设置监听cookie发生变化时候调用的回调函数
         * @param callback
         */
        function setListener(callback){
            onSuccess = callback;
        }

        return {
            setListener:setListener
        }
    }

   // C.opened = new Opened();

})(J.chat);

