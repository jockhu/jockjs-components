Jmap = function(options){
    var map = {}, bounds, io = {}, o = {}, mpWidth, mpHeight, skipOvList = [], fn = {
        addSkipOvList: function(o){
            skipOvList.push(o)
        },
        init: function(ops){
            window.mapData = {};
            window.mapData.base = {};
            window.mapData.entity = {};
            window.mapData.sign = {};
            window.map = {};
            Jock.extend(o, Jock.map.options || {});
            Jock.extend(o, ops || {});
            if(o.d && typeof console != 'undefined') console.log(o);
            Jock.extend(io, Jock.map.icOpts || {});
            if (!o.elm || typeof BMap!=='object')
                return;
            this.createMap();
        },
        getCdn: function(){
            return o.cdn;
        },
        createMap: function(){
            map = new BMap.Map(o.elm, {
                mapType: !!o.u3d && o.city != '' ? BMAP_PERSPECTIVE_MAP : BMAP_NORMAL_MAP
            });
            var s = map.getSize();
            mpWidth = s.width;
            mpHeight = s.height;

            if (!!o.u3d && o.city != '')
                map.setCurrentCity(o.city);

            map.enableContinuousZoom();
            map.centerAndZoom(new BMap.Point(o.lng, o.lat), o.zoom);
            if (!!o.mark){
                var omk = this.addMarker(o.lng, o.lat, io)
                this.addSkipOvList(omk);
            }
            if (!!o.ezoom)
                map.enableScrollWheelZoom(true);

            this.addNavControl();
        },
        getMap: function(){
            return map || {};
        },
        reset: function(){
            map.reset()
        },
        inBounds: function(lng, lat){
            var xy = map.pointToPixel(new BMap.Point(lng, lat));
            if (xy.x > 0 && xy.x < mpWidth && xy.y > 0 && xy.y < mpHeight)
                return true;
            else
                return false;
        },
        clearMarkers: function(){
            map.clearOverlays()
        },
        addMarker: function(lng, lat, p){
            if (this.inBounds(lng, lat)) {
                var marker = new BMap.Marker(new BMap.Point(lng, lat), {
                    icon: this.getMarkerIcon(p || io)
                });
                if (!p.title || !io.title)
                    marker.setTitle(p.title || io.title);
                map.addOverlay(marker);
                return marker;
            }
        },
        addNavControl: function(){
            var ctrl_nav = new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_TOP_LEFT,
                type: !!o.ctype ? BMAP_NAVIGATION_CONTROL_LARGE : BMAP_NAVIGATION_CONTROL_ZOOM
            });
            map.addControl(ctrl_nav);
        },
        getMarkerIcon: function(p){
            return new BMap.Icon(p.icon, new BMap.Size(p.size.w, p.size.h), {
                offset: new BMap.Size(p.offset.x, p.offset.y),
                imageOffset: new BMap.Size(p.imgOffset.x, p.imgOffset.y)
            });
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
        openWindow: function(ops){
            var infoWindow = new BMap.InfoWindow(ops.popInfo);
            map.openInfoWindow(infoWindow, new BMap.Point(ops.lng, ops.lat));
        },
        mapAddOverlay: function(myOverlay){
            map.addOverlay(myOverlay);
        },
        mapRemoveOverlay: function(mOv, skipOv){
            var ols = map.getOverlays();
            for (var i = 0, l = ols.length; i < l; i++) {
                if ((mOv == this.mOverlay.All || mOv === ols[i].toString()) && !Jock.inArray(ols[i], skipOvList) && (!!skipOv && !this.vOverlay(ols[i], skipOv)))
                    map.removeOverlay(ols[i]);
            }
        },
        vOverlay: function(o, skipOv){
            if (!!skipOv.length)
                return Jock.inArray(o, skipOv)
            if (typeof skipOv === 'object' && o === skipOv)
                return true;
            return false
        },
        mOverlay: {
            All: '',
            Marker: 'Marker',
            Overlay: 'Overlay'
        },
        localSearch: function(keyword, obj, callback, args){
            var options = {
                onSearchComplete: function(results){
                    if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                        var s = [], l = results.getCurrentNumPois();
                        while (l--) {
                            s.push(results.getPoi(l))
                        }
                        if (obj && callback)
                            callback.call(obj, s, args)
                    }
                }
            }, local = new BMap.LocalSearch(map, options);
            local.searchInBounds(keyword, map.getBounds());
        }
    };
    fn.init(options);
    return fn;
};