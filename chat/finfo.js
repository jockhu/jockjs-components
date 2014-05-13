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

(function(C){


    /**
     * Finfo 函数
     * @param opts
     *      container:
     *      brokerObject:
     *      propertyId
     *
     * @constructor
     */
    function Finfo(opts){

        /**
         * 初始化
         */
        function init(){
            
        }
        var pdata = new J.chat.Pdata();
        /**
         * 获取房源信息
         */
        function getPropertyInfo(opts,callback){
            var getprop = pdata.getPropertyInfo({
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
                return callback&&callback(html);
            });
        }

        /**
         * 获取经纪人信息
         */
        function getBrokerInfo(opts,callback){
            var getbro = pdata.getBrokerInfo({
                'broker_id' : opts.broker_id
            },function(d){
                if(d.retcode === 0){
                    var data = d.retdata,
                        html = '<dl class="cf">'+
                                    '<dt><img src="'+data.photo+'" width="100" height="135"></dt>'+
                                    '<dd>'+data.name+'</dd>'+
                                    '<dd>'+data.phone+'</dd>'+
                                    '<dd><a href="'+(data.companyUrl||'')+'" target="_blank">'+data.company+'</a></dd>'+
                                    '<dd><a href="'+(data.addressUrl||'')+'" target="_blank">'+(data.address||'')+'</a></dd>'+                                   
                                '</dl>'+
                                '<div class="ct"><a href="'+(data.moreUrl||'')+'" class="btn_more" target="_blank">查看TA的更多房源</a></div>'+
                            '</div>';
                }else{

                }
                return callback&&callback(html);
            });
        }

        return {
            getPropertyInfo : getPropertyInfo,
            getBrokerInfo : getBrokerInfo
        }
    }

    C.Finfo = Finfo;

})(J.chat);

