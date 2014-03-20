;
(function (context) {
    function Search(option) {
        var defOpts = {
                KWUrl:'http://shanghai.release.lunjiang.dev.anjuke.com/ajax/geomap/',
                map:null
            }, opts, map, me = this, singleComm, preClickedItem, //上次所点击的overlay
            retSearchBar = J.g("statusSearch"), retStatusBar = J.g("propBarLeft"), autocomplete = {
                onSelect:function (data) {
                    me.getSearchCommData(data.id, data.name, false);
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
            };
        this.data={
            kw:'',
            p:1,
            model:3
        };
        J.map.search.callback = function (data) {
            me.onSearch(data);
        };
        (function () {
            opts = J.mix(defOpts, option || {});
            map = opts.map;
            //J.mix(window.header,autocomplete);
            window.header.onSelect = autocomplete.onSelect;
            window.header.onSource = autocomplete.onSource;
            window.header.onItemBuild = autocomplete.onItemBuild;
            J.g("searchForm").get().onsubmit = function () {
                J.g("searchPrompt").hide();
                var str = J.g("p_search_input").val();
                J.get({
                    type:'jsonp',
                    url:opts.KWUrl,
                    data:{
                        kw:str
                    },
                    callback:'J.map.search.callback'
                })
                return false;
            }
            this.nextPage = this.nextPage || J.g("nextPage");
            J.on(this.nextPage,'click', function(){
                me.getDataCommMulti(me.data);
            });
            retSearchBar.on('click',function(){
               me.getNextPageData();
            });
            J.on(document.body, 'click', function () {
                J.g("searchPrompt").hide();
            });

        })();


        this.getNextPageData = function(){
            ++this.data.p;
            this.getDataCommMulti();
        }



        /**
         * 搜索单小区处理逻辑
         * @param commid
         * @param commname
         * @param async
         */
        this.getSearchCommData = function (commid, commname, async) {
            var _onResultCommData = ListCenter.onResultCommData;
            var _onResultZoneData = ListCenter.onResultZoneData;
            var _getCommData = ListCenter.getCommData;
            ListCenter.onResultCommData = function (data, commname) {
                singleComm = data.comms[0];
                var singleData = data;
                ListCenter.onResultZoneData = function (data) {
                    ListCenter.getCommData = function () {
                    };
                    var comms = data.comms;
                    comms.unshift(singleComm);
                    singleData.comms = comms;
                    this.data.commids = data.props.commids;
                    this.container.html('');
                    J.g("p_filter_result").get().scrollTop = 0;
                    this.updateListHtml(singleData.props.list, 'community_id');
                    this.upDateStatusHtml(commname, singleData.propNum);

                    setTimeout(function () {
                        var cur = map.getCurrentOverlays();
                        cur[singleComm.commid + '_' + 17].onClick();
                        ListCenter.getCommData = _getCommData;
                    }, 10)


                    ListCenter.onResultZoneData = _onResultZoneData;
                    ListCenter.onResultCommData = _onResultCommData;
                    return singleData.comms;
                }
                map.setCenter(singleComm.lng, singleComm.lat, 17);//居中显示
            }
            console.log(this.data,'fuck')
            ListCenter.getCommData(commid, commname, false);
        }
        this.getContext = function () {
            return this;
        }


        //单小区处理结果
        this.onResultCommData = function (data, commname) {
            this._onResultCommData = this.onResultCommData;

            var comm = data.comms[0];
            if (!comm) return;
            ListCenter.getZoneData = this._getzoneData;
            map.setCenter(comm.lng, comm.lat, 17);

            var p = {
                lng:comm.lng,
                lat:comm.lat,
                className:'',
                x:-8,
                y:-45,
                html:'<div class="OverlayB"><b>' + comm.propCount + '套｜</b>' + comm.commname + '<span class="tip"></span></div>'
            }
            map.addOverlay(p, 'zoneMarker');
        }
        this.updateStatusHtml = function (countNum) {
            this.statusBar = this.statusBar || J.g('propBarLeft');
            this.statusSearchBar = this.statusSearchBar || J.g('statusSearch')
            this.nextPage = this.nextPage || J.g("listPager");
            this.nextPage.show();
            this.statusBar.hide();
            J.g("statusSearch").get().style.display = 'block';
            var tmp = this.statusSearchBar.s(".ret_num").eq(0);
            tmp.html(tmp.html().replace(/\d+/, countNum));
        }

        function getViewPort(data) {
            var points = [];
            J.each(data, function (k, v) {
                points.push(new BMap.Point(v.lat, v.lng));
            })
            return map.getViewport(points);
        }


        this.onSearch = function (data) {
            switch (data.matchType) {
                case 0:
                    //搜地标
                    this.data.p =1;
                    this.data.kw=data.kw;
                    this.model = 3;
                    this.getDataCommMulti(data.kw);
                    break;
                case 1:
                    this.data.p =1;
                    this.data.kw='';
                    this.model = 2;
                    var comm = data.comm[0];
                    this.getSearchCommData(comm.commId, comm.commName, false);
                    break;
                case 2:
                    break;
                //community multi
                case 3:
                    //
                    this.onResultBlock(data.region);
                    break;
                //single block
                case 4:
                    this.onResultBlock(data.region);
                //single area

            }
        }
        this.onResultArea = function (data) {
            map.setCenter(data.lng, data.lat, data.zoom)
        }
        this.onResultBlock = function (data) {
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
        //单小区处理逻辑
        this.onResultComm = function (commid, commname, async) {
            this._getzoneData = this.getZoneData;
            ListCenter.getZoneData = function () { };
            var params = {
                zoom:17,
                model:2,
                commid:commid,
                commids:'',
                p:1
            }
            var me = this;
            this.opts.onResult = this.onResultCommon(function (data) {
                me.onResultCommData.call(me, data, commname);
            });
            this.getDataCommon(params, false);
        }

        //多小区处理罗辑
        this.onResultCommMulti = function (data) {
            //给 build item 加上ａ,ｂ,ｃ,ｄ
            me.charCode = 65;
            var handler, tmp;
            this.updateStatusHtml(data.propNum);
            var viewPort = getViewPort(data.comms);
            if (viewPort.zoom > 12) {
                //多小区清除
                handler = ListCenter.getZoneData;
                ListCenter.getZoneData = function(){};
                map.setViewport(getViewPort(data.comms));
                ListCenter.getZoneData = handler;
                this._onResultZoneData = ListCenter.onResultZoneData;
                ListCenter.onResultZoneData =this.onResultCommon(function(data){
                    J.g("p_filter_result").get().scrollTop=0;
                    map.clearCache();
                    ListCenter.onResultZoneData = me._onResultZoneData;
                    return data.comms;
                });
                //ListCenter.getZoneData();//去拉取区域数据，但是不展示列表数据。
                setTimeout(function(){
                    handler.call(ListCenter)
                },1000);
            } else {
                handler = ListCenter.getRankData;
                ListCenter.getRankData = function(){};
                map.setViewport(getViewPort(data.comms));
                ListCenter.getRankData = handler;


            }
            this.container.html('');
            this.updateListHtml(data.comms, 'commid');
            var _listItemClick = ListCenter.listItemClick;
            //list item click 什么时候回去呢？
            ListCenter.listItemClick = function (elm, e) {
               var code = elm.attr("data-code");
                this.preClickedItem && this.preClickedItem.removeClass("landHover");
                elm.addClass("landHover");

                this.preClickedItem = elm;
                if (e.target.className == "view") {
                    ListCenter.getCommData(code, elm.s('.t').eq(0).html());
                }
                var currentOverlays = map.getCurrentOverlays();
            }

            return data.comms;

        }
        this.onResultLandMask = function (data) {

        }
        this.onResultLandMaskMulti = function () {

        }
        this.onResultNo = function () {

        }
        this.updateListHtml = function (data, key) {
            var frag = document.createDocumentFragment();
            var uid = 65, strChar;
            J.each(data, function (k, t) {
                var tmp = document.createElement("li");
                strChar = String.fromCharCode(uid++);
                tmp.className = "land";
                tmp.setAttribute("data-code", t[key]);
                var str = '<a onclick="return false;" href="' + t['prop_url'] + '" class="tip" title="' + t['img_title'] + '" alt="' + t['img_title'] + '" target="_blank">' + strChar + '</a>' + '<div class="t">' + t['commname'] + '</div>' + '<div class="addr">' + t['address'] + '</div>' + '<a class="view" href="###">查看附近房源</a>' + '<span class="line"></span>';
                tmp.innerHTML = str;
                tmp.setAttribute("data-id", t[key]);
                frag.appendChild(tmp);
            });
            this.container.get().appendChild(frag);
        }
        this.onSearchItemBuild = function (item) {
            //尼玛，搞返了
            var tmp = item.lng;
            item.x = -8;
            item.y = -45;
            item.zIndex=1;
            item.key = item.commid + '_' + item.zoom;
            item.html = '<div class="OverlayB searchOverlay f60bg"><b>' + (item.propCount || 0) + '套｜</b>' + item.commname + '<span class="tip"></span><span class="char">'+String.fromCharCode(me.charCode++)+'</span></div>';
            item.onClick = function () {
            }, item.lng = item.lat;
            item.lat = tmp;
            return item;
        }
        //多少区查找
        this.getDataCommMulti = function (commName) {
            this.data.kw = commName;
            this.data.model = 3;
            var self = this;
            this.opts.onResult = this.onResultCommon(function (data) {
                if (!data.comms.length) {
                    //搜多小区无结果时去搜地标
                    this.searchBaiduLandMask(commName);
                    return false;
                }
                //搜多多少区后的操作
                me.opts.onItemBuild = self.onSearchItemBuild;
                return self.onResultCommMulti.call(self,data);
            });
            this.getDataCommon(this.data, true);
        }

        //多小区查找
        this.searchBaiduLandMask = function (kw) {
            map.localSearch(kw, Search, function (data) {
                switch (data.length) {
                    case 0:
                        this.onResultNo();
                        break;
                    case 1:
                        this.onResultLandMask(data);
                        break;
                    default :
                        this.onResultLandMaskMulti(data);
                }
            });
        }
        this.resetHandler = function(){

        }



        return autocomplete;

    }
    Search.prototype = ListCenter;

    context.search = Search;

})(J.map);


