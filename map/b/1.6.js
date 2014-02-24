var Jmap=function(b){var e={},d,h={},g={},a={},f=[],c={eventsBind:function(k,n){for(var l=0,j=k.length;l<j;l++){var m=k[l].fn;Jock.event.add(k[l].obj,k[l].type,function(){m.call(n);});}},overlaysType:{overlay:"overlays",marker:"markers"},init:function(j){window.mapData={};window.mapData.base={};window.mapData.entity={};window.mapData.sign={};window.map={};Jock.extend(g,Jock.map.options||{});Jock.extend(g,j||{});g.latlng=this.getLatLng(g);if(g.d&&typeof console!="undefined"){console.log(g);}Jock.extend(h,Jock.map.icOpts||{});if(!g.elm||typeof BMap!=="object"){return;}g.elm=document.getElementById(g.elm);g.elm.style.background="none";this.setWH();this.createMap();var i=this;e.addEventListener("resize",function(){i.setWH(true);});},setWH:function(j){var i=g.elm.style;if(j||!i.width){i.width="auto";}if(j||!i.height){i.height=(Jock.getHeight()-g.top)+"px";}},getMapWH:function(){return e.getSize();},createMap:function(){e=new BMap.Map(g.elm,{mapType:!!g.u3d&&g.city!=""?BMAP_PERSPECTIVE_MAP:BMAP_NORMAL_MAP,minZoom:g.minz?g.minz:3,maxZoom:g.maxz?g.maxz:18});if(!!g.u3d&&g.city!=""){e.setCurrentCity(g.city);}e.enableContinuousZoom();e.centerAndZoom(new BMap.Point(g.lng,g.lat),g.zoom);if(!!g.mark){var j=this.addMarker(g,"center");}if(!!g.ezoom){e.enableScrollWheelZoom();}e.enableKeyboard();e.enableContinuousZoom();e.enableInertialDragging();var i=new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:!!g.ctype?BMAP_NAVIGATION_CONTROL_LARGE:BMAP_NAVIGATION_CONTROL_ZOOM});e.addControl(i);if(!!g.scale){var k=new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});e.addControl(k);}},setOverlaysVisible:function(j,m,l){var k=a[j];for(var i in k){this.setOverlayVisible(j,i,m);}},setOverlayVisible:function(j,i,k){if(a[j]&&a[j][i]){a[j][i].setVisible(k||false);}},getOverlay:function(j,i){a[j]=a[j]?a[j]:{};return a[j][i];},getOverlays:function(i){return a[i]?a[i]:undefined;},clearOverlays:function(){e.clearOverlays();a={};},removeOverlays:function(j){var k=a[j];for(var i in k){this.removeOverlay(j,i);}},removeOverlay:function(j,i){if(a[j][i]){e.removeOverlay(a[j][i]);delete a[j][i];}},pushOverlayList:function(j,i,l){a[j]=a[j]?a[j]:{};a[j][i]=l;},getLatLng:function(i){var i=i||g;return new BMap.Point(i.lng,i.lat);},getMap:function(){return e||{};},reset:function(){e.reset();},getBounds:function(){return e.getBounds();},getBoundsWE:function(m){var j=this.getBounds(),k=j.getSouthWest(),n=j.getNorthEast();if(m&&typeof m=="number"){var l=e.pointToOverlayPixel(k),i=e.pointToOverlayPixel(n);l.x+=-m;l.y+=m;i.x+=m;i.y+=-m;k=e.overlayPixelToPoint(new BMap.Pixel(l.x,l.y));n=e.overlayPixelToPoint(new BMap.Pixel(i.x,i.y));}return{swlat:k.lat,nelat:n.lat,swlng:k.lng,nelng:n.lng};},inBounds:function(j){var i=this.getBounds();if(typeof i==="object"){return i.containsPoint(j);}return true;},pointToPixel:function(i){return e.pointToPixel(i);},addMarker:function(o,l,k){o.latlng=o.latlng?o.latlng:this.getLatLng(o);var n=k||this.buildOverlayKey(o.latlng),j=l||this.overlaysType.overlay;if(this.getOverlay(j,n)){return;}if(this.inBounds(o.latlng)){var i=new BMap.Marker(o.latlng,{icon:this.getMarkerImage(Jock.extend(h,o,true))});if(o.title){i.setTitle(o.title);}if(o.showInfo){var m=this;Jock.event.add(i,"click",function(){m.openMarkerWindow(o);});}e.addOverlay(i);this.pushOverlayList(j,n,i);return i;}},getMarkerImage:function(i){return new BMap.Icon(i.icon,new BMap.Size(i.size.w,i.size.h),{anchor:new BMap.Size(i.offset.x,i.offset.y),imageOffset:new BMap.Size(i.imgOffset.x,i.imgOffset.y)});},openWindow:function(k){var j={};if(typeof k.offset!="undefined"){j.pixelOffset=new BMap.Size(k.offset.x,k.offset.y);}var i=new BMap.InfoWindow(k.popInfo,j);e.openInfoWindow(i,k.latlng);},openMarkerWindow:function(i){this.openWindow(i);},openOverlayWindow:function(i){this.openWindow(i);},addOverlay:function(n,l,k){n.latlng=n.latlng?n.latlng:this.getLatLng(n);var m=k||this.buildOverlayKey(n.latlng),j=l||this.overlaysType.overlay;if(this.getOverlay(this.overlaysType.overlay,m)){return;}function o(q,r){this._obj=r;this.p=q||{};}o.prototype=new BMap.Overlay();o.prototype.initialize=function(r){this._map=r;this._CName=!!this.p.className?this.p.className:"";this._CHover=!!this.p.classHover?this.p.classHover:"";this._barOffsetX=(this.p.barOffset&&this.p.barOffset.x)?this.p.barOffset.x:0;this._barOffsetY=(this.p.barOffset&&this.p.barOffset.y)?this.p.barOffset.y:0;var q=this;var s=document.createElement("DIV");s.style.position="absolute";s.style.cursor="pointer";s.style.zIndex=0;if(q._CName){s.className=q._CName;}s.innerHTML=this.p.barInfo;s.title=!!this.p.title?this.p.title:"";if(q.p.showInfo){Jock.event.add(s,"click",function(){q._obj.openOverlayWindow(q.p);});}Jock.event.add(s,"mouseover",function(){s.style.zIndex=1;if(q._CName&&q._CHover){s.className=q._CName+" "+q._CHover;}});Jock.event.add(s,"mouseout",function(){s.style.zIndex=0;if(q._CName){s.className=q._CName;}});var p=r.getPanes();p.markerPane.appendChild(s);this._div=s;return s;};o.prototype.draw=function(){var p=this._map.pointToOverlayPixel(this.p.latlng);this._div.style.left=parseInt(p.x+this._barOffsetX)+"px";this._div.style.top=parseInt(p.y+this._barOffsetY)+"px";};o.prototype.setVisible=function(p){if(this._div){this._div.style.visibility=(p)?"visible":"hidden";}};var i=new o(n,this);e.addOverlay(i);this.pushOverlayList(j,m,i);return i;},buildOverlayKey:function(i){return i.lat+"_"+i.lng;},getGeocoder:function(i,l,k){var j=new BMap.Geocoder();j.getPoint(i,l,k);},sw3d:function(){var i={};this.extend(i,opts||{});this.extend(i,b||{});this.extend(i,{u3d:1,zoom:17}||{});this.init(i);},sw2d:function(){var i={};this.extend(i,opts||{});this.extend(i,b||{});this.extend(i,{u3d:0}||{});this.init(i);},localSearch:function(i,m,n,k){var j={onSearchComplete:function(q){if(l.getStatus()==BMAP_STATUS_SUCCESS){var t=[],o=q.getCurrentNumPois();while(o--){var p=q.getPoi(o);var u={};u.title=p.title;u.point=p.point;u.address=p.address;t.push(u);}if(m&&n){n.call(m,t,k);}}}},l=new BMap.LocalSearch(e,j);l.searchInBounds(i,this.getBounds());},geolocation:function(i,k){var j=new BMap.Geolocation();j.getCurrentPosition(function(l){if(i&&k&&l){k.call(i,l.point);}});}};c.init(b);return c;};