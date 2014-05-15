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
            '1' : getTextTpl,
            '2' : getPicTpl,
            '3' : getCardTpl,
            '5' : getVoiceTpl,
            '6' : getMapTpl,
            '106' : getSysTpl
        };

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
        function getSendMessageTpl(type, content,callback){
            return FUNS[type]('me',content,callback);
        }

        /**
         * 获取接受者的消息模板
         * @param type
         * @param content
         */
        function getShiftMessageTpl(type, content,callback){
            if(type!=106){
                return FUNS[type]('jjr',content,callback);
            }else{
                return FUNS[type](content,callback);
            }
        }

        /**
         * 获取时间模板
         * @param type
         * @param content
         */
        function getTimeTpl(content,callback){
            var day = new Date(),
            year = day.getFullYear(),
            month = day.getMonth(),
            date = day.getDate(),
            dayTime = 1000*60*60*24,
            todayTime = new Date(year,month,date).getTime(),
            tomTime = todayTime + dayTime,
            yesTime = todayTime - dayTime,
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
                time = formateTime(content,callback);
            }else if(content >= yesTime && content < todayTime){
                time = '昨天 ' + formateTime(content,callback);
            }else if(content < yesTime ){
                time = setDate(content) +' ' + formateTime(content,callback);
            }else{

            }
            var dom = J.create('div',{
                class : 'timebar ct'
            }).html('<div class="timebar ct">'+
                        '<em></em><div class="timeTip">'+ time + '</div><em></em>'+
                    '</div>');
            return callback&&callback(dom);
        }


        /**
         * 获取系统的消息模板
         * @param content
         */
        function geSysMessageTpl(type,content,callback){
            return FUNS[type](content,callback);
        }

        /**
         * 获取消息模板
         * @param position
         * @param content
         */
         function getTpl(position,content,callback){
            var dom = J.create('div',{
                class : position + ' cf'
            }).html('<dl class="cf"><dt><img src="'+'xx'+'" width="48" height="48"></dt>'+ content +'</dl>');
            return callback&&callback(dom);
        }


        /**
         * 获取文本的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getTextTpl(position, content,callback){
            var content = formateTxt(encodeTxt(content));
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<p>' + content + '</p>'+
                        '</dd>';
            getTpl(position,html,function(d){
                  return callback&&callback(d);
            });
        }
        function formateTxt(content){
            var reg = /(https?|ftp|mms):\/\/([A-z0-9]+[_\-]?[A-z0-9]+\.)*[A-z0-9]+\-?[A-z0-9]+\.[A-z]{2,}(\/.*)*\/?/ig;
            
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
                .replace(/'/g, "&#39;");
        }

        function decodeTxt(content){
            return content
                .replace(/&quot;/g,'"')
                .replace(/&lt;/g,'<')
                .replace(/&gt;/g,'>')
                .replace(/&amp;/g, "&");
        }

        /**
         * 获取图片的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getPicTpl(position, content,callback){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<a href="javascript:void(0);" title="点击查看大图"><img src="'+content+'" width="120" height="90" alt=""></a>'+
                        '</dd>';
            getTpl(position,html,function(d){
                  return callback&&callback(d);
            });
        }
        
        /**
         * 获取地图的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getMapTpl(position, content,callback){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<a href="javascript:void(0);" title="点击查看地图" class="map">'+
                                '<img src="http://api.map.baidu.com/staticimage?center='+ content.baidu_lat + ',' + content.baidu_lng +'&width=300&height=200&zoom=11" width="120" height="120" alt="">'+
                                '<i class="ico_c"></i>'+
                                '<span class="msk"></span>'+
                                '<em class="msk_txt">'+ content.city + content.region + content.address +'</em>'+
                            '</a>'+
                        '</dd>';
            getTpl(position,html,function(d){
                  return callback&&callback(d);
            });
        }

        /**
         * 获取房源卡片的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getCardTpl(position, content,callback){
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
                '12' : '租房 (个人)',

            };
            var html = '<dd class="card">'+
                            '<em class="ico_arw"></em>'+
                            '<div class="cardbox cf">'+
                                '<h6>'+h6[content.tradeType]+'</h6>'+
                                '<a href="'+ content.src + '" class="cbox" target="_blank">'+
                                    '<img src="'+ content.img +'" width="65" height="50">'+
                                    '<p>'+ content.name +'</p>'+
                                    '<p class="gray">'+ content.des +'</p>'+
                                    '<p class="f14 bold">'+ content.price +'</p>'+
                                '</a>'+
                            '</div>'+
                        '</dd>';
            getTpl(position,html,function(d){
                  return callback&&callback(d);
            });
        }
        
        /**
         * 获取语音的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getVoiceTpl(position, content,callback){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<p>本功能不支持经纪人发布的语音，请<a href="http://shanghai.anjuke.com/mobile?from=RightBar" target="_blank">下载手机版</a></p>'+
                        '</dd>';
            getTpl(position,html,function(d){
                  return callback&&callback(d);
            });
        }

        /**
         * 获取系统的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getSysTpl(content,callback){
            var dom = J.create('div',{
                class : 'ct'
            }).html('<div class="notice">' + content.content + '</div>');
            return callback&&callback(dom);
        }
        
        /**
         * 获取链接的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getLinkTpl(position, content,callback){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<p><a href="'+'xx'+'" target="_blank">'+'xx'+'</a></p>'+
                        '</dd>';
            return ''
        }

        return {
            getSendMessageTpl :getSendMessageTpl,
            getShiftMessageTpl : getShiftMessageTpl,
            getTimeTpl : getTimeTpl
        }
    }

    C.Template = Template();

})(J.chat);
