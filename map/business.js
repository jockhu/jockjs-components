/// require('map.BMap');


var region_list = [{"region_id":"7","region_title":"\u6d66\u4e1c","Lat":"31.220104873204","Lng":"121.56739336405","Zoom":"14","loupan_num":"194","pinyin":"pudong"},{"region_id":"11","region_title":"\u95f5\u884c","Lat":"31.106018744131","Lng":"121.41822295874","Zoom":"14","loupan_num":"80","pinyin":"minhang"},{"region_id":"5","region_title":"\u5f90\u6c47","Lat":"31.196676437131","Lng":"121.4437543905","Zoom":"15","loupan_num":"24","pinyin":"xuhui"},{"region_id":"10","region_title":"\u666e\u9640","Lat":"31.266299697239","Lng":"121.39182540631","Zoom":"14","loupan_num":"39","pinyin":"putuo"},{"region_id":"6","region_title":"\u957f\u5b81","Lat":"31.229564711888","Lng":"121.42576354928","Zoom":"15","loupan_num":"24","pinyin":"changning"},{"region_id":"2","region_title":"\u9759\u5b89","Lat":"31.235250560941","Lng":"121.45159075128","Zoom":"15","loupan_num":"36","pinyin":"jingan"},{"region_id":"4","region_title":"\u9ec4\u6d66","Lat":"31.240525263239","Lng":"121.49275087519","Zoom":"15","loupan_num":"24","pinyin":"huangpu"},{"region_id":"3","region_title":"\u5362\u6e7e","Lat":"31.222351697873","Lng":"121.47530065559","Zoom":"15","loupan_num":"35","pinyin":"luwan"},{"region_id":"8","region_title":"\u8679\u53e3","Lat":"31.277089161938","Lng":"121.48741240679","Zoom":"15","loupan_num":"16","pinyin":"hongkou"},{"region_id":"12","region_title":"\u95f8\u5317","Lat":"31.260460492547","Lng":"121.46805865041","Zoom":"15","loupan_num":"24","pinyin":"zhabei"},{"region_id":"9","region_title":"\u6768\u6d66","Lat":"31.303034311108","Lng":"121.5328626265","Zoom":"14","loupan_num":"64","pinyin":"yangpu"},{"region_id":"13","region_title":"\u5b9d\u5c71","Lat":"31.437966063416","Lng":"121.37939190034","Zoom":"13","loupan_num":"89","pinyin":"baoshan"},{"region_id":"15","region_title":"\u677e\u6c5f","Lat":"31.021169325894","Lng":"121.23847799745","Zoom":"14","loupan_num":"117","pinyin":"songjiang"},{"region_id":"14","region_title":"\u5609\u5b9a","Lat":"31.379175164422","Lng":"121.26875453082","Zoom":"15","loupan_num":"114","pinyin":"jiading"},{"region_id":"19","region_title":"\u9752\u6d66","Lat":"31.166161200505","Lng":"121.10322543744","Zoom":"12","loupan_num":"79","pinyin":"qingpu"},{"region_id":"17","region_title":"\u5949\u8d24","Lat":"30.918535413392","Lng":"121.46828953812","Zoom":"15","loupan_num":"55","pinyin":"fengxian"},{"region_id":"18","region_title":"\u91d1\u5c71","Lat":"30.717737422955","Lng":"121.35614918797","Zoom":"14","loupan_num":"57","pinyin":"jinshan"},{"region_id":"20","region_title":"\u5d07\u660e","Lat":"31.629856771949","Lng":"121.4085501731","Zoom":"14","loupan_num":"25","pinyin":"chongming"},{"region_id":"6128","region_title":"\u9646\u5bb6\u5634","Lat":"31.243215","Lng":"121.509232","Zoom":"14","loupan_num":"1","pinyin":"lujiazui"},{"region_id":"6129","region_title":"\u9646A","Lat":"31.242165","Lng":"121.510167","Zoom":"14","loupan_num":0,"pinyin":"lua"},{"region_id":"6130","region_title":"\u8f6f\u4ef6\u56ed","Lat":"31.22966","Lng":"121.539308","Zoom":"14","loupan_num":0,"pinyin":"ruanjianyuan"},{"region_id":"6131","region_title":"\u4e0a\u6d77\u5c0f\u53f7","Lat":"31.233334","Lng":"121.485158","Zoom":"14","loupan_num":0,"pinyin":"shanghaixiaohao"},{"region_id":"6132","region_title":"\u4e0a\u6d77\u5c0f\u53f7\u4e8c","Lat":"31.23142","Lng":"121.48717","Zoom":"14","loupan_num":0,"pinyin":"shanghaixiaohaoer"},{"region_id":"6135","region_title":"\u6d4b\u8bd5\u7248\u57574","Lat":"31.230308","Lng":"121.484295","Zoom":"14","loupan_num":0,"pinyin":"ceshibankuai4"},{"region_id":"6136","region_title":"\u6d4b\u8bd5\u7248\u575744","Lat":"31.230247","Lng":"121.483792","Zoom":"14","loupan_num":0,"pinyin":"\u6d4b\u8bd5\u7248\u575744"}];
var map_params = {"d":true,"elm":"jmap_fill","lat":"31.230246775887","lng":"121.48246298372","mark":0,"zoom":14,"ezoom":1,"minz":10,"maxz":18};
    map_params['top'] = parseInt(document.getElementById('header').offsetHeight);
    var h_height = (document.viewport.getHeight() - map_params['top'])+'px',
        width = (document.viewport.getWidth() - 382),
        w_width = (width > 468 ? width : 468) + 'px';
    $('map_page').setStyle({
        height:h_height,
        width:w_width
    });
    if(parseInt(width) <= 468){
        $('jmap_list').setStyle({
            left:468+'px',
            height:h_height
        });
    }else{
        $('jmap_list').setStyle({
            left:'auto',
            height:h_height
        });
    }
    $('i_shadow').setStyle({
        height:h_height
    });
    //console.log('height:',$('map_page').getStyle('height'),'height:height:',Jock.getHeight(),'top',map_params['top']);

    var jmap = function(){

    var M = new Jmap(map_params);
    var map=M.getMap(),info_panel=$('info_panel'), cityName = '上海';
    var i_shadow = $('i_shadow'), a_sort = $("a_sort");
    i_shadow.setStyle({
        'height': map.height + 'px'
    });

    Jock.extend(M,{
        LOUPANS:{},
        MarkerTimer:[],
        OFFSET:{
            TOP:134,
            RIGHT:480,
            BOTTOM:120,
            LEFT:0
        },
        DEF:{
            OFFSET:-41
        },

        status:null,

        clearMarkerTimer:function(){
            var mks = this.MarkerTimer, len = mks.length;
            for(var i=0;i<len;i++){
                if(mks[i]) clearTimeout(mks[i]); mks[i]=null;
            }
            this.MarkerTimer = [];
        },

        isRegionZoom:function(){
            return map.getZoom() <= 11;
        },

        //显示楼盘价格
        getInfoB: function(info){
            var barInfos = [];
            var price = info.lpPrice >= 10000 ? (info.lpPrice / 10000)+'万' : info.lpPrice == 0 ? '待定' : info.lpPrice+'元';
            var newPrice, re = /([0-9]+\.[0-9]{2})[0-9]*/;
            newPrice = price.replace(re,"$1");
            barInfos.push('<i class="i_B" style="float:left;white-space:nowrap;" title="'+info.lpName+'">'+newPrice+'</i>');
           return barInfos.join('');
        },

        //显示区域信息
        getInfoR: function(region_list){
            var info = region_list;
            var barInfos = [];
            barInfos.push('<div style="float:left;"><i class="i_R" style="float:left;white-space:nowrap;"> '+info.region_title+'  '+info.loupan_num+' </i></div>');
            return barInfos.join('');
            },

        //显示搜索结果
        getInfoS: function(info){
            var barInfos = [];
            barInfos.push('<div style=" white-space:nowrap; position:relative;"><span class="i_S_l" style="white-space:nowrap; display:inline-block;">'+info.keyword+'</span>');
            barInfos.push('<span class="i_S_r"></span></div>');

            //barInfos.push('<div class="s_bar"><span>'+info.keyword+'</span></div>');
            return barInfos.join('');
            },

        //显示楼盘详细
        getInfoD: function(info){
            var barInfos = [],
            pri = '<span>' + ((info.lpPrice!=null && info.lpPrice!=0) ? info.lpPrice +'</span>元/平米' : '待定');
            barInfos.push('<div class="m_pop">');
            barInfos.push('<div class="m_content">');
            barInfos.push(   '<a href="/loupan/'+ info.lpID +'.html?from=map_loupanlist" class="m_img" target="_blank"><img class="m_a_img" width="122" height="94" src="'+info.img+'" /></a>');
            barInfos.push(   '<dl class="m_box">');
            barInfos.push(   '    <dt class="dt_001"><b><a href="/loupan/'+ info.lpID +'.html?from=map_loupanlist" target="_blank" class="m_cname">'+info.lpName+'</a></b>');
            if(info.st==5){
            barInfos.push(   '<i class="icon_sw">&nbsp;</i>');
            }
        barInfos.push(   '</dt>');
    barInfos.push(   '    <dd class="dd_002">价格：'+pri+'</dd>');
    barInfos.push(   '    <dd class="dd_003">地址：<span>'+info.lpRegin+'&nbsp;&nbsp;'+info.lpAdd+'</span></dd>');
    if(info.lpTuan!=''){//判断是否有团购信息
        barInfos.push(   '<dd class="dd_006">团购：<span>'+ info.lpTuan +'</span></dd>');
        }
    //barInfos.push(   '    <dd class="dd_004"><i class="i_con i_type">'+ info.lpType +'</i><i class="i_con i_buil">'+ info.lpDeco +'</i></dd>');

    barInfos.push(   '    <dd class="dd_004">');
        if(info.lpType!='' && info.lpType!=null){
            barInfos.push(   '        <i class="i_con i_type">'+ info.lpType +'</i>');
            }
        if(info.lpDeco!=''&& info.lpDeco!=null){
            barInfos.push(   '        <i class="i_con i_buil">'+ info.lpDeco +'</i></dd>');
            }
        barInfos.push(   '    </dd><dd class="dd_005"><a href="/loupan/'+info.lpID +'.html?from=map_loupanlist" class="m_detail" target="_blank">查看详情&nbsp;&gt;&gt;</a></dd>');
    barInfos.push('</dl></div><div class="m_close" id="m_close"></div></div>');
return barInfos.join('');
},

// 根据当前可视区域，获取楼盘列表
getLoupanList:function(){

    var url = this.buildUrl();
    new Ajax.Request(url, {
        method: "get",
        onSuccess: function(transport) {
            if(this.isRegionZoom()) return;
            var jsonOverlays = transport.responseJSON, ids = (function(){
                var ids = [];
                for(i=0,l=jsonOverlays.length;i<l;i++){
                    ids.push(jsonOverlays[i].lpID);
                }
                return ids;
            })(),num = ids.length,str='';

            TT.clearTimers();
            if (num == 0) {
                if(this.status == 'region' || this.status == 'geo'){

                    TT.delayTimer(null, function(){
                        var zoom = parseInt(map.getZoom());
                        if(zoom > 12){
                            map.zoomOut();
                        }else if(zoom <= 12){
                            M.showTip(4, true)
                        }
                    },2000);

                }else{
                    this.showTip(0, true);
                }
                return;
            }else{
                this.showPanel('list_panel')
                info_panel.update('');
            }
            var overlays = M.getOverlays(M.overlaysType.overlay);
            $H(overlays).each(function(v){
                var key = v[0].toString();
                if(!Jock.inArray(key, ids)){
                    M.removeOverlay(M.overlaysType.overlay, key)
                }
            });
            for(i=0,n=0;i<num;i++){
                var r = jsonOverlays[i],key = parseInt(r.lpID);
                if(!overlays || !overlays[key]){
                    ~function(r, key){
                        setTimeout(function(){
                            M.showLoupanBar(r, key);
                        },n++*10);
                    }(r, key);
                }
            }
            this.status = null;
            this.showList(transport);
        }.bind(this)
    });
},

showLoupanBar:function(r, key, type, undefined){
    var self = this, p = {
        latlng:M.getLatLng({lat:r.lat,lng:r.lng})
    }, overlay;
    p.info = r;
    p.showInfo = true;
    p.className = 'OverlayB';
    p.classHover = 'OverlayHoverB';
    p.status = 'click';
    p.type = type;

    if(type && type === 'search'){
        p.barInfo = this.getInfoS(r);
        p.barOffset = {
            x : -28,
            y : -29
        };
    }else{
        p.barInfo = this.getInfoB(r);
        p.barOffset = {
            x : -27,
            y : -27
        };
    }

    if(type === 'search'){
        overlay = self.markerOverlayOnce(p, M.overlaysType.overlay, p.info.keyword, key)
    }else{
        overlay = M.addOverlay(M.clone(p), M.overlaysType.overlay, key);
        if(overlay){
            overlay.setOver = function(stopFire){
                if(!this._locked){
                    this._div.style.zIndex = 1;
                    if(this._CName && this._CHover){
                        this._div.className = this._CName+' '+this._CHover;
                    }
                    if(stopFire === undefined){
                        document.fire("map:overlayOver", {lpId:key});
                    }
                }
            }
            overlay.setOut = function(stopFire){
                if(!this._locked){
                    this._div.style.zIndex = type === 'search' ? 1:0;
                    if(this._CName){
                        this._div.className = this._CName;
                    }
                    if(stopFire === undefined){
                        document.fire("map:overlayOut", {lpId:key});
                    }
                }
            }
        }
    }
    return overlay;
},

// 此方法是系统调用
openOverlayWindow: function(p, openerOverlay){
    M.hideLoupanInfo('openOverlayWindow', M.lockBarCache);
    M.locKBar(openerOverlay, true);
    M.showLoupanInfo(p, openerOverlay);
    // 统计 overlay 打开事件
    M.trackerEvent(M.trackerType.overlay);
},

lockBarCache : null,

    locKBar:function(overlay, locked){
    var overlay = overlay || M.lockBarCache, locked = locked != undefined ? locked : false;
    //console.log('overlay',overlay, locked)
    if(overlay){
        if(locked) {
            overlay.setOver();
            M.lockBarCache = overlay;
            overlay.setLock(locked);
        }else {
            overlay.setLock(locked);
            overlay.setOut();
            M.lockBarCache = null;
        }
    }
},


showLoupanInfo:function(p, openerOverlay){
    var p = M.clone(p);
    var mp = M.getMap(), ox = oy = 0, ow = openerOverlay ? $(openerOverlay._div).getWidth() : 57;
    if(p.type == 'search'){
        ox = ow + -32;
        oy = -(86 + 18);
    }else{
        ox = ow + -27;
        oy = -(86 + 16);
    }

    p.barInfo = this.getInfoD(p.info);
    p.showInfo = false;
    p.className = 'loupan';
    p.classHover = '';
    p.barOffset = {
        x : ox,
        y : oy
    };

    M.removeOverlay('Loupan', 'Detail');
    M.addOverlay(p, 'Loupan', 'Detail');

    Event.observe($('m_close'), 'click', function(){
        M.hideLoupanInfo('openOverlayWindow', openerOverlay)
    });

    var WH = this.getMapWH(),
        position = M.pointToPixel(p.latlng),
        top = parseInt( position.y ),
        left = parseInt( position.x ),
        x = left, y = top;

    if(top < this.OFFSET.TOP){
        y = this.OFFSET.TOP;
    }else if(top > WH.height - this.OFFSET.BOTTOM){
        y = WH.height - this.OFFSET.BOTTOM;
    }

    if(left < this.OFFSET.LEFT){
        x = this.OFFSET.LEFT;
    }else if(left > WH.width - this.OFFSET.RIGHT){
        x = WH.width - this.OFFSET.RIGHT;
    }

    if(top != y || left != x){
        this.status = p.status === 'click' ? 'offseted' : 'search';
        setTimeout(function(){
            mp.panBy(x-left, y-top);
        },200);
    }
},

hideLoupanInfo : function(type, openerOverlay){
    //            console.log('hideLoupanInfo',type, 'this.status:', this.status)
    if(this.status == 'offseted' || this.status == 'search'){
        return;
    }
    if($('m_close')) $('m_close').stopObserving('click');
    M.locKBar(openerOverlay, false);
    M.removeOverlay('Loupan', 'Detail');
},

showRegionOverlays:function(){
    var self = this;
    var num = region_list.length;

    if (num == 0) {
        return;
    }
    for(i=0,n=0;i<num;i++){
        var r = region_list[i],
            p = {latlng:M.getLatLng({lat:r.Lat,lng:r.Lng})},
            key = 'region';

        p.r = r;
        p.barInfo = this.getInfoR(r);
        p.showInfo = false;
        p.className = 'OverlayB';
        p.classHover = 'OverlayHoverB';
        p.barOffset = {
            x : -48,
            y : -37
        };
        M.clearOverlays();
        (function(p,key){
            self.MarkerTimer.push(setTimeout(function(){
                var Mk = M.addOverlay(p, M.overlaysType.overlay);
                Jock.event.add(Mk._div,'click',function(){
                    map.panTo(p.latlng);
                    setTimeout(function(){
                        M.clearOverlays();
                        map.setZoom(parseInt(p.r.Zoom));
                    },800);
                });
            },n++*10));
        })(p,key);
    }
},


highLight:function(){
    var s = this;
    $$('.list_li').each(function(item){
        window.setTimeout(function() {
            var linkUrl = item.readAttribute('link');
            var lpId = item.readAttribute('lpid');
            if(!linkUrl) {return false;}

            var timer = null;
            var eventOverHandler = function(e){
                e.stopPropagation();
                e.stop();
                if(timer){
                    clearTimeout(timer);
                    timer = null;
                }else{
                    item.addClassName('actived');
                    document.fire("map:listItemOver", {lpId:lpId});
                }
            }.bind(this);
            var eventOutHandler = function(e){
                timer = setTimeout(function(){
                    item.removeClassName('actived');
                    document.fire("map:listItemOut", {lpId:lpId});
                    timer = null;
                },1);
            }.bind(this);

            Event.observe(item,'click',function(){
                s.redirect(linkUrl);
            });
            Event.observe(item,'mouseover',eventOverHandler);
            Event.observe(item,'mouseout',eventOutHandler);

            item.select('a').each (function (ele_a) {
                Event.observe(ele_a, 'click', function(ee) {
                    ee.stopPropagation();
                });
            });

        }.bind(this), 0);
    }.bind(this));

    document.observe("map:overlayOver", function(event) {
        var item = $('LP_'+event.memo.lpId);
        if(item) item.addClassName('actived');
    });
    document.observe("map:overlayOut", function(event) {
        var item = $('LP_'+event.memo.lpId);
        if(item) item.removeClassName('actived');
    });
},

redirect:function(url){
    if(!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1)){
        window.open(url,'_blank');
    }else{
        var a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
    }
},

LOUPANLIST:[],

    //显示右侧列表数据
/**
 * p 楼盘信息
 */
    showList: function(p) {
    var list = $('map_pan_list'), pan = p.responseJSON,
        map = M.getMap(),listing = $('listing');

    listing.setStyle({
        'height': map.height-40 + 'px'
    });
    $('search_status').update('找到 <i class="i_col" id="lp_count">'+pan.length+'</i> 个符合要求的楼盘');
    a_sort.removeClassName('sort_up');
    a_sort.removeClassName('sort_down');

    this.LOUPANLIST = pan;
    this.fullListHtml(pan, 'top');


},

fullListHtml:function(pan, top){
    var list = $('map_pan_list'), html=[], firstHtml = '', li_html, searchLpId = this.SearchOverlayCache && this.SearchOverlayCache.p && this.SearchOverlayCache.p.key ? this.SearchOverlayCache.p.key : 0;
    for(var i=0,len=pan.length;i<len;i++){
        var pri = '<i class="i_col">' + ((pan[i].lpPrice!=null && pan[i].lpPrice!=0) ? pan[i].lpPrice +'</i> 元/平米' : '<span style="color:#999; font-weight:normal; font-size:12px;">待定</span></i>');
        var actived_top = (searchLpId == pan[i].lpID && top) ? 'actived_top' : '';
        li_html = '<li class="list_li '+ actived_top +' fix" lpId="'+pan[i].lpID+'" id="LP_'+pan[i].lpID+'" link="/loupan/'+ pan[i].lpID +'.html?from=map_loupanlist">';
        li_html +='    <a class="a_img" href="/loupan/'+ pan[i].lpID +'.html?from=map_loupanlist" target="_blank"><img width="87" height="67" src="'+pan[i].img+'" /></a>';
        li_html +='    <dl class="dl_info">';
        li_html +='        <dt class="dt_01"><a target="_blank" href="/loupan/'+ pan[i].lpID +'.html?from=map_loupanlist">'+pan[i].lpName+'</a></dt>';
        li_html +='        <dd class="dd_02">'+pan[i].lpRegin+' '+pan[i].lpAdd+'</dd>';
        //li_html +='        <dd class="dd_03">'+ pan[i].lpType +' '+pan[i].lpDeco+'</dd>';
        li_html +='        <dd class="dd_03">';
        if(pan[i].lpType!='' && pan[i].lpType!=null){
            li_html += pan[i].lpType + '&nbsp;&nbsp;';
        }
        if(pan[i].lpDeco!='' && pan[i].lpDeco!=null){
            li_html += pan[i].lpDeco;
        }
        li_html +='        <dd class="dd_pri">'+pri+'</dd>';
        li_html +='</dl></li>';

        if(searchLpId == pan[i].lpID && top){
            firstHtml = li_html;
        }else{
            html.push(li_html);
        }
    }
    list.update(firstHtml + html.join(''));
    this.highLight();
},

sortBy:function(arr, t, key, st){
    var fix = function(key, st){
        if(t === 'asc' && (st == 5 || key == 0)){
            return 100000000;
        }else if(t === 'desc' && st == 5){
            return 0;
        }
        return key;
    }
    return arr.sort(function(a,b){
        return t === 'asc' ? ( fix.call({}, a[key], a[st]) - fix.call({}, b[key], b[st]) ) : ( fix.call({}, b[key], b[st]) - fix.call({}, a[key], a[st]));
    });
},

//根据价格排序
sorting:function(){
    var sort = $('a_sort'),s=this, type;
    if(sort.hasClassName('sort_up')){
        sort.removeClassName('sort_up');
        sort.addClassName('sort_down');
        type = 'desc';
    }else{
        sort.removeClassName('sort_down');
        sort.addClassName('sort_up');
        type = 'asc';
    }
    this.fullListHtml(this.sortBy(this.LOUPANLIST, type,'lpPrice', 'st'));
},


getJSONdata:function(once){
    TT.clearTimers();
    if(this.status == 'offseted' || this.isRegionZoom()){
        return;
    }

    TT.startTimer(function(){
        M.showTip(1);
        M.getLoupanList()
    },function(){
        M.showTip(2)
    },function(){
        M.showTip(3)
    });

},

buildUrl: function() {
    var WestEast = M.getBoundsWE(this.DEF.OFFSET);
    var url = "/a/map/list/W0";
    $H(WestEast).each(function(p) {
        url += "QQbaidu_" + p.key + "Z" + p.value;
    });
    //url += 'QQp7Z'+this.searchFilter.price;
    return url;
},

initialize:function(){
    TT.clearTimers();
    this.getJSONdata();
    this.eventsBind();
},

showPanel:function(panel){
    $('info_panel','list_panel','region_panel').invoke('hide');
    $(panel).show();
},

showTip:function(num, finished){
    if(finished) TT.clearTimers();
    this.showPanel('info_panel');
    var spInfo = '';
    if (num == 0) {
        spInfo = '<span class="sp_info">没找到符合您要求的房子，请缩小地图试试看！</span>';
    } else if (num == 1) {
        spInfo = '<span class="sp_info">正在为您找房子...</span>';
    } else if (num == 2) {
        spInfo = '<span class="sp_info">网速有点慢，还在继续，请稍后...</span>';
    } else if (num == 3) {
        spInfo = '<span class="sp_info">请求超时，请重新刷新页面！</span>';
    } else if (num == 4) {
        spInfo = '<span class="sp_info">在<span style="color:#f60"> “' + $F('qwhereinput') + '” </span>周边没有找到楼盘！</span>';
        spInfo += '<div class="div_info">建议您：<br/>';
        spInfo += '<em class="no_em">输入正确的楼盘名或者路名；</em><br/>';
        spInfo += '<em class="no_em">先选择区域，在缩放/拖动地图到目标位置；</em></div>';
    } else if (num == 5) {
        spInfo = '<span class="sp_info">没找到<span style="color:#f60"> “' + $F('qwhereinput') + '” </span>这个地方！</span>';
        spInfo += '<div class="div_info">建议您：<br/>';
        spInfo += '<em class="no_em">输入正确的楼盘名或者路名；</em><br/>';
        spInfo += '<em class="no_em">先选择区域，在缩放/拖动地图到目标位置；</em></div>';
    }
    info_panel.update(spInfo);
},

FixbugTimer: null,

    SearchOverlayCache:null,

    markerOverlayOnce:function(p, overlayType, keyword, key){
    p.title = keyword;
    p.barOffset = {
        x : -28,
        y : -29
    };
    p.barInfo = this.getInfoS({keyword:keyword});
    p.className = 'OverlayB';
    p.classHover = '';

    if(key) {
        p.key = key;
        M.removeOverlay(M.overlaysType.overlay, key);
    }

    var overlay = M.addOverlay(p, overlayType, key);

    if(this.SearchOverlayCache != overlay){
        M.removeOverlay(this.SearchOverlayCache);
        this.SearchOverlayCache = overlay;
    }

    overlay._div.style.zIndex = 1;

    return overlay;
},

trackerObj : null,

    trackerType : {
    overlay:'aifang-web-map-click-overlay',
        region:'aifang-web-map-click-region'
},

trackerEvent:function(type){
    if(typeof SiteTracker == 'function'){
        if(!this.trackerObj) this.trackerObj = new SiteTracker('aifang-npv');
        this.trackerObj.setPage(type);
        this.trackerObj.setNGuid("aQQ_ajkguid");
        this.trackerObj.setNUid("aQQ_afweb_uid");
        this.trackerObj.track();
    }
},

eventsBind:function(){
    var me = this;
    Event.observe($("a_sort"),'click',function(){
        this.sorting();
    }.bind(this));
    document.observe("map:listItemOver", function(event) {
        var lpId = event.memo.lpId;
        var overlay = M.getOverlay(M.overlaysType.overlay, lpId);
        overlay.setOver(false);
    });
    document.observe("map:listItemOut", function(event) {
        var lpId = event.memo.lpId;
        var overlay = M.getOverlay(M.overlaysType.overlay, lpId);
        overlay.setOut(false);
    });

    map.addEventListener('click',function(){
        // 发生点击事件就清除 movestart 事件
        if(this.FixbugTimer) clearTimeout(this.FixbugTimer);
    }.bind(this));

    map.addEventListener('movestart',function(){
        var self = this;
        this.FixbugTimer = setTimeout(function(){
            self.hideLoupanInfo('movestart');
        },200);
        TT.clearTimers();
    }.bind(this));
    map.addEventListener('moveend',function(){
        TT.delayTimer(null,function(){
            M.getJSONdata();
        },200);
        this.status = this.status === 'offseted' ? null : this.status;
    }.bind(this));
    map.addEventListener('zoomstart',function(){
        this.hideLoupanInfo('zoomstart');
        //M.clearOverlays();
    }.bind(this));
    map.addEventListener('zoomend',function(){
        M.removeOverlay(M.overlaysType.overlay);
        M.removeOverlay('Loupan');
        TT.clearTimers();
        var zoom = map.getZoom(),
            sort_z = $('list_sort'),
            listing_z = $('listing'),
            region_z = $('region_panel');
        if(this.isRegionZoom()){
            M.removeOverlay(this.SearchOverlayCache);
            this.SearchOverlayCache = null;
            this.showRegionOverlays();
            this.showPanel('region_panel');
        }else{
            this.getJSONdata();
        }
    }.bind(this));

    Event.observe(window,'resize',function(){
        setTimeout(function(){
            var h_height = (document.viewport.getHeight() - map_params['top'])+'px', width = (document.viewport.getWidth() - 382),
                w_width = (width > 468 ? width : 468) + 'px';
            $('map_page').setStyle({
                height:h_height,
                width:w_width
            });
            $('jmap_fill').setStyle({
                height:h_height,
                width:w_width
            });
            if(parseInt(width) <= 468){
                $('jmap_list').setStyle({
                    left:468+'px'
                });
            }else{
                $('jmap_list').setStyle({
                    left:'auto'
                });
            }
        },0);
    });

    // 搜索状态码：1
    document.observe("map:loupan", function(event) {
        this.status = 'search';
        var p = {},r = event.memo, latlng = M.getLatLng({lat:r.lat,lng:r.lng}), zoom = parseInt(event.memo.zoom);
        r.keyword = r.lpName;

        map.panTo(latlng);

        var self = this;
        setTimeout(function(){
            var overlay = self.showLoupanBar(r, r.lpID, 'search');
            if(overlay){
                overlay.setOver = function(){
                    this._div.style.zIndex = 1;
                }
                overlay.setOut = function(){
                    this._div.style.zIndex = 1;
                }
            }
            setTimeout(function(){
                p.info = r;
                p.status = p.type = 'search';
                p.latlng = latlng;
                self.openOverlayWindow(p, overlay);
            },400);
        },100);

    }.bind(this));

    // 搜索状态码：2
    document.observe("map:region", function(event) {
        this.status = 'region';
        function markerOverlay(keyword){
            if(keyword){
                M.markerOverlayOnce({latlng:latlng}, 'Search', keyword);
            }
        }
        // TODO 切换效果有时间优化
        var zoom = parseInt(event.memo.zoom), latlng = M.getLatLng({lat:event.memo.lat,lng:event.memo.lng});
        var keyword = event.memo.keyword;
        if(this.isRegionZoom()){
            map.panTo(latlng);
            setTimeout(function(){
                M.clearOverlays();
                map.setZoom(zoom);
                markerOverlay(keyword);
            },900);
        }else{
            map.centerAndZoom(latlng,zoom);
            markerOverlay(keyword);
        }
        // 统计 region 打开事件
        M.trackerEvent(M.trackerType.region);

    }.bind(this));

    // 搜索状态码：3
    document.observe("map:geo", function(event) {
        this.status = 'geo';
        //中远两湾城
        var keyword = event.memo.keyword, self=this;
        M.localSearch(cityName+' '+keyword,self, function(points){
            if(points.length){
                p = points[0], latlng = p.point;
                map.panTo(latlng);
                setTimeout(function(){
                    if(self.isRegionZoom()) map.setZoom(12);
                    var overlay = self.markerOverlayOnce({latlng:latlng}, 'Search', keyword);
                    if(overlay){
                        overlay.setOver = function(){
                            this._div.style.zIndex = 1;
                        }
                        overlay.setOut = function(){
                            this._div.style.zIndex = 1;
                        }
                    }
                },500);
            }else{
                M.showTip(5, true);
            }
        }.bind(this));
    }.bind(this));

    document.observe("map:search", function(){
        this.showTip(1);
    }.bind(this));
}

});
M.initialize();
};


