/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/finfo.js
 * @author: 钟玲
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');
/// require('chat.pdata');

(function(C){


    /**
     * Finfo 函数
     * @param opts
     *      container:信息
     *      brokerId:经纪人id
     *      propId:房源id
     *
     * @constructor
     */
    function Finfo(){

        /**
         * 获取房源信息
         */
        function getPropertyInfo(opts){ 
            C.pdata.getPropertyInfo(opts.houseId, function(data){
                if(!data.retcode){
                    var data = data.retdata,
                        html = '<img src="'+data.pic +'" width="120" height="90">'+
                            '<a href="'+(data.url||'') + '" target="_blank">'+data.title+'</a>'+
                            '<p>'+data.community+'</p>'+
                            '<p>'+data.room+','+parseInt(data.size)+'平米par</p>'+
                            '<strong class="ylw">'+parseInt(data.price) +'万</strong>'+
                            '</div>';
                    opts.container.html(html);
                }
            })

            /*var getprop = pdata.getPropertyInfo({
                container : opts.container,
                property_id : opts.property_id
            },function(d){
                if(d.retcode === 0){
                    var data = d.retdata,
                        html = '<img src="'+data.pic +'" width="120" height="90">'+
                                '<a href="'+(data.url||'') + '" target="_blank">'+data.title+'</a>'+
                                '<p>'+data.community+'</p>'+
                                '<p>'+data.size+'</p>'+
                                '<strong class="ylw">'+data.price/10000+'万</strong>'+
                            '</div>';

                }else{
                }
                opts.container.s('.finfo').eq(0).html(html);
            });*/
        }

        /**
         * 获取经纪人信息
         */
        function getBrokerInfo(opts){
            C.pdata.getBrokerInfo(opts.brokerId, opts.id, function(data){
                if(!data.retcode){
                    var data = data.retdata,
                        html = '<dl class="cf">'+
                            '<dt><img src="'+data.photo+'" width="100" height="135"></dt>'+
                            '<dd>'+data.name+'</dd>'+
                            '<dd>'+data.phone+'</dd>'+
                            '<dd><a href="'+(data.url)+'" target="_blank">'+data.company+'</a></dd>'+
                            '<dd><a href="'+(data.url)+'" target="_blank">'+(data.store)+'</a></dd>'+
                            '</dl>'+
                            '<div class="ct"><a href="'+(data.more_url)+'" class="btn_more" target="_blank">查看TA的更多房源</a></div>'+
                            '</div>';
                    opts.container.html(html);
                }
            });
        }

        return {
            getPropertyInfo : getPropertyInfo,
            getBrokerInfo : getBrokerInfo
        }
    }

    C.finfo = new Finfo();

})(J.chat);

