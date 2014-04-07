/**
 * Created with JetBrains PhpStorm.
 * User: lunjiang
 * Date: 14-3-5
 * Time: 下午6:39
 * To change this template use File | Settings | File Templates.
 */
var ListCenter = {
    url:'/newmap/search2',
    container:null,
    data:{
        model:1,//除区域外都是模式１
        p:1,//页码
        commids:'',//上一页的小区
        commid:0,
        px:0
    },
    search:null,//
    map:null,
    opts:null,
    px:0,
    wait:false,
    progress:null,
    preClickedOverlay:null,//上一个点击过的overlay
    preClickedItem:null,
    ignoreNextpage:false,//忽略下一页
    resultHandler:[],
    resetHandler:function(){
        this.data = {
            model:1,//除区域外都是模式１
            p:1,//页码
            commids:'',//上一页的小区
            commid:0,
            px:0
        };
        this.toggleClassOver();
    },

    //获得rank排序的数据
    //
    getDataCommon:function(data){
        J.g("statusSearch").hide();
        J.g("propBarLeft").show();
        this.ignoreNextpage = false;
        if(this.preClickedOverlay&&this.preClickedOverlay.isInViewPort()){
            this.overlayInViewPort = true;
        }else{
            J.g("propBarLeft").removeClass("commSel");
            this.preClickedOverlay&&this.preClickedOverlay.removeOverlay();
            this.preClickedOverlay = null;
            this.overlayInViewPort = false;
        }
        this.map.getData(data);
    },
    getRankData:function(data,noCache){
        this.data.model = 1;
        this.opts.onItemBuild = this.onRankItemBuild;
        var me = this;
        this.opts.onResult =this.onResultCommon(function (data) {
            return me.onResultRankData(data);
        });
        this.getDataCommon(this.data);
    },
    //获得单个小区的数据
    getCommData:function (commid,commname,asy){
        if(Object.prototype.toString.call(commid)==='[object Object]'){
            J.mix(this.data,commid);
            commid = null;
        }else{
            this.data.model =2;
            this.data.commid = commid;
            this.data.commids='';
            this.data.p = 1;
        }
        var me = this;
        this.opts.onResult =this.onResultCommon(function (data) {
            me.onResultCommData.call(me,data,commname);
        });
        this.getDataCommon(J.mix({bounds:''},this.data),true,asy);
    },
    //普通获得下一页的数据
    getNextPageData:function (){
        if(this.wait){
            return true;
        }
        this.wait = true;
        this.data.p++;
        this.opts.onItemBuild = this.data.model==1?this.onRankItemBuild:this.onCommItemBuild;
        var me = this;
        this.opts.onResult =this.onResultCommon(function (data) {
            me.wait = false;
            setTimeout(function(){
              me.wait = false;
            },10000);
            me.onResultNextPageData.call(me,data);
        });
        this.getDataCommon(this.data);
    },
    //获得可视区域数据
    getZoneData:function(){
        this.data.model =2;
        this.data.commids = '';
        this.data.commid='';
        this.data.p = 1;

        this.opts.onItemBuild = this.onCommItemBuild;
        var me = this;
        this.opts.onResult =this.onResultCommon(function (data) {
            return me.onResultZoneData.call(me,data);
        });
        this.getDataCommon(this.data);
    },

    //获得筛选数据
    getFilterData:function(data){
        this.data.p =1;
        this.data = J.mix(this.data,data);
        this.map.removeCurrentOverlays();
        //点击过单　个小区
        if(this.preClickedOverlay){
            this.getFilterCommData(this.data)
            return;
        }

        if(!(this.map.getZoom()>12)){
            this.getRankData(data,true);
            return;
        }
        this.getZoneData(data);
    },

    /**
     *
     * @param data　筛选条件
     */
    getFilterCommData:function(data){
        //首先拿到当前选中小区的筛选数据
        data.commid = this.preClickedOverlay.p.commid;
        var me = this;
        var stack = this.getCombineResult(function(){
           // me.progress.hide();
        });
        //定义单小区的callback
        this.map.getData(data,stack.getCallBack('comm',onResultCommData));
        function onResultCommData(data,combineData){
             var item = me.preClickedOverlay._div.s("b").eq(0);
             item.html(item.html().replace(/\d+/,data.propNum))
            me.onResultCommData(data);
        }
        //首先拿到当前选中小区的筛选数据
        data.commid = '';
        //定义多小区的callback
        this.map.getData(data,stack.getCallBack('muti',onResultZoneData));
        function onResultZoneData(data,combineData){
            return data.comms;
        }
    },

    //获得排序数据
    getSortData:function(data){
        this.data.p= 1;
        this.data.commids='';
        this.opts.onItemBuild = this.data.model==1?this.onRankItemBuild:this.onCommItemBuild;
        var me = this;
        this.opts.onResult =this.onResultCommon(function (data) {
            me.onResultSortData.call(me,data);
        });
        this.getDataCommon(this.data);
    },


    onRankItemBuild:function(item){
        if(!item.propCount){
            return false;
        }
        item.key = item.id+'_'+item.zoom;
        item.x=-37.5;
        item.y=-37.5;
        item.html =item.propCount ? '<div class="OverlayA"><div class="circle"></div><div class="txt"><b>'+item.areaName+'</b><br/><p>'+item.propCount+'</p></div></div>':false;
        return item;
    },
    onCommItemBuild:function(item){
        item.x=-8;
        item.y=-45;
        item.key = item.commid+'_'+item.zoom;
        item.html='<div class="OverlayB"><b>'+item.propCount+'套｜</b>'+item.commname+'<span class="tip"></span></div>';
        item.onClick= function(){
        }
    },
    addResultHandler:function(fn){
        this.resultHandler.push(fn);
    },
    getResultHandler:function(){
        return !this.resultHandler.length?false:this.resultHandler.pop();
    },

    /**
     * 所有ajax回调都会调用这个方法
     * @param fn　回调方法
     * @return {Function}
     */
    onResultCommon:function(fn){
        var handler = this.progress.handler;
        var searchHandler = this.search&&this.search.handler;
        var me = this;

        return function(data){
            var clientFn = me.getResultHandler();
            if(clientFn === false){
                handler(data);
                data.sojData&&SentSoj("anjuke-pad", data.sojData); //第二个参数是anjax请求的
                return fn(data);
            }
            var clientData = clientFn(data);
            if(clientData === false)return;
            handler(clientData||data);
            data.sojData&&SentSoj("anjuke-pad", data.sojData); //第二个参数是anjax请求的
            return fn(data);
        }
    },
    onResultRankData:function(data){
        this.container.html('');
        J.g("p_filter_result").get().scrollTop=0;
        this.updateListHtml(data.props.list,'area_id',data.propNum);
        this.upDateStatusHtml('地图内找到房源',data.propNum);
        return data.groups;
    },
    onResultCommData:function(data,commname){
        this.container.html('');
        this.upDateStatusHtml(commname,data.propNum);
        if(!data.propNum){
            //无房源
            this.progress.showCommResultTip();
            return;
        }
        this.progress.hide();
        J.g("propBarLeft").addClass("commSel");
        J.g("p_filter_result").get().scrollTop=0;
        this.updateListHtml(data.props.list,'community_id',data.propNum);
        return data.comms;
    },
    onResultNextPageData:function(data){
        //如果下一页的数据为空，则不进行任何操作
        if(!data.props.list.length)return;
        var commanme;
        var key = this.data.model == 1 ?'area_id':'community_id';
        if(data.curPage == 1){
             commanme = !!data.props.iscommid ? data.comms[0].commname : '地图内找到房源';
            this.upDateStatusHtml(commanme,data.propNum);
        }
        var start =  this.container.s("li").length-this.container.s(".sep").length;
        var sep = document.createElement("li");
        sep.className="sep";
        sep.innerHTML =  start+ "-"+(start+data.props.list.length)+"条";
        this.container.get().appendChild(sep);
        this.updateListHtml(data.props.list,key,data.propNum)
        //J.g("p_filter_result").get().scrollTop =top;
        this.data.commids = data.props.commids;
    },
    onResultSortData:function(data){
        //如果下一页的数据为空，则不进行任何操作
        if(!data.props.list.length)return;
        this.container.html('');
        J.g("p_filter_result").get().scrollTop=0;

        var commanme;
        var key = this.data.model == 1 ?'area_id':'community_id';
        this.updateListHtml(data.props.list,key,data.propNum);
        this.data.commids = data.props.commids;
    },
    onResultZoneData:function(data){
        console.log(this.overlayInViewPort,'in view port');
        if(this.overlayInViewPort){
            return data.comms;
        }
        this.container.html('');
        J.g("p_filter_result").get().scrollTop=0;
        this.updateListHtml(data.props.list,'community_id',data.propNum);
        this.upDateStatusHtml('地图内找到房源',data.propNum);
        this.data.commids = data.props.commids;
        return data.comms;
    },
    init:function(){
        this.bindEvent();
    },
    bindEvent:function(){
        var me = this;
        J.g('p_list').on('click',function(e){
            var target = e.target;
            while(target.tagName.toLocaleLowerCase() !== 'li'){
                target = target.parentNode;
            }
            target = J.g(target);
            me.listItemClick(target,e);
        })
    },
    nextPageEvent:function(){
        //搜索状态出来后，就不进行翻页
        if(J.g("statusSearch").get().clientHeight) return;
        ListCenter.progress.showLoadingTip(J.g('p_filter_loading')); //显示loading提示
        ListCenter.nextPageTimer&&clearTimeout(ListCenter.nextPageTimer);
        var lis = document.getElementById("p_list");
        if(this.clientHeight+this.scrollTop+30 >= this.scrollHeight){
            //把上一　次点击的区域选中状态清掉
            ListCenter.nextPageTimer&&window.clearTimeout(ListCenter.nextPageTimer);
            ListCenter.nextPageTimer = setTimeout(function(){
                ListCenter.getNextPageData();
            },500);
            setTimeout(function(){
                ListCenter.progress.hideLoadingTip(J.g('p_filter_loading'));
            },0);
        }

    },
    getContext:function(){
        return this;
    },
    upDateStatusHtml:function(commname,countNum){
        commname&&this.CommnameContainer.html(commname);
        this.countNum&&this.countNum.html(countNum);

    },
    /**
     * 填充列表数据
     * @param data
     */
    updateListHtml:function(data,key,count){
        var frag = document.createDocumentFragment();
        J.each(data,function(k,t){
            var tmp = document.createElement("li");
            tmp.setAttribute("data-code",t[key]);
            var str = '<a onclick="return false;" href="'+t['prop_url']+'" class="pi_a_img" title="'+t['img_title']+'" alt="'+t['img_title']+'" target="_blank">'+
                '<img height="100" width="133" id="prop_2_a"  alt="'+t['img_title']+'" src="'+t['img_url']+'">'+
                '</a>'+
                '<div class="pi_info">'+
                '<a onclick="return false;" data-soj="'+t["soj"]+'" href="'+t["prop_url"]+'" target="_blank">'+t["title"]+'</a>'+
                '<div class="pi_address"><span>'+t['community_name']+'</span></div>'+
                '<div class="pi_basic"><span>'+t['room_num']+'室'+t['hall_num']+'厅'+"</span></div></div>"+
                '<div class="pi_sub"><span class="pi_s_price">'+t['price']+'</span>元/月</div>';
            tmp.innerHTML = str;
            tmp.community_id = t['community_id'];
            tmp.setAttribute("data-id",t['id']);
            tmp.setAttribute("data-fromtype",t['fromtype']);
            frag.appendChild(tmp);
        });
        this.container.get().appendChild(frag);
        if(J.g("p_list").get().scrollHeight>J.g("p_filter_result").height()){
           var tmp = this.container.s("li").length-this.container.s(".sep").length;
            if(tmp == count){
                var last =  document.createElement("li");
                last.setAttribute("class",'last');
                last.innerHTML='已经到底了,调整找房条件试试。';
                this.container.get().appendChild(last);
            }
        }
    },
    listItemClick:function (elm,e) {
        var url = '/xiaoqu/jingjiren/'+elm.get().community_id+'/?fromother='+elm.attr("data-id")+'&from=pad_zf_map'+'&fromtype='+elm.attr("data-fromtype");
        window.open(url);
        var map = this.map;
        //J.g(elm).s("a").eq(0).get().click();
        var overlays = map.getCurrentOverlays();
        var code = elm.attr('data-code');
        var zoom = map.getZoom();
        var key = code + '_' + zoom;
        this.preClickedItem && this.preClickedItem.removeClass("on");
        elm.addClass("on");
        this.toggleClassOver(overlays[key]|| ListCenter.preClickedOverlay);
        this.preClickedItem = elm;
    },
    overlayClick:function(event){
            var data = event.data;
             var map = ListCenter.map;
            if(data.zoom <13){
                map.setCenter(data.lng,data.lat,14);
                return
            }
            //对于单个小区，先拿到地图上的那个点，单独处理，移出可视区域再删除
            var overlays = map.getCurrentOverlays();
            delete  overlays[data.target.key];
            //把上一次点击过的ｏｖｅｒａｌｙ重新放到ｏｖｅｒａｌｙ数组
            var pre = ListCenter.preClickedOverlay;
            pre&&pre.isInViewPort()&&(overlays[pre.key]=pre);
            map.setCurrentOverlays(overlays);
            ListCenter.toggleClassOver(data.target,true);
            ListCenter.preClickedOverlay = data.target;
            ListCenter.getCommData(data.commid,data.commname);
            //计录小区id,用来翻页
    },
    toggleClassOver:function (current, isskip) {
        this.preClickedOverlay && this.preClickedOverlay.get().first().removeClass("f60bg");
        this.preClickedOverlay && this.preClickedOverlay.onMouseOut();
        console.log(current)
        current && current.onMouseOver();
        current && current.get().first().addClass("f60bg");
        this.preClickedOverlay = current;
    },
    getCombineResult:function(callback){
        function stack(callback){
            var ret = {};
            var guid = 0;
            var num=0;
            var callback=callback;
            function getCallback(name,fn){
                var key;
                if(Object.prototype.toString.call(name)=='[object Function]'){
                    fn = name;
                    key = guid;
                }else{
                    key = ret[name] === undefined ? name:guid;
                }
                ret[key] = undefined;
                guid++;
                ret.count = guid;
                return function(data){
                    ret[key] = data;
                    num++;
                    ret.length = num;
                    if(num==guid)callback&&callback(ret);
                    return fn&&fn(data,ret);
                };
            }
            return {
                getCallBack:getCallback
            }
        }
        return new  stack(callback);
    }
}
