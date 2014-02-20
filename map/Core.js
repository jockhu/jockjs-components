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
            cacheKey:['id','zoom'],//创建缓存的ｋｅｙ值
            onBeforeRequest:null,//取数据之前的操作　
            onResult:null,//数据返回的操作
            callback:null,
            target:document//自定义事件触发的对象
        }, BMap, opts, MSG, context, dataCenter,overlayCenter, map, isLoaded = false,stack;

        (function() {
            opts = J.mix(defOpts, opption);

            context = new J.map.bmap(opts);
            dataCenter = DataCenter(opts);
            MSG = new MessageCenter(opts);
            eventBind();


            overlayCenter = new OverlayCenter(opts);
        })();






        function eventBind(){
            isLoaded = true;
            map = context.getMap();
            dataCenter = new DataCenter(opts);
            map = context.getMap();
            dataCenter.getData();
          //  var event = ['click','dbclick','rightclick','rightdblclick','maptypechange','maptypechange'];
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
               // dataCenter.getData();
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
                    onBeforeRequest:null,//发送请求之前接收用户传递的参数
                    onResult:null//对数据返回作处理
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
             * 防止用户频繁操作，用setTimeout解决
             * 发送ajax请求数据
             * sendImmediately 是送立即取数据
             */
            function getData(sendImmediately){
                if(!isLoaded || isLocked){
                    stack.push(getData);
                    return false;
                }

                var ajaxSetting={
                    url:opts.url,
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

                ajaxSetting.onSuccess = callback[guid]=J.map.bmap['callback'+guid] = onResult;
                //ajaxSetting.callback = 'J.map.bmap.callback'+guid;
                ajaxSetting.data = params;
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
                return clientData ?  J.mix(params,clientData):false;
            }

            /**
             * ajax数据回来　，创建Ｏverlay 并发现消息
             * @param data
             */
            function onResult(data){
                data.zoom = context.getZoom();
                var clientData = opts.onResult&&opts.onResult(data);
                if(Object.prototype.toString.call(clientData) === "[object Array]"){
                    if(clientData&&!CACHE[key])CACHE[key] = clientData;
                    MSG.ajaxChange(data);//通过消息中心发送消息
                    overlayCenter.addOverLays(clientData);
                }

            }

            /**
             * get the cache key
             * @returns {string}
             */
            function getCacheKey (params){
                var i,key='',searchRet=[],totalRet =[];
                for(i in params){
                    opts.cacheKey.indexOf(i) >-1 ? searchRet.push( params[i]+'_') :totalRet.push(params[i]+'_');
                }
                return searchRet.length === opts.cacheKey.length ? searchRet.join('') :totalRet.join('') ;
            }

            /**
             *
             * @param ret
             */
            function setLocked(ret){
               isLocked = !!ret;
            }

            return {
                getData:getData,
                getCacheKey:getCacheKey
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
            },opts,preCache={};
            (function(){
                opts= J.mix(defOpts,option);


            })();
            function addOverlay(data){

            }
            function onClick(elm,data){
                data.target = elm;
                MSG.overlayClick(data);
            }
            function onMouseOver(elm,data){
                data.target = elm;
                MSG.overlayMouseOver(data);
            }
            function onMouseOut(elm,data){
                data.target = elm;
                MSG.overlayMouseOut(data);
            }
            function remove(data){
                data.remove();
                MSG.overlayRemove(data);
            }

            /**
             *
             * @param data array
             */
            function addOverlays(data){
                var i,len=data.length,itemOpts,item,key,tmpObj={},removeHandler, j,zoom=context.getZoom();

                for(i=0;i<len;i++){

                    (function(itemOpts){
                        itemOpts = data[i];
                        itemOpts.zoom = zoom;
                        itemOpts = onItemBuild(data[i]);
                        if(!itemOpts.html) return;

                        //itemOpts = J.mix(defOpts,itemOpts,true);
                        key = dataCenter.getCacheKey(itemOpts);
                        itemOpts.key = key;
                        /**
                         * 不在ｃａｃｈｅ里，需要创建，同时创建缓存
                         */
                        if(!preCache[key]){
                            item =  context.addOverlay(itemOpts,itemOpts.overlaysType,key);
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
                            tmpObj[key] = item;
                            return;
                        }
                        tmpObj[key] = preCache[key];
                        delete  preCache[key];
                    })(itemOpts);

                }
                /**
                 * 删除本次请求与上次请求之外的点
                 */
                for(j in preCache){
                    remove(preCache[j]);
                }
                preCache = tmpObj;

            }

            /**
             * 为创建的Overlay创建参数
             */
            function onItemBuild(data){
                opts.onItemBuild&&opts.onItemBuild(data);
                return data;
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
            },opts,overlayEventType={
                click:'map:overlayClick',
                mouseOver:'overlayMouseOver',
                mouseOut:'overlayMouseOut',
                remove:'overlayRemove'
            };

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
                sendMessage(overlayEventType.click,data);
            }
            function overlayMouseOver(data){
                sendMessage(overlayEventType.mouseOver,data);
            }
            function overlayMouseOut(data){
                sendMessage(overlayEventType.mouseOut,data);
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
                zoomChange:zoomChange,
                eventType:{
                    overlay:overlayEventType//overlay事件类型
                }


            }
        }
        return J.mix({
            getData:dataCenter.getData,
            eventType:MSG.eventType
        },context);
    }
    J.map.core =core;

})(J);