
/// require('map.Bload');
/// require('page.page');

;(function(J){
    function Bmap(opption){
        var baseDomain = "http://pages.lunjiang.dev.aifcdn.com/";
        var defOpts ={
            id:'',
            lng:0,
            lat:0,
            latlng:0,
            zoom:15,
            mark:0,
            u3d:0,
            city:'',
            ctype:1,
            cdn:baseDomain+'img/',
            ezoom:0,
            top:0,
            d:true,//debug
            minz:0,
            maxz:0,
            scale:0,
            onMoveStart:null,
            onMoveEnd:null,
            onZoomStart:null,
            onZoomEnd:null,
            target:document,//自定主事件触对的对象
            callback:null,
            progrss:'progrss'
        },elm,isLoaded;

        var io = {
                title: '',
                popInfo: '',
                barInfo: '',
                icon: 'http://pages.lunjiang.dev.aifcdn.com/img/jmap/1/mapMarker-Default.png',
                size: {
                    w: 35,
                    h: 34
                },
                offset: {
                    x: 9,
                    y: 34
                },
                imgOffset: {x: 0, y: 0}, lat: 0, lng: 0,
                latlng: {}
            },opts = {},
            OVERLAYS = {},
            map,
            skipOvList = [];

        function init(){
            opts = J.mix( defOpts,opption || {});
            opts.latlng = getLatLng(opts);
            if (!opts.id || typeof BMap!=='object') return;
            var elem = J.g(opts.id);
            if(!elem){
                alert('文档中未找到id：'+opts.id+'对像');
                return false;
            }
            opts.elm=elem;
            //opts.elm.setStyle({background:'none'});
            createMap();
        }
        init();

        function createMap(){
            map = new BMap.Map(opts.id, {
                enableMapClick:false,
                mapType: !!opts.u3d && opts.city != '' ? BMAP_PERSPECTIVE_MAP : BMAP_NORMAL_MAP,
                minZoom: opts.minz ? opts.minz : 3,
                maxZoom: opts.maxz ? opts.maxz : 18
            });
            if (!!opts.u3d && opts.city != '')
                map.setCurrentCity(opts.city);
            map.centerAndZoom(new BMap.Point(opts.lng, opts.lat), opts.zoom);

            if (!!opts.mark){
                var marker = addMarker(opts,'center');
            }
            if (!!opts.ezoom)
                map.enableScrollWheelZoom();  // 开启鼠标滚轮缩放
            map.enableKeyboard();         // 开启键盘控制
            map.enableContinuousZoom();   // 开启连续缩放效果
            map.enableInertialDragging(); // 开启惯性拖拽效果
            var ctrl_nav = new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_TOP_LEFT,
                type: !!opts.ctype ? BMAP_NAVIGATION_CONTROL_LARGE : BMAP_NAVIGATION_CONTROL_ZOOM
            });
            map.addControl(ctrl_nav);
            if(!!opts.scale){
                var ctrl_scale = new BMap.ScaleControl({
                    anchor: BMAP_ANCHOR_BOTTOM_LEFT
                });
                map.addControl(ctrl_scale);
            }
            opts.callback&&opts.callback();
        }
        function setOverlaysVisible(t, visible, skip){
            var ovs = OVERLAYS[t];
            for(var ov in ovs){
                setOverlayVisible(t, ov, visible)
            }
        }
        function setOverlayVisible(t, key, visible){
            if(OVERLAYS[t] && OVERLAYS[t][key]) OVERLAYS[t][key].setVisible(visible||false);
        }
        function getOverlay(t, key){
            OVERLAYS[t] = OVERLAYS[t] ? OVERLAYS[t] : {};
            return OVERLAYS[t][key]
        }
        function getOverlays(t){
            return OVERLAYS[t] ? OVERLAYS[t] : undefined
        }
        function clearOverlays(){
            map.clearOverlays();
            OVERLAYS = {};
        }
        function pushOverlayList(t,k,o) {
            OVERLAYS[t] = OVERLAYS[t] ? OVERLAYS[t] : {}
            OVERLAYS[t][k] = o;
        }
        function getLatLng (p) {
            var p = p || opts;
            return new BMap.Point(p.lng, p.lat);
        }
        function getMap(){
            return map || {};
        }
        function reset(){
            map.reset()
        }
        function getBounds(){
            return map.getBounds();
        }
        function getBoundsWE(zoom){
            var b=getBounds(),w=b.getSouthWest(),e=b.getNorthEast();
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
        function inBounds(latlng) {
            var b = getBounds();
            if(typeof b === 'object'){
                return b.containsPoint(latlng);
            }
            return true;
        }
        function pointToPixel(latlng){
            return map.pointToPixel(latlng);
        }
        function addMarker (p, overlayType, key) {
            p.latlng = p.latlng ? p.latlng : getLatLng(p);
            var _key = key || buildOverlayKey(p.latlng), _type = overlayType;
            var marker = new BMap.Marker(p.latlng);
            if (p.title) {
                marker.setTitle(p.title)
            }
            if (p.showInfo) {
                var s = this;
                marker.addEventListener('click',function(){
                    s.openMarkerWindow(p);
                })
            }
            map.addOverlay(marker);
           // pushOverlayList(_type, _key, marker);
            return marker;
        }
        function getMarkerImage(p){
            return new BMap.Icon(p.icon, new BMap.Size(p.size.w, p.size.h), {
                anchor: new BMap.Size(p.offset.x, p.offset.y),
                imageOffset: new BMap.Size(p.imgOffset.x, p.imgOffset.y)
            });
        }
        function openWindow(p){
            var opts={}
            if(typeof p.offset != 'undefined'){
                opts['pixelOffset'] = new BMap.Size(p.offset.x,p.offset.y)
            }
            var infoWindow = new BMap.InfoWindow(p.popInfo, opts);
            map.openInfoWindow(infoWindow, p.latlng);
        }
        function openMarkerWindow(p){
            openWindow(p)
        }
        function openOverlayWindow(p, openerOverlay){
            openWindow(p)
        }


        function addOverlay(param, overlayType, key) {
            var p = param
            J.mix(p,param);
            p.latlng = p.latlng ? p.latlng : getLatLng(p);
            var _key = param.key||key||buildOverlayKey(p.latlng),
           /*     _type = overlayType,
                oldOverlay = getOverlay(_type,_key),*/
                me;
            //if(oldOverlay) return oldOverlay;
            function userOverlay(p){
                this.p = p;
            }
            userOverlay.prototype = new BMap.Overlay();
            userOverlay.prototype.initialize = function(map){
                this._map = map;
                this._locked = false;
                this.className =  this.p.className || '';
                this.classHover =  this.p.classHover ||'';
                this._barOffsetX = this.p.x || 0;
                this._barOffsetY = this.p.y || 0;
                this._zIndex = this.p.zIndex || 0;

                me = this;

                var div = J.create('div',{
                    style:"position:absolute;cursor:pointer;z-index:"+this._zIndex,
                    className:me.p.className||'',
                    title:me.p.title||''
                }).html(this.p.html);
                div.on('click',function(){
                    me.onClick&&me.onClick();
                    me.p.showInfo&&openOverlayWindow(me.p, me)
                });
                div.on('touchend',function(){
                    me.onClick&&me.onClick();
                    me.p.showInfo&&openOverlayWindow(me.p, me)
                });
                div.on("mouseover", function(){
                    me.onMouseOver();
                 });
                div.on("mouseout", function(){
                    me.onMouseOut();
                 });
                map.getPanes().labelPane.appendChild(div.get());
                this._div = div;
                return div.get()
            }
            userOverlay.prototype.onClick = function(){
            }
            userOverlay.prototype.onMouseOver = function(){

            }
            userOverlay.prototype.onMouseOut = function(){

            }
            userOverlay.prototype.setLock = function(isLocked){
                if(isLocked) this._locked = true;
                else this._locked = false;
            }
            userOverlay.prototype.draw = function(){
                var map = this._map;
                var pixel = map.pointToOverlayPixel(this.p.latlng);
                this._div.setStyle({
                    left:pixel.x + this._barOffsetX + "px",
                    top:pixel.y + this._barOffsetY + "px"
                })
            }
            userOverlay.prototype.setVisible = function(b){
                this._div.setStyle({
                    visibility:b
                })
            }
            userOverlay.prototype.removeOverlay=function(){
                J.un(this._div);
                map.removeOverlay(this)
            },
            userOverlay.prototype.get=function(){
                return this._div;
            }
            userOverlay.prototype.isInViewPort=function(){
                var lat = this.p.lat;
                var lng = this.p.lng;
                var pos = map.pointToPixel(new BMap.Point(lng, lat));
                var size = map.getSize();
                if(pos.x>size.width){
                    return false;
                }
                if(pos.x+this._div.width()<0){
                    return false;
                }
                if(pos.y<0){
                    return false;
                }
                if(pos.y-this._div.height()>size.height){
                    return false;
                }
                return true

            }
            var uO = new userOverlay(p);
            uO.key = _key;
            map.addOverlay(uO);
           // pushOverlayList(_type,_key,uO);
            return uO;
        }
        function addPloyline(path, PloylineOptions, overlayType, key){
            var _key = key||buildOverlayKey(PloylineOptions.latlng), _type = overlayType || this.overlaysType.ployline;
            if(getOverlay(overlaysType.ployline,_key)) return;
            var _PloylineOptions = Jock.extend({
                strokeColor : "#0030ff",
                strokeOpacity : 0.60,
                strokeWeight : 6,
                enableMassClear : true
            }, PloylineOptions || {});
            var _polyline = new BMap.Polyline(path, _PloylineOptions)
            map.addOverlay(_polyline);
            pushOverlayList(_type,_key,_polyline);
        }
        function buildOverlayKey(latlng){
            return latlng.lat+'_'+latlng.lng;
        }
        function getGeocoder(address,callback,city){
            var geo = new BMap.Geocoder();
            geo.getPoint(address,callback,city);
        }


        function getMapWH(){
            return map.getSize();
        }

        function localSearch(keyword, obj, callback, args){
            var A = new BMap.LocalSearch(map);
            A.setPageCapacity(10);
            A.enableAutoViewport();
            //A.setLocation('北京市');
            A.setSearchCompleteCallback( function(D) {
                var s = [];
                if (A.getStatus() == BMAP_STATUS_SUCCESS) {
                    var l = D.getCurrentNumPois();
                    while (l--) {
                        var rs = D.getPoi(l);
                        var r = {};
                        r['title'] = rs.title;
                        r['point'] = rs.point;
                        r['address'] = rs.address;
                        s.push(r)
                    }
                }
                if (obj && callback){
                    callback.call(obj, s, args);
                    A = null;
                }
            });
            A.search(keyword)
        }
        function localSearchNearby(keyword, callback, capacity, radius){
            if(!keyword) return;
            var A = new BMap.LocalSearch(map);
            radius = radius || 1000;
            A.setPageCapacity(capacity || 50);
            A.enableAutoViewport();
            A.setSearchCompleteCallback( function(D) {
                var s = [];
                if (A.getStatus() == BMAP_STATUS_SUCCESS) {
                    var l = D.getCurrentNumPois();
                    for(var i=0;i<l;i++){
                        s.push( D.getPoi(i) );
                    }
                }
                callback && callback.call(null, s),A=null;
            });
            A.searchNearby(keyword, map.getCenter(), radius)
        }
        function setCenter(lng,lat,zoom){
            map.centerAndZoom(new BMap.Point(lng, lat),zoom);
        }
        function geolocation(obj, callback){
            var gl = new BMap.Geolocation();
            gl.getCurrentPosition(function(result){
                if (obj && callback && result)
                    callback.call(obj, result.point)
            });
        }
        function getZoom(){
            return map.getZoom();
        }
        function getCenter(){
            return map.getCenter();
        }
        function zoomOut(){
            map.zoomOut();
        }

        /**
         * 获得地铁线路
         * @param subwayLineName　１号线
         */
        function addSubwayLine(subwayLineName){
            var busline = new BMap.BusLineSearch(map,{
                renderOptions:{
                    autoViewport:false,
                    map:map
                },
                onGetBusListComplete: function(result){
                    if(result) {
                        var fstLine = result.getBusListItem(0);//获取第一个公交列表显示到map上
                        busline.getBusLine(fstLine);
                    }
                }
            });
            setTimeout(function(){
                busline.getBusList(subwayLineName);
            },0);
            //this._busLine = busline;
        }
        function getViewport(data){
            return map.getViewport(data);
        }
        function setViewport(viewport){
            return map.setViewport(viewport);
        }


        function pro() {
            var m = {
                addOverlay:addOverlay,
                geolocation:geolocation,
                setCenter:setCenter,
                getGeocoder:getGeocoder,
                addMarker:addMarker,
                getOverlays:getOverlays,
                getMap:getMap,
                getZoom:getZoom,
                pointToPixel:pointToPixel, //latlng translate to px;
                getMapWH:getMapWH,
                getCenter:getCenter,
                addSubwayLine:addSubwayLine,
                clearOverlays:clearOverlays,
                zoomOut:zoomOut,
                localSearch:localSearch,
                getViewport:getViewport,
                setViewport:setViewport,
                localSearchNearby:localSearchNearby,
		localSearch:localSearch
            }
            for (var i in m) {
                this[i] = m[i];
            }
        }

        pro.prototype = map;
        return new pro();
    }

    J.map.bmap = Bmap;

})(J);















