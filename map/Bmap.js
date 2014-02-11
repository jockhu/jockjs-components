/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * 表单验证组件
 *
 * @path: map/core.js
 * @author: lunjiang
 * @version: 1.0
 * @date: 2014/02/08
 *
 */


/// require('map.Bload');
/// require('page.page');


(function(J){
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
            onZoomEnd:null
        };

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

        (function(){
           /* window.mapData = {};
            window.mapData.base = {};
            window.mapData.entity = {};
            window.mapData.sign = {};
            window.map = {};*/
            opts = J.mix( defOpts,opption || {});
            opts.latlng = getLatLng(opts);
            if (!opts.id || typeof BMap!=='object') return;
            opts.elm=J.g(opts.id);
            opts.elm.setStyle({background:'none'});
            createMap();
        })();


        function createMap(){
            map = new BMap.Map(opts.elm.get(), {
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
            var _key = key || buildOverlayKey(p.latlng), _type = overlayType || overlaysType.overlay;
            if (getOverlay(_type, _key)) return;
            var marker = new BMap.Marker(p.latlng, {
                icon: getMarkerImage(J.mix(io, p, true))
            });
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
            pushOverlayList(_type, _key, marker);
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

        function clone (obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }
        function userOverlay(){


        }
        function addOverlay(param, overlayType, key) {
            var p = fn.clone(param);
            p.latlng = p.latlng ? p.latlng : getLatLng(p);
            var _key = key||buildOverlayKey(p.latlng),
                _type = overlayType,
                oldOverlay = getOverlay(_type,_key),
                me;
            if(oldOverlay) return oldOverlay;

            function userOverlay(p){
                this.p = p;
            }
            userOverlay.prototype = new BMap.Overlay();
            userOverlay.prototype.initialize = function(map){
                this._map = map;
                this._locked = false;
                this._CName = !!this.p.className ? this.p.className : '';
                this._CHover = !!this.p.classHover ? this.p.classHover : '';
                this._barOffsetX = this.p.x || 0;
                this._barOffsetY = this.p.y || 0;
                me = this;
                var div = document.createElement("DIV");
                div.style.position = "absolute";
                div.style.cursor = "pointer";
                div.style.zIndex = 0;

                if(this._CName){
                    div.className = me._CName;
                }
                div.innerHTML = this.p.html;
                div.title = !!this.p.title ? this.p.title : '';

                if(this.p.showInfo){
                    J.on(div,'click',function(){
                        fn.openOverlayWindow(me.p, me)
                    });
                }
                J.on(div,"mouseover", function(){
                    me.setOver();
                });
                J.on(div,"mouseout", function(){
                    me.setOut();
                });
                map.getPanes().labelPane.appendChild(div);
                this._div = div;
                return div
            }
            userOverlay.prototype.setOver = function(){
                if(!this._locked){
                    this._div.style.zIndex = 1;
                    if(this._CName && this._CHover){
                        this._div.className = this._CName+' '+this._CHover;
                    }
                }
            }
            userOverlay.prototype.setOut = function(){
                if(!this._locked){
                    this._div.style.zIndex = 0;
                    if(this._CName){
                        this._div.className = this._CName;
                    }
                }
            }
            userOverlay.prototype.setLock = function(isLocked){
                if(isLocked) this._locked = true;
                else this._locked = false;
            }
            userOverlay.prototype.draw = function(){
                var map = this._map;
                var pixel = map.pointToOverlayPixel(this.p.latlng);
                this._div.style.left = pixel.x + this._barOffsetX + "px";
                this._div.style.top  = pixel.y + this._barOffsetY + "px";
            }
            userOverlay.prototype.setVisible = function(b){
                if (this._div) {
                    this._div.style.visibility = (b) ? "visible" : "hidden";
                }
            }
            userOverlay.prototype.removeOverlay=function(){
                J.un(this._div);
                map.removeOverlay(this)
            }
            var uO = new userOverlay(p);
            uO.key = _key;
            map.addOverlay(uO);
            fn.pushOverlayList(_type,_key,uO);
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
            map.setCenter(new BMap.Point(lng, lat));
        }
        function geolocation(obj, callback){
            var gl = new BMap.Geolocation();
            gl.getCurrentPosition(function(result){
                if (obj && callback && result)
                    callback.call(obj, result.point)
            });
        }

        return {
            addOverlay:addOverlay,
            geolocation:geolocation,
            setCenter:setCenter,
            getGeocoder:getGeocoder,
            addMarker:addMarker,
            getOverlays:getOverlays

        }


    }


    J.map.bmap = Bmap;

})(J);















