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
     *      container:推荐位容器
     *      broker_id:经纪人id
     *      prop_id:房源id
     *
     * @constructor
     */
    function Recomm(){
      /*  var options = {
            container : '',
            broker_id : '',
            prop_id : '',
            city_id : '',
            price_int : ''
        }
        init(opts);
        *//**
         * 初始化
         *//*
        function init(options){
            options = J.mix(options,opts||{});
            getRecommList(options);
        };
*/

        function buildHtml(item){
            return '<dl class="cf">'+
                '<dt>'+
                '<img src="' + item.image +'" width="65" height="50">'+
                '</dt>'+
                '<dd class="fname">'+
                '<a href="' + (item.url||'') + '" target="_blank">'+item.title + '</a>'+
                '</dd>'+
                '<dd class="ylw">'+parseInt(item.price) +'万</dd>'+
            '</dl>';
        }

        /**
         * 获取房源推荐列表
         * @param opts
         */
        function getRecomm(opts){
            C.pdata.getRecomm(opts.brokerId, opts.propId, function(data){
                var html = '', arrHtml;
                if(data.retcode === 0){
                    J.each(data.retdata, function(i, v){
                        arrHtml.push( buildHtml(v) );
                    });
                    html = arrHtml.join('');
                }else{
                    html = '<p>暂无推荐房源</p>';
                }
                opts.container.html(html);
            });



            /*var pdata = J.chat.Pdata.getRecomm({
                container : opts.container,
                broker_id : opts.broker_id,
                prop_id : opts.prop_id,
                city_id : opts.city_id,
                price_int : opts.price_int
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
                opts.container.s('.othslist').eq(0).html(html);
            });*/
        }

        return {
            getRecomm:getRecomm
        }
       
    }

    C.recomm = new Recomm();

})(J.chat);
