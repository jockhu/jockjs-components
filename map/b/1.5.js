Jmap = function(options){
    var map = {}, bounds, io = {}, o = {}, OVERLAYS = {}, skipOvList = [], fn = {
        eventsBind:function(eventHanders, objthis){
            for(var i=0,len=eventHanders.length;i<len;i++){
                var fn = eventHanders[i].fn;
                Jock.event.add(eventHanders[i].obj, eventHanders[i].type, function(){
                    fn.call(objthis);
                });
            }
        },
        overlaysType:{
            overlay:'overlays',
            marker:'markers'
        },
        init: function(ops){
            window.mapData = {};
            window.mapData.base = {};
            window.mapData.entity = {};
            window.mapData.sign = {};
            window.map = {};
            Jock.extend(o, Jock.map.options || {});
            Jock.extend(o, ops || {});
            o.latlng = this.getLatLng(o);
            if(o.d && typeof console != 'undefined') console.log(o);
            Jock.extend(io, Jock.map.icOpts || {});
            if (!o.elm || typeof BMap!=='object')
                return;
            o.elm=document.getElementById(o.elm);
            o.elm.style.background = 'none';
            this.setWH();
            this.createMap();
            var s = this;
            map.addEventListener('resize',function(){
                s.setWH(true);
            });
        },
        setWH:function(rw){
            var es = o.elm.style;
            if(rw||!es.width) es.width = 'auto';
            if(rw||!es.height) es.height = (Jock.getHeight()-o.top)+'px';
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

            map.enableContinuousZoom();
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


//            map.addEventListener('click',function(e){
//                console.log('lat:'+e.point.lat+' lng:'+e.point.lng)
//            });

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
        removeOverlays: function(t){
            var ovs = OVERLAYS[t];
            for(var ov in ovs){
                this.removeOverlay(t, ov)
            }
        },
        removeOverlay: function(t, key){
            if(OVERLAYS[t][key]){
                map.removeOverlay(OVERLAYS[t][key]);
                delete OVERLAYS[t][key];
            }
        },
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
                _e.x+=zoom;
                _e.y+=-zoom;
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
            if(this.getOverlay(_type, _key)) return;
            if (this.inBounds(p.latlng)) {
                var marker = new BMap.Marker(p.latlng, {
                    icon: this.getMarkerImage(Jock.extend(io,p,true))
                });
                if(p.title){
                    marker.setTitle(p.title)
                }
                if(p.showInfo){
                    var s = this;
                    Jock.event.add(marker,'click',function(){
                        s.openMarkerWindow(p);
                    });
                }
                map.addOverlay(marker);
                this.pushOverlayList(_type, _key, marker);
                return marker;
            }
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
        openOverlayWindow:function(p){
            this.openWindow(p)
        },
        addOverlay : function(p, overlayType, key) {
            p.latlng = p.latlng ? p.latlng : this.getLatLng(p);
            var _key = key||this.buildOverlayKey(p.latlng), _type = overlayType || this.overlaysType.overlay;
            if(this.getOverlay(this.overlaysType.overlay,_key)) return;

            function userOverlay(p, o){
                this._obj = o;
                this.p = p || {};
            }
            userOverlay.prototype = new BMap.Overlay();
            userOverlay.prototype.initialize = function(map){
                this._map = map;
                this._CName = !!this.p.className ? this.p.className : '';
                this._CHover = !!this.p.classHover ? this.p.classHover : '';
                this._barOffsetX = (this.p.barOffset&&this.p.barOffset.x) ? this.p.barOffset.x : 0;
                this._barOffsetY = (this.p.barOffset&&this.p.barOffset.y) ? this.p.barOffset.y : 0;
                var me = this;
                var div = document.createElement("DIV");
                div.style.position = "absolute";
                div.style.cursor = "pointer";
                div.style.zIndex = 0;

                if(me._CName){
                    div.className = me._CName;
                }
                div.innerHTML = this.p.barInfo;
                div.title = !!this.p.title ? this.p.title : '';

                if(me.p.showInfo){
                    Jock.event.add(div,'click',function(){
                        me._obj.openOverlayWindow(me.p)
                    });
                }
                Jock.event.add(div,"mouseover", function(){
                    div.style.zIndex = 1;
                    if(me._CName && me._CHover){
                        div.className = me._CName+' '+me._CHover;
                    }
                });
                Jock.event.add(div,"mouseout", function(){
                    div.style.zIndex = 0;
                    if(me._CName){
                        div.className = me._CName;
                    }
                });

                var panes = map.getPanes();
                panes.markerPane.appendChild(div);
                this._div = div;
                return div
            }
            userOverlay.prototype.draw = function(){
                var position = this._map.pointToOverlayPixel(this.p.latlng);
                this._div.style.left = parseInt(position.x + this._barOffsetX) + "px";
                this._div.style.top = parseInt(position.y + this._barOffsetY) + "px";
            }
            userOverlay.prototype.setVisible = function(b){
                if (this._div) {
                    this._div.style.visibility = (b) ? "visible" : "hidden";
                }
            }
            var uO = new userOverlay(p,this);
            map.addOverlay(uO);
            this.pushOverlayList(_type,_key,uO);
            return uO;
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
            var options = {
                onSearchComplete: function(results){
                    if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                        var s = [], l = results.getCurrentNumPois();
                        while (l--) {
                            var rs = results.getPoi(l);
                            var r = {};
                            r['title'] = rs.title;
                            r['point'] = rs.point;
                            r['address'] = rs.address;
                            s.push(r)
                        }
                        if (obj && callback)
                            callback.call(obj, s, args)
                    }
                }
            }, local = new BMap.LocalSearch(map, options);
            local.searchInBounds(keyword, this.getBounds());
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
    return fn;
};