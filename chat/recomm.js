/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/recomm.js
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
     *      container:
     *      brokerObject:
     *      propertyId
            callback
     *
     * @constructor
     */
    function Recomm(){
        /**
         * 初始化
         */

        function init(opts,callback){
            var defaults = {
                broker_id : opts.broker_id || '',
                city_id : opts.city_id || '',
                price_int : opts.price_int || '',
                prop_id : opts.prop_id || ''
            };
            getRecommList(defaults,callback);
        };

        /**
         * 获取房源推荐列表
         */
        function getRecommList(opts,callback){
            var pdata = J.chat.Pdata.getRecomm({
                broker_id : opts.broker_id ,
                city_id : opts.city_id,
                price_int : opts.price_int,
                prop_id : opts.prop_id
            },function(d){
                if(d.retcode === 0){
                    var html = '';
                    for(var i in d.retdata){
                        var data = d.retdata[i],
                            txt = '<dl class="cf">'+
                                '<dt>'+
                                    '<img src="' + data.image +'" width="65" height="50">'+
                                '</dt>'+
                                '<dd class="fname">'+
                                    '<a href="' + (data.url||'') + '" target="_blank">'+data.title + '</a>'+
                                '</dd>'+
                                '<dd class="ylw">'+parseInt(data.price) +'万</dd>'+
                            '</dl>';
                        html+=txt;
                    }

                }else{
                    html = '<p>暂无推荐房源</p>';
                }
                return callback&&callback(html);
            });
        }

        return {
            init:init
        }
       
    }

    C.Recomm = Recomm;

})(J.chat);
