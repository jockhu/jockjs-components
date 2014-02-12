(function(J){
	function Geolocation(){
		this._defaultOptions = {
			enableHighAccuracy: false,
			timeout: 10000,
			maximumAge: 0,
			retry: true,
			cookieFirst: true,
			usePositionIn30Min: true,
			useBothNativeAndHTML5Position: true
			};
	    this._retryTimes = 0;
	    this._isAndroid = !!(/android/i.test(navigator.userAgent));
	    this._error = {};
	}	
	Geolocation.prototype.getCurrentPosition = function(success,error,options){
		this._timestamp = (new Date()).getTime();
        this._successCallback = success;
        this._errorCallback = error;
        this._currentOptions = mix(this._defaultOptions, options);
        this._bind();
        gEvent.trigger("start");
	}
	Geolocation.prototype._bind = function(){
		if(this.binded) return;		
		this.binded = true;
		var obj = this, opts = obj._currentOptions;	
		gEvent.on("start",function(){
			if(!opts.cookieFirst && obj._isAndroid){
				native_geo.getPosition();
				return;
			}
			cookie_geo.getPosition(5);
		});
		gEvent.on("nativesuccess", function(data){
			obj._position = data.position;
            cookie_geo.setPosition(changePos(obj._position));
            gEvent.trigger("success");
		});
		gEvent.on("nativefail",function(data){
			obj._error.nativeError = data.error;
			if (!opts.cookieFirst) {
                cookie_geo.getPosition(5);
                return
            }
            if (data.error.code == 1 || data.error.code == 6) {
                html_geo.getPosition(opts);
                return
            }
            if (opts.useBothNativeAndHTML5Position) {
                html_geo.getPosition(opts);
                return
            }
            if (opts.usePositionIn30Min) {
                cookie_geo.getPosition(30);
                return
            }
            gEvent.trigger("fail");
		});
		gEvent.on("cookiesuccess",function(data){
			obj._position = data.position;
			gEvent.trigger("success");
		});
		gEvent.on("cookiefail",function(data){
			obj._error.cookieError = data.error;
			if (data.error.minutes == 5) {
                if (opts.cookieFirst) {
                    if (obj._isAndroid) {
                        native_geo.getPosition();
                        return;
                    }
                }
                html_geo.getPosition(opts);
            } else {
                if (data.error.minutes == 30) {
                    if (opts.retry && obj._retryTimes < 1) {
                        obj._retryTimes++;
                        gEvent.trigger("start");
                    } else {
                        gEvent.trigger("fail");
                    }
                }
            }
		});
		gEvent.on("html5success", function(data) {
            obj._position = new addressInfo(data.position.coords, data.position.timestamp);
            latlngInfo(data.position.coords.latitude, data.position.coords.longitude);
        });
        gEvent.on("html5fail", function(data) {
            obj._error.html5Error = data.error;
            cookie_geo.getPosition(30);
        });
        gEvent.on("addresssuccess", function(data) {
            var result = data.result;
            var addr = result.addr;
            var convert = Convert.pixelToLngLat(result.point.x, result.point.y, 18);
            obj._position.coords = {x: result.point.x,y: result.point.y,accuracy: obj._position.coords.accuracy,longitude: convert[0],latitude: convert[1]};
            obj._position.addressComponent.city = addr.city;
            obj._position.addressComponent.cityCode = addr.city_code;
            obj._position.addressComponent.district = addr.district;
            obj._position.addressComponent.street = addr.street;
            obj._position.address = addr.city + addr.district + addr.street;
            cookie_geo.setPosition(changePos(obj._position));
            gEvent.trigger("success");
        });
        gEvent.on("success", function(data) {
            obj._successCallback && obj._successCallback(obj._position);
        });
        gEvent.on("fail", function() {
            var time = (new Date()).getTime() - obj._timestamp;
            var pageName = J.site.info.pageName;
            if (obj._error.html5Error) {
                trackEvent(pageName + "_position_error","{type:'html5',code:" + obj._error.html5Error.code + ",time:" + time + "}");
            } else {
                if (obj._error.nativeError) {
                    trackEvent(pageName + "_position_error","{type:'native',code:" + obj._error.nativeError.code + ",time:" + time + "}");
                } else {
                    if (obj._error.cookieError) {
                        trackEvent(pageName + "_position_error","{type:'cookie',time:" + time + "}");
                    } else {
                        trackEvent(pageName + "_position_error","{type:'unknown',time:" + time + "}");
                    }
                }
            }
            obj._errorCallback && obj._errorCallback(obj._error);
        });
	}
	window.geolocation = new geolocate();
	//gps定位
	function nativeGeo(){
		this._isApnAvailable = false;
        this._isApnTimeout = false;
        this._isNativeGeoSuc = false;
        this._isNativeAvailable = false;
        this._isNativeTimeout = false;
        this._config = {host: "127.0.0.1"};
	}
	nativeGeo.prototype.getPosition = function(){
		var obj = this;
		var callback = function(data){
			clearTimeout(obj._apnTimer);
			if(obj._isApnTimeout == false){
				if(data && data.error == 0){
					obj._isNativeAvailable = true;
					obj._getPosition();
					return;
				}
			}
			gEvent.trigger("nativefail",{error:{code:6}});
		}
		get("http://" + obj._config.host + ":6259/getapn?",callback);
		obj.checkApnTimeout(2);
	}
	nativeGeo.prototype.checkApnTimeout = function(second){
		var obj = this;
		obj._apnTimer = setTimeout(function(){
			if(obj._isNativeAvailable == false){
				obj._isApnTimeout = true;
				gEvent.trigger("nativefail",{error:{code:6}});
			}
		}, 1000 * second);
	}
	nativeGeo.prototype._getPosition = function(){
		var obj = this;
		var callback = function(data){
			clearTimeout(obj._nativeGeoTimer);
			if(data.error == 0 && obj._isNativeTimeout == false){
				obj.getDetailLoc(data);
			}else{
				gEvent.trigger("nativefail",{error:{code:data.error}});
			}
		}
		get("http://" + obj._config.host + ":6259/geolocation?timeout=10000", callback);
		obj.checkNativeTimeout(10);
	}
	nativeGeo.prototype.checkNativeTimeout = function(second){
		var obj = this;
		obj._nativeGeoTimer = setTimeout(function(){
			if(obj._isNativeGeoSuc == false){
				obj._isNativeTimeout = true;
				gEvent.trigger("nativefail", {error: {code: 3}});
			}
		}, 1000 * second);
	}
	nativeGeo.prototype.getDetailLoc = function(data){
		var obj = this, url = obj.getRgcUrl(data);
		var callback = function(data){
			var content = data.content, addressDetail = content && content.address_detail, point = content && content.point, convert = Convert.pixelToLngLat(point.x, point.y,18);
			obj._isNativeGeoSuc = true;
			var adInfo = new addressInfo({x:point.x, y:point.y, accuracy:data.coords.accuracy, longitude:convert[0], latitude:convert[1]}, Date.now(), {city:addressDetail.city, district:addressDetail.district, street:addressDetail.street, cityCode:addressDetail.city_code ||1});
			gEvent.trigger("nativesuccess",{position:adInfo});
		}
		get(url, callback);
	}
	nativeGeo.prototype.getRgcUrl = function(data){
		var x = data.coords.longitude, y = data.coords.latitude;
		return "http://api.map.baidu.com/?qt=rgc&x=" + x + "&y=" + y + "&dis_poi=100&poi_num=10&ie=utf-8&oue=1&res=api"
	}
	var native_geo = new nativeGeo();
	//cookie获取位置信息
	function cookieGeo(){
		this._config = {
			domain: ".anjuke.com",
			path: "/",
			webCookieKey: "H_LOC_WEB",
			nativeCookieKey: "H_LOC_NAT",
			expires: 30 * 60 * 1000
		};
		this._isShareLocSuc = false;
	}
	cookieGeo.prototype._getCookie = function(str){
		if(!str || !(str == 'web' || str == 'native')) return;
		var key = str === "web" ? this._config.webCookieKey : this._config.nativeCookieKey;
		var cookies = getCookie(key);
		if(!cookies) return;
		var jsonObj = JSON.parse(cookies);
        if (cookies && jsonObj) {
            if (jsonObj.crd) {
                var arr = jsonObj.crd.split("_");
                if (arr.length > 4) {
                    jsonObj.crd = {x: arr[0],y: arr[1],longitude: arr[2],latitude: arr[3],r: arr[4]};
                }
            }
            return jsonObj;
        }
	}
	cookieGeo.prototype.setPosition = function(second){
		var str = JSON.stringify(second);
        setCookie(this._config.webCookieKey, str, {domain: this._config.domain,path: this._config.path,expires: this._config.expires});
	}
	cookieGeo.prototype.getPosition = function(second){
		var cookie, geo;
		this._minutes = parseInt(second);
		cookie = this._getCookie("native") || this._getCookie("web") || false;
		if(cookie != false){
			geo = this.getPreciseLoc(cookie);
		}else{
			gEvent.trigger("cookiefail",{error:{minutes:second}});
		}
	}
	cookieGeo.prototype.getPreciseLoc = function(data){
		var time = Date.now() - 1000 * 60 * this._minutes;
		var pos = this._getPositionObj(data);
		if(pos.coords.x && (pos.timestamp > time)) gEvent.trigger("cookiesuccess",{position:pos});
		else gEvent.trigger("cookiefail",error{minutes: this._minutes});
	}
	cookieGeo.prototype._getPositionObj = function(data){
		var coords = data.crd;
            if (!coords) {
                return
            }
            var addInfo = new addressInfo({x: coords.x,y: coords.y,accuracy: coords.r,longitude: coords.longitude,latitude: coords.latitude}, parseInt(data.t), {city: data.city,district: data.district,street: data.street,cityCode: data.cc});
            return addInfo;
	}
	var cookie_geo = new cookieGeo();
	//html5定位
	function htmlGeo() {
    }
    htmlGeo.prototype.getPosition = function(opts) {
        if (!navigator.geolocation) {
            gEvent.trigger("html5fail", {error: {code: 4}});
            return;
        }
        var temp = {};
        opts = opts || {};
        if (opts.timeout != Math.Infinity) {
            temp.timeout = opts.timeout;
        }
        temp.enableHighAccuracy = opts.enableHighAccuracy;
        temp.maximumAge = opts.maximumAge;
        var obj = this;
        navigator.geolocation.getCurrentPosition(function(data) {
            gEvent.trigger("html5success", {position: data})
        }, function(data) {
            gEvent.trigger("html5fail", {error: data});
        }, temp);
    };
    var html_geo = new htmlGeo();

    //混合合并参数属性
	function mix(def,act){
		act = act ||{};
		for(var i in act){
			def[i] = act[i];	
		}
		return def;
	}
	//获取cookie
	function getCookie(key){
		var isVaildKey = (new RegExp('^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24')).test(key), str = null;
		if(isVaildKey){
			var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"), result = reg.exec(document.cookie);
			if(result) str = result[2] || null;
		}
		if("string" == typeof str) return decodeURIComponent(str);
		return null;
	}
	//设置cookie
	function setCookie(key,str,options){
		writeCookie(key, encodeURIComponent(str), options);
	}
	//写入cookie方法
	function writeCookie(key, strings, options) {
        var isReady = (new RegExp('^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24')).test(key);
        if (!isReady) return;
        options = options || {};
        var time = options.expires;
        if ("number" == typeof options.expires) {
            time = new Date();
            time.setTime(time.getTime() + options.expires);
        }
        document.cookie = key + "=" + strings + (options.path ? "; path=" + options.path : "") + (time ? "; expires=" + time.toGMTString() : "") + (options.domain ? "; domain=" + options.domain : "") + (options.secure ? "; secure" : "");
    }
    //转换坐标
    function changePos(data) {
        var addComponent = data.addressComponent, address = data.address;
        x = data.coords.x, y = data.coords.y;
        var convert = Convert.pixelToLngLat(x, y, 18);
        return {crd: x + "_" + y + "_" + convert[0] + "_" + convert[1] + "_" + (data.coords && data.coords.accuracy),cc: addressComponent.cityCode,addr: address,tp: "gl",city: addComponent.city,district: addComponent.district,street: addComponent.street,t: data.timestamp};
    }
	//get请求
	function get(url, fun) {
        var script = document.createElement("script");
        var rand = Math.floor(Math.random() * 10000);
        var value = "_cbk" + rand;
        window[value] = function(C) {
            fun(C);
        };
        if (url.indexOf("callback=") == -1) {
            callbackParam = "&callback=" + value;
            if (url.indexOf("=") == -1) {
                callbackParam = callbackParam.slice(1)
            }
            url = url + callbackParam
        }
        script.src = url;
        script.addEventListener("load", function(D) {
            var C = D.target;
            C.parentNode.removeChild(C);
            delete window[value]
        }, false);
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    //坐标转换地址信息
    function latlngInfo(lat, lng) {
        get("http://loc.map.baidu.com/wloc?x=" + lng + "&y=" + lat + "&r=41&prod=geoapi&addr=city|district|street|city_code&fn=_callback&t=" + (new Date).getTime());
    }
    window.touchWeb = window.touchWeb || {};
    window.touchWeb._callback = function(data) {
        gEvent.trigger("addresssuccess", {result: data});
    };
    //位置信息
    function addressInfo(coords, time, address){
    	this.coords = coords;
    	if(coords.x) coords.x = parseFloat(coords.x);
    	if(coords.y) coords.y = parseFloat(coords.y);
    	this.timestamp = time;
    	this.addressComponent = address || {city: "",district: "",street: ""};
    	this.address = this.addressComponent.city + this.addressComponent.district + this.addressComponent.street;
    }
    //trackEvent
    function trackEvent(page, customparam){
        if (document.getElementsByTagName( "head" )[0].getAttribute('data-flow')=="new") {
            if (!customparam) {
                var params = {};
            } else {
                var params = eval("("+customparam+")");
            }
            params["new"] = "1";
            customparam = JSON.stringify(params);
        }
        J.logger.trackEvent({site : 'm_anjuke-npv', page : page, customparam : customparam});
    }
	//事件发射和接收
	function geoEvent(){
		this._handlers = {};
	}
	geoEvent.prototype.on = function(name, fun){
		if(!this._handlers[name]){
			this._handlers[name] = [];
			this._handlers[name].push(fun);
		}
	}
	geoEvent.prototype.trigger = function(name,fun){
		if(!this._handlers[name]) return;	
		for(var i=1;i<this._handlers[name].length;i++){
			this._handlers[name][i](fun);
		}		
	}
	var gEvent = new geoEvent();

	function mapConvert(){
		var h = 6370996.81;
	    var j = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0];
	    var i = [75, 60, 45, 30, 15, 0];
	    var n = [[1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2], [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86], [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37], [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06], [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4], [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]];
	    var k = [[-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5], [0.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5], [0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5], [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5], [-0.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5], [-0.0003218135878613132, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]];
		//坐标转换
		function pixelToLngLat(x, y, power){
			return searchArray([x / Math.pow(2, power - 18), y / Math.pow(2, power - 18)])；
		}
		function lngLatToPixel(x, y, power) {
	        var tempArray = inverseArrary([x, y]);
	        var x = tempArray[0] * Math.pow(2, r - 18);
	        var y = tempArray[1] * Math.pow(2, r - 18);
	        return [Math.ceil(x), Math.ceil(y)];
	    }
	    //反转换坐标
	    function inverseArrary(arr){
	    	var newArr, kArr;
	    	arr[0] = limitX(arr[0], -180, 180);
	        arr[1] = limitY(arr[1], -74, 74);
	        newArr = arr.slice(0);
	        for (var q = 0; q < i.length; q++) {
	            if (newArr[1] >= i[q]) {
	                kArr = k[q];
	                break;
	            }
	        }
	        if (!kArr) {
	            for (var q = i.length - 1; q >= 0; q--) {
	                if (newArr[1] <= -i[q]) {
	                    kArr = k[q];
	                    break;
	                }
	            }
	        }
	        var tempArray = changeValue(arr, kArr);
	        var arr = [tempArray[0].toFixed(2), tempArray[1].toFixed(2)];
	        return arr;
	    }
		//查找对应替换数组
		function searchArray(arr){
			var coords,nArr;
			coords = [Math.abs(arr[0]), Math.abs(arr[1])];
			for(var r = 0; r<j.length; r++){
				if(coords[1] >= j[r]){
					nArr = n[r];
					break;
				}
			}
			var tempArray = changeValue(arr, nArr);
			var arr = [tempArray[0].toFixed(6),tempArray[1].toFixed(6)];
			return arr;
		}
		//替换X，Y值
		function changeValue(arr, nArr){
			if(!arr || !nArr) return;
			var pointX = nArr[0] + nArr[1] * Math.abs(arr[0]);
			var y = Math.abs(arr[1] / nArr[9]);
			var pointY = nArr[2] + nArr[3] * y + nArr[4] * y * y + nArr[5] * y * y * y + nArr[6] * y * y * y * y + nArr[7] * y * y * y * y * y + nArr[8] * y * y * y * y * y * y;
			pointX *= (arr[0] < 0 ? -1 : 1);
	        pointY *= (arr[1] < 0 ? -1 : 1);
			return [pointX, pointY];
		}
		//X值限定
		function limitX(x, min, max) {
	        while (x > max) {
	            x -= max - min;
	        }
	        while (x < min) {
	            x += max - min;
	        }
	        return x;
	    }
	    //Y值限定
	    function limitY(y, min, max){
	    	if (min != null) y = Math.max(y, min);
	        if (max != null) y = Math.min(y, max);
	        return y;
	    }
		return {
			pixelToLngLat: pixelToLngLat,
			lngLatToPixel: lngLatToPixel
		}
	}
	var Convert = new mapConvert();

	J.ui.geolocate = Geolocation;
})(J);