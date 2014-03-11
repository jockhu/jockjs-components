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
    map:null,
    opts:null,
    px:0,
    wait:false,
    progress:null,
    //获得rank排序的数据
    //
    getRankData:function(data,noCache){
        this.data.model = 1;
        this.opts.onItemBuild = this.onRankItemBuild;
        var me = this;
        this.opts.onResult =this.onResultCommon(function (data) {
            return me.onResultRankData(data);
        });
        this.map.getData(this.data);

    },
    //获得单个小区的数据
    getCommData:function (commid,commname){
        this.data.model =2;
        this.data.commid = commid;
        this.data.commids='';
        this.data.p = 1;
        var me = this;
        this.opts.onResult =this.onResultCommon(function (data) {
            me.onResultCommData.call(me,data,commname);
        });
        this.map.getData(this.data,true);

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
            },10000)
            me.onResultNextPageData.call(me,data);
        });
        this.map.getData(this.data,true);
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
        this.map.getData(this.data);
    },

    //获得筛选数据
    getFilterData:function(data){
        this.data = J.mix(this.data,data);
        if(!(this.map.getZoom()>12)){
            this.getRankData(data,true);
            return;
        }
        this.getZoneData(data);
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
        this.map.getData(this.data,true);
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
    /**
     * 所有ajax回调都会调用这个方法
     * @param fn　回调方法
     * @return {Function}
     */
    onResultCommon:function(fn){
        var handler = this.progress.handler;
        return function(data){
            handler(data);
            data.sojData&&SentSoj("anjuke-pad", data.sojData); //第二个参数是anjax请求的
            return fn(data);
        }
    },
    onResultRankData:function(data){
        this.container.html('');
        J.g("p_filter_result").get().scrollTop=0;
        this.updateListHtml(data.props.list,'area_id');
        this.upDateStatusHtml('地图内找到房源',data.propNum);
        return data.groups;
    },
    onResultCommData:function(data,commname){
        this.container.html('');
        J.g("p_filter_result").get().scrollTop=0;
        this.updateListHtml(data.props.list,'community_id');
        this.upDateStatusHtml(commname,data.propNum);
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
        var start =  this.container.s("li").length;
        var sep = document.createElement("li");
        sep.className="sep";
        sep.innerHTML =  start+ "-"+(start+data.props.list.length)+"条";
        //var top = J.g("p_list").get().scrollHeight;
        this.container.get().appendChild(sep);
        this.updateListHtml(data.props.list,key)
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
        this.updateListHtml(data.props.list,key);
        this.data.commids = data.props.commids;
    },
    onResultZoneData:function(data){
        this.container.html('');
        J.g("p_filter_result").get().scrollTop=0;
        this.updateListHtml(data.props.list,'community_id');
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
            var overlays = map.getCurrentOverlays();
            var code  =target.attr('data-code');
            var zoom = map.getZoom();
            var key =code+'_'+zoom;
            me.preClickedItem&&me.preClickedItem.removeClass("on");
            target.addClass("on");
            toggleClassOver(overlays[key],me.preClickedOverlay);
            me.preClickedOverlay= overlays[key];
            me.preClickedItem = target;

        })
    },
    upDateStatusHtml:function(commname,countNum){
        this.CommnameContainer.html(commname);
        this.countNum&&this.countNum.html(countNum);
    },
    /**
     * 填充列表数据
     * @param data
     */
    updateListHtml:function(data,key){
        var frag = document.createDocumentFragment();
        J.each(data,function(k,t){
            var tmp = document.createElement("li");
            tmp.setAttribute("data-code",t[key]);
            var str = '<a href="'+t['prop_url']+'" class="pi_a_img" title="'+t['img_title']+'" alt="'+t['img_title']+'" target="_blank">'+
                '<img height="100" width="133" id="prop_2_a"  alt="'+t['img_title']+'" src="'+t['img_url']+'">'+
                '</a>'+
                '<div class="pi_info">'+
                '<a data-soj="'+t["soj"]+'" href="'+t["prop_url"]+'" target="_blank">'+t["title"]+'</a>'+
                '<div class="pi_address"><span>'+t['community_name']+'</span></div>'+
                '<div class="pi_basic"><span>'+t['room_num']+'室'+t['hall_num']+'厅'+"</span></div></div>"+
                '<div class="pi_sub"><span class="pi_s_price">'+t['price']+'</span>元/月</div>';
            tmp.innerHTML = str;
            tmp.community_id = t['community_id'];
            tmp.id = t['id'];
            frag.appendChild(tmp);
        });
        this.container.get().appendChild(frag);
    }


}
