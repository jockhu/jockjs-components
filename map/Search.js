;
(function (context) {
    function Search(opts) {
        var defOpts = {
                KWUrl:'http://shanghai.release.lunjiang.dev.anjuke.com/ajax/geomap/',
                map:null,
                callback:{}
            }, opts, map, callback, progress, list, ret = {
                resetHandler:function () {
                }
            }, currentOverlays, charCode = 65,
            data = {
                model:2,
                commid:''

            },
            KW='';//当前搜索的关键字
        (function () {
            opts = J.mix(defOpts, opts || {})
            callback = opts.callback;
            map = opts.map;
            progress = opts.progress;
            list = document.getElementById("p_list");
            J.g("statusSearch").on('click',function(){
                J.g(this).hide();
                clickTipHandler();
            });
            J.g("fresh_list").on('click',function(e){
                J.g(e.target).hasClass('btn')&&clickTipHandler();
            })

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
            this.landMask=[];
            if(!data.length){
                progress.showSearchTip();
                ret.resetHandler();
                return;
            }
            progress.setLock(true)
            ret.resetHandler = function () {
            };
            //给 build item 加上ａ,ｂ,ｃ,ｄ
            var charCode = 65;
            var handler, tmp;
            var _getZoneData = ListCenter.getZoneData;
            var _getRankData = ListCenter.getRankData;
            var _getNextPageData = ListCenter.getNextPageData;
            var _listItemClick = ListCenter.listItemClick;
            ListCenter.getZoneData = function () {
            };
            ListCenter.getRankData = function () {
            }
            ListCenter.getNextPageData = function () {
            };
            ListCenter.listItemClick = baiduListItemClick;
            setTimeout(function () {
                ret.resetHandler = function () {
                    J.g("listPager").hide();
                    progress.setLock(false)
                    ListCenter.getZoneData = _getZoneData;
                    ListCenter.getRankData = _getRankData
                    ListCenter.getNextPageData = _getNextPageData;
                    ListCenter.listItemClick = _listItemClick;
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
            map.getZoom()>12?ListCenter.getZoneData():ListCenter.getRankData();
            J.g("propBarLeft").removeClass('propBarLeft ').show();
            ListCenter.resetHandler();
            progress.hide();
        }


        function updateListeHtml(data) {
            var key = 'commid'
            var frag = document.createDocumentFragment();
            var uid = 65;
            J.each(data, function (k, t) {
                if(!t.propCount)return;
                t.onItemBuild = searchItemBuild;
                var tmp = document.createElement("li");
                strChar = String.fromCharCode(uid++);
                tmp.className = "land";
                tmp.setAttribute("data-code", t[key]);
                var str = '<a onclick="return false;" href="' + t['prop_url'] + '" class="tip" title="' + t['img_title'] + '" alt="' + t['img_title'] + '" target="_blank">' + strChar + '</a>' + '<div class="t">' + t['commname'] + '</div>' + '<div class="addr">' + t['address'] + '</div>' + '<a class="view" href="###">查看附近房源</a><span class="line"></span>';
                tmp.innerHTML = str;
                tmp.setAttribute("data-id", t[key]);
                frag.appendChild(tmp);
            });
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
            progress.setLock(true)
            ret.resetHandler = function () {
            };
            //给 build item 加上ａ,ｂ,ｃ,ｄ
            var charCode = 65;
            var handler, tmp;
            updateStatusHtml(data.propNum);
            var _getZoneData = ListCenter.getZoneData;
            var _getRankData = ListCenter.getRankData;
            var _getNextPageData = ListCenter.getNextPageData;
            var _listItemClick = ListCenter.listItemClick;
            ListCenter.getZoneData = function () {
            };
            ListCenter.getRankData = function () {
            }
            ListCenter.getNextPageData = function () {
            };
            ListCenter.listItemClick = listItemClick
            setTimeout(function () {
                ret.resetHandler = function () {
                    J.g("listPager").hide();
                    progress.setLock(false)
                    ListCenter.getZoneData = _getZoneData;
                    ListCenter.getRankData = _getRankData
                    ListCenter.getNextPageData = _getNextPageData;
                    ListCenter.listItemClick = _listItemClick;
                }
            }, 500)

           /* if(map.getZoom()>12){

                ListCenter.addResultHandler(function(data){

                });d
            }*/
            map.setViewport(getViewPort(data.comms));
            list.innerHTML = '';
            updateListeHtml(data.comms);
            if (map.getZoom() > 12) {
               // map.clearCache();
                J.each(data.comms,function(k,v){
                    v.onItemBuild = searchItemBuild;
                });
                map.opts.onItemBuild = ListCenter.onCommItemBuild;
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
            ListCenter.getCommData(target.p.commid, target.p.commname);
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
            console.log(item)
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

        function baiduListItemClick(elm, e) {
            var code = elm.attr("data-code");
            if(elm.hasClass("landHover")){
              /*  J.each(this.landMask,function(k,v){v.removeOverlay()})*/
                var p = {
                    lng:elm.attr('lng'),
                    lat:elm.attr('lat'),
                    className:'areaMarkerMain',
                    x:-18,
                    y:-59,
                    html:'<div><p>'+elm.s(".t").eq(0).html()+'</p><i class="areaMarker"></i></div>'
                }
                map.setCenter(p.lng, p.lat,16);
                map.addOverlay(p,'zoneMarker');
                return;
            }
            this.preClickedItem && this.preClickedItem.removeClass("landHover");
            elm.addClass("landHover");
            toggleMask(code + "_" + map.getZoom());
            this.preClickedItem = elm;
        }


        function listItemClick(elm, e) {
            var code = elm.attr("data-code");
            if(elm.hasClass("landHover")){
                getCommData(code, elm.s('.t').eq(0).html());
                return;
            }
            this.preClickedItem && this.preClickedItem.removeClass("landHover");
            elm.addClass("landHover");
            toggleComm(code + "_" + map.getZoom());
            this.preClickedItem = elm;
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
                ret.resetHandler();
                map.clearOverlays();
                J.g("searchPrompt").hide();
                KW = J.g("p_search_input").val();
                J.get({
                    type:'jsonp',
                    url:opts.KWUrl,
                    data:{
                        kw:KW
                    },
                    callback:'J.map.search.callback'
                })
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