/**
 * TimerTrigger component
 * design by Jock 2012.05.24
 */
(function(w){
    function TimerTrigger(startTime, lodingTime, timeoutTime){
        this.timerTypes = {
            delay:{
                k:'DELAY',
                v:startTime || 1000
            },
            loading:{
                k:'LOADING',
                v:lodingTime || 3000
            },
            timeout:{
                k:'TIMEOUT',
                v:timeoutTime || 8000
            }
        };
        this.timerHandlers = [];
        this.status = '';
    }
    TimerTrigger.prototype = {
        constructor: TimerTrigger,
        // 清除当个任务
        clearTimer:function(timeType){
            var timerT = timeType && timeType.k ? this.timerHandlers[timeType.k] : null;
            if (timerT) {
                clearTimeout(timerT);
                delete this.timerHandlers[timeType.k];
            }
        },
        // 清除所有任务
        clearTimers:function(){
            for(var t in this.timerTypes){
                this.clearTimer(this.timerTypes[t]);
            }
            this.status = '';
        },
        // 启动智能任务
        startTimer:function(before, loadComplete, timeoutComplete){
            var me = this;
            me.loadingTimer(before, function(){
                if(loadComplete) loadComplete.call(me);
                me.timeoutTimer(null, timeoutComplete);
            });
        },
        // 延迟启动任务
        delayTimer:function(before, complete, time){
            this.status = 'delaying';
            var me = this, t = this.timerTypes.delay;
            if(before) before.call(me);
            this.timerHandlers[t.k] = setTimeout(function(){
                if(complete) complete.call(me);
            },time || t.v);
        },
        // 启动加载任务
        loadingTimer:function(before, complete){
            this.status = 'loading';
            var me = this, t = this.timerTypes.loading;
            if(before) before.call(me);
            this.timerHandlers[t.k] = setTimeout(function(){
                if(complete) complete.call(me);
            },t.v);
        },
        // 启动超时任务
        timeoutTimer:function(before, complete){
            this.status = 'timeouting';
            var me = this, t = this.timerTypes.timeout;
            if(before) before.call(me);
            this.timerHandlers[t.k] = setTimeout(function(){
                if(complete) complete.call(me);
            },t.v);
        }
    }
    w['TimerTrigger'] = TimerTrigger;
})(window);

var TT = new TimerTrigger();

TT.startTimer(function(){
    Jock.map.loadMap('b',this,'jmap');
},function(){
    $('info_panel').update('<span class="sp_info">地图加载时间比平时要长，还在加载中...</span>');
},function(){
    $('info_panel').update('<span class="sp_info">地图加载超时，请刷新页面</span>');
});

