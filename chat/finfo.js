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
            C.pdata.getPropertyInfo(opts.houseId, opts.cityId, function(data){
                if(!data.retcode){
                    var data = data.retdata,
                        html = '<a class="prop_link" href="'+(data.url||'') + '" target="_blank">' + '<img src="'+data.pic +'" width="120" height="90"></a>'+
                            '<a href="'+(data.url||'') + '" target="_blank">'+data.title+'</a>'+
                            '<p>'+data.community+'</p>'+
                            '<p>'+data.room+','+parseInt(data.size)+'平米</p>'+
                            '<strong class="ylw">'+parseInt(data.price) +'万</strong>'+
                            '</div>';
                    opts.container.html(html);
                }
            })
        }

        /**
         * 获取经纪人信息
         */
        function getBrokerInfo(opts){
            C.pdata.getBrokerInfo(opts.brokerId, opts.id, function(data){
                if(!data.retcode){
                    var data = data.retdata, str;
                    if (data.company_id && parseInt(data.company_id) != 0) {
                        str = '<dd><a href="'+(data.url||'')+'" target="_blank">'+data.company+'</a></dd>'+
                              '<dd><a href="'+(data.url||'')+'" target="_blank">'+(data.store)+'</a></dd>';
                    } else {
                        str = '<dd><p>'+data.company+'</p></dd>'+
                              '<dd><p>'+(data.store)+'</p></dd>';
                    }

                    var html = '<dl class="cf">'+
                            '<dt><img src="'+data.photo+'" width="100" height="135"></dt>'+
                            '<dd>'+data.name+'</dd>'+
                            '<dd>'+data.phone+'</dd>'+
                            str +
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

