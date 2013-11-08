/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/exposure.js
 * @author: Lunjiang
 * @version: 1.0.0
 * @date: 2013/09/08
 *
 */

/// require('ui.ui');
/// require('page');
(function (J) {
    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var defaultOpts = {
        trackTag:"data-trace",
        trackType:'',
        pageName:null,
        site:null,
        autoStart:true//是否页面加载全局搜索A
    }, data = 0;

    /**
     * Panel Function
     * @param options 扩展选项
     * @constructor
     */
    function Exposure(options) {
        var opts,disPatch,tasker,traceTag,page = J.page,tracker;
        (function(){
            opts = J.mix(defaultOpts, options || {},true);
            traceTag = opts.trackTag;
            tracker = new J.logger.Tracker(opts.site, opts.pageName);
            opts.trackType && tracker.setSendType(opts.trackType);
            tasker = new Tasker(opts);
            disPatch =  new Dispatch();
        })();
        function Dispatch() {
            var timer = null,cache=[],botY,topY,pageW,pageH,delay = 50,Ret={};
            function init(){
               resize();
               opts.autoStart&&add(J.s("a"));
               eventBind();
            }
            function eventBind(){
               window.onscroll = taskAdd;
                J.on(window,"scroll",taskAdd);
                J.on(window,"resize",resize);
            }

            /**
             *
             * @param doms
             */
            function add(doms){
                (doms&&doms.length)&&(doms.each(function(k,v){
                    v.attr(traceTag)&&(function(){
                            var tmpY = v.offset().y;
                            cache.push({y:tmpY,elm:v,trace: v.attr(traceTag)})
                            v.attr("pos",v.offset().y)
                    })();
                }),taskAdd());
            }
            function remove(dom){
                dom && J.each(dom, function(i, v){
                    (cache[i].elm.get() == dom.get()) && (cache.splice(i,1));
                });
            }
            function taskAdd(){
                timer&&clearTimeout(timer);
                timer=setTimeout(function(){
                    topY = page.scrollTop(),botY=topY+ pageH;
                    var ret= [];
                    for(var i in cache){
                        var tmp = cache[i], offsetY =  tmp.elm.offset().y;
                        if(tmp && (offsetY>topY && offsetY < botY)){
                            ret.push(tmp.trace);
                            delete cache[i];
                        }
                    }
                    if(!ret.length){
                        return;
                    }
                    tasker.add(ret);
                },delay);
            }
            function resize(){
                pageW = J.page.viewWidth();
                pageH = J.page.viewHeight();
            }
            return {
                add:add,
                remove:remove,
                init:init
            }
        }

        function Tasker(options) {
            var timer = null,delay = 1000,Ret={},WAITEDDATA= [];
            
            (function(){
                J.on(window,'beforeunload',function(){
                    sendData()
                });
            })();

            function setData(items) {
                for (var key in items) {
                    /^\d+$/.test(items[key]) && (Ret[key] || (Ret[key] = []), Ret[key].push(items[key]))
                }
            }
            function buildData(){
                var data = eval('([' + WAITEDDATA.join(',') + '])');
                var l = data.length;
                while (l--) {
                    setData(data[l]);
                }
                var U = [];
                for (var item in Ret) {
                    U.push('"' + item + '":[' + Ret[item].join(',') + ']')
                }
                Ret = {};
                WAITEDDATA = [];
                //return U;
                return  '{"exposure":' + '{' + U.join(",") + '}'+ '}';
            }
            function add(data){
                WAITEDDATA=WAITEDDATA.concat(data)
                timer&&clearTimeout(timer);
                timer= setTimeout(sendData,delay);
            }
            function sendData(){
                if(WAITEDDATA.length){
                    tracker.setCustomParam(buildData());
                    tracker.track();
                }
            }
            return {
                add:add
            }
        }
        var ret ={
            add:disPatch.add,
            remove:disPatch.remove,
            start:disPatch.init
        };
        return J.mix(ret,tracker);
    }
    J.ui.exposure = Exposure;
})(J);
