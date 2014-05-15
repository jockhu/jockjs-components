/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/box.js
 * @author: 江仑
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');
/// require('chat.finfo');
/// require('chat.recomm');
/// require('chat.tab');

(function(C){


    /**
     * Box
     * @returns {{show: show, remove: remove}}
     * @constructor
     */
    function Box(option){

        var defOpts={
            id:0


            },opts;
        /**
         * 初始化
         */
        function init(){
            opts = J.mix(defOpts,option);


        }



        function createElement(isFromList){
            var dom = J.create('div',{
                className:'tab_conf_cf'
            })
            var html;

            dom.html()
        }


        /**
         * 绑定事件
         */
        function eventBind(){

        }

        /**
         * 发送消息
         * @param content 消息内容
         * @param messageBox 消息盒子，可为空
         */
        function sendMessage(content, messageBox){

        }

        /**
         * 消息发送正常回掉
         * @param statusCode 状态吗
         */
        function sendSuccess(statusCode){

        }

        /**
         * 消息发送非法（超时，断网，意外中断）
         * @param content 消息内容
         * @param messageBox 消息盒子，可为空
         */
        function sendError(content, messageBox){

        }

        /**
         * 发送新消息
         * @param type 消息类型
         * @param content 消息内容
         * @returns {HTMLObject}
         */
        function pushMessage(type, content){
            var messageBox;
            return messageBox
        }

        /**
         * 查看历史消息
         * @param type 消息类型
         * @param content 消息内容
         * @returns {HTMLObject}
         */
        function shiftMessage(type, content){
            var messageBox;
            return messageBox
        }

        /**
         * 显示消息（消息，提醒，时间...）
         * @param content 信息内容
         * @param showType 0:新消息，1:历史消息（取决显示的位置）
         */
        function showMessage(content, showType){

        }

        /**
         * 时间任务处理
         */
        function timerTasker(){

        }

        /**
         * 显示或激活和经纪人的聊天会话box
         * @param brokerObject
         */
        function show(brokerObject){
            
        }

        /**
         * 隐藏和经纪人的对话box
         * @param brokerObject
         */
        function hide(brokerObject){

        }

        /**
         * 移除和经纪人的对话box
         * @param brokerObject
         */
        function remove(brokerObject){

        }



        return {
            show:show,
            remove:remove
        }
    }

    C.Box = Box;

})(J.chat);

