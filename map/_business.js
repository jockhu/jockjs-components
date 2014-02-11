/// require('map.BMap');


var region_list = [
    {"region_id": "7", "region_title": "\u6d66\u4e1c", "Lat": "31.220104873204", "Lng": "121.56739336405", "Zoom": "14", "loupan_num": "194", "pinyin": "pudong"},
    {"region_id": "11", "region_title": "\u95f5\u884c", "Lat": "31.106018744131", "Lng": "121.41822295874", "Zoom": "14", "loupan_num": "80", "pinyin": "minhang"},
    {"region_id": "5", "region_title": "\u5f90\u6c47", "Lat": "31.196676437131", "Lng": "121.4437543905", "Zoom": "15", "loupan_num": "24", "pinyin": "xuhui"},
    {"region_id": "10", "region_title": "\u666e\u9640", "Lat": "31.266299697239", "Lng": "121.39182540631", "Zoom": "14", "loupan_num": "39", "pinyin": "putuo"},
    {"region_id": "6", "region_title": "\u957f\u5b81", "Lat": "31.229564711888", "Lng": "121.42576354928", "Zoom": "15", "loupan_num": "24", "pinyin": "changning"},
    {"region_id": "2", "region_title": "\u9759\u5b89", "Lat": "31.235250560941", "Lng": "121.45159075128", "Zoom": "15", "loupan_num": "36", "pinyin": "jingan"},
    {"region_id": "4", "region_title": "\u9ec4\u6d66", "Lat": "31.240525263239", "Lng": "121.49275087519", "Zoom": "15", "loupan_num": "24", "pinyin": "huangpu"},
    {"region_id": "3", "region_title": "\u5362\u6e7e", "Lat": "31.222351697873", "Lng": "121.47530065559", "Zoom": "15", "loupan_num": "35", "pinyin": "luwan"},
    {"region_id": "8", "region_title": "\u8679\u53e3", "Lat": "31.277089161938", "Lng": "121.48741240679", "Zoom": "15", "loupan_num": "16", "pinyin": "hongkou"},
    {"region_id": "12", "region_title": "\u95f8\u5317", "Lat": "31.260460492547", "Lng": "121.46805865041", "Zoom": "15", "loupan_num": "24", "pinyin": "zhabei"},
    {"region_id": "9", "region_title": "\u6768\u6d66", "Lat": "31.303034311108", "Lng": "121.5328626265", "Zoom": "14", "loupan_num": "64", "pinyin": "yangpu"},
    {"region_id": "13", "region_title": "\u5b9d\u5c71", "Lat": "31.437966063416", "Lng": "121.37939190034", "Zoom": "13", "loupan_num": "89", "pinyin": "baoshan"},
    {"region_id": "15", "region_title": "\u677e\u6c5f", "Lat": "31.021169325894", "Lng": "121.23847799745", "Zoom": "14", "loupan_num": "117", "pinyin": "songjiang"},
    {"region_id": "14", "region_title": "\u5609\u5b9a", "Lat": "31.379175164422", "Lng": "121.26875453082", "Zoom": "15", "loupan_num": "114", "pinyin": "jiading"},
    {"region_id": "19", "region_title": "\u9752\u6d66", "Lat": "31.166161200505", "Lng": "121.10322543744", "Zoom": "12", "loupan_num": "79", "pinyin": "qingpu"},
    {"region_id": "17", "region_title": "\u5949\u8d24", "Lat": "30.918535413392", "Lng": "121.46828953812", "Zoom": "15", "loupan_num": "55", "pinyin": "fengxian"},
    {"region_id": "18", "region_title": "\u91d1\u5c71", "Lat": "30.717737422955", "Lng": "121.35614918797", "Zoom": "14", "loupan_num": "57", "pinyin": "jinshan"},
    {"region_id": "20", "region_title": "\u5d07\u660e", "Lat": "31.629856771949", "Lng": "121.4085501731", "Zoom": "14", "loupan_num": "25", "pinyin": "chongming"},
    {"region_id": "6128", "region_title": "\u9646\u5bb6\u5634", "Lat": "31.243215", "Lng": "121.509232", "Zoom": "14", "loupan_num": "1", "pinyin": "lujiazui"},
    {"region_id": "6129", "region_title": "\u9646A", "Lat": "31.242165", "Lng": "121.510167", "Zoom": "14", "loupan_num": 0, "pinyin": "lua"},
    {"region_id": "6130", "region_title": "\u8f6f\u4ef6\u56ed", "Lat": "31.22966", "Lng": "121.539308", "Zoom": "14", "loupan_num": 0, "pinyin": "ruanjianyuan"},
    {"region_id": "6131", "region_title": "\u4e0a\u6d77\u5c0f\u53f7", "Lat": "31.233334", "Lng": "121.485158", "Zoom": "14", "loupan_num": 0, "pinyin": "shanghaixiaohao"},
    {"region_id": "6132", "region_title": "\u4e0a\u6d77\u5c0f\u53f7\u4e8c", "Lat": "31.23142", "Lng": "121.48717", "Zoom": "14", "loupan_num": 0, "pinyin": "shanghaixiaohaoer"},
    {"region_id": "6135", "region_title": "\u6d4b\u8bd5\u7248\u57574", "Lat": "31.230308", "Lng": "121.484295", "Zoom": "14", "loupan_num": 0, "pinyin": "ceshibankuai4"},
    {"region_id": "6136", "region_title": "\u6d4b\u8bd5\u7248\u575744", "Lat": "31.230247", "Lng": "121.483792", "Zoom": "14", "loupan_num": 0, "pinyin": "\u6d4b\u8bd5\u7248\u575744"}
];
var map_params = {"d": false, "elm": "jmap_fill", "lat": "31.230246775887", "lng": "121.48246298372", "mark": 0, "zoom": 14, "ezoom": 1, "minz": 10, "maxz": 18};
map_params['top'] = parseInt(document.getElementById('header').offsetHeight);
var h_height = (document.viewport.getHeight() - map_params['top']) + 'px',
    width = (document.viewport.getWidth() - 382),
    w_width = (width > 468 ? width : 468) + 'px';
