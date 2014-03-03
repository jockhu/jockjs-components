/**
 * Created by kathleen on 14-1-20.
 */
(function(J,D){
    J.map={
        addOverlay:function(){

        },
        removeOverlay:function(){

        },
        overlay:{
            initialize:function(){

            }

        }


    }
    function overlay(p){
        this.p = p;
    }
    var ore = new BMap.Overlay();
    overlay.prototype.initialize = function(map){
        this._map = map;
        this._locked = false;
        this._CName = !!this.p.className ? this.p.className : '';
        this._CHover = !!this.p.classHover ? this.p.classHover : '';
        this._barOffsetX = (this.p.barOffset&&this.p.barOffset.x) ? this.p.barOffset.x : 0;
        this._barOffsetY = (this.p.barOffset&&this.p.barOffset.y) ? this.p.barOffset.y : 0;
        me = this;
        var div = document.createElement("DIV");
        div.style.position = "absolute";
        div.style.cursor = "pointer";
        div.style.zIndex = 0;

        if(this._CName){
            div.className = me._CName;
        }
        div.innerHTML = this.p.barInfo;
        div.title = !!this.p.title ? this.p.title : '';

        if(this.p.showInfo){
            Jock.event.add(div,'click',function(){
                fn.openOverlayWindow(me.p, me)
            });
        }
        Jock.event.add(div,"mouseover", function(){
            me.setOver();
        });
        Jock.event.add(div,"mouseout", function(){
            me.setOut();
        });
        map.getPanes().labelPane.appendChild(div);
        this._div = div;
        return div
    }
    userOverlay.prototype.setOver = function(){
        if(!this._locked){
            this._div.style.zIndex = zIndex;
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

    J.map.event={

    }



})(J,D);