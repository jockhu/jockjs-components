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
    }

    // C.Main = Main;
    // C.Main.init();
    C.main = new Main();

})(J.chat);

