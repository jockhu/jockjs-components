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
/// require('chat.pdata');

(function(C){


    /**
     * Recomm 函数
     * @param opts
     *      container:推荐位容器
     *      broker_id:经纪人id
     *      prop_id:房源id
     *
     * @constructor
     */
    function Recomm(){

        function buildHtml(item){
            return '<dl class="cf">'+
                '<dt>'+
                '<img src="' + item.image +'" width="65" height="50">'+
                '</dt>'+
                '<dd class="fname">'+
                '<a href="' + (item.url) + '" target="_blank">'+item.title + '</a>'+
                '</dd>'+
                '<dd class="ylw">'+parseInt(item.price) +'万</dd>'+
            '</dl>';
        }

        /**
         * 获取房源推荐列表
         * @param opts
         */
        function getRecomm(opts){
            C.pdata.getRecomm(opts.brokerId, opts.id, opts.houseId||'', function(data){
                var html = '', arrHtml=[];
                if(data && data.retcode == 0 && data.retdata && data.retdata.length){
                    J.each(data.retdata, function(i, v){
                        arrHtml.push( buildHtml(v) );
                    });
                    html = arrHtml.join('');
                }else{
                    html = '<p>暂无推荐房源</p>';
                }
                opts.container.html(html);
            });

        }
        return {
            getRecomm:getRecomm
        }
    }
    C.recomm = Recomm;

})(J.chat);