$('map_page').setStyle({
    height: h_height,
    width: w_width
});
if (parseInt(width) <= 468) {
    $('jmap_list').setStyle({
        left: 468 + 'px',
        height: h_height
    });
} else {
    $('jmap_list').setStyle({
        left: 'auto',
        height: h_height
    });
}
$('i_shadow').setStyle({
    height: h_height
});
//console.log('height:',$('map_page').getStyle('height'),'height:height:',Jock.getHeight(),'top',map_params['top']);



function jmap(){

    new Map(map_params);

    function Map(option){
        var defOpts = {
            "d":false,
            "elm": "jmap_fill",
            "lat": "31.230246775887",
            "lng": "121.48246298372",
            "mark": 0, "zoom": 14,
            "ezoom": 1,
            "minz": 10,
            "maxz": 18,
            url:'/a/map/list/W0',
            type:'json',
            params:{

            },
            key:'lpID',
            buildUrl:function(url,WestEast){
                var i;
                for(i in WestEast){
                    url += "QQbaidu_" + i + "Z" + WestEast[i];
                }
                return url;
            },
            buildOverlay:null,
            getData:null,
            onResult:null
        }, M,opts,context,map,CACHE={},timer,prevCache={};
        CACHE.length =0;



        function init(){
            opts = J.mix(defOpts,option||{})
            context = new JMap(opts);
            map = context.getMap();
            getData();
            bindEvent();

        }
        init();
        function dataCenter(){


        }
        function bindEvent(){
            map.addEventListener('moveend',function(){
                timer&&clearTimeout(timer);
                timer = setTimeout(getData,200);
            });

            map.addEventListener('zoomend',function(){
                timer&&clearTimeout(timer);
                timer = setTimeout(getData,200);
            });
        }

        function getData(){
            var data = opts.params;
            if(!!opts.getData){
                var customParas = opts.getData();
                var type = Object.prototype.toString.call(customParas)
                if(type =='[object Object]'){
                    data = J.mix(opts.params,data,true);
                }

            }
            J.get({
                type:opts.type,
                url:buildUrl(),
                data:opts.params,
                onSuccess:onResult

            })

        }

        /**
         * 对数据进行操作
         * prevCache　上一次onResult中的overlay对像
         * １.如果地图上包含上次所有点不做任何操作
         * @param data
         */
        function onResult(data){
            var i= 0,key,pre={};
            for(;i<data.length;i++){
                var tmp = buildOverlayParams(data[i]);
                tmp.html='<div style="background: #ff0000;padding: 5px 10px;color: #fff">'+tmp.lpAdd+'</div>';
                key  = tmp[opts.key];
                if(CACHE[key]){
                    !prevCache[key]&&map.addOverlay(CACHE[key])
                }else{
                    var objOverlay = CACHE[key]= new Overlays(tmp);
                    map.addOverlay(objOverlay);
                }
                pre[key] = CACHE[key];
                delete prevCache[key];
            }
            var j;
            for(j in prevCache){
                prevCache[j].remove();
            }
            prevCache = pre;

        }
        function buildOverlayParams(data){
            var customData = (opts.buildOverlay&&opts.buildOverlay(data));
            return customData?customData:data;
        }

        function buildUrl() {
            var url = opts.url;
            var WestEast = getBoundsWE(-40), i,
                customerUrl = opts.buildUrl&&opts.buildUrl(url,WestEast);
            url = customerUrl || url;

            return url;
        }
        function getBoundsWE(zoom){
            var b=map.getBounds(),w=b.getSouthWest(),e=b.getNorthEast();
            if(zoom && typeof zoom == 'number'){
                var _w = map.pointToOverlayPixel(w),_e = map.pointToOverlayPixel(e);
                _w.x+=-zoom; // w.lng 横向
                _w.y+=zoom; // w.lat 纵向
                _e.x+=zoom-30;
                _e.y+=-(zoom-20);
                w=map.overlayPixelToPoint(new BMap.Pixel(_w.x,_w.y));
                e=map.overlayPixelToPoint(new BMap.Pixel(_e.x,_e.y));
            }
            return {
                swlat:w.lat,
                nelat:e.lat,
                swlng:w.lng,
                nelng:e.lng
            }
        }

        function sendMessage(type,message){
            J.fire(document,type,message,true);
        }

        function Overlays(option){
            var defOPts = {
                context:null,
                onclick:onClick,
                onMouseOut:onMouseOut,
                onMouseOver:onMouseOver
            },opts,obj;
            (function(){
                opts = J.mix(defOPts,option)
                obj = context.addOverlay(opts);
                obj.onClick = onClick;
                obj.onMouseOver = onMouseOver;
                obj.onMouseOut = onMouseOut;
            })();

            function onMouseOver(){
            }
            function onMouseOut(){
            }
            function onClick(){
                this.removeOverlay();

            }
            return obj;
        }


        function DataCenter(){
            var CACHE= {};
            var prev = [];

            /**
             * 取交集保留
             * @param data
             */
            function addData(data){
                var i= 0,key,prevTmp,len = data.length;
                for(;i<len;i++){
                    var tmp = buildOverlayParams(data[i]);
                    tmp.html='<div style="background: #ff0000;padding: 5px 10px;color: #fff">'+tmp.lpAdd+'</div>';
                    key  = tmp[opts.key];
                    if(CACHE[key]){
                        map.addOverlay(CACHE[key])
                    }else{
                        var objOverlay= new Overlays(tmp);
                        key ? CACHE[key] = objOverlay:'';
                        map.addOverlay(objOverlay);
                    }
                    prevTmp = prev[i];
                    prevTmp&&CACHE[prevTmp[opts.key]]&&CACHE[prevTmp[opts.key]].remove();
                }
                prev = data;
            }
            function drawData(){

            }
            function removeData(){

            }
        }



    }


}
/**
 * TimerTrigger component
 * design by Jock 2012.05.24
 */
