/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/broker.js
 * @author: 霍本林
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');

(function(C){


    /**
     * Broker
     * @constructor
     */
    function Broker(options){
        var opts = {
            icon: '',
            name: '',
            id: '',
            count: 0,
            lasttime: '',
            html: ''
        };

        /**
         * 初始化
         */
        (function init(options){
            opts = J.mix(opts, options || {});
        })(options);



        function getHtml(count, lasttime){
            if(count != opts.count || lasttime != opts.lasttime){
                return buildHtml(count, lasttime);
            }
            return opts.html;
        }


        function buildHtml(count, lasttime){
            var msg_html = '';
            count = (count > 99) ? '99+' : count;
            if (count > 0) {
                msg_html = '<dd class="infos cf"><p class="new"><span class="ylw">' + count + '</span>"条新回复"</p><p>' + lasttime + '</p></dd>';
            } else {
                msg_html = '<dd class="infos cf"><p>上次聊天：</p><p>' + lasttime + '</p></dd>';
            }
            opts.html = '<dl class="cf" brokerId="' + opts.id + '"><dt><img src="' + opts.icon + '" width="28" height="36"></dt><dd class="name"><a href="javascript:void(0);">' + opts.name + '</a></dd>' + msg_html + '</dl>';
            return opts.html;
        }





        // /**
        //  *
        //  */
        // function update(data){ //buildItem + changeItem
        //     var originNewMsgCount = opts.new_msg_count;
        //     opts.new_msg_count = data.new_msg_count;
        //     opts.last_active_time = data.last_active_time;
        //     if (!opts.itemEle) {//初始化
        //         buildItem();

        //     } else { //更新item
        //         if (originNewMsgCount != opts.new_msg_count) {
        //             changeItem();
        //         }
        //     }
        //     appendBroker();
        // }

        // function appendBroker() {
        //     var eles = J.s('.listbox');
        //     eles.length && eles.eq(0).appendChild(opts.itemEle);
        // }

        // /**
        //  *
        //  */
        // function buildItem(){
        //     var msg_html = '', dlEle, item_html;
        //     msg_html = buildHtml();
        //     item_html = '<dt><img src="' + opts.icon + '" width="28" height="36"></dt><dd class="name"><a href="javascript:void(0);">' + opts.nick_name + '</a></dd>' + msg_html;
        //     dlEle = document.createElement('dl');
        //     dlEle.className = 'cf';
        //     J.g(dlEle).attr('uid', opts.broker_id);
        //     dlEle.innerHTML = item_html;
        //     opts.itemEle = dlEle;
        // }

        // function changeItem() {
        //     var ele = opts.itemEle.s('.infos'), newItem, msgEle;
        //     ele.length && ele.eq(0).remove();
        //     msgEle = buildMsgItem();
        //     opts.itemEle.appendChild(msgEle);
        // }


        // /*
        // 根据newMsgCount更改对应html
        // */
        // function buildHtml() {
        //     var dealedMsgCount = 0, msg_html = '';
        //     dealedMsgCount = (opts.new_msg_count > 99) ? '99+' : opts.new_msg_count;
        //     if (opts.new_msg_count > 0) {
        //         msg_html = '<dd class="infos cf"><p class="new"><span class="ylw">' + dealedMsgCount + '</span>"条新回复"</p><p>' + opts.last_active_time + '</p></dd>';
        //     } else {
        //         msg_html = '<dd class="infos cf"><p>上次聊天：</p><p>' + opts.last_active_time + '</p></dd>';
        //     }
        //     return msg_html;
        // }

        // /*
        // 创建联系人列表item中的消息展示
        // */
        // function buildMsgItem() {
        //     var dealedMsgCount = 0, ddEle;
        //     dealedMsgCount = (opts.new_msg_count > 99) ? '99+' : opts.new_msg_count;
        //     ddEle = document.createElement('dd');
        //     ddEle.className = 'infos cf';
        //     if (opts.new_msg_count > 0) {
        //         ddEle.innerHTML = '<p class="new"><span class="ylw">' + dealedMsgCount + '</span>"条新回复"</p><p>' + opts.last_active_time + '</p>';
        //     } else {
        //         ddEle.innerHTML = '<p>上次聊天：</p><p>' + opts.last_active_time + '</p>';
        //     }
        //     return ddEle;
        // }


        return {
            getHtml: getHtml
        }
    }

    C.Broker = Broker;

})(J.chat);

