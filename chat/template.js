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
/// require('chat.emoji');

(function(C){


    /**
     * Recomm 函数
     *
     * @constructor
     */
    function Template(){

        var FUNS = {
            '1' : getTextTpl,
            '2' : getPicTpl,
            '3' : getCardTpl,
            '9' : getCardTpl,//金铺房源卡片
            '5' : getVoiceTpl,
            '6' : getMapTpl,
            '106' : getSysTpl,
            '107': getSysTpl
        };


        /**
         * 获取发送者的消息模板
         * @param type 消息
         * @param content
         */
        function getSendMessageTpl(type, content, icon){
            return FUNS[type]('me', content);
        }

        /**
         * 获取接受者的消息模板
         * @param type
         * @param content
         */
        function getShiftMessageTpl(type, content, icon){  
            if(type!=106 && type!=107){
                return FUNS[type]('jjr',content, icon);
            }else{
                return FUNS[type](content);
            }
        }

        /**
         * 获取时间模板
         * @param type
         * @param content
         */
        function getTimeTpl(content){
            var day = new Date(),
            year = day.getFullYear(),
            month = day.getMonth(),
            date = day.getDate(),
            dayTime = 1000*60*60*24, //1天转成ms
            todayTime = new Date(year,month,date).getTime(),
            tomTime = todayTime + dayTime,
            yesTime = todayTime-dayTime,
            time;

            function formateTime(content,time){
                var day = new Date(content),
                hour = day.getHours(),
                min = day.getMinutes(),
                time;
                function addpre(time){
                    return (time >= 0 && time < 10) ? '0' + time : time;
                }
                time = addpre(hour) + ':' +addpre(min);
                return time;
            }

            function setDate(content){
               var day = new Date(content),
               year = day.getFullYear(),
               month = day.getMonth() + 1,
               date = day.getDate();
               return year + '年' + month + '月' + date + '日';
            }
            if(content >= todayTime && content <= tomTime){
                time = formateTime(content);
            }else if(content >= yesTime && content < todayTime){
                time = '昨天 ' + formateTime(content);
            }else if(content < yesTime ){
                time = setDate(content) +' ' + formateTime(content);
            }
            var dom = J.create('div',{
                'class' : 'timebar ct'
            }).html('<div class="timebar ct">'+
                        '<em></em><div class="timeTip">'+ time + '</div><em></em>'+
                    '</div>');
            return dom;
        }
        window.getTimeTpl = getTimeTpl;


        /**
         * 获取系统的消息模板
         * @param content
         */
        function getSysMessageTpl(type,content,callback){
            return FUNS[type](content,callback);
        }




        /**
         * 获取文本的模板
         * @param className
         * @param content
         * @returns {string}
         */
        function getTextTpl(className, content, icon){
            //超链接
            content = formateTxt( encodeTxt(content) );
            //先转化表情
            content = formateEmoji(content); //只能在超链接后面
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<p>' + content + '</p>'+
                        '</dd>';
            return getTpl(className, html, icon);
        }
        function formateEmoji(content) {
            emoji.img_path = 'http://pages.anjukestatic.com/img/chat/images/unicode/';
            emoji.sheet_path = 'http://pages.anjukestatic.com/img/chat/images/sheet_64.png';

            emoji.use_sheet = true;
            emoji.init_env();
            var auto_mode = emoji.replace_mode; 
            return emoji.replace_unified(content);
        }

        /**
         *
         * @param content
         * @returns {*|XML|string|void}
         */
        function formateTxt(content){
            var reg = /(https?|ftp|mms):\/\/([A-z0-9]+[_\-]?[A-z0-9]+\.)*[A-z0-9_\-]+\-?[A-z0-9]+(\.[A-z]{2,})*(\/.*)*\/?/ig;
            
            return content.replace(reg,function(m){                
                return '<a href="'+m+'" target="_blank">'+m+'</a>';
            });
        }

        function encodeTxt(content){
            return content
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;")
                .replace(/ /g,'&nbsp;');
        }

        /*function decodeTxt(content){
            return content
                .replace(/&quot;/g,'"')
                .replace(/&lt;/g,'<')
                .replace(/&gt;/g,'>')
                .replace(/&amp;/g, "&");
        }*/

        /**
         * 获取图片的模板
         * @param className
         * @param content
         * @returns {string}
         */
        function getPicTpl(className, content, icon){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<a href="javascript:void(0);" title="点击查看大图" data-src="'+content+'" class="event_image_click"><img src="'+content+'" height="90" alt=""></a>'+
                        '</dd>';
            return getTpl(className, html, icon);
        }
        
        /**
         * 获取地图的模板
         * @param className
         * @param content
         * @returns {string}
         */
        function getMapTpl(className, content, icon){
            var text = (content.city|| '') + (content.region||'') + content.address;
            var lat,lng;
            lat = content.baidu_lat || content.google_lat;
            lng = content.baidu_lng || content.google_lng;

            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<a href="javascript:void(0);" title="点击查看地图" data-content="'+text +'" data-center="'+ lng + ',' + lat +'" class="map event_map_click">'+
                                '<img src="http://api.map.baidu.com/staticimage?center='+ lng + ',' + lat +'&width=300&height=200&zoom=17" width="120" height="120" alt="">'+
                                '<i class="ico_c"></i>'+
                                '<span class="msk"></span>'+
                                '<em class="msk_txt">'+text +'</em>'+
                            '</a>'+
                        '</dd>';
            return getTpl(className,html, icon);
        }

        /**
         * 获取房源卡片的模板
         * @param className
         * @param content
         * @returns {string}
         */
        function getCardTpl(className, content, icon){
            var h6 = {
                '1' : '二手房 （所有）',
                '2' : '租房 (经纪人)',
                '3' : '小区 （二手房）' ,
                '4' : '新房 （所有）',
                '5' : '新盘 （所有）',
                '6' : '团购 （所有）',
                '7' : '文章 （所有）' ,
                '8' : '商铺出租 （所有）',
                '9' : '商铺出售 （所有）',
                '10' : '写字楼出租 （所有）',
                '11' : '写字楼出售 （所有）' ,
                '12' : '租房 (个人)'
            };
            var html = '<dd class="card">'+
                            '<em class="ico_arw"></em>'+
                            '<div class="cardbox cf">'+
                                '<h6>'+h6[content.tradeType]+'</h6>'+
                                '<a href="'+ content.url + '" class="cbox" target="_blank">'+
                                    '<img src="'+ content.img +'" width="65" height="50">'+
                                    '<p>'+ content.name +'</p>'+
                                    '<p class="gray">'+ content.des +'</p>'+
                                    '<p class="f14 bold">'+ content.price +'</p>'+
                                '</a>'+
                            '</div>'+
                        '</dd>';
            return getTpl(className, html, icon);
        }
        
        /**
         * 获取语音的模板
         * @param className
         * @param content
         * @returns {string}
         */
        function getVoiceTpl(className, content, icon){
            var content = 'http://www.anjuke.com/mobile?from=webweiliao', pStr;
            if (className == 'jjr') {
                pStr = '<p>暂不支持接收经纪人发送的语音内容，您可<a href="'+ content +'" target="_blank">下载手机版</a></p>';
            } else if (className == 'me') {
                pStr = '<p>暂不支持播放您发送的语音内容</p>';
            }
            var html = '<dd>'+
                            '<em class="ico_arw"></em>' + pStr +
                        '</dd>';
            return getTpl(className,html, icon);
        }

        /**
         * 获取系统的模板
         * @param className
         * @param content
         * @returns {string}
         */
        function getSysTpl(content){
            var dom = J.create('div',{
                'class' : 'ct'
            }).html('<div class="notice">' + content + '</div>');
            return dom;
        }

        /**
         * 获取消息模板
         * @param className
         * @param content
         */
        function getTpl(className, content, icon){
            var src = "http://pages.anjukestatic.com/img/chat/images/default.gif";
            if (className.indexOf('jjr') > -1) {
                src = icon;
            }
            var dom = J.create('div',{
                'class' : className + ' cf'
            }).html('<dl class="cf"><dt><img src="' + src + '" width="48px"></dt>'+ content +'</dl>');
            return dom;
        }
        

        return {
            getSendMessageTpl :getSendMessageTpl,
            getShiftMessageTpl : getShiftMessageTpl,
            getTimeTpl : getTimeTpl,
            getSysMessageTpl: getSysMessageTpl
        }
    }

    C.template = new Template();

})(J.chat);

