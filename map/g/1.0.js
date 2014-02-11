var Jmap = function(options) {
    var map = {}, gmap = {}, io = {}, o = {}, OVERLAYS = [], gWindow, fn = {
        setOverlays:function(visible, key){
            var OVs = this.getOverlays(key);
            for(var i=0,l=OVs.length;i<l;i++){
                OVs[i].setVisible(visible||false);
            }
        },
        getOverlays:function(key){
            var OVs = [];
            if (typeof key != 'undefined') {
                for(var i=0,l=OVERLAYS.length;i<l;i++){
                    if(key === OVERLAYS[i][0])
                        OVs.push(OVERLAYS[i][1]);
                }
            }else{
                for(var i=0,l=OVERLAYS.length;i<l;i++){
                     OVs.push(OVERLAYS[i][1]);
                }
            }
            return OVs;
        },
        pushOverlayList : function(k,o) {
            OVERLAYS.push([k,o])
        },
        init : function(ops) {
            Jock.extend(o, Jock.map.options || {});
            Jock.extend(o, ops || {});
            if (!o.elm || typeof google.maps !== 'object')
                return;
            gmap = google.maps;
            o.latlng = this.getLatLng(o);
            if(o.d && typeof console != 'undefined') console.log(o);
            Jock.extend(io, Jock.map.icOpts || {});
            this.createMap();
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
            map = new gmap.Map(document.getElementById(io.elm), gOpts);
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
            gmap.event.addListener(map,'click',function(e){
                //console.log(e.latLng)
                //console.log('lat:'+e.point.lat+' lng:'+e.point.lng)
            });
        },
        getLatLng : function(p) {
            var p = p || o;
            return new gmap.LatLng(p.lat, p.lng);
        },
        getMap : function() {
            return map || {};
        },
        getGMap : function(){
            return gmap || {};
        },
        setCenter : function(latlng) {
            map.setCenter(o.latlng);
        },
        setZoom:function(zoom){
            map.setZoom(zoom||o.zoom);
        },
        inBounds : function(latlng) {
            var b = map.getBounds();
            if(typeof b === 'object'){
                return b.contains(latlng);
            }
            return true;
        },
        getBounds:function(){
            return map.getBounds();
        },
        clearMarkers : function() {
            map.clearOverlays()
        },
        getSize:function(x,y){
            return new gmap.Size(x,y);
        },
        addMarker : function(p,key) {
            if (this.inBounds(p.latlng)) {
                var icon = new gmap.MarkerImage(p.icon, new gmap.Size(p.size.w,p.size.h), new gmap.Point(p.imgOffset.x, p.imgOffset.y === 0 ? 0 : -(p.imgOffset.y)), new gmap.Point(p.offset.x,p.offset.y));
                var marker = new gmap.Marker({
                    position : p.latlng,
                    map : map,
                    icon : icon,
                    title : (!!p.title) ? p.title : ''
                });
                if(!!p.popInfo && p.popInfo != ''){
                    var s = this;
                    gmap.event.addListener(marker, 'click',function(){
                        s.openWindow(p);
                    });
                }
                this.pushOverlayList(key||'marker',marker);
                return marker;
            }
        },
        openWindow : function(p) {
            if(gWindow.getContent() != p.popInfo){
                gWindow.close();
                var ops = {
                    content: p.popInfo,
                    position: p.latlng
                }
                if(typeof p.offset != 'undefined'){
                    ops['pixelOffset'] = new gmap.Size(p.offset.x,p.offset.y)
                }
                gWindow.setOptions(ops);
                gmap.event.addListener(gWindow,'closeclick',function(){
                    gWindow.setContent('');
                });
                gWindow.open(map);
            }
        },
        addOverlay : function(p,key) {
            function userOverlay(p, o){
                this.div_ = null;
                this.map_ = map;
                this.o = o;
                this.gmap_ = gmap;
                this.p = p || {};
                this.setMap(map);
            }
            userOverlay.prototype = new gmap.OverlayView();
            userOverlay.prototype.onAdd = function(){
                var div = document.createElement("DIV");
                div.style.position = "absolute";
                div.style.cursor = "pointer";
                div.style.zIndex = 0;
                div.innerHTML = this.p.barInfo;
                div.title = (!!this.p.title) ? this.p.title : '';
                var panes = this.getPanes();
                panes.overlayImage.appendChild(div);
                this.div_ = div;
                var me = this;
                if(typeof this.p.popInfo != 'undefined' && this.p.popInfo != ''){
                    me.gmap_.event.addDomListener(this.div_, "click", function(){
                        me.o.openWindow(me.p);
                    });
                }
                me.gmap_.event.addDomListener(this.div_, "mouseover", function(){
                    me.div_.style.zIndex = 1;
                });
                me.gmap_.event.addDomListener(this.div_, "mouseout", function(){
                    me.div_.style.zIndex = 0;
                });
            }
            userOverlay.prototype.draw = function(){
                var overlayProjection = this.getProjection();
                var z = overlayProjection.fromLatLngToDivPixel(this.p.latlng);
                var div = this.div_;
                div.style.left = (z.x-2) + 'px';
                div.style.top = (z.y-28) + 'px';
            }
            userOverlay.prototype.onRemove = function(){
                this.div_.parentNode.removeChild(this.div_);
                this.div_ = null;
            }
            userOverlay.prototype.setVisible = function(b){
                if (this.div_) {
                    this.div_.style.visibility = (b) ? "visible" : "hidden";
                }
            }
            var uO = new userOverlay(p,this);
            this.pushOverlayList(key||'overlay',uO);
            return uO;
        },
        localSearch : function(keyword, obj, callback, args) {
            if(typeof GlocalSearch === 'undefined') return;
            var gLocalSearch = new GlocalSearch();
            gLocalSearch.clearResults();
            gLocalSearch.setSearchCompleteCallback(obj, callback, [gLocalSearch, args]);
            gLocalSearch.setCenterPoint(map.getCenter());
            gLocalSearch.setResultSetSize(8);
            gLocalSearch.execute(keyword);
        }
    };
    fn.init(options);
    return fn;
};