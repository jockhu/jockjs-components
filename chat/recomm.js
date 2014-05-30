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
            var id = opts.brokerId ? opts.brokerId : opts.id;//若有borkerId则传入,否则传入chatid
            C.pdata.getRecomm(id, opts.houseId, function(data){ 
                var html = '', arrHtml=[];
                // data = {"retcode":0,"retmsg":"success","retdata":[{"id":"168797270","title":"\u6d4b\u8bd5\u623f\u6e90 4","price":"333.00","image":"http:\/\/pic1.ajkimg.com\/display\/d7bc72694c4f5b8e81cfadef20f44bd6\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168797270"},{"id":"168797251","title":"\u6d4b\u8bd5\u623f\u6e90 2","price":"333.00","image":"http:\/\/pic1.ajkimg.com\/display\/86bd65d3d18af4714d6ee7bfeea47d41\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168797251"},{"id":"168797201","title":"\u6d4b\u8bd5\u623f\u6e90  2","price":"444.00","image":"http:\/\/pic1.ajkimg.com\/display\/7c6822879c06f6fd8bd90b079e550fc6\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168797201"},{"id":"168797186","title":"\u6d4b\u8bd5\u623f\u6e90  1","price":"444.00","image":"http:\/\/pic1.ajkimg.com\/display\/d380c6f421dc10ce2f86496561537f8d\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168797186"},{"id":"168795434","title":"\u6d4b\u8bd5\u7ade\u4ef7\u7684\u623f\u6e90\u4e0b\u67b6\u5904\u7406 \u7136\u540e\u91cd\u65b0\u63a8\u5e7f1","price":"333.00","image":"http:\/\/pic1.ajkimg.com\/display\/d380c6f421dc10ce2f86496561537f8d\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168795434"},{"id":"168793714","title":"\u6d4b\u8bd5\u7cbe\u9009\u63a8\u5e7f 24 1","price":"244.00","image":"http:\/\/pic1.ajkimg.com\/display\/e8f0b0fc5edd361210c3367bd8c5a4f0\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168793714"},{"id":"168793712","title":"\u6d4b\u8bd5\u7b4b\u9aa8\u5438\u7eb3\u8ba1\u52121","price":"666.00","image":"http:\/\/pic1.ajkimg.com\/display\/1362e52ef88121cbe61c06d524cd5092\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168793712"},{"id":"168793691","title":"\u6d4b\u8bd5\u53d1\u5149\u6e90\u9006\u88ad","price":"280.00","image":"http:\/\/pic1.ajkimg.com\/display\/7d966ef2554df46d4b8ce3473caafbee\/420x315c.jpg","url":"http:\/\/www.anjuke.com\/prop\/view\/168793691"}]}

                if(data.retcode === 0 && data.retdata){
                    J.each(data.retdata, function(i, v){
                        arrHtml.push( buildHtml(v) );
                    });
                    html = arrHtml.join('');
                }else{
                    html = '<p>暂无推荐房源</p>';
                }
                opts.container.html(html);
            });



            // var pdata = J.chat.Pdata.getRecomm({
            //     container : opts.container,
            //     broker_id : opts.broker_id,
            //     prop_id : opts.prop_id,
            //     city_id : opts.city_id,
            //     price_int : opts.price_int
            // },function(d){
            //     if(d.retcode === 0){
            //         var html = '';
            //         for(var i in d.retdata){
            //             var data = d.retdata[i],
            //                 txt = '<dl class="cf">'+
            //                     '<dt>'+
            //                         '<img src="' + data.image +'" width="65" height="50">'+
            //                     '</dt>'+
            //                     '<dd class="fname">'+
            //                         '<a href="' + (data.url||'') + '" target="_blank">'+data.title + '</a>'+
            //                     '</dd>'+
            //                     '<dd class="ylw">'+parseInt(data.price) +'万</dd>'+
            //                 '</dl>';
            //             html+=txt;
            //         }

            //     }else{
            //         html = '<p>暂无推荐房源</p>';
            //     }
            //     opts.container.s('.othslist').eq(0).html(html);
            // });
        }
        return {
            getRecomm:getRecomm
        }
    }
    C.recomm = Recomm;

})(J.chat);
