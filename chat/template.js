/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/template.js
 * @author: 钟玲
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');

(function(C){


    /**
     * Recomm 函数
     * @param opts
     *
     * @constructor
     */
    function Template(opts){

        var FUNS = {
            'f10010': getTextTpl,
            'f10011': getPicTpl
            // ...
        }

        /**
         * 初始化
         */
        function init(){

        }

        /**
         * 获取发送者的消息模板
         * @param type
         * @param content
         */
        function getSendMessageTpl(type, content){

        }

        /**
         * 获取接受者的消息模板
         * @param type
         * @param content
         */
        function getShiftMessageTpl(type, content){

        }

        /**
         * 获取文本的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getTextTpl(position, content){

            return ''
        }

        /**
         * 获取图片的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getPicTpl(position, content){

            return ''
        }



        return {

        }
    }

    C.Template = Template;

})(J.chat);

