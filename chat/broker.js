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
            id: '', //聊天id(chatId)
            brokerId: '',//经纪人id(如果从联系人列表点开，则取不到brokerId)
            houseId:'',
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
                opts.count = count;
                opts.lasttime = lasttime;
                buildHtml(count, lasttime);
            }
            return opts.html;
        }



        function buildHtml(count, lasttime){
            var msg_html = '';
            if (count > 0) {
                count = (count > 99) ? '99+' : count;
            }
            lasttime = translateTime(lasttime);
            if (count > 0) {
                msg_html = '<dd class="infos cf"><p class="new"><span class="ylw">' + count + '</span>条新回复</p><p>' + lasttime + '</p></dd>';
            } else {
                msg_html = '<dd class="infos cf"><p>上次聊天：</p><p>' + lasttime + '</p></dd>';
            }
            opts.html = '<dl class="cf event_broker_click" chatid="' + opts.id + '"><dt><img src="' + opts.icon + '" width="28" height="36"></dt><dd class="name"><a href="javascript:void(0);">' + opts.name + '</a></dd>' + msg_html + '</dl>';
        }

        /*
        *只更新经纪人的新消息数目
        * @param count: 新消息数目
        * @param ele: 某个经纪人对应的dom
        */
        function updateNewMsgCount(count, ele) {
            var pele = ele.s('.infos p'), str;
            if (count > 0) {
                count = (count > 99) ? '99+' : count;
                str = '<span class="ylw">' + count + '</span>条新回复';
            } else {
                str = '上次聊天：';
            }
            pele.length && pele.eq(0).html(str);
            buildHtml(count, opts.lasttime); 
        }

        /*
        将时间戳转为可显示的时间，如：03.28.19：00
        */
        function translateTime(lasttime) {  
            var time = new Date(parseInt(lasttime)), 
                month = time.getMonth() + 1, 
                date = time.getDate(),   
                hour = time.getHours(),     
                minute = time.getMinutes(), str; 
            if (month < 10) { //一位
                month = '0' + month;
            }
            if (date < 10) {
                date = '0' + date;
            }
            if (hour < 10) {
                hour = '0' + hour;
            }
            if (minute < 10) {
                minute = '0' + minute;
            }
            str = month + '.' + date + '.' + hour + ':' + minute; 
            return str; 
        }

        function getOpts() {
            return opts;
        }

        return {
            getHtml: getHtml,
            updateNewMsgCount: updateNewMsgCount,
            getOpts: getOpts
        }
    }

    C.Broker = Broker;

})(J.chat);

