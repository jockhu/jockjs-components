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
            classHover:'',
            target:document,//自定义事件触发的对象
            zoomEnd:null,//缩放结束事件
            moveEnd:null//地图移动结事事件
        }, BMap, opts, MSG, context, dataCenter,overlayCenter, map,lockCenter,moveStart,moveEnd;

        (function() {
            opts = J.mix(defOpts, opption);

            context = new J.map.bmap(opts);
            dataCenter = DataCenter(opts);
            MSG = new MessageCenter(opts);
            lockCenter = new LockCenter();

            eventBind();
            overlayCenter = new OverlayCenter(opts);
        })();






        function eventBind(){
            map = context.getMap();
            dataCenter = new DataCenter(opts);
            map = context.getMap();
            dataCenter.getData();
          //  var event = ['click','dbclick','rightclick','rightdblclick','maptypechange','maptypechange'];

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
                moveStart = context.getCenter();

                //map click
            });
            map.addEventListener('moveend', function (e) {
                moveEnd = context.getCenter();
                /**
                 * 把移动的长度添加的事件属性当中去。
                 * @type {*}
                 */
                e.moveLenth = moveLength(moveStart,moveEnd);
                opts.moveEnd&&opts.moveEnd.call(this,e);
            });
            map.addEventListener('zoomstart', function () {
                //map click
            });
            map.addEventListener('zoomend', function (e) {
                 opts.zoomEnd&&opts.zoomEnd.call(this,e);
                //map click
            });
            map.addEventListener('touchstart', function () {
                //map click
              //  alert("touchstart ")
            });
            map.addEventListener('touchmove', function () {
                //map click
            });
            map.addEventListener('touchend', function () {
                //dataCenter.getData();
            });
            //click 执行操作就行了。
            map.addEventListener('click',function(e){

            });
            map.addEventListener('longpress', function () {
                //map click
            });

            function moveLength(moveStart,moveEnd){
                if(!moveEnd || !moveStart) return 0;
                var start ,end ;
                end = map.pointToOverlayPixel(moveEnd);
                start = map.pointToOverlayPixel(moveStart);
                 return Math.sqrt((end.x-start.x)*(end.x-start.x)+(end.y-start.y)*(end.y-start.y));
            }




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
             * sendData　自定义发数的数据　用于用户主动发送的数据
             * immediately true 忽略lock
             * isLock 右边不变化,适用于翻页
             */
            function getData(sendData,isLock){
                var sendData =  sendData || {};
                if(!isLock&&lockCenter.isLock()){
                    return;
                }
                var ajaxSetting={
                    url:opts.url,
                    type:opts.type,
                    onSuccess: null,
                    timeout:20000
                };
                var params = beforeRequest(sendData),data;
                if(params === false){
                    return false;
                }
              /*  data = CACHE[ key = getCacheKey(params)];

                if(data){
                    onResult(data);
                    return true;
                }*/
                callback[guid]&&(callback[guid]=J.map.bmap['callback'+guid]=function(){});
                guid++;
                ajaxSetting.onSuccess = callback[guid]=J.map.bmap['callback'+guid] = onResult;
                onResult.isLock = isLock;
                ajaxSetting.data = J.mix(params,sendData);
                J.get(ajaxSetting);

            }
            function getStaticData(sendData){
                getData(sendData,true);
            }

            /**
             * 发送ajax请求之前所需要的参数
             * @returns {ajaxsetting} or {ajaxsetting.data}
             */
            function beforeRequest(data){
                var params = getBoundsWE(),clientData;
                params = J.mix(params,data);
                params.zoom =map.getZoom();

                clientData =  opts.onBeforeRequest&&opts.onBeforeRequest(params,map);
                return clientData ?  J.mix(params,clientData):false;
            }

            /**
             * ajax数据回来　，创建Ｏverlay 并发送消息
             * @param data
             */
            function onResult(data){
                delete callback[guid];
                delete J.map.bmap['callback'+guid];
                data.zoom = context.getZoom();
                var clientData = opts.onResult&&opts.onResult(data);
                if(Object.prototype.toString.call(clientData) == "[object Array]"){
                    MSG.ajaxChange(data);//通过消息中心发送消息
                    !onResult.isLock&&overlayCenter.addOverLays(clientData);
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



            return {
                getData:getData,
                getCacheKey:getCacheKey,
                onResult:onResult
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
                classHover:'hover',//鼠标放上去展示的样式
                x:0,//x轴要偏移的像素
                y:0//y轴要偏 移的像素
            },opts,preCache={},zIndex =1;//点击后加１;
            (function(){
                opts= J.mix(defOpts,option);
            })();
            function onClick(elm,data){
                elm._div.setStyle({
                    zIndex:zIndex++
                });

                var WH = context.getMapWH(),
                    position = context.pointToPixel(data.latlng),
                    y = parseInt( position.y),
                    x = parseInt( position.x);
                x = x+data.x;
                y= y+data.y;
                var w = elm.get().width();
                var h = elm.get().height();
                var panX =0 ;
                var panY = 0;
                var tmp =0;
                if(x<0){
                    panX = x;
                }
                if( (tmp = (x+w-WH.width)) > 0 ){
                    panX = tmp;
                }
                if(y <0 ) {
                    panY =y;
                }
                if((tmp =(y+h-WH.height))>0){
                    panY = tmp;
                }
                if(panX || panY )map.panBy(-panX,-panY);
                data.target = elm;
                MSG.overlayClick(data);
            }
            function onMouseOver(data){

                this.prevZindex = this._div.getStyle('zIndex');
                this._div.setStyle({
                    zIndex:zIndex
                });
                this.classHover&&this._div.first().addClass(this.classHover);



                data.target = this;


                MSG.overlayMouseOver(data);
            }
            function onMouseOut(data){
                if(zIndex == this._div.getStyle('zIndex')){
                    this._div.setStyle({
                        zIndex:this.prevZindex
                    });
                }
                this.classHover&& this._div.first().removeClass(this.classHover);
                data.target = this;
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
                var i,len=data.length,key,tmpObj={},removeHandler, j,zoom=context.getZoom();
                for(i=0;i<len;i++){
                    (function(itemOpts){
                        if(!itemOpts.key){
                            itemOpts = J.mix(itemOpts,{
                                className:opts.className,
                                classHover:opts.classHover,
                                zoom:zoom
                            });
                            itemOpts = onItemBuild(itemOpts);
                            if(!itemOpts || !itemOpts.html) return;

                            key = itemOpts.key || dataCenter.getCacheKey(itemOpts);
                            itemOpts.key = key;
                        }else{
                            key = itemOpts.key;
                        }

                        /**
                         * 不在ｃａｃｈｅ里，需要创建，同时创建缓存
                         */

                        if(!preCache[key]){
                           var item =  context.addOverlay(itemOpts,itemOpts.overlaysType);
                            item.onClick = function(){
                                var ret = itemOpts.onClick&&itemOpts.onClick.call(this);
                                if(ret === false) return;
                                onClick(item,itemOpts);
                            };
                            item.onMouseOver = function(){
                                onMouseOver.call(this,itemOpts);
                                return itemOpts.onMouseOver&& itemOpts.onMouseOver.call(this);
                            };
                            item.onMouseOut = function(){
                                onMouseOut.call(item,itemOpts);
                                return itemOpts.onMouseOut&& itemOpts.onMouseOut.call(item);
                            }
                            item.onRemove = function(){
                                itemOpts.remove&&itemOpts.remove(item,itemOpts);
                                remove(item);
                            }
                            tmpObj[key] = item;
                            return;
                        }
                        tmpObj[key] = preCache[key];
                        delete  preCache[key];
                    })(data[i]);


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
                var ret = opts.onItemBuild&&opts.onItemBuild(data);
                return ret === false? false :data;
            }

            /**
             * 得到当前在地图上显上的ｏｖｅｒｌａｙｓ
             */
            function getCurrentOverlays(){
                return preCache;
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
                getCurrentOverlays:getCurrentOverlays,
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
                remove:'overlayRemove',
                loading:'map:loading',
                listItemClick:'list:itemClick'
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
            function loading(data){
               sendMessage(overlayEventType.loading,data);
            }
            function sendMessage(eventName,data){
                J.fire(opts.target,eventName,data,true);
            }

            /**
             * 列表页被点击
             */
            function listItemClick(data){
                sendMessage(overlayEventType.listItemClick,data);
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
                loading:loading,
                eventType:{
                    overlay:overlayEventType//overlay事件类型
                }


            }
        }

        /**
         * 事件锁
         * @return {Object}
         * @constructor
         */

        function LockCenter(){
            var task = [];
            function run(){
                var curTask, i,len = task.length;
                for(i=0;i<len;i++){
                    if(task[i]()===false)return true;
                }
           /*     while((curTask=task.shift())&&(curTask()=== false)){
                       return true;
                }*/
            }
            function addLockTask (fn){
                task.push(fn)
            }
            function removeLockTask(fn){
                var i= 0,len= task.length;
                for(;i<len;i++){
                    if(task[i] === fn){
                        task.splice(i,1);
                        console.dir(task)

                        i--;
                    }
                }

            }
            return {
                addLockTask:addLockTask,
                removeLockTask:removeLockTask,
                isLock:run
            }
        }

        return J.mix({
            getData:dataCenter.getData,
            onResult:dataCenter.onResult,
            eventType:MSG.eventType,
            getCurrentOverlays:overlayCenter.getCurrentOverlays,
            addOverLays:overlayCenter.addOverLays,
            addLockTask:lockCenter.addLockTask,
            removeLockTask:lockCenter.removeLockTask

        },context);
    }
    J.map.core =core;

})(J);