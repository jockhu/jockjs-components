/*
 * Jock
 * * Base api
 */
;(function(win){
    var J, Jock=J=Jock||{version: "0.1.0"};
    var document = win.document;
    win.Jock = Jock;
    Jock.base = {
        baseDomain: "http://pages.lunjiang.dev.aifcdn.com/",
        extend: function(l, r, w){
            if(w){
                var newOb = {};
                for (var n in l){
                    if (l.hasOwnProperty(n))
                        newOb[n] = l[n];
                }
                for (var n in r){
                    if (r.hasOwnProperty(n))
                        newOb[n] = r[n];
                }
                return newOb;
            }
            for (var p in r) {if (r.hasOwnProperty(p)) {l[p] = r[p];} }return l;
        },
        inArray: function(o, array){
            for (var i = 0, length = array.length; i < length; i++) {if (array[i] === o) {return true} }return false
        },
        loadResource: function(type, resource, object, callback){
            var o = {},s = {}, cback = function(c, o){
                if (c) {
                    setTimeout(function(){
                        if (typeof c === 'function')
                            c.call(o);
                        else eval("window." + c + "()");
                    }, 10);
                }
            }, f = {
                load: function(){
                    if (type === 'js') {
                        o = document.createElement('script');
                        o.type = 'text/javascript';
                        o.async = true;
                        o.src = resource;
                        s = document.getElementsByTagName('script')[0];
                        s.parentNode.insertBefore(o, s);
                    }
                    else if (type === 'css') {
                        o = document.createElement('link');
                        o.type = 'text/css';
                        o.rel = 'stylesheet';
                        o.href = resource;
                        s = document.getElementsByTagName('head')[0];
                        s.appendChild(o);
                    }
                    if (!(win.attachEvent && navigator.userAgent.indexOf('Opera') === -1)) {
                        o.onload = function(){
                            cback(callback, object)
                        }
                    }
                    else {
                        o.onreadystatechange = function(){
                            if ('loaded' === o.readyState || 'complete' === o.readyState) {
                                cback(callback, object)
                            }
                        }
                    }
                }
            }
            return f.load();
        }
    };
    Jock.base.extend(Jock, Jock.base);
    Jock.page = {
        getWidth: function(){
            var doc = document,body = doc.body,html = doc.documentElement,client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;
            return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
        },
        getHeight: function(){
            var doc = document, body = doc.body, html = doc.documentElement, client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;
            return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
        }
    };
    Jock.extend(Jock, Jock.page);
    Jock.event = {
        add: function(target, type, func){
            if (target.addEventListener)
                target.addEventListener(type, func, false);
            else if (target.attachEvent)
                target.attachEvent("on" + type, func);
        }
    };
    Jock.event.on = Jock.event.add;
    Jock.map = {
        options: {elm:'',lng:0,lat:0,latlng:0,zoom:15,mark:0,u3d:0,city:'',ctype:1,cdn:Jock.baseDomain+'img/',ezoom:0,top:0,d:0,minz:0,maxz:0,scale:0},
        icOpts: {title : '',popInfo : '',barInfo : '',icon : Jock.baseDomain + 'img/jmap/1/mapMarker-Default.png',size : {w : 35,h : 34},offset : {x : 9,y : 34},imgOffset : {x : 0,y : 0},lat:0,lng:0,latlng:{}},
        version:{
            baidu:'1.7.6',
            google:'1.4'
        },
        loadMap: function(mapType, object, callback){
            if (mapType === 'b') {this.loadBaiduMap(object, callback);}
            else if (mapType === 'g') {this.loadGoogleMap(object, callback);}
        },
        loadGoogleMap: function(object, callback){
            Jock.loadResource('js', Jock.baseDomain + 'api/map/g/' + this.version.google + '.js', this, function(){Jock.loadResource('js', 'http://maps.google.com/maps/api/js?sensor=false&language=zh-CN&region=zh&callback=' + callback);});
        },
        loadBaiduMap: function(object, callback){
            var baiduApiVersion = '1.3';
            Jock.loadResource('js', 'http://api.map.baidu.com/getscript?v='+baiduApiVersion, this, callback);
            Jock.loadResource('css', 'http://api.map.baidu.com/res/13/bmap.css');
        }
    };
})(window);