(function (w) {
    function TimerTrigger(startTime, lodingTime, timeoutTime) {
        this.timerTypes = {
            delay: {
                k: 'DELAY',
                v: startTime || 1000
            },
            loading: {
                k: 'LOADING',
                v: lodingTime || 3000
            },
            timeout: {
                k: 'TIMEOUT',
                v: timeoutTime || 8000
            }
        };
        this.timerHandlers = [];
        this.status = '';
    }

    TimerTrigger.prototype = {
        constructor: TimerTrigger,
        // 清除当个任务
        clearTimer: function (timeType) {
            var timerT = timeType && timeType.k ? this.timerHandlers[timeType.k] : null;
            if (timerT) {
                clearTimeout(timerT);
                delete this.timerHandlers[timeType.k];
            }
        },
        // 清除所有任务
        clearTimers: function () {
            for (var t in this.timerTypes) {
                this.clearTimer(this.timerTypes[t]);
            }
            this.status = '';
        },
        // 启动智能任务
        startTimer: function (before, loadComplete, timeoutComplete) {
            var me = this;
            me.loadingTimer(before, function () {
                if (loadComplete) loadComplete.call(me);
                me.timeoutTimer(null, timeoutComplete);
            });
        },
        // 延迟启动任务
        delayTimer: function (before, complete, time) {
            this.status = 'delaying';
            var me = this, t = this.timerTypes.delay;
            if (before) before.call(me);
            this.timerHandlers[t.k] = setTimeout(function () {
                if (complete) complete.call(me);
            }, time || t.v);
        },
        // 启动加载任务
        loadingTimer: function (before, complete) {
            this.status = 'loading';
            var me = this, t = this.timerTypes.loading;
            if (before) before.call(me);
            this.timerHandlers[t.k] = setTimeout(function () {
                if (complete) complete.call(me);
            }, t.v);
        },
        // 启动超时任务
        timeoutTimer: function (before, complete) {
            this.status = 'timeouting';
            var me = this, t = this.timerTypes.timeout;
            if (before) before.call(me);
            this.timerHandlers[t.k] = setTimeout(function () {
                if (complete) complete.call(me);
            }, t.v);
        }
    }
    w['TimerTrigger'] = TimerTrigger;
})(window);

var TT = new TimerTrigger();

TT.startTimer(function () {
    Jock.map.loadMap('b', this, 'jmap');
}, function () {
    $('info_panel').update('<span class="sp_info">地图加载时间比平时要长，还在加载中...</span>');
}, function () {
    $('info_panel').update('<span class="sp_info">地图加载超时，请刷新页面</span>');
});

