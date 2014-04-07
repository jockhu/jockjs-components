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
        var dataCenter;
        var eventCenter;
        var viewCenter;

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
            //rollback();
            J.map.search.callback = onResultKW;
            dataCenter = new DataCenter(map);
            viewCenter = new ViewCenter();
            eventCenter = new EventCenter();
        })();

        function DataCenter(map){
            var map = map;
            var data={};
            var kw;
            /**
             * 获取单个小区
             */
            function getSingleData(commid) {
                data.commid = commid;
                data.model = 2;
                return getData(data)
            }

            function getZoneData(){
                var b=map.getBounds(),w=b.getSouthWest(),e=b.getNorthEast();
                var data = {
                    swlat:w.lat,
                    nelat:e.lat,
                    swlng:w.lng,
                    nelng:e.lng
                }
                var params = {
                    model:2,
                    p:1,
                    bounds:data.swlat + "," + data.nelat + "," + data.swlng + "," + data.nelng
                }
                return getData(params);

            }

            /**
             * demo dataCenter.getMoreCommData('a')
             * 获得多小区的接口
             * @param name
             * @return {*}
             */
            function getMoreCommData(name){
                var data = {
                    model:3,
                    kw:name
                }
                return getData(data);

            }

            /**
             * 获取二手房分词接口数据
             * @param name　关键字
             * @return {*}
             */
            function getKWData(name){
                kw = name;
               //这里跨域了
                return getData({
                    kw:name
                },opts.KWUrl)
             }

            /**
             * 从百地拉地标数据
             * 这个是异步的，没法同步
             */
            function getBaiduData(name,context,callback){
                map.localSearch(name, context||this, callback)
            }

            function getData(data,url){
                var ret;
                J.get({
                    async:false,
                    url:url||'/newmap/search2',
                    data:data,
                    type:'json',
                    timeout:20000,
                    onSuccess:function(data){ret = data}
                });
                return ret;
            }
            return {
                getSingleCommData:getSingleData,
                getMoreCommData:getMoreCommData,
                getKWData:getKWData,
                getBaiduData:getBaiduData,
                getZoneData:getZoneData
            }
        }


        function EventCenter(){
            /**
             *
             * @param params 可以为参数或数据对象
             */
            function onItemSelect(params){
                data = params.props&&params.comms ?params:dataCenter.getSingleCommData(params.id);
                var singleComm = data;
                var com = singleComm.comms[0];
                map.setCenter(com.lng, com.lat, 17);//居中显示,居中显示和会去取区域数据。
                ListCenter.addResultHandler(function (data) {
                    data.comms.unshift(singleComm.comms[0]);
                    setTimeout(function () {
                        var cur = map.getCurrentOverlays();
                        cur[com.commid + '_' + 17] && cur[com.commid + '_' + 17].onClick();
                        singleComm= null;
                        com = null;
                    }, 100)
                    data.props.list = singleComm.props.list;
                    return data;
                })
            }

            function onSubmit(name){
                var data = dataCenter.getKWData(name);
                switch (data.matchType) {
                    case 0:
                        //先搜多小区，再搜百度地标
                        　var ret = dataCenter.getMoreCommData(name);
                         switch (ret.commNum){
                             case 0:
                                data = dataCenter.getBaiduData(name);
                                break;
                             case 1:
                                onItemSelect(ret);
                                 break;
                             default:
                                 onBuildMultiCommData(ret);
                         }
                        break;
                    case 1:
                        onItemSelect(data.comm.commId)
                        break;
                    case 2:
                        break;
                    //community multi
                    case 3:
                        //
                        viewCenter.showLankMask(data.region);
                        break;
                    //single block
                    case 4:
                        viewCenter.showLankMask(data.region);
                }
            }

            function onClickListItem(){


            }

            function onClearCondition(){

            }
            return {
                onItemSelect:onItemSelect,
                onSubmit:onSubmit
            }
        }


        function ViewCenter(){
            var charCode = 65;
            function showMoreCommList(data) {
                list.innerHTML = '';
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
                    tmp.setAttribute('data-lng', t.lng);
                    tmp.setAttribute('data-lat', t.lat);
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


            function showLandMaskList(data) {
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

            function showLankMask(data) {
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

            function showNoResultTip(){
                progress.showSearchTip();
            }
            /**
             * 展示搜索结果状态
             */
            function showStatus(countNum) {
                var statusBar = J.g('propBarLeft');
                var statusSearchBar = J.g('statusSearch')
                var nextPage = J.g("listPager");
                nextPage.show();
                statusBar.hide();
                J.g("statusSearch").get().style.display = 'block';
                var tmp = statusSearchBar.s(".ret_num").eq(0);
                tmp.html(tmp.html().replace(/\d+/, countNum));
            }



            return {
                showLandMaskList:showLandMaskList,
                showMoreCommList:showMoreCommList,
                showNoResultTip:showNoResultTip,
                showStatus:showStatus,
                showLankMask:showLankMask
            }



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
            updateStatusHtml(data.length);
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
            map.clearOverlays();
            map.getZoom()>12?_proListCenter.getZoneData():_proListCenter.getRankData();
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
                tmp.setAttribute('data-lng', t.lng);
                tmp.setAttribute('data-lat', t.lat);
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
            map.setLock(true);
            progress.setLock(true)
            //给 build item 加上ａ,ｂ,ｃ,ｄ
            var handler, tmp;
            viewCenter.showStatus(data.commNum);
            viewCenter.showMoreCommList(data.comms);
            map.setViewport(getViewPort(data.comms));

            if (map.getZoom() > 12) {
                var  zoneData =dataCenter.getZoneData();
                 data.comms = data.comms.concat(zoneData.comms);
                ListCenter.opts.onItemBuild = ListCenter.onCommItemBuild;
            }
            charCode=65;
            progress.setLock(false)
            map.addOverLays(data.comms);
           // map.setLock(false);
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
                eventCenter.onItemSelect(code);
                return;
            }
            me.preClickedItem && me.preClickedItem.removeClass("landHover");
            elm.addClass("landHover");
            toggleComm(code + "_" + map.getZoom());
            me.preClickedItem = elm;
            return false;
        }





        function onResultKW(data) {
            switch (data.matchType) {
                case 0:
                    //搜地标
                    /*   this.data.p =1;
                     this.data.kw=data.kw;
                     this.model = 3;*/
                    getMultiCommData(data.kwFmt);
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
                    if(!data.id){
                        J.g("searchForm").get().onsubmit();
                        return false;
                    }
                    eventCenter.onItemSelect(data);
                    map.removeCurrentOverlays();
                    map.clearOverlays();
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
                map.clearOverlays();
                J.g("searchPrompt").hide();
                KW = J.g("p_search_input").val();
                if(!KW){
                    ListCenter.getRankData();
                    return false;
                }
                eventCenter.onSubmit(KW);
                J.g("p_search_input").get().blur();
                return false;
                }

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



        return ret;


    }

    context.search = Search;

})(J.map);


