;
(function (context) {
    function Search(opts) {
        var defOpts = {
               KWUrl:J.g("p_filter_result").attr("data-searchurl"),
                map:null,
                callback:{}
            }, opts, map, callback, progress, list, ret = {
                resetHandler:function () {
                },
                reset:clickTipHandler
            }, currentOverlays, charCode = 65,
            data = {
                model:2,
                commid:''

            },
            _proListCenter= J.mix({},ListCenter),
            me= this,
            KW='';//当前搜索的关键字

        (function () {
            opts = J.mix(defOpts, opts || {})
            callback = opts.callback;
            map = opts.map;
            progress = opts.progress;
            list = document.getElementById("p_list");
            //清除条件事件
            J.g("statusSearch").on('click',function(){
                J.g(this).hide();
                clickTipHandler();
            });
            J.g("fresh_list").on('click',function(e){
                J.g(e.target).hasClass('btn')&&clickTipHandler();
            })


            J.g(document,'touchend',function(){
                J.g("searchPrompt").hide();
            });
            setAutocomplete();
            rollback();
            J.map.search.callback = onResultKW;
        })();


        /**
         * 获取单个小区
         */
        function getCommData(commid, commName) {
            ret.resetHandler();
            J.get({
                url:'/newmap/search2',
                data:{
                    commid:commid,
                    model:2
                },
                type:'json',
                timeout:20000,
                onSuccess:onResultCommData
            });
        }

        function onResultCommData(data) {
            var singleComm = data;
            var com = singleComm.comms[0];
            map.setCenter(com.lng, com.lat, 17);//居中显示,居中显示和会去取区域数据。
            ListCenter.addResultHandler(function (data) {
                data.comms.unshift(singleComm.comms[0]);
                setTimeout(function () {
                    var cur = map.getCurrentOverlays();
                    cur[com.commid + '_' + 17] && cur[com.commid + '_' + 17].onClick();
                }, 100)
                data.props.list = singleComm.props.list;
                return data;
            })
        }


        function getMultiCommData(commName) {
            var params = {
                model:3,
                kw:commName
            }
            J.get({
                url:'/newmap/search2',
                data:params,
                type:'json',
                timeout:20000,
                onSuccess:onResultMultiCommData
            });

        }

        function getLankMask(data) {
            ret.resetHandler();
            this.landMask=[];
            if(!data.length){
                progress.showSearchTip();
                ret.resetHandler();
                return;
            }
            progress.setLock(true)
            //给 build item 加上ａ,ｂ,ｃ,ｄ
            charCode = 65;
            var handler, tmp;
            var _getZoneData = ListCenter.getZoneData;
            var _getRankData = ListCenter.getRankData;
            var _getNextPageData = ListCenter.getNextPageData;
            ListCenter.getZoneData = function () {};
            ListCenter.getRankData = function () {};
            ListCenter.getNextPageData = function () {};
            setTimeout(function () {
                ret.resetHandler = function () {
                    J.g("listPager").hide();
                    progress.setLock(false)
                    ListCenter.getZoneData = _getZoneData;
                    ListCenter.getRankData = _getRankData
                    ListCenter.getNextPageData = _getNextPageData;
                    ret.resetHandler=function(){};
                }
            }, 500)
            map.setViewport(getViewPort(data));
            list.innerHTML = '';
            updateBaiduListeHtml(data);
            this.landMask = map.addOverLays(data);
            map.clearCache();
            if (map.getZoom() > 12) {
                map.opts.onItemBuild = ListCenter.onCommItemBuild;
                map.opts.onResult = function (data) {
                    return data.comms;
                }
                map.getData();
            }
            charCode=65;
        }

        function onResultMultiCommData(data) {
            if (data.comms.length == 0) {
                map.localSearch(KW, this, getLankMask)
                return;
            }
            if (data.comms.length == 1) {
                onResultCommData(data);
                return;
            }
            onBuildMultiCommData(data);

        }

        /**
         * 清空条件重新查找事件
         */
        function clickTipHandler(){
            ret.resetHandler();
            J.g("p_search_input").val('');
            map.removeCurrentOverlays();
            map.getZoom()>12?ListCenter.getZoneData():ListCenter.getRankData();
            J.g("propBarLeft").removeClass('propBarLeft ').show();
            ListCenter.resetHandler();
            progress.hide();

        }


        function updateListeHtml(data) {
            var key = 'commid'
            var frag = document.createDocumentFragment();
            charCode =65;;
            J.each(data, function (k, t) {
                if(!t.propCount)return;
                t.onItemBuild = searchItemBuild;
                t.onClick = listItemClick;
                var tmp = document.createElement("li");
                strChar = String.fromCharCode(charCode++);
                tmp.className = "land";
                tmp.setAttribute("data-code", t[key]);
                var str = '<a onclick="return false;" href="' + t['prop_url'] + '" class="tip" title="' + t['img_title'] + '" alt="' + t['img_title'] + '" target="_blank">' + strChar + '</a>' + '<div class="t">' + t['commname'] + '</div>' + '<div class="addr">' + t['address'] + '</div>' + '<a class="view" href="###">查看附近房源</a><span class="line"></span>';
                tmp.innerHTML = str;
                tmp.onclick = listItemClick;
                tmp.setAttribute("data-id", t[key]);
                frag.appendChild(tmp);
            });
            charCode=65;
            list.appendChild(frag);
        }


        function updateBaiduListeHtml(data) {
            var frag = document.createDocumentFragment(),
             charCode = 65, key = 'commid',code=0;
            J.each(data, function (k, t) {
                t[key] = code++;
                t.onItemBuild = baiduAddressItemBuild;
                var tmp = document.createElement("li");
                tmp.className = "land";
                tmp.setAttribute('lng', t.point.lng);
                tmp.setAttribute('lat', t.point.lat);
                tmp.setAttribute("data-code", t[key]);
                var str = '<a onclick="return false;" href="' + '###' + '" class="tip" title="' + t['title'] + '" alt="' + t['title'] + '" target="_blank">' + String.fromCharCode(charCode++) + '</a>' + '<div class="t">' + t['title'] + '</div><div class="addr">' + t['address'] + '</div><a class="view" href="###">查看附近房源</a>'  + '<span class="line"></span>';
                tmp.innerHTML = str;
                tmp.onclick = baiduListItemClick;
                tmp.setAttribute("data-id", t[key]);
                frag.appendChild(tmp);
            });
            charCode=65;
            list.appendChild(frag);
        }

        /**
         * 生成地标
         * @param data
         */
        function onBuildMultiCommData(data) {
            var _ListCenter = ListCenter;
            charCode = 65;

            ListCenter = {
                data:{},
                getZoneData : function () {},
                getRankData : function () {},
                getNextPageData : function (){},
                nextPageEvent:function(){}
            }
            progress.setLock(true)
            ret.resetHandler = function () {
            };
            //给 build item 加上ａ,ｂ,ｃ,ｄ
            var handler, tmp;
            updateStatusHtml(data.propNum);
            map.setViewport(getViewPort(data.comms));
            setTimeout(function () {
                ret.resetHandler = function () {
                    J.g("listPager").hide();
                    progress.setLock(false)
                    ListCenter=_ListCenter;
                    ret.resetHandler=function(){};

                }
            }, 500);
            list.innerHTML = '';
            updateListeHtml(data.comms);
            if (map.getZoom() > 12) {
               // map.clearCache();
                J.each(data.comms,function(k,v){
                    v.onItemBuild = searchItemBuild;
                });
                map.opts.onItemBuild = _ListCenter.onCommItemBuild;
                map.opts.onResult = function (ret) {
                    J.each(data.comms,function(k,v){
                       ret.comms.push(v);
                    });
                    //var merge = ret.comms.concat(data.comms);
                    return ret.comms;
                }
                map.getData();
                return;
            }
            charCode=65;
           map.addOverLays(data.comms);
        }

        //高亮显示小区
        function toggleComm(key) {
            var i, t;
            currentOverlays = map.getCurrentOverlays();
            for (i in currentOverlays) {
                t = currentOverlays[i];
                var dom = t._div.first();
                dom.addClass('f60bg')
                t.key == key ? (t.onMouseOver(),dom.addClass('buble')) : (t.onMouseOut(),dom.removeClass("f60bg"), dom.removeClass("buble"))
            }
        }


        //高亮显示小区
        function toggleMask(key) {
            var i, t;
            currentOverlays = this.landMask;
            for (i in currentOverlays) {
                t = currentOverlays[i];
                var dom = t._div.first();
                t.key == key ? (t.onMouseOver(),dom.addClass('buble')) :dom.removeClass("buble");
            }
        }

        function overlayClick() {
            var target = this;
                //已经点击过一次的
            _proListCenter.getCommData(target.p.commid, target.p.commname);
            ListCenter = J.mix({},_proListCenter);
            toggleComm(target.key)
            return false;
        }

        function landMaskClick(){
            ret.resetHandler();
            var data = this.p;
            var p = {
                lng:data.lng,
                lat:data.lat,
                className:'areaMarkerMain',
                x:-18,
                y:-59,
                html:'<div><p>'+data.title+'</p><i class="areaMarker"></i></div>'
            }
            map.setCenter(p.lng, p.lat,16);
            map.addOverlay(p,'zoneMarker');
            return false;
        }

        function landMaskMouseOver(){
            this._div.first().addClass('buble');
            return false;
        }
        function landMaskMouseOut(){
            this._div.first().removeClass('buble');
            return false;
        }


        function searchItemBuild(item) {
            var tmp = item.lng;
            item.x = -8;
            item.y = -45;
            item.zIndex = 1;
            item.key = item.commid + '_' + item.zoom;
            item.html = '<div class="OverlayB searchOverlay f60bg"><b>' + (item.propCount || 0) + '套｜</b>' + item.commname + '<span class="tip"></span><span class="char">' + String.fromCharCode(charCode++) + '</span></div>';
            item.onClick = overlayClick
            return item;
        }

        function baiduAddressItemBuild(item) {
            var tmp = item.lng;
            item.x = 0;
            item.y = 0;
            item.zIndex = 1;
            item.lng=item.point.lng;
            item.lat=item.point.lat
            item.key = item.commid + '_' + item.zoom;
            item.className='landMask',
            item.html = '<div><p class="">'+item.title+'</p><i class="tip">'+String.fromCharCode(charCode++)+'</i></div>';
            item.onClick = landMaskClick;
            item.onMouseOver = landMaskMouseOver;
            item.onMouseOut = landMaskMouseOut;


            return item;
        }

        function baiduListItemClick( e) {
            e.stopPropagation();
            var elm = J.g(this);
            var code = elm.attr("data-code");
            if(elm.hasClass("landHover")){
                var p = {
                    lng:elm.attr('lng'),
                    lat:elm.attr('lat'),
                    className:'areaMarkerMain',
                    x:-18,
                    y:-59,
                    html:'<div><p>'+elm.s(".t").eq(0).html()+'</p><i class="areaMarker"></i></div>'
                }
                ret.resetHandler();
                console.log(ListCenter,123)
                map.setCenter(p.lng, p.lat,16);
                map.addOverlay(p,'zoneMarker');
                return;
            }
            me.preClickedItem && me.preClickedItem.removeClass("landHover");
            elm.addClass("landHover");
            toggleMask(code + "_" + map.getZoom());
            me.preClickedItem = elm;
        }


        function listItemClick(e) {
            e.stopPropagation();
            var elm = J.g(this);
            var code = elm.attr("data-code");
            if(elm.hasClass("landHover")){
                getCommData(code, elm.s('.t').eq(0).html());
                return;
            }
            me.preClickedItem && me.preClickedItem.removeClass("landHover");
            elm.addClass("landHover");
            toggleComm(code + "_" + map.getZoom());
            me.preClickedItem = elm;
            return false;
        }


        function onResultBlock(data) {
            data = data[0];
            map.setCenter(data.lng, data.lat, data.zoom)
            var p = {
                lng:data.lng,
                lat:data.lat,
                className:'areaMarkerMain',
                x:-18,
                y:-46,
                html:'<div><p>' + data.name + '</p><i class="areaMarker"></i></div>'
            }
            map.addOverlay(p, 'zoneMarker');
        }


        function onResultKW(data) {
            switch (data.matchType) {
                case 0:
                    //搜地标
                    /*   this.data.p =1;
                     this.data.kw=data.kw;
                     this.model = 3;*/
                    getMultiCommData(data.kw);
                    break;
                case 1:
                    getCommData(data.comm.commId, data.comm.commName)
                    break;
                case 2:
                    break;
                //community multi
                case 3:
                    //
                    onResultBlock(data.region);
                    break;
                //single block
                case 4:
                    onResultBlock(data.region);
                //single area

            }
        }



        function setAutocomplete() {
            var auto = {
                onSelect:function (data) {
                    ret.resetHandler();
                    getCommData(data.id, data.name, false);
                    map.removeCurrentOverlays();
                    progress.hide();
                    return false;
                },
                onSource:function (params, response) {
                    var def = {
                        q:params.kw,
                        cid:params.c,
                        limit:10,
                        padmap:1
                    }
                    J.get({
                        timeout:20000,
                        type:'json',
                        url:'/ajax/newautocomplete/',
                        data:def,
                        onSuccess:function (data) {
                            response(data);
                        }
                    })
                },
                onItemBuild:function (item) {
                    var number = item.k + '<i>约' + item.num + '套</i>';
                    return {
                        l:number,
                        v:item.k
                    }
                }
            }
            window.header.onSelect = auto.onSelect;
            window.header.onSource = auto.onSource;
            window.header.onItemBuild = auto.onItemBuild;
            J.g("searchForm").get().onsubmit = function () {
                map.removeCurrentOverlays();
                ret.resetHandler();
                map.clearOverlays();
                J.g("searchPrompt").hide();
                KW = J.g("p_search_input").val();
                if(!KW){
                    ListCenter.getRankData();
                    return false;
                }
                J.get({
                    type:'jsonp',
                    url:opts.KWUrl,
                    data:{
                        kw:KW
                    },
                    callback:'J.map.search.callback'
                })
                progress.hide();
                J.g("p_search_input").get().blur();
                return false;
            }

            J.g("p_search_input").on('blur',function(){
                setTimeout(function(){J.g("searchPrompt").hide();},400)
            });
        }

        function updateStatusHtml(countNum) {

            var statusBar = J.g('propBarLeft');
            var statusSearchBar = J.g('statusSearch')
            var nextPage = J.g("listPager");
            nextPage.show();
            statusBar.hide();
            J.g("statusSearch").get().style.display = 'block';
            var tmp = statusSearchBar.s(".ret_num").eq(0);
            tmp.html(tmp.html().replace(/\d+/, countNum));
        }

        function getViewPort(data) {
            var points = [];
            J.each(data, function (k, v) {
                points.push(v.point||new BMap.Point(v.lng, v.lat));
            })
            return map.getViewport(points);
        }


        function rollback() {
            ListCenter.isLock = !ListCenter.isLock;
        }

        return ret;


    }

    context.search = Search;

})(J.map);


