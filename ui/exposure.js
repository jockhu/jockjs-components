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
        pageName:null,
        site:null
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
            tracker = new J.site.tracker(opts.site, opts.pageName);
            tasker = new Tasker(opts);
            disPatch =  new Dispatch();
        })();
        function Dispatch() {
            var timer = null,cache=[],botY,topY,pageW,pageH,delay = 50,Ret={};
            function init(){
               resize();
               add(J.s("a"));
               eventBind();
            }
            function eventBind(){
                J.on(window,"scroll",taskAdd);
                J.on(window,"resize",resize);
            }
            function add(doms){
                doms&&doms.each(function(k,v){
                    v.attr(traceTag)&&(function(){
                        setTimeout(function(){
                            cache.push({y:v.offset().y,elm:v,trace: v.attr(traceTag)})
                        },0);
                    })();
                });
                taskAdd();
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
                        var tmp = cache[i];
                        if(tmp && (tmp.y>topY && tmp.y < botY)){
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
            function start(){

            }
            return {
                add:add,
                remove:remove,
                init:init
            }
        }

        function Tasker(options) {
            var timer = null,delay = 3000,Ret={},WAITEDDATA= [];
            
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
J.ready(function(){
    var st =  new J.ui.exposure()
    st.setSite("anjuke-exposure-npv");
    st.setPage("Home_HomePage");
    st.setPageName("Home_HomePage");
    st.setReferrer(document.referrer);
    st.setNGuid("aQQ_ajkguid");
    st.setNUid("ajk_member_id");
    st.start();
});
