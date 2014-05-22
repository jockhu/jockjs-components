/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/main.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');
/// require('chat.brlist');

(function(C){


    /**
     * chat入口主函数
     * @returns {{init: init}}
     * @constructor
     */
    function Main(){

        // function init(){
           
        // }

        (function() {
            C.container.brlist = J.g('c_brlist'); //联系人列表的box
            C.container.brlistNum = J.g('brokersCount'); //共xx名
            C.container.allUnreadMsg = J.g('allUnreadMsg'); //显示“所有经纪人”按钮的未读消息数
            //tab
            C.container.tabContainer = J.g('tab_container');

            //长轮询
            C.pdata.getPollListener(callbackPollListener);
        })();

        function callbackPollListener(data) {
            //当data.result返回的是string时，它表示某种原因断开
            if (data.status == 'OK' && (typeof data.result == 'object')) {
                C.pdata.getChatList(C.brlist.update);
            }
        }

        // return {
        //     init:init
        // }
        function closeWindow(){

            J.on(window,'beforeunload',function(e){
                var e = e || window.event;
                e.returnValue = '暂时关闭这次微聊？您可点击屏幕右侧微聊按钮继续进入';
                J.un(window,'beforeunload')
            })
        }
        closeWindow();


        function docIsVisiable(){
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
        }
    }

    // C.Main = Main;
    // C.Main.init();
    C.main = new Main();

})(J.chat);

