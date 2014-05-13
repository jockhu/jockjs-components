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
            'f10011': getPicTpl,
            'f10012': getMapTpl,
            'f10013': getCardTpl,
            'f10014': getVoiceTpl,
            'f10015': getLinkTpl
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
        function getSendMessageTpl(type, content){
            return FUNS[type]('left',content);
        }

        /**
         * 获取接受者的消息模板
         * @param type
         * @param content
         */
        function getShiftMessageTpl(type, content){
            return FUNS[type]('left',content);
        }

        /**
         * 获取文本的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getTextTpl(position, content){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<p>'+xx+'</p>'+
                        '</dd>';
            return ''
        }

        /**
         * 获取图片的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getPicTpl(position, content){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<a href="javascript:void(0);" title="点击查看大图"><img src="'+xx+'" width="120" height="90" alt=""></a>'+
                        '</dd>';
            return ''
        }
        
        /**
         * 获取地图的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getMapTpl(position, content){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<a href="javascript:void(0);" title="点击查看地图" class="map">'+
                                '<img src="'+xx+'" width="120" height="120" alt="">'+
                                '<i class="ico_c"></i>'+
                                '<span class="msk"></span>'+
                                '<em class="msk_txt">'+xx+'</em>'+
                            '</a>'+
                        '</dd>';
            return ''
        }

        /**
         * 获取房源卡片的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getCardTpl(position, content){
            var html = '<dd class="card">'+
                            '<em class="ico_arw"></em>'+
                            '<div class="cardbox cf">'+
                                '<h6>'+xx+'</h6>'+
                                '<div class="cbox">'+
                                    '<img src="'+xx+'" width="65" height="50">'+
                                    '<p>'+xx+'</p>'+
                                    '<p class="gray">'+xx+'</p>'+
                                    '<p class="f14 bold">'+xx+'</p>'+
                                '</div>'+
                            '</div>'+
                        '</dd>';
            return ''
        }
        
        /**
         * 获取语音的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getVoiceTpl(position, content){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<p>本功能不支持经纪人发布的语音，请<a href="http://shanghai.anjuke.com/mobile?from=RightBar" target="_blank">下载手机版</a></p>'+
                        '</dd>';
            return ''
        }
        
        /**
         * 获取链接的模板
         * @param position
         * @param content
         * @returns {string}
         */
        function getLinkTpl(position, content){
            var html = '<dd>'+
                            '<em class="ico_arw"></em>'+
                            '<p><a href="'+xx+'" target="_blank">'+xx+'</a></p>'+
                        '</dd>';
            return ''
        }

        return {
            getTextTpl : getTextTpl,
            getPicTpl : getPicTpl,
            getMapTpl : getMapTpl,
            getCardTpl : getCardTpl,
            getVoiceTpl : getVoiceTpl,
            getLinkTpl : getLinkTpl
        }
    }

    C.Template = Template;

})(J.chat);