JMap = function(options){
    var map = {},
        bounds,
        io =
        {
            title: '',
            popInfo: '',
            barInfo: '',
            icon: 'http://pages.lunjiang.dev.aifcdn.com/img/jmap/1/mapMarker-Default.png',
            size: {w: 35, h: 34}, offset: {x: 9, y: 34},
            imgOffset: {x: 0, y: 0}, lat: 0, lng: 0,
            latlng: {}
        },
        o = {},
        OVERLAYS = {},
        skipOvList = [],
        fn = {
            eventsBind: function (eventHanders, objthis) {
                for (var i = 0, len = eventHanders.length; i < len; i++) {
                    var fn = eventHanders[i].fn;
                    Jock.event.add(eventHanders[i].obj, eventHanders[i].type, function () {
                        fn.call(objthis);
                    });
                }
            },
            overlaysType: {
                overlay: 'overlays',
                marker: 'markers',
                ployline: 'ployline'
            },
            init: function(ops){
                var defOpts ={
                    elm:'',
                    lng:0,
                    lat:0,
                    latlng:0,
                    zoom:15,
                    mark:0,
                    u3d:0,
                    city:'',
                    ctype:1,
                    cdn:Jock.baseDomain+'img/',
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
                window.mapData = {};
                window.mapData.base = {};
                window.mapData.entity = {};
                window.mapData.sign = {};
                window.map = {};
                o = J.mix( defOpts,ops || {});
                o.latlng = this.getLatLng(o);
                if(o.d && typeof console != 'undefined') console.log(o);
                if (!o.elm || typeof BMap!=='object')
                    return;
                o.elm=document.getElementById(o.elm);
                o.elm.style.background = 'none';
                this.setWH();
                this.createMap();
            },
            setWH:function(rw){
                var es = o.elm.style;
                if(rw||!es.width) es.width = 'auto';
                if(rw||!es.height) es.height = (J.page.height()-o.top)+'px';
            },

            getMapWH: function(){
                return map.getSize();
            },
            createMap: function(){
                map = new BMap.Map(o.elm, {
                    mapType: !!o.u3d && o.city != '' ? BMAP_PERSPECTIVE_MAP : BMAP_NORMAL_MAP,
                    minZoom: o.minz ? o.minz : 3,
                    maxZoom: o.maxz ? o.maxz : 18
                });

                if (!!o.u3d && o.city != '')
                    map.setCurrentCity(o.city);

                map.centerAndZoom(new BMap.Point(o.lng, o.lat), o.zoom);
                if (!!o.mark){
                    var marker = this.addMarker(o,'center');
                }
                if (!!o.ezoom)
                    map.enableScrollWheelZoom();  // 开启鼠标滚轮缩放
                map.enableKeyboard();         // 开启键盘控制
                map.enableContinuousZoom();   // 开启连续缩放效果
                map.enableInertialDragging(); // 开启惯性拖拽效果

                var ctrl_nav = new BMap.NavigationControl({
                    anchor: BMAP_ANCHOR_TOP_LEFT,
                    type: !!o.ctype ? BMAP_NAVIGATION_CONTROL_LARGE : BMAP_NAVIGATION_CONTROL_ZOOM
                });
                map.addControl(ctrl_nav);

                if(!!o.scale){
                    var ctrl_scale = new BMap.ScaleControl({
                        anchor: BMAP_ANCHOR_BOTTOM_LEFT
                    });
                    map.addControl(ctrl_scale);
                }
            },
            setOverlaysVisible:function(t, visible, skip){
                var ovs = OVERLAYS[t];
                for(var ov in ovs){
                    this.setOverlayVisible(t, ov, visible)
                }
            },
            setOverlayVisible:function(t, key, visible){
                if(OVERLAYS[t] && OVERLAYS[t][key]) OVERLAYS[t][key].setVisible(visible||false);
            },
            getOverlay:function(t, key){
                OVERLAYS[t] = OVERLAYS[t] ? OVERLAYS[t] : {};
                return OVERLAYS[t][key]
            },
            getOverlays:function(t){
                return OVERLAYS[t] ? OVERLAYS[t] : undefined
            },
            clearOverlays: function(){
                map.clearOverlays();
                OVERLAYS = {};
            },
/*            removeOverlays: function(t){
                var ovs = OVERLAYS[t];
                for(var ov in ovs){
                    this.removeOverlay(t, ov)
                }
            },
            removeOverlay: function(t, key, callback){
                if(t){
                    if(Object.prototype.toString.call(t) == '[object Object]'){
                        map.removeOverlay(t);
                        if(callback) callback.call(this);
                        return true;
                    }
                    if(OVERLAYS[t] && OVERLAYS[t][key]){
                        map.removeOverlay(OVERLAYS[t][key]);
                        delete OVERLAYS[t][key];
                        if(callback) callback.call(this);
                    }
                }
            },*/
            pushOverlayList : function(t,k,o) {
                OVERLAYS[t] = OVERLAYS[t] ? OVERLAYS[t] : {}
                OVERLAYS[t][k] = o;
            },
            getLatLng : function(p) {
                var p = p || o;
                return new BMap.Point(p.lng, p.lat);
            },
            getMap: function(){
                return map || {};
            },
            reset: function(){
                map.reset()
            },
            getBounds:function(){
                return map.getBounds();
            },
            getBoundsWE:function(zoom){
                var b=this.getBounds(),w=b.getSouthWest(),e=b.getNorthEast();
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
            },
            inBounds : function(latlng) {
                var b = this.getBounds();
                if(typeof b === 'object'){
                    return b.containsPoint(latlng);
                }
                return true;
            },
            pointToPixel:function(latlng){
                return map.pointToPixel(latlng);
            },
            addMarker : function(p, overlayType, key) {
                p.latlng = p.latlng ? p.latlng : this.getLatLng(p);
                var _key = key || this.buildOverlayKey(p.latlng), _type = overlayType || this.overlaysType.overlay;
                if (this.getOverlay(_type, _key)) return;
                var marker = new BMap.Marker(p.latlng, {
                    icon: this.getMarkerImage(Jock.extend(io, p, true))
                });
                if (p.title) {
                    marker.setTitle(p.title)
                }
                if (p.showInfo) {
                    var s = this;
                    Jock.event.add(marker, 'click', function () {
                        s.openMarkerWindow(p);
                    });
                }
                map.addOverlay(marker);
                this.pushOverlayList(_type, _key, marker);
                return marker;
            },
            getMarkerImage: function(p){
                return new BMap.Icon(p.icon, new BMap.Size(p.size.w, p.size.h), {
                    anchor: new BMap.Size(p.offset.x, p.offset.y),
                    imageOffset: new BMap.Size(p.imgOffset.x, p.imgOffset.y)
                });
            },
            openWindow: function(p){
                var opts={}
                if(typeof p.offset != 'undefined'){
                    opts['pixelOffset'] = new BMap.Size(p.offset.x,p.offset.y)
                }
                var infoWindow = new BMap.InfoWindow(p.popInfo, opts);
                map.openInfoWindow(infoWindow, p.latlng);
            },
            openMarkerWindow:function(p){
                this.openWindow(p)
            },
            openOverlayWindow:function(p, openerOverlay){
                this.openWindow(p)
            },
            clone:function (obj) {
                if (null == obj || "object" != typeof obj) return obj;
                var copy = obj.constructor();
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
                }
                return copy;
            },
            userOverlay:function(){


            },
            addOverlay : function(param) {
                var p = fn.clone(param);
                p.latlng = p.latlng ? p.latlng : fn.getLatLng(p);
                function userOverlay(p){
                    var defOpts = {
                        onClick:null,
                        onMouseOver:null,
                        onMouseOut:null,
                        onHide:null,
                        onShow:null,
                        onHide:null,
                        remove:null,
                        className:null,
                        hoverClass:null,
                        html:'',
                        data:{

                        }
                    };
                    this.opts= J.mix(defOpts,p,true);
                }
                var overlay =  new BMap.Overlay();
                J.mix(overlay,{
                    initialize: function (map) {
                        this._map = map;
                        this._locked = false;
                        this._CName = !!this.opts.className ? this.opts.className : '';
                        this._barOffsetX = (this.opts.x) ? this.opts.x : 0;
                        this._barOffsetY = (this.opts.y) ? this.opts.y : 0;
                        var me = this;
                        var div = J.create("div",{
                            style:"white-space:nowrap;position:absolute;cursor:pointer;z-index:0;"
                        });
                        div.addClass(this._CName);
                        div.html(this.opts.html);
                        div.attr('title',this.opts.title||'');
                        div.on('click',function(){
                            if(!(me.onClick&&me.onClick(me.opts)=== false)){
                                J.fire(document,'overlayclick',me.opts,true);
                            }
                        })
                        div.on('mouseover',function(){
                            if(!(me.onMouseOver&&me.onMouseOver(me.opts)=== false)){
                                J.fire(document,'overlayover',me.opts,true);
                            }
                        })
                        div.on('mouseout',function(){
                            if(!(me.onMouseOut&&me.onMouseOut(me.opts)=== false)){
                                J.fire(document,'overlayout',me.opts,true);
                            }
                        })
                        map.getPanes().labelPane.appendChild(div.get());
                        this._div = div;
                        return div.get();
                    },
                    onclick: function () {


                    },
                    onMouseOver:function(){

                    },
                    onMouseOut: function () {

                    },
                    setLock: function (isLocked) {

                    },
                    toCenter:function(){
                          map.setCenter(this.opts.latlng)
                    },
                    draw: function () {
                        var map = this._map;
                        var pixel = map.pointToOverlayPixel(this.opts.latlng);
                        this._div.setStyle({
                            left:(pixel.x + this._barOffsetX) + "px",
                            top:(pixel.y + this._barOffsetY)+'px'
                        });
                    },
                    setVisible: function (b) {
                        if (this._div) {
                            this._div.style.visibility = (b) ? "visible" : "hidden";
                        }
                    },
                    removeOverlay:function(){
                        J.un(this._div);
                        J.fire(document,'overlayremove',this.opts,true);
                        map.removeOverlay(this)
                    }

                }
                );
                userOverlay.prototype = overlay;
                var uO = new userOverlay(p);

                return uO;
            },
            addPloyline:function(path, PloylineOptions, overlayType, key){
                var _key = key||this.buildOverlayKey(PloylineOptions.latlng), _type = overlayType || this.overlaysType.ployline;
                if(this.getOverlay(this.overlaysType.ployline,_key)) return;
                var _PloylineOptions = Jock.extend({
                    strokeColor : "#0030ff",
                    strokeOpacity : 0.60,
                    strokeWeight : 6,
                    enableMassClear : true
                }, PloylineOptions || {});
                var _polyline = new BMap.Polyline(path, _PloylineOptions)
                map.addOverlay(_polyline);
                this.pushOverlayList(_type,_key,_polyline);
            },
            buildOverlayKey:function(latlng){
                return latlng.lat+'_'+latlng.lng;
            },
            getGeocoder:function(address,callback,city){
                var geo = new BMap.Geocoder();
                geo.getPoint(address,callback,city);
            },
            sw3d: function(){
                var ot = {};
                this.extend(ot, opts || {});
                this.extend(ot, options || {});
                this.extend(ot, {
                    u3d: 1,
                    zoom: 17
                } || {});
                this.init(ot);
            },
            sw2d: function(){
                var ot = {};
                this.extend(ot, opts || {});
                this.extend(ot, options || {});
                this.extend(ot, {
                    u3d: 0
                } || {});
                this.init(ot);
            },
            localSearch: function(keyword, obj, callback, args){
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
            },
            localSearchNearby: function(keyword, callback, capacity, radius){
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
            },
            setCenter:function(lng,lat,zoom){
                map.centerAndZoom(new BMap.Point(lng, lat),zoom);
                map.setCenter(new BMap.Point(lng, lat));
            },
            geolocation: function(obj, callback){
                var gl = new BMap.Geolocation();
                gl.getCurrentPosition(function(result){
                    if (obj && callback && result)
                        callback.call(obj, result.point)
                });
            }

    };
    fn.init(options);

    Jock.extend(fn,(function(){
        /**
         * 导航搜索配置
         * @param {String} container 容器ID
         * @param {String} city 城市名称
         * @param {String|null} background 图片地址
         * @param {String|Point|LocalResultPoi} start 起点
         * @param {String|Point|LocalResultPoi} end 终点
         * @param {String|null} startTitle 起始标题
         * @param {String|null} endTitle 终点标题
         * @param {String|null} routeType 导航类别（交通导航|驾车路线）
         * @return {Object}
         */
        var RouteOptions = {
            container: '',
            city:'',
            background:'',
            start:'',
            end:'',
            startTitle:'',
            endTitle:'',
            routeType:'transit',
            isReSearch:false
        };
        var STATUS = 0;
        function fullRouteOptons(RouteOptions, routeType){
            Jock.extend(RouteOptions,RouteOptions||{});
            Jock.extend(RouteOptions,{routeType:routeType});
        }
        function E(tag){
            return document.createElement(tag);
        }
        /**
         * 本地搜索
         * @param {String} searchName 名称
         * @return {null}
         */
        function localSearch(RouteOptions) {
            var local = new BMap.LocalSearch(map,{
                onSearchComplete: function(results){
                    RouteOptions.container.innerHTML = '';
                    var s = [], l = results.getCurrentNumPois(), rs;
                    if(l<=0){
                        RouteOptions.container.innerHTML = getErrTemplate(RouteOptions);
                        return false;
                    }
                    var div = E('div'),b = E('b'),li;
                    div.style.cssText = 'clear:both; height:225px; overflow-x:hidden; overflow-y:auto; padding:8px 0 0 8px; line-height:26px;';
                    b.style.cssText = 'font-size:13px; color:#666;';
                    b.innerHTML = '请确认起点';
                    div.appendChild(b);

                    function _SearchRoute(sPoint, sTitle){
                        return function(){
                            RouteOptions.startTitle = sTitle;
                            RouteOptions.start = sPoint;
                            RouteOptions.isReSearch = true;
                            Route(RouteOptions);
                        }
                    }

                    for(var i=0;i<l;i++){
                        rs = results.getPoi(i);
                        li = E('li');
                        li.style.cssText = 'padding:0 0 0 14px; margin-bottom:10px; float:left; background:url('+RouteOptions.background+') 0 -305px no-repeat; width:195px; line-height:26px;';
                        rs.address = rs.address ? rs.address : '';
                        li.innerHTML = '<span style="display:block;line-height:17px; cursor: pointer;"><a href="javascript:void(0)">'+rs.title+'</a> '+rs.address+'</span>';
                        li.onclick = _SearchRoute(rs.point, rs.title);
                        div.appendChild(li);
                    }
                    RouteOptions.container.appendChild(div);
                }
            });
            local.search(RouteOptions.start);
        }
        /**
         * 获得路线换乘规划标题
         * @param {Object} plan 换乘计划
         * @return {Array}
         */
        function getLineTitles(plan){
            var n = plan.getNumLines(), title = [];
            for(var i=0;i<n;i++){
                var _title = plan.getLine(i).title.replace(/\(.*\)/,'');
                title.push(_title.match(/^\d+$/) ? _title + '路' : _title);
            }
            return title;
        }
        /**
         * 获得路线换乘 Description
         * @param {Object} RouteOptions 导航搜索配置
         * @param {Object} results 换乘计划
         * @param {Int} index 第几条计划路线
         * @return {String}
         */
        function getRouteDescription(RouteOptions, results, index, routeType){
            var plan     = results.getPlan(index),
                route         = plan.getRoute(0),
                _titles     = '',
                _startTitle = RouteOptions.startTitle || results.getStart().title,
                _endTitle     = RouteOptions.endTitle || results.getEnd().title,
                _desc         = []
            len            = 0;

            // 最外框
            var description = ['<div id="sec_result" style="clear:both; overflow-x:hidden; overflow-y:auto; padding:8px 0 5px 6px; height:220px; font-size:12px;">'];

            // 时间 / 路程
            description.push('<span style="margin:0 0 0 2px; display:block; color:#999; line-height:18px; font-size:12px;">');

            if(RouteOptions.routeType == 'driving'){
                description.push('<b style="color:#666; font-size:13px;">全程</b>');
            }else{
                _titles = getLineTitles(plan);
                for(var i=0;i<_titles.length;i++){
                    _desc.push('<b style="color:#666; font-size:13px;">'+_titles[i]+'</b>');
                }
                description.push(_desc.join('<b style="font-size:13px;">→</b>'));
            }
            description.push('    <br/>约' + plan.getDuration() + ' / ' + plan.getDistance());
            description.push('</span>');

            // 起点
            description.push('<span style="display:block; padding:2px 0 0 25px; height:24px; background:url('+RouteOptions.background+') 0 -49px no-repeat; margin:10px 0 0; white-space:nowap; overflow:hidden;">');
            description.push('    <span style="display:block; float:left; background:url('+RouteOptions.background+') right 0 no-repeat; margin-left:2px; height:18px;">');
            description.push('        <strong style="display:block; margin:0 8px 0 0; padding:0 0 0 8px; line-height:19px; background:url('+RouteOptions.background+') 0 0 no-repeat; color:#fff;">'+_startTitle+'</strong>');
            description.push('    </span>');
            description.push('</span>');

            description.push('<ul style="width:207px; border-top:1px solid #ddd;">');


            if(RouteOptions.routeType == 'driving'){
                // 驾车
                len = route.getNumSteps();
                for(var i = 0; i < len; i++) {
                    description.push(getLineTemplate(RouteOptions, 3, route.getStep(i).getDescription().replace(/<b>/gi,'<b style="color:#f60; font-weight: normal">'), (i + 1)));
                }
            }else{
                // 公交
                len = plan.getNumRoutes();
                for(var j=0;j<len;j++){
                    var route = plan.getRoute(j);
                    var line = plan.getLine(j);
                    if(route.getDistance(false) > 0){
                        if(j == len-1){
                            description.push(getLineTemplate(RouteOptions, 2,'步行至<span style="color:#f60;">'+_endTitle+'</span>'));
                        }else{
                            description.push(getLineTemplate(RouteOptions, 2,'步行至<span style="color:#f60;">'+line.getGetOnStop().title+'站</span>'));
                        }
                    }
                    if(j < len-1){
                        description.push(getLineTemplate(RouteOptions, line.type,'乘坐<span style="color:#f60;">'+_titles[j] + '('+line.title.match(/-(.*[^)])[^\s]/)[1]+'方向)</span>在<span style="color:#f60;">'+line.getGetOffStop().title+'站</span>下车',RouteOptions.background));
                    }
                }
            }

            description.push('</ul>');

            // 终点
            description.push('<span style="display:block; padding:2px 0 0 25px; height:24px; background:url('+RouteOptions.background+') 0 -80px no-repeat; margin:5px 0 0; clear:both;">');
            description.push('    <span style="display:block; float:left; background:url('+RouteOptions.background+') right 0 no-repeat; margin-left:2px; height:18px;">');
            description.push('        <strong style="display:block; margin:0 8px 0 0; padding:0 0 0 8px; line-height:19px; background:url('+RouteOptions.background+') 0 0 no-repeat; color:#fff;">'+_endTitle+'</strong>');
            description.push('    </span>');
            description.push('</span>');

            description.push('</div>');

            return description.join('');
        }
        /**
         * 获得路线换乘模板
         * @param {Int} type 交通路线类型
         * @param {String} desc 路线换成描述
         * @param {String} index 只在驾车路线下有效
         * @return {String}
         */
        function getLineTemplate(RouteOptions, type, desc, index){
            var _line_template = '', _x = 0;
            if(type == 0){ //公交
                _x = '-6px';
            }else if(type == 1){ // 地铁
                _x = '-68px';
            }else if(type == 2){ // 步行
                _x = '-38px';
            }
            _line_template = '<li style="padding:5px 0; _padding:4px 0 0; width:207px; line-height:20px; border-bottom:1px solid #ddd;">';
            if(type == 3){ // 驾车
                _line_template +='  <i style="float:left;width:25px;height:18px;text-align:center;font-style: normal">'+index+'.</i>';
            }else{
                _line_template +='  <i style="float:left; width:25px; height:18px; background:url('+RouteOptions.background+') '+ _x +' -23px no-repeat;"></i>';
            }
            _line_template +='  <span style="float:left; width:180px;">'+desc+'</span>';
            _line_template +='  <div style="clear:both; margin:0; padding:0; height:0; line-height:0;"></div>';
            _line_template +='</li>';
            return _line_template;
        }
        /**
         * 导航
         * @param {Object} RouteOptions 导航搜索配置
         * @return {Object}
         */
        function Route(RouteOptions){
            var route = null;
            if(RouteOptions.routeType == 'transit'){
                route = new BMap.TransitRoute(RouteOptions.city);
                route.setPageCapacity(1);
            }else{
                route = new BMap.DrivingRoute(RouteOptions.city);
            }
            //route.enableAutoViewport();
            route.setSearchCompleteCallback(function(results) {
                var status = route.getStatus(), index = 0;
                if(status == BMAP_STATUS_SUCCESS) {
                    RouteOptions.container.innerHTML = getRouteDescription(RouteOptions, results, index); // 获取路线 Description
                    DrawLine(RouteOptions, results, index);
                }else if(status == BMAP_STATUS_UNKNOWN_ROUTE){
                    if(RouteOptions.isReSearch){
                        RouteOptions.container.innerHTML = getErrTemplate(RouteOptions);
                        return false;
                    }
                    localSearch(RouteOptions);
                }
            });
            route.enableAutoViewport();
            route.search(RouteOptions.start, RouteOptions.end);
            return route;
        }
        /**
         * 搜索无结果
         * @param {Object} RouteOptions 导航搜索配置
         * @return {Object}
         */
        function getErrTemplate(RouteOptions){
            return '<div style="clear:both; height:244px; overflow-x:hidden; overflow-y:auto; padding:8px 0 0 8px; line-height:26px;"><b style="font-size:13px; color:#666;">在 '+RouteOptions.city+' 未找到相关地点，您可更换关键词再尝试。</b></div>'
        }
        /**
         * 公交导航
         * @param {Object} RouteOptions 导航搜索配置
         * @return {Object}
         */
        function TransitRoute(RouteOptions){
            fullRouteOptons(RouteOptions, 'transit');
            return Route(RouteOptions);
        }

        /**
         * driving
         * @param {Object} RouteOptions 导航搜索配置
         * @return {Object}
         */
        function DrivingRoute(RouteOptions){
            fullRouteOptons(RouteOptions, 'driving');
            return Route(RouteOptions);
        }

        function DrawLine(RouteOptions, results, index){
            fn.removeOverlays('route');
            var Bounds     = [],
                plan         = results.getPlan(index);
            var MarkerOptions = {
                icon:RouteOptions.background,
                showInfo : false,
                size: {w: 21,h: 21},
                offset: {x: 0,y: 0},
                imgOffset: {x: 0,y:0}
            };
            function addPoints(points) {
                for(var i = 0; i < points.length; i++) {
                    Bounds.push(points[i]);
                }
            }
            function addMarkerFun(point, title, options){
                Jock.extend(MarkerOptions, Jock.extend({latlng:point,title:title},options||{}));
                fn.addMarker(MarkerOptions, 'route');
            }

            if(RouteOptions.routeType == 'transit'){
                // 绘制公交线路
                for( i = 0; i < plan.getNumLines(); i++) {
                    var line = plan.getLine(i);
                    addPoints(line.getPath());
                    // 公交
                    if(line.type == BMAP_LINE_TYPE_BUS) {
                        // 上车
                        addMarkerFun(line.getGetOnStop().point, line.getGetOnStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-196}} );
                        // 下车
                        addMarkerFun(line.getGetOffStop().point, line.getGetOffStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-196}} );

                        // 地铁
                    } else if(line.type == BMAP_LINE_TYPE_SUBWAY) {
                        // 上车
                        addMarkerFun(line.getGetOnStop().point, line.getGetOnStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-227}} );
                        // 下车
                        addMarkerFun(line.getGetOffStop().point, line.getGetOffStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-227}} );
                    }
                    fn.addPloyline(line.getPath(),'','route','line'+i);
                }
            }

            var PloylineOptions = {
                strokeOpacity : 0.75,
                strokeWeight : 4,
                enableMassClear : true
            }
            if(RouteOptions.routeType == 'transit'){
                PloylineOptions['strokeStyle'] = "dashed";
                PloylineOptions['strokeColor'] = "#30a208";
            }else{
                PloylineOptions['strokeStyle'] = "solid";
                PloylineOptions['strokeColor'] = "#f0f";
            }

            // 绘制驾车步行线路
            for(var i = 0; i < plan.getNumRoutes(); i++) {
                var route = plan.getRoute(i);
                addPoints(route.getPath());
                if(route.getDistance(false) > 0) {
                    // 步行线路有可能为0
                    fn.addPloyline(route.getPath(), PloylineOptions, 'route', 'route'+i);
                }
            }

            // 终点
            addMarkerFun(results.getEnd().point, results.getEnd().title, {size: {w: 40,h: 32}, offset : {x : 20,y : 16}, imgOffset: {x: 0,y:-154} });
            // 开始点
            addMarkerFun(results.getStart().point, RouteOptions.startTitle || results.getStart().title, {size: {w: 40,h: 32}, offset : {x : 15,y : 16}, imgOffset: {x: 0,y:-111} });

            map.setViewport(Bounds);

        }

        return {
            TransitRoute: TransitRoute,
            DrivingRoute: DrivingRoute
        }

    })());
    return fn;
};







