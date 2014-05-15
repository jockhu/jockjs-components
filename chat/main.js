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

(function(C){


    /**
     * chat入口主函数
     * @returns {{init: init}}
     * @constructor
     */
    function Main(){

        function init(){
            C.container.brlist = J.g('c-brlist');
            //C.activeId = 0;

        }


        return {
            init:init
        }
    }

    C.Main = Main;

})(J.chat);

