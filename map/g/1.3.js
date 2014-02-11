//google
var Jmap = function(options) {
    var map = {}, gmap=google.maps, io = {}, o = {}, OVERLAYS = {}, fn = {
        eventsBind:function(eventHanders, objthis){
            for(var i=0,len=eventHanders.length;i<len;i++){
                var fn = eventHanders[i].fn;
                gmap.event.addDomListener(eventHanders[i].obj, getEventType(eventHanders[i].type), function(){
                    fn.call(objthis);
                });
            }
            function getEventType(type){
                typeNew = ''
                switch(type){
                    case  'movestart':
                        typeNew = 'dragstart'
                        break;
                }
                return typeNew;
            }
        },
        overlaysType:{
            overlay:'overlays',
            marker:'markers'
        },
        init : function(ops) {
            Jock.extend(o, Jock.map.options || {});
            Jock.extend(o, ops || {});
            if (!o.elm || typeof google.maps !== 'object')
                return;
            o.latlng = this.getLatLng(o);
            if(o.d && typeof console != 'undefined') console.log(o);
            Jock.extend(io, Jock.map.icOpts || {});
            o.elm=document.getElementById(o.elm);
            o.elm.style.background = 'none';
            this.setWH();
            this.createMap();
        },
        setWH:function(rewrite){
            var es = o.elm.style;
            if(rewrite||!es.width) es.width = 'auto';
            if(rewrite||!es.height) es.height = (Jock.getHeight()-o.top)+'px';
        },
        getMapWH: function(){
            return {
                width:Jock.getWidth(),
                height:o.elm.style.height
            }
        },
        createMap : function() {
            gWindow = new gmap.InfoWindow;
            Jock.extend(io, o || {});
            var gOpts = {
                zoom : io.zoom,
                center : io.latlng,
                streetViewControl : false,
                mapTypeId : gmap.MapTypeId.ROADMAP
            };
            map = new gmap.Map(io.elm, gOpts);
            if (!o.u3d)
                map.setOptions({mapTypeControl : false});
            if (!!o.mark){
                this.addMarker(io);
            }
            map.setOptions({navigationControl : true});
            if (!!o.ctype){
                map.setOptions({navigationControlOptions:{style: gmap.NavigationControlStyle.DEFAULT}});
            }else{
                map.setOptions({navigationControlOptions:{style: gmap.NavigationControlStyle.SMALL}});
            }
            if (!o.ezoom)
                map.setOptions({scrollwheel : false});

            if(!!o.scale)
                map.setOptions({scaleControl: true});

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
                var ov = OVERLAYS[t][key];
                ov.setMap(null);
                delete OVERLAYS[t][key];
            }
        },
        pushOverlayList : function(t,k,o) {
            OVERLAYS[t] = OVERLAYS[t] ? OVERLAYS[t] : {}
            OVERLAYS[t][k] = o;
        },
        getLatLng : function(p) {
            var p = p || o;
            return new gmap.LatLng(p.lat, p.lng);
        },
        getMap: function(){
            return map || {};
        },
        reset: function(){
            map.panTo(o.latlng);
            map.setZoom(o.zoom);
        },
        getBounds:function(){
            return map.getBounds();
        },
        getBoundsWE:function(zoom){
            var b=this.getBounds(),w=b.getSouthWest(),e=b.getNorthEast();
            //console.log(w.lat())
//            var ov = new gmap.OverlayView();
//            var pr = ov.getProjection();
//            console.log(ov.getProjection())
//            if(zoom && typeof zoom == 'number'){
//                //var pro = gmap.getProjection();
//                var _w = map.fromLatLngToDivPixel(w),_e = map.fromLatLngToDivPixel(e);
//                console.log(w)
//                _w.x+=-zoom; // w.lng 横向
//                _w.y+=zoom; // w.lat 纵向
//                _e.x+=zoom;
//                _e.y+=-zoom;
//                //w=MC.fromContainerPixelToLatLng(new gmap.Point(_w.x,_w.y));
//                //e=MC.fromContainerPixelToLatLng(new gmap.Point(_e.x,_e.y));
//            }
            //var swlat = center_lat-0.027, nelat = center_lat+0.022, swlng = center_lng-0.0588, nelng = center_lng+0.053;

//            console.log(e.lat(),e.lng())
//            console.log(w.lat(),w.lng())
            return {
                swlat:w.lat(),
                nelat:e.lat()-0.002,
                swlng:w.lng(),
                nelng:e.lng()
            }
        },
        inBounds : function(latlng) {
            var b = map.getBounds();
            if(typeof b === 'object'){
                return b.contains(latlng);
            }
            return true;
        },
        _getProjection:function(){
            function userOverlay(){this.setMap(map);}
            userOverlay.prototype = new gmap.OverlayView();
            userOverlay.prototype.onAdd = function(){}
            userOverlay.prototype.draw = function(){}
            userOverlay.prototype.onRemove = function(){}
            var overlay = new userOverlay();
            return overlay.getProjection();
        },
        pointToPixel:function(latlng){
            var overlay = new gmap.OverlayView();
            overlay.draw = function() {};
            overlay.setMap(map);
            return overlay.getProjection().fromLatLngToContainerPixel(latlng);
        },
        addMarker : function(p, overlayType, key) {
            p.latlng = p.latlng ? p.latlng : this.getLatLng(p);
            var _key = key || this.buildOverlayKey(p.latlng), _type = overlayType || this.overlaysType.overlay;
            if(this.getOverlay(_type, _key)) return;
            if (this.inBounds(p.latlng)) {
                var marker = new gmap.Marker({
                    position : p.latlng,
                    map : map,
                    icon: this.getMarkerImage(p || io),
                    title : (!!p.title) ? p.title : ''
                });
                if(p.showInfo){
                    var s = this;
                    gmap.event.addDomListener(marker, 'click', function(){
                        s.openMarkerWindow(p);
                    });
                }
                this.pushOverlayList(_type, _key, marker);
                return marker;
            }
        },
        getMarkerImage: function(p){
            return new gmap.MarkerImage(p.icon, new gmap.Size(p.size.w,p.size.h), new gmap.Point(p.imgOffset.x, p.imgOffset.y === 0 ? 0 : -(p.imgOffset.y)), new gmap.Point(p.offset.x,p.offset.y));
        },
        openWindow: function(p){
            gWindow.close();
            var opts = {
                content: p.popInfo,
                position: p.latlng
            }
            if(typeof p.offset != 'undefined'){
                ops['pixelOffset'] = new gmap.Size(p.offset.x,p.offset.y)
            }
            gWindow.setOptions(opts);
            gWindow.open(map);
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
                this.setMap(map);
            }
            userOverlay.prototype = new gmap.OverlayView();
            userOverlay.prototype.onAdd = function(map){
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
                var panes = this.getPanes();
                panes.overlayImage.appendChild(div);
                this._div = div;
                return div
            }
            userOverlay.prototype.draw = function(){
                var overlayProjection = this.getProjection();
                var position = overlayProjection.fromLatLngToDivPixel(this.p.latlng);
                this._div.style.left = parseInt(position.x + this._barOffsetX) + "px";
                this._div.style.top = parseInt(position.y + this._barOffsetY) + "px";
            }
            userOverlay.prototype.onRemove = function(){
                this.div_.parentNode.removeChild(this.div_);
                this.div_ = null;
            }
            userOverlay.prototype.remove = function(){
                this.setMap(null);
            }
            userOverlay.prototype.setVisible = function(b){
                if (this._div) {
                    this._div.style.visibility = (b) ? "visible" : "hidden";
                }
            }
            var uO = new userOverlay(p,this);
            this.pushOverlayList(_type,_key,uO);
            return uO;
        },
        buildOverlayKey:function(latlng){
            return latlng.lat()+'_'+latlng.lng();
        },
        getGeocoder:function(address,callback,city){

        },
        sw3d: function(){

        },
        sw2d: function(){

        },
        localSearch : function(keyword, obj, callback, args) {
            if(typeof GlocalSearch === 'undefined') return;
            var gLocalSearch = new GlocalSearch(), me=this;
            gLocalSearch.clearResults();
            gLocalSearch.setSearchCompleteCallback(null, function(searchResults){
                var s = [], results = searchResults.results, l = results.length;
                while (l--) {
                    var rs = results[l];
                    var r = {};
                    r['title'] = rs.title;
                    r['point'] = me.getLatLng({lat:rs.lat, lng:rs.lng});
                    r['address'] = rs.addressLines[0]+rs.addressLines[1];
                    s.push(r)
                }
                if (obj && callback)
                    callback.call(obj, s, args)
            }, [gLocalSearch,args]);
            gLocalSearch.setCenterPoint(map.getCenter());
            gLocalSearch.setResultSetSize(8);
            gLocalSearch.execute(keyword);
        }
    };
    fn.init(options);
    return fn;
};