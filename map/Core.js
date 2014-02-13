/// require('map.Bmap');

(function(J){
    function core(opption){
        var defOpts={
            url:'',
            id: "",
            lat: "31.230246775887",
            lng: "121.48246298372",
            mark: 0,
            zoom: 12,
            ezoom: 1,
            minz: 11,
            maxz: 18,
            onBeforeRequest:null,//取数据之前的操作　
            callback:eventBind,
            target:document//自定义事件触发的对象
        }, BMap, opts, MSG, context, dataCenter, map, isLoaded = false;

        (function() {
            opts = J.mix(defOpts, opption);
            context = new J.map.bmap(opts);

        })();



        function eventBind(){
            map = context.getMap();
            MSG = new MessageCenter(opts);
            dataCenter = new DataCenter(opts);

            var map = context.getMap();
          //  var event = ['click','dbclick','rightclick','rightdblclick','maptypechange','maptypechange'];
            J.on(opts.target,'mapLoaded',function(map){
                console.log("have resceived the event");
                dataCenter.getData();
            });

            map.addEventListener('click',function(){
                //map click
            });
            map.addEventListener('dbclick',function(){
                //map click
            });
            map.addEventListener('rightclick', function () {
                //map click
            });
            map.addEventListener('rightdblclick', function () {
                //map click
            });
            map.addEventListener('maptypechange', function () {
                //map click
            });
            map.addEventListener('mousemove', function () {
                //map click
            });
            map.addEventListener('mouseover', function () {
                //map click
            });
            map.addEventListener('mouseout', function () {
                //map click
            });
            map.addEventListener('movestart', function () {
                //map click
            });
            map.addEventListener('moveend', function () {
                dataCenter.getData();
            });
            map.addEventListener('zoomstart', function () {
                //map click
            });
            map.addEventListener('zoomend', function () {
                dataCenter.getData();

                //map click
            });
            map.addEventListener('touchstart', function () {
                //map click
            });
            map.addEventListener('touchmove', function () {
                //map click
            });
            map.addEventListener('touchend', function () {
                dataCenter.getData();
            });
            map.addEventListener('longpress', function () {
                //map click
            });


        }




        /**
         * 数据中心
         * @constructor
         */
        function DataCenter(opption){
            var defOpts = {
                    url:'',
                    type:'json',
                    onBeforeRequest:null//发送请求之前接收用户传递的参数

                },
                CACHE = [],
                opts,
                callback = {},
                guid= 0,
                key,
                isLocked;

            opts = J.mix(defOpts,opption);

            /**
             * 得到地图可视化区域坐标
             * @param zoom
             */
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

            /**
             * 发送ajax请求数据
             */
            function getData(){
                if(!isLoaded || isLocked){
                    return false;
                }
                var ajaxSetting={
                    type:opts.type,
                    onSuccess: null
                },params = beforeRequest(),data;
                if(!params){
                    return false;
                }

                data = CACHE[ key = getCacheKey(params)];
                if(data){
                    onResult(data);
                    return true;
                }
                callback[guid]&&(callback[guid]=J.map.bmap['callback'+guid]=function(){});
                guid++;
                ajaxSetting.callback =ajaxSetting.onSuccess = callback[guid]=J.map.bmap['callback'+guid] = onResult;
                J.get(ajaxSetting);
            }

            /**
             * 发送ajax请求之前所需要的参数
             * @returns {ajaxsetting} or {ajaxsetting.data}
             */
            function beforeRequest(){
                var params = getBoundsWE(),clientData;
                params.zoom =map.getZoom();
                clientData =  opts.onBeforeRequest&&opts.onBeforeRequest(params,map);
                return clientData ? false : J.mix(params,clientData);
            }

            /**
             * ajax数据回来　，创建Ｏverlay 并发现消息
             * @param data
             */
            function onResult(data){
                if(data&&!CACHE[key])CACHE[key] = data;
                data&&(CACHE[key]= data);
                MSG.ajaxChange(data);//通过消息中心发送消息
            }

            /**
             * get the cache key
             * @returns {string}
             */
            function getCacheKey (params){
                var i,key='';
                for(i in params){
                    key= key+i;
                }
                return key;
            }

            /**
             *
             * @param ret
             */
            function setLocked(ret){
               isLocked = !!ret;
            }

            return {
                getData:getData
            }
        }


        /**
         * 标点中心
         * @constructor
         */

        function OverlayCenter(option){
            var defOpts= {
                html:'',//标点要显示html
                onMouseOver:null,
                onMouseOut:null,
                onClick:null,
                onItemBuild:null,
                overlaysType:'overlays',//标点的类型
                showInfo:'',//点击要展示的文本,
                className:'',//默认展示的Class
                classHover:'',//鼠标放上去展示的样式
                x:0,//x轴要偏移的像素
                y:0//y轴要偏 移的像素
            },opts,preCache;
            (function(){
                opts= J.mix(defOpts,option);


            })();
            function addOverlay(data){

            }
            function onClick(elm,data){
                MSG.overlayClick({
                    target:elm,
                    data:data
                });
            }
            function onMouseOver(elm,data){
                MSG.overlayMouseOver({
                    target:elm,
                    data:data
                });

            }
            function onMouseOut(elm,data){
                MSG.overlayMouseOut({
                    target:elm,
                    data:data
                });
            }
            function remove(elm,data){
                MSG.overlayRemove({
                    target:elm,
                    data:data
                });
            }

            /**
             *
             * @param data array
             */
            function addOverlays(data){
                var i,len=data.length,itemOpts,item,key,tmpObj={},removeHandler;
                for(i=0;i<len;i++){
                    itemOpts = onItemBuild(data[i]);
                    if(!html) continue;
                    itemOpts = J.mix(defOpts,itemOpts,true);
                    key = buildOverlayKey(itemOpts);
                    if(!preCache[key+itemOpts.overlaysType]){
                        item =  context.addOverLays(itemOpts,itemOpts.overlaysType,key);
                        item.onClick = function(){
                            var ret = itemOpts.onClick&&itemOpts.onClick.call(this);
                            if(ret === false) return;
                            onClick(item,itemOpts);
                        };
                        item.onMouseOver = function(){
                            var ret = onMouseOver.call(this);
                            if(ret === false) return;
                            onMouseOver(item,itemOpts);

                        };

                        item.onMouseOut = function(){
                            var ret = onMouseOver.call(this);
                            if(ret === false) return;
                            onMouseOut(item,itemOpts);
                        }
                        item.onRemove = function(){
                            itemOpts.remove&&itemOpts.remove(item,itemOpts);
                            remove(item,itemOpts);
                        }
                        tmpObj[key+itemOpts.overlaysType] = item;
                    }
                    for(i in preCache){
                        remove(preCache[i]);
                    }
                    preCache = tmpObj;
                }
            }

            /**
             * 为创建的Overlay创建参数
             */
            function onItemBuild(data){
                var tmp ;
                var html = opts.onItemBuild&& (tmp =opts.onItemBuild(data))?opts.html:tmp;
                return html;
            }

            /**
             * 移除上次ajax所添加的数据，并移除不应该显示的点
             * data OverlaysArray
             */
            function removeOverlays(data){

            }
            function buildOverlayKey(latlng){
                return latlng.lat+'_'+latlng.lng;
            }
            function k_means(){


            }
            return {
                addOverLays:addOverlays
            }




        }

        /**
         * 消息中心
         * @returns {{ajaxChange: Function, overlayRemove: Function, overlayClick: Function, overlayMouseOver: Function}}
         * @constructor
         */
        function MessageCenter(option){

            var defOpts = {
                target:document,//触发对象
                data:null//附带消息
            },opts;
            (function(){
                opts = J.mix(defOpts,option);

            })();

            /**
             * 发送的ajax请求变化
             */
            function ajaxChange(data){
                sendMessage('ajaxChange',data);
            }
            /**
             *
             */
            function overlayRemove(data){
                sendMessage('overlayRemove',data);

            }
            function overlayClick(data){
                sendMessage('overlayClick',data);
            }
            function overlayMouseOver(data){
                sendMessage('overlayMouseOver',data);
            }
            function overlayMouseOut(data){
                sendMessage('overlayMouseOut',data);
            }
            function mapMoveStart(data){
                sendMessage('mapMoveStart',data);
            }
            function mapMoveStop(data){
                sendMessage('mapMoveStop',data);
            }
            function zoomChange(data){
                sendMessage('zoomChange',data);
            }
            function sendMessage(eventName,data){
                J.fire(opts.target,eventName,data,true);
            }
            return {
                ajaxChange:ajaxChange,
                overlayRemove:overlayRemove,
                overlayClick:overlayClick,
                overlayMouseOver:overlayMouseOver,
                overlayMouseOut:overlayMouseOut,
                mapMoveStart:mapMoveStart,
                mapMoveStop:mapMoveStop,
                zoomChange:zoomChange

            }
        }
        return J.mix({
            getData:dataCenter.getData

        },context);
    }
    J.map.core =core;

})(J);