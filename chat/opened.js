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

    var cookieObj = J.cookie, cookie= C.cookie, windowOpenr = C.windowOpener,
        windowSize = C.windowSize, bId = '';

    /**
     *
     * @returns {{open: open}}
     * @constructor
     */
    function Opened(){


        /*document.getElementById('dv').innerHTML = +new Date();

        J.g('bt').on('click',function(){
            console.log('click')
            ///window.opener.close();
            window.close();
        });

        J.g('bt1').on('click',function(){
            J.cookie.rmCookie('chat_conf','anjuke.com');
        });

        J.on(window,'load',function(){
            J.on(window,'beforeunload', function(){
                J.cookie.rmCookie('chat_conf','anjuke.com');
            });
        });

        J.on(window,'focus',function(){
            console.log('focus')
        });
        J.on(window,'blur',function(){
            console.log('blur')
        });
        J.on(window,'beforeunload',function(){
            (new Image()).src = 'http://jockjs.jockhu.dev.anjuke.com/pjs/base/a.js';
        });


        window.setInterval(function () {

            document.getElementById('dv').innerHTML = J.cookie.getCookie('chat_poll');

            //window.focus('abc');
            //window.opener.openWindow();
            //window.opener.document.getElementById('bt').fireEvent('click');

            //console.log(window)
            //alert(0)
            //window.opener.openWindow1().focus();
            //window.opener.location.focus();
            //window.focus(window.opener.openWindow1());
        }, 500)

        *//**
         * 打开聊天窗口，客户端入口
         * @param brokerId 经纪人ID
         * @param propertyId 房源ID
         *//*
        function open(brokerId, propertyId){
            var pId = propertyId || '', hours = (new Date).getHours();
            bId = brokerId || '';
            console.log(windowIsOpend(hours))
            if(windowIsOpend(hours)){
                if(windowOpenr){
                    windowOpenr.focus();
                }
            }else{
                windowOpenr = window.open(C.url, C.windowName, getAttrString());
                windowOpenr.focus();
            }

            *//**
             * cookie 保存的格式为 15|12345|23456
             * chat窗口如果在后台保持1小时，哪怕窗口存在，也强制open一个新窗口，反之是激活后台窗口
             *//*
            cookieObj.setCookie(cookie.name, hours + '|' + bId + '|' + pId, 0, cookie.domain);
        }

        *//**
         * 获取chat是否已经被打开
         * @param hours 当前时间（小时数）
         * @returns {boolean}
         *//*
        function windowIsOpend(hours){
            return false;
            var cks;
            if(cks = cookieObj.getCookie(cookie.name)){
                return cks.split('|')[0] == hours ? true : false;
            }
            return false;
        }

        *//**
         * 获取Open.Window的窗口属性字符串
         * @returns {string}
         *//*
        function getAttrString(){
            var wSize = windowSize[ bId ? 'dialog' : 'list'];
            return C.windowAttrs + ',width=' + wSize.width + 'px,left=' + wSize.left +
                ',top='+ wSize.top +',height=' + wSize.height + 'px'
        }*/


        return {
            open:open
        }
    }

    C.opened = new Opened();

})(J.chat);

